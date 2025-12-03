// server/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Excel-Export
import ExcelJS from 'exceljs';
import Game from './models/Game.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// MongoDB verbinden
connectDB();

// Middleware
if (process.env.CLIENT_URL) {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());

// API-Routes
app.use('/api/game', gameRoutes);

// ==================================================
// 📊 Excel-Export-Route – ALLE RUNDEN aller Spiele
// ==================================================
app.get('/api/export-excel', async (req, res) => {
  try {
    const games = await Game.find().lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('All Negotiations');

    // Kopfzeile
    sheet.addRow([
      'Pair ID',
      'Group',
      'Round',
      'Proposer',
      'Offer A (€)',
      'Offer B (€)',
      'Response',
      'Timestamp',
    ]);

    // Jede Runde eintragen
    games.forEach((game) => {
      const pairId = game.pairId;
      const group = game.groupNumber;

      (game.rounds || []).forEach((round) => {
        const proposer =
          round.proposer === 'A'
            ? 'Person A'
            : round.proposer === 'B'
            ? 'Person B'
            : round.proposer;

        let responseText = round.response;
        if (round.response === 'too_low') responseText = 'Too low - counteroffer';
        if (round.response === 'accept') responseText = 'Accept - offer accepted';
        if (round.response === 'better_offer') responseText = 'Better offer outside option';
        if (round.response === 'not_accept') responseText = 'Not accept';

        sheet.addRow([
          pairId,
          group,
          round.roundNumber,
          proposer,
          round.offerA,
          round.offerB,
          responseText,
          round.timestamp || game.createdAt,
        ]);
      });
    });

    // Download-Header
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="all_games.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).send('Error generating Excel');
  }
});

// Health-Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.io setup
setupSocketHandlers(io);

// Server starten
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📡 Socket.io ready for connections');
});

export { io };
