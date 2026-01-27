// server/socket/socketHandlers.js

import Player from '../models/Player.js';
import Game from '../models/Game.js';
import { findPair } from '../controllers/gameController.js';

export const setupSocketHandlers = (io) => {
  // playerId -> socket.id
  const activeConnections = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // ✅ Player joins and requests pairing (NOW uses groupNumber)
    socket.on('join_game', async (data) => {
      try {
        const { playerId, groupNumber } = data || {};

        if (!playerId || !groupNumber) {
          socket.emit('error', { message: 'playerId and groupNumber required' });
          return;
        }

        // save active connection
        activeConnections.set(playerId, socket.id);

        // ✅ ensure player exists + has socketId + groupNumber + waiting
        // (this makes it robust even if Player wasn't created via REST)
        await Player.findOneAndUpdate(
          { playerId },
          {
            $set: {
              playerId,
              socketId: socket.id,
              groupNumber: Number(groupNumber),
              isWaiting: true,
            },
          },
          { upsert: true, new: true }
        );

        // ✅ Try to find a pair in SAME group
        const pairResult = await findPair(playerId, Number(groupNumber));

        if (pairResult) {
          const { pairId, players, game } = pairResult;

          // Notify both players
          Object.values(players).forEach((p) => {
            const playerSocketId = activeConnections.get(p.playerId);
            if (playerSocketId) {
              io.to(playerSocketId).emit('pair_found', {
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

          console.log(`🎯 Pair created: ${pairId} (group ${game.groupNumber})`);
        } else {
          // No pair found, player is waiting
          socket.emit('waiting_for_pair', {
            message: 'Waiting for another player...',
          });
        }
      } catch (error) {
        console.error('❌ Error in join_game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // ----------------------------
    // submit_offer (unchanged)
    // ----------------------------
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

        socket.emit('offer_sent', {
          offerA,
          offerB,
          waitingForResponse: true,
        });
      } catch (error) {
        console.error('❌ Error in submit_offer:', error);
        socket.emit('error', { message: 'Failed to submit offer' });
      }
    });

    // ----------------------------
    // submit_response (unchanged)
    // ----------------------------
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
        console.error('❌ Error in submit_response:', error);
        socket.emit('error', { message: 'Failed to submit response' });
      }
    });

    // ----------------------------
    // reconnect_player (unchanged)
    // ----------------------------
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
        console.error('❌ Error in reconnect_player:', error);
      }
    });

    // ----------------------------
    // disconnect cleanup (important)
    // ----------------------------
    socket.on('disconnect', async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      for (const [playerId, socketId] of activeConnections.entries()) {
        if (socketId === socket.id) {
          activeConnections.delete(playerId);

          try {
            // mark player as not waiting & remove socketId
            await Player.findOneAndUpdate(
              { playerId },
              { $set: { socketId: null, isWaiting: false } }
            );
          } catch (e) {
            console.error('Disconnect cleanup error:', e);
          }

          break;
        }
      }
    });
  });
};
