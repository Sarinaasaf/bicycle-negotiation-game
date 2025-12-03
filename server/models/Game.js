// server/models/Game.js
import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  proposer: {
    type: String,
    enum: ['A', 'B'],
    required: true,
  },
  offerA: {
    type: Number,
    required: true,
  },
  offerB: {
    type: Number,
    required: true,
  },
  response: {
    type: String,
    enum: ['too_low', 'accept', 'better_offer', 'not_accept'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const gameSchema = new mongoose.Schema(
  {
    pairId: {
      type: String,
      required: true,
      unique: true,
    },
    groupNumber: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    playerA: {
      playerId: { type: String },
      batna: { type: Number, default: 0 },
    },
    playerB: {
      playerId: { type: String },
      batna: { type: Number, default: 0 },
    },
    rounds: [roundSchema],
    currentRound: {
      type: Number,
      default: 1,
    },
    currentTurn: {
      type: String,
      enum: ['A', 'B'],
      default: 'A',
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed', 'failed'],
      default: 'waiting',
    },
    result: {
      type: {
        type: String,
        enum: ['success', 'failed'],
      },
      finalOfferA: Number,
      finalOfferB: Number,
      payoutA: Number,
      payoutB: Number,
      reason: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);

export default Game;
