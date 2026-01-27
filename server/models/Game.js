import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema(
  {
    roundNumber: Number,
    proposer: String,
    offerA: Number,
    offerB: Number,
    response: String,
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    pairId: { type: String, required: true, unique: true, index: true },
    groupNumber: { type: Number, required: true, index: true },

    status: { type: String, default: 'active' }, // active, completed, failed
    currentTurn: { type: String, default: 'A' }, // A or B
    currentRound: { type: Number, default: 1 },

    playerA: {
      playerId: String,
      role: String,
      batna: Number,
    },
    playerB: {
      playerId: String,
      role: String,
      batna: Number,
    },

    rounds: { type: [RoundSchema], default: [] },
    result: { type: Object, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Game', GameSchema);
