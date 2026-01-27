// server/socket/socketHandlers.js
import Player from '../models/Player.js';
import Game from '../models/Game.js';
import { findPair } from '../controllers/gameController.js';

export const setupSocketHandlers = (io) => {
  // playerId -> socket.id
  const activeConnections = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // ✅ JOIN GAME (MUSS player in DB updaten/erstellen)
    socket.on('join_game', async (data) => {
      try {
        const { playerId, groupNumber } = data || {};

        if (!playerId || !groupNumber) {
          socket.emit('error', { message: 'join_game requires playerId and groupNumber' });
          return;
        }

        // map player -> socket
        activeConnections.set(playerId, socket.id);

        // ✅ upsert player in DB (WICHTIG für findPair)
        await Player.findOneAndUpdate(
          { playerId },
          {
            playerId,
            groupNumber: Number(groupNumber),
            socketId: socket.id,
            isWaiting: true,
            pairId: null,
            role: null,
          },
          { upsert: true, new: true }
        );

        // ✅ try pairing
        const pairResult = await findPair(playerId);

        if (pairResult) {
          const { pairId, players, game } = pairResult;

          // Notify both players
          Object.values(players).forEach((p) => {
            const sid = activeConnections.get(p.playerId);
            if (sid) {
              io.to(sid).emit('pair_found', {
                pairId,
                playerId: p.playerId,
                role: p.role,
                batna: p.batna,
                opponentRole: p.role === 'A' ? 'B' : 'A',
                groupNumber: game.groupNumber,
                currentTurn: game.currentTurn,
              });
            }
          });

          console.log(`🎯 Pair created: ${pairId} (Group ${game.groupNumber})`);
        } else {
          socket.emit('waiting_for_pair', { message: 'Waiting for another player...' });
        }
      } catch (error) {
        console.error('Error in join_game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Player submits an offer
    socket.on('submit_offer', async (data) => {
      try {
        const { pairId, playerId, offerA, offerB } = data;

        const game = await Game.findOne({ pairId });
        const player = await Player.findOne({ playerId });

        if (!game || !player) {
          socket.emit('error', { message: 'Game or player not found' });
          return;
        }

        if (player.role !== game.currentTurn) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        if (offerA + offerB !== 1000) {
          socket.emit('error', { message: 'Offers must sum to €1,000' });
          return;
        }

        const opponentId =
          player.role === 'A' ? game.playerB.playerId : game.playerA.playerId;
        const opponentSocketId = activeConnections.get(opponentId);

        if (opponentSocketId) {
          io.to(opponentSocketId).emit('offer_received', {
            offerA,
            offerB,
            proposer: player.role,
            roundNumber: game.currentRound,
          });
        }

        socket.emit('offer_sent', { offerA, offerB, waitingForResponse: true });
      } catch (error) {
        console.error('Error in submit_offer:', error);
        socket.emit('error', { message: 'Failed to submit offer' });
      }
    });

    // Player submits response
    socket.on('submit_response', async (data) => {
      try {
        const { pairId, playerId, response, offerA, offerB } = data;

        const game = await Game.findOne({ pairId });
        const player = await Player.findOne({ playerId });

        if (!game || !player) {
          socket.emit('error', { message: 'Game or player not found' });
          return;
        }

        game.rounds.push({
          roundNumber: game.currentRound,
          proposer: game.currentTurn,
          offerA,
          offerB,
          response,
        });

        let gameEnded = false;
        let gameResult = null;

        if (response === 'accept') {
          game.status = 'completed';
          gameResult = {
            type: 'success',
            finalOfferA: offerA,
            finalOfferB: offerB,
            payoutA: offerA,
            payoutB: offerB,
            reason: 'Offer accepted',
          };
          game.result = gameResult;
          game.completedAt = new Date();
          gameEnded = true;
        } else if (response === 'not_accept') {
          game.status = 'failed';
          gameResult = {
            type: 'failed',
            payoutA: 0,
            payoutB: game.playerB.batna,
            reason: 'Negotiation terminated',
          };
          game.result = gameResult;
          game.completedAt = new Date();
          gameEnded = true;
        } else {
          game.currentRound += 1;

          if (game.currentRound > 10) {
            game.status = 'failed';
            gameResult = {
              type: 'failed',
              payoutA: 0,
              payoutB: game.playerB.batna,
              reason: 'Maximum rounds reached',
            };
            game.result = gameResult;
            game.completedAt = new Date();
            gameEnded = true;
          } else {
            game.currentTurn = game.currentTurn === 'A' ? 'B' : 'A';
          }
        }

        await game.save();

        const playerAId = game.playerA.playerId;
        const playerBId = game.playerB.playerId;
        const playerASocketId = activeConnections.get(playerAId);
        const playerBSocketId = activeConnections.get(playerBId);

        if (gameEnded) {
          const resultData = {
            ...gameResult,
            pairId: game.pairId,
            rounds: game.rounds,
            groupNumber: game.groupNumber,
          };

          if (playerASocketId) io.to(playerASocketId).emit('game_ended', resultData);
          if (playerBSocketId) io.to(playerBSocketId).emit('game_ended', resultData);

          console.log(`🏁 Game ended: ${pairId} - ${gameResult.type}`);
        } else {
          const updateData = {
            currentTurn: game.currentTurn,
            currentRound: game.currentRound,
            lastResponse: response,
            lastOffer: { offerA, offerB },
          };

          if (playerASocketId) io.to(playerASocketId).emit('turn_updated', updateData);
          if (playerBSocketId) io.to(playerBSocketId).emit('turn_updated', updateData);
        }
      } catch (error) {
        console.error('Error in submit_response:', error);
        socket.emit('error', { message: 'Failed to submit response' });
      }
    });

    // Handle reconnection
    socket.on('reconnect_player', async (data) => {
      try {
        const { playerId } = data;
        const player = await Player.findOne({ playerId });

        if (player) {
          player.socketId = socket.id;
          await player.save();

          activeConnections.set(playerId, socket.id);

          if (player.pairId) {
            const game = await Game.findOne({ pairId: player.pairId });
            if (game && game.status === 'active') {
              socket.emit('reconnected', {
                pairId: player.pairId,
                role: player.role,
                batna:
                  player.role === 'A' ? game.playerA.batna : game.playerB.batna,
                currentTurn: game.currentTurn,
                currentRound: game.currentRound,
                groupNumber: game.groupNumber,
              });
              console.log(`🔄 Player reconnected: ${playerId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error in reconnect_player:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      for (const [pid, sid] of activeConnections.entries()) {
        if (sid === socket.id) {
          activeConnections.delete(pid);

          try {
            const player = await Player.findOne({ playerId: pid });
            if (player) {
              if (player.pairId) {
                const game = await Game.findOne({ pairId: player.pairId });
                if (game && game.status === 'active') {
                  const opponentId =
                    player.role === 'A'
                      ? game.playerB.playerId
                      : game.playerA.playerId;
                  const opponentSocketId = activeConnections.get(opponentId);
                  if (opponentSocketId) {
                    io.to(opponentSocketId).emit('opponent_disconnected', {
                      message: 'Your opponent has disconnected',
                    });
                  }
                }
              } else if (player.isWaiting) {
                await Player.deleteOne({ playerId: pid });
                console.log(`🗑️ Removed waiting player: ${pid}`);
              }
            }
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }

          break;
        }
      }
    });
  });
};
