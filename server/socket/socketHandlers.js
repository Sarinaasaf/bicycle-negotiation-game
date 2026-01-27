import Player from '../models/Player.js';
import Game from '../models/Game.js';

export const setupSocketHandlers = (io) => {
  // Store active connections
  const activeConnections = new Map();

  // BATNA mapping for groups 1-7
  // 1: A0 B0
  // 2: A0 B250
  // 3: A0 B500
  // 4: A0 B750
  // 5: A250 B0
  // 6: A500 B0
  // 7: A750 B0
  const getBatna = (groupNumber, role) => {
    const g = Number(groupNumber);
    if (g === 1) return 0;
    if (g === 2) return role === 'B' ? 250 : 0;
    if (g === 3) return role === 'B' ? 500 : 0;
    if (g === 4) return role === 'B' ? 750 : 0;
    if (g === 5) return role === 'A' ? 250 : 0;
    if (g === 6) return role === 'A' ? 500 : 0;
    if (g === 7) return role === 'A' ? 750 : 0;
    return 0;
  };

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Player joins and requests pairing (FIXED: groupNumber-aware)
    socket.on('join_game', async (data) => {
      try {
        const { playerId, groupNumber } = data || {};

        if (!playerId || !groupNumber) {
          socket.emit('error', { message: 'Missing playerId or groupNumber' });
          return;
        }

        const g = Number(groupNumber);
        if (!g || Number.isNaN(g)) {
          socket.emit('error', { message: 'Invalid groupNumber' });
          return;
        }

        // Map playerId -> socket.id
        activeConnections.set(playerId, socket.id);

        // Upsert player with waiting status + group
        await Player.findOneAndUpdate(
          { playerId },
          {
            playerId,
            socketId: socket.id,
            groupNumber: g,
            isWaiting: true,
          },
          { upsert: true, new: true }
        );

        // Find opponent in same group who is waiting
        const opponent = await Player.findOne({
          isWaiting: true,
          groupNumber: g,
          playerId: { $ne: playerId },
        });

        if (!opponent) {
          socket.emit('waiting_for_pair', { message: 'Waiting for another player...' });
          return;
        }

        // Create pair + assign roles randomly
        const pairId = `${playerId}_${opponent.playerId}_${Date.now()}`;
        const assignAFirst = Math.random() < 0.5;

        const playerAId = assignAFirst ? playerId : opponent.playerId;
        const playerBId = assignAFirst ? opponent.playerId : playerId;

        const batnaA = getBatna(g, 'A');
        const batnaB = getBatna(g, 'B');

        // Update both players
        await Player.updateOne(
          { playerId: playerAId },
          { role: 'A', pairId, batna: batnaA, isWaiting: false }
        );
        await Player.updateOne(
          { playerId: playerBId },
          { role: 'B', pairId, batna: batnaB, isWaiting: false }
        );

        // Create game
        const game = await Game.create({
          pairId,
          groupNumber: g,
          status: 'active',
          currentTurn: 'A',
          currentRound: 1,
          rounds: [],
          playerA: { playerId: playerAId, role: 'A', batna: batnaA },
          playerB: { playerId: playerBId, role: 'B', batna: batnaB },
        });

        // Notify both players
        const notify = (pid, role, batna) => {
          const sid = activeConnections.get(pid);
          if (!sid) return;

          io.to(sid).emit('pair_found', {
            pairId,
            playerId: pid,
            role,
            batna,
            opponentRole: role === 'A' ? 'B' : 'A',
            groupNumber: g,
            currentTurn: game.currentTurn,
          });
        };

        notify(playerAId, 'A', batnaA);
        notify(playerBId, 'B', batnaB);

        console.log(`🎯 Pair created in group ${g}: ${pairId}`);
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

        // Validate turn
        if (player.role !== game.currentTurn) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        // Validate offer sum
        if (offerA + offerB !== 1000) {
          socket.emit('error', { message: 'Offers must sum to €1,000' });
          return;
        }

        // Get opponent
        const opponentId =
          player.role === 'A' ? game.playerB.playerId : game.playerA.playerId;
        const opponentSocketId = activeConnections.get(opponentId);

        // Notify opponent to respond
        if (opponentSocketId) {
          io.to(opponentSocketId).emit('offer_received', {
            offerA,
            offerB,
            proposer: player.role,
            roundNumber: game.currentRound,
          });
        }

        // Confirm to proposer
        socket.emit('offer_sent', {
          offerA,
          offerB,
          waitingForResponse: true,
        });
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

        // Add round to history
        game.rounds.push({
          roundNumber: game.currentRound,
          proposer: game.currentTurn,
          offerA,
          offerB,
          response,
        });

        let gameEnded = false;
        let gameResult = null;

        // Handle response
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
          // ✅ FIX: payouts should be BATNA for BOTH
          gameResult = {
            type: 'failed',
            payoutA: game.playerA.batna,
            payoutB: game.playerB.batna,
            reason: 'Negotiation terminated',
          };
          game.result = gameResult;
          game.completedAt = new Date();
          gameEnded = true;
        } else {
          // Continue negotiation
          game.currentRound += 1;

          if (game.currentRound > 10) {
            game.status = 'failed';
            // ✅ FIX: payouts should be BATNA for BOTH
            gameResult = {
              type: 'failed',
              payoutA: game.playerA.batna,
              payoutB: game.playerB.batna,
              reason: 'Maximum rounds reached',
            };
            game.result = gameResult;
            game.completedAt = new Date();
            gameEnded = true;
          } else {
            // Switch turn
            game.currentTurn = game.currentTurn === 'A' ? 'B' : 'A';
          }
        }

        await game.save();

        // Notify both players
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
                batna: player.role === 'A' ? game.playerA.batna : game.playerB.batna,
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

      for (const [playerId, socketId] of activeConnections.entries()) {
        if (socketId === socket.id) {
          activeConnections.delete(playerId);

          try {
            const player = await Player.findOne({ playerId });
            if (player) {
              if (player.pairId) {
                const game = await Game.findOne({ pairId: player.pairId });
                if (game && game.status === 'active') {
                  const opponentId =
                    player.role === 'A' ? game.playerB.playerId : game.playerA.playerId;
                  const opponentSocketId = activeConnections.get(opponentId);

                  if (opponentSocketId) {
                    io.to(opponentSocketId).emit('opponent_disconnected', {
                      message: 'Your opponent has disconnected',
                    });
                  }
                }
              } else if (player.isWaiting) {
                await Player.deleteOne({ playerId });
                console.log(`🗑️  Removed waiting player: ${playerId}`);
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
