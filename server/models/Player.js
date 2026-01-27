import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, index: true },

    socketId: { type: String, default: null },

    // ✅ WICHTIG für Gruppen-Pairing
    groupNumber: { type: Number, default: null, index: true },
    isWaiting: { type: Boolean, default: false, index: true },

    // game state
    pairId: { type: String, default: null, index: true },
    role: { type: String, enum: ['A', 'B', null], default: null },
    batna: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Player', PlayerSchema);
