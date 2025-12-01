import express from 'express';
import { joinGame, getGameState, submitOffer, submitResponse } from '../controllers/gameController.js';
import { exportGameData, exportAllGames } from '../controllers/exportController.js';

const router = express.Router();

router.post('/join', joinGame);
router.get('/state/:pairId', getGameState);
router.post('/offer', submitOffer);
router.post('/response', submitResponse);

// Excel für EIN Paar
router.get('/export/:pairId', exportGameData);

// Excel für ALLE Spiele
router.get('/export-all', exportAllGames);

export default router;
