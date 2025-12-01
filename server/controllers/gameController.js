import Player from '../models/Player.js';
import Game from '../models/Game.js';
import { nanoid } from 'nanoid';

// Get BATNA values based on group
const getBATNA = (groupNumber) => {
  // A hat immer 0, B hat je nach Gruppe 0 / 250 / 500 / 750
  const batnaMap = {
    1: { A: 0, B: 0 },
    2: { A: 0, B: 250 },
    3: { A: 0, B: 500 },
    4: { A: 0, B: 750 }
  };
  return batnaMap[groupNumber];
};

// Create player and join group
export const joinGame = async (req, res) => {
  try {
    const { groupNumber, socketId } = req.body;

    if (!groupNumber || !socketId) {
      return res.status(400).json({ message: 'Group number and socket ID required' });
    }

    // Generate unique player ID
    const playerId = `Player_${nanoid(6)}`;

    // Create new player
    const player = await Player.create({
      playerId,
      groupNumber,
      socketId,
      isWaiting: true
    });

    res.status(201).json({
      success: true,
      player: {
        playerId: player.playerId,
        groupNumber: player.groupNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find and pair waiting players
export const findPair = async (playerId) => {
  try {
    const currentPlayer = await Player.findOne({ playerId, isWaiting: true });
    
    if (!currentPlayer) {
      return null;
    }

    // Find another waiting player in the same group
    const waitingPlayer = await Player.findOne({
      groupNumber: currentPlayer.groupNumber,
      isWaiting: true,
      playerId: { $ne: playerId },
      socketId: { $exists: true, $ne: null }
    });

    if (!waitingPlayer) {
      return null;
    }
    
    // Extra validation: ensure player still exists and is valid
    if (!waitingPlayer.socketId) {
      // Clean up invalid player
      await Player.deleteOne({ playerId: waitingPlayer.playerId });
      return null;
    }

    // Generate pair ID
    const pairId = `Pair_${nanoid(6)}`;

    // Randomly assign roles
    const roles = Math.random() < 0.5 ? ['A', 'B'] : ['B', 'A'];
    
    currentPlayer.role = roles[0];
    currentPlayer.pairId = pairId;
    currentPlayer.isWaiting = false;
    await currentPlayer.save();

    waitingPlayer.role = roles[1];
    waitingPlayer.pairId = pairId;
    waitingPlayer.isWaiting = false;
    await waitingPlayer.save();

    // Get BATNA values
    const batna = getBATNA(currentPlayer.groupNumber);

    // Create game
    const game = await Game.create({
      pairId,
      groupNumber: currentPlayer.groupNumber,
      playerA: {
        playerId: currentPlayer.role === 'A' ? currentPlayer.playerId : waitingPlayer.playerId,
        batna: batna.A
      },
      playerB: {
        playerId: currentPlayer.role === 'B' ? currentPlayer.playerId : waitingPlayer.playerId,
        batna: batna.B
      },
      status: 'active',
      currentTurn: 'A'
    });

    return {
      pairId,
      players: {
        [currentPlayer.playerId]: {
          playerId: currentPlayer.playerId,
          role: currentPlayer.role,
          socketId: currentPlayer.socketId,
          batna: currentPlayer.role === 'A' ? batna.A : batna.B
        },
        [waitingPlayer.playerId]: {
          playerId: waitingPlayer.playerId,
          role: waitingPlayer.role,
          socketId: waitingPlayer.socketId,
          batna: waitingPlayer.role === 'A' ? batna.A : batna.B
        }
      },
      game
    };
  } catch (error) {
    console.error('Error in findPair:', error);
    return null;
  }
};

// Get game state
export const getGameState = async (req, res) => {
  try {
    const { pairId } = req.params;
    
    const game = await Game.findOne({ pairId });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit offer
export const submitOffer = async (req, res) => {
  try {
    const { pairId, playerId, offerA, offerB } = req.body;

    const game = await Game.findOne({ pairId });
    const player = await Player.findOne({ playerId });

    if (!game || !player) {
      return res.status(404).json({ message: 'Game or player not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ message: 'Game is not active' });
    }

    if (player.role !== game.currentTurn) {
      return res.status(400).json({ message: 'Not your turn' });
    }

    if (offerA + offerB !== 1000) {
      return res.status(400).json({ message: 'Offers must sum to 1000' });
    }

    res.json({
      success: true,
      offer: { offerA, offerB },
      waitingForResponse: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit response
export const submitResponse = async (req, res) => {
  try {
    const { pairId, playerId, response, offerA, offerB } = req.body;

    const game = await Game.findOne({ pairId });
    const player = await Player.findOne({ playerId });

    if (!game || !player) {
      return res.status(404).json({ message: 'Game or player not found' });
    }

    // Add round to history
    game.rounds.push({
      roundNumber: game.currentRound,
      proposer: game.currentTurn,
      offerA,
      offerB,
      response
    });

    // Handle response
    if (response === 'accept') {
      game.status = 'completed';
      game.result = {
        type: 'success',
        finalOfferA: offerA,
        finalOfferB: offerB,
        payoutA: offerA,
        payoutB: offerB,
        reason: 'Offer accepted'
      };
      game.completedAt = new Date();
    } else if (response === 'not_accept') {
      game.status = 'failed';
      game.result = {
        type: 'failed',
        payoutA: 0,
        payoutB: game.playerB.batna,
        reason: 'Negotiation terminated'
      };
      game.completedAt = new Date();
    } else {
      // Continue negotiation
      game.currentRound += 1;
      
      if (game.currentRound > 10) {
        // Max rounds reached
        game.status = 'failed';
        game.result = {
          type: 'failed',
          payoutA: 0,
          payoutB: game.playerB.batna,
          reason: 'Maximum rounds reached'
        };
        game.completedAt = new Date();
      } else {
        // Switch turn
        game.currentTurn = game.currentTurn === 'A' ? 'B' : 'A';
      }
    }

    await game.save();

    res.json({
      success: true,
      game
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
