// server/models/Player.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true },

    // ✅ wichtig fürs Pairing
    groupNumber: { type: Number, required: true, index: true },
    isWaiting: { type: Boolean, default: true, index: true },
    socketId: { type: String, default: null, index: true },

    // optional / später genutzt
    role: { type: String, enum: ['A', 'B'], default: null },
    pairId: { type: String, default: null, index: true },
    batna: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Player', playerSchema);
