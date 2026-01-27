// server/controllers/gameController.js

import Player from '../models/Player.js';
import Game from '../models/Game.js';
import { nanoid } from 'nanoid';

// ✅ BATNA-Werte je Gruppe (JETZT 1–7)
const getBATNA = (groupNumber) => {
  const batnaMap = {
    1: { A: 0,   B: 0   },
    2: { A: 0,   B: 250 },
    3: { A: 0,   B: 500 },
    4: { A: 0,   B: 750 },
    5: { A: 250, B: 0   },
    6: { A: 500, B: 0   },
    7: { A: 750, B: 0   },
  };
  return batnaMap[groupNumber] || null;
};

// Spieler erstellen & in Warteschlange stellen (REST endpoint – optional)
export const joinGame = async (req, res) => {
  try {
    const { groupNumber, socketId } = req.body;

    if (!groupNumber || !socketId) {
      return res.status(400).json({ message: 'Group number and socket ID required' });
    }

    const playerId = `Player_${nanoid(6)}`;

    const player = await Player.create({
      playerId,
      groupNumber,
      socketId,
      isWaiting: true,
    });

    res.status(201).json({
      success: true,
      player: {
        playerId: player.playerId,
        groupNumber: player.groupNumber,
      },
    });
  } catch (error) {
    console.error('Error in joinGame:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Wartenden Partner finden & Spiel anlegen
export const findPair = async (playerId, groupNumberFromClient = null) => {
  try {
    // 1) Player holen (auch wenn groupNumber vom Client kommt)
    let currentPlayer = await Player.findOne({ playerId });

    // wenn Spieler nicht existiert, abbrechen
    if (!currentPlayer) return null;

    // ✅ groupNumber notfalls aus client übernehmen (falls DB es nicht hatte)
    if (groupNumberFromClient && !currentPlayer.groupNumber) {
      currentPlayer.groupNumber = groupNumberFromClient;
    }

    // ✅ ensure waiting state
    if (!currentPlayer.isWaiting) {
      currentPlayer.isWaiting = true;
    }

    // socketId muss existieren
    if (!currentPlayer.socketId) return null;

    await currentPlayer.save();

    const groupNumber = currentPlayer.groupNumber;

    if (!groupNumber) return null;

    // 2) BATNA check
    const batna = getBATNA(groupNumber);
    if (!batna) {
      console.error('❌ No BATNA mapping for group:', groupNumber);
      return null;
    }

    // 3) Wartepartner suchen (gleiche Gruppe!)
    const waitingPlayer = await Player.findOne({
      groupNumber,
      isWaiting: true,
      playerId: { $ne: playerId },
      socketId: { $exists: true, $ne: null },
    });

    if (!waitingPlayer) return null;

    // 4) pairId
    const pairId = `Pair_${nanoid(6)}`;

    // Rollen zufällig
    const roles = Math.random() < 0.5 ? ['A', 'B'] : ['B', 'A'];

    // Player updaten
    currentPlayer.role = roles[0];
    currentPlayer.pairId = pairId;
    currentPlayer.isWaiting = false;

    waitingPlayer.role = roles[1];
    waitingPlayer.pairId = pairId;
    waitingPlayer.isWaiting = false;

    await currentPlayer.save();
    await waitingPlayer.save();

    // ✅ wer anfängt
    const startingTurn = Math.random() < 0.5 ? 'A' : 'B';
    console.log('🎲 Starting turn for', pairId, '->', startingTurn);

    // 5) Game erstellen
    const game = await Game.create({
      pairId,
      groupNumber,
      playerA: {
        playerId: currentPlayer.role === 'A' ? currentPlayer.playerId : waitingPlayer.playerId,
        batna: batna.A,
      },
      playerB: {
        playerId: currentPlayer.role === 'B' ? currentPlayer.playerId : waitingPlayer.playerId,
        batna: batna.B,
      },
      status: 'active',
      currentTurn: startingTurn,
      currentRound: 1,
      rounds: [],
    });

    return {
      pairId,
      players: {
        [currentPlayer.playerId]: {
          playerId: currentPlayer.playerId,
          role: currentPlayer.role,
          socketId: currentPlayer.socketId,
          batna: currentPlayer.role === 'A' ? batna.A : batna.B,
        },
        [waitingPlayer.playerId]: {
          playerId: waitingPlayer.playerId,
          role: waitingPlayer.role,
          socketId: waitingPlayer.socketId,
          batna: waitingPlayer.role === 'A' ? batna.A : batna.B,
        },
      },
      game,
    };
  } catch (error) {
    console.error('Error in findPair:', error);
    return null;
  }
};

// Game-Status holen
export const getGameState = async (req, res) => {
  try {
    const { pairId } = req.params;
    const game = await Game.findOne({ pairId });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ success: true, game });
  } catch (error) {
    console.error('Error in getGameState:', error);
    res.status(500).json({ message: error.message });
  }
};

// Angebot (nur Validierung)
export const submitOffer = async (req, res) => {
  try {
    const { pairId, playerId, offerA, offerB } = req.body;

    const game = await Game.findOne({ pairId });
    const player = await Player.findOne({ playerId });

    if (!game || !player) return res.status(404).json({ message: 'Game or player not found' });
    if (game.status !== 'active') return res.status(400).json({ message: 'Game is not active' });
    if (player.role !== game.currentTurn) return res.status(400).json({ message: 'Not your turn' });
    if (offerA + offerB !== 1000) return res.status(400).json({ message: 'Offers must sum to 1000' });

    res.json({ success: true, offer: { offerA, offerB }, waitingForResponse: true });
  } catch (error) {
    console.error('Error in submitOffer:', error);
    res.status(500).json({ message: error.message });
  }
};

// Antwort
export const submitResponse = async (req, res) => {
  try {
    const { pairId, playerId, response, offerA, offerB } = req.body;

    const game = await Game.findOne({ pairId });
    const player = await Player.findOne({ playerId });

    if (!game || !player) return res.status(404).json({ message: 'Game or player not found' });

    game.rounds.push({
      roundNumber: game.currentRound,
      proposer: game.currentTurn,
      offerA,
      offerB,
      response,
    });

    if (response === 'accept') {
      game.status = 'completed';
      game.result = { type: 'success', finalOfferA: offerA, finalOfferB: offerB, payoutA: offerA, payoutB: offerB, reason: 'Offer accepted' };
      game.completedAt = new Date();
    } else if (response === 'not_accept') {
      game.status = 'failed';
      game.result = { type: 'failed', payoutA: 0, payoutB: game.playerB.batna, reason: 'Negotiation terminated' };
      game.completedAt = new Date();
    } else {
      game.currentRound += 1;

      if (game.currentRound > 10) {
        game.status = 'failed';
        game.result = { type: 'failed', payoutA: 0, payoutB: game.playerB.batna, reason: 'Maximum rounds reached' };
        game.completedAt = new Date();
      } else {
        game.currentTurn = game.currentTurn === 'A' ? 'B' : 'A';
      }
    }

    await game.save();
    res.json({ success: true, game });
  } catch (error) {
    console.error('Error in submitResponse:', error);
    res.status(500).json({ message: error.message });
  }
};
