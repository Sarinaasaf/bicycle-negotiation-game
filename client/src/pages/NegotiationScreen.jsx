// client/src/pages/NegotiationScreen.jsx

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';

const responseOptions = [
  {
    value: 'too_low',
    label: 'Too Low',
    description: 'That is too low for me, counteroffer',
    color: 'from-orange-400 to-orange-600',
    icon: '👎',
  },
  {
    value: 'accept',
    label: 'Accept',
    description: 'The offer is accepted, end of game',
    color: 'from-green-400 to-green-600',
    icon: '✅',
  },
  {
    value: 'better_offer',
    label: 'Better Offer',
    description: 'I have a better offer outside the negotiation',
    color: 'from-blue-400 to-blue-600',
    icon: '💼',
  },
  {
    value: 'not_accept',
    label: 'Not Accept',
    description: 'Negotiation is terminated, end of game',
    color: 'from-red-400 to-red-600',
    icon: '❌',
  },
];

// Mapping: für jede Gruppe Alternative von A und B
const GROUP_ALTERNATIVES = {
  1: { A: 0, B: 0 },
  2: { A: 0, B: 250 },
  3: { A: 0, B: 500 },
  4: { A: 0, B: 750 },
};

const TOTAL_AMOUNT = 1000;

const NegotiationScreen = () => {
  const navigate = useNavigate();
  const {
    socket,
    playerId,
    role, // 'A' oder 'B'
    pairId,
    batna, // eigene Alternative (BATNA)
    groupNumber, // Gruppennummer 1–4
    currentTurn,
    setCurrentTurn,
    currentRound,
    setCurrentRound,
    rounds,
    setRounds,
    setGameResult,
    setGameStatus,
  } = useGame();

  // Start: wer dran ist, bekommt 1000, der andere 0
  const [offerA, setOfferA] = useState(role === 'A' ? TOTAL_AMOUNT : 0);
  const [offerB, setOfferB] = useState(role === 'A' ? 0 : TOTAL_AMOUNT);

  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const isMyTurn = role === currentTurn;
  const maxRounds = 10;

  // Gegnerische Alternative aus Gruppennummer berechnen
  const opponentAlternative = (() => {
    const group = GROUP_ALTERNATIVES[groupNumber];
    if (!group || !role) return 0;
    return role === 'A' ? group.B : group.A;
  })();

  // Slider-Handler: ein Wert bestimmt beide Anteile
  const handleSingleSliderChange = (e) => {
    const value = Number(e.target.value);
    setOfferA(value);
    setOfferB(TOTAL_AMOUNT - value);
  };

  // manuelle Eingabe A
  const handleOfferAInputChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;

    const clamped = Math.max(0, Math.min(TOTAL_AMOUNT, value));
    setOfferA(clamped);
    setOfferB(TOTAL_AMOUNT - clamped);
  };

  // manuelle Eingabe B
  const handleOfferBInputChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;

    const clamped = Math.max(0, Math.min(TOTAL_AMOUNT, value));
    setOfferB(clamped);
    setOfferA(TOTAL_AMOUNT - clamped);
  };

  useEffect(() => {
    if (!socket || !playerId || !role || !pairId) {
      navigate('/select-group');
      return;
    }

    // Angebot vom Gegner bekommen
    socket.on('offer_received', (data) => {
      console.log('Offer received:', data);
      setPendingOffer(data);
      setShowResponseModal(true);
      toast.info(`Person ${data.proposer} made an offer!`);
    });

    // Bestätigung, dass eigenes Angebot gesendet wurde
    socket.on('offer_sent', (data) => {
      console.log('Offer sent:', data);
      setIsWaitingResponse(true);
      toast.success('Offer sent! Waiting for response...');
    });

    // Zug-Update
    socket.on('turn_updated', (data) => {
      console.log('Turn updated:', data);
      setCurrentTurn(data.currentTurn);
      setCurrentRound(data.currentRound);

      // Historie updaten
      setRounds((prev) => [
        ...prev,
        {
          round: data.currentRound - 1,
          proposer: data.currentTurn === 'A' ? 'B' : 'A',
          offerA: data.lastOffer.offerA,
          offerB: data.lastOffer.offerB,
          response: data.lastResponse,
        },
      ]);

      setIsWaitingResponse(false);
      setShowResponseModal(false);
      setPendingOffer(null);

      if (data.currentTurn === role) {
        toast.info("It's your turn now!");
      }
    });

    // Spielende
    socket.on('game_ended', (data) => {
      console.log('Game ended:', data);

      if (data.rounds && data.rounds.length > 0) {
        setRounds(data.rounds);
      }

      setGameResult(data);
      setGameStatus('completed');

      setTimeout(() => {
        navigate('/result');
      }, 1500);
    });

    // Gegner getrennt
    socket.on('opponent_disconnected', (data) => {
      toast.error(data.message);
      setTimeout(() => {
        navigate('/select-group');
      }, 3000);
    });

    return () => {
      socket.off('offer_received');
      socket.off('offer_sent');
      socket.off('turn_updated');
      socket.off('game_ended');
      socket.off('opponent_disconnected');
    };
  }, [
    socket,
    playerId,
    role,
    pairId,
    navigate,
    setCurrentRound,
    setCurrentTurn,
    setGameResult,
    setGameStatus,
    setRounds,
  ]);

  const handleSubmitOffer = () => {
    if (offerA + offerB !== TOTAL_AMOUNT) {
      toast.error('Offers must sum to €1,000');
      return;
    }

    if (offerA < 0 || offerB < 0) {
      toast.error('Offers cannot be negative');
      return;
    }

    socket.emit('submit_offer', {
      pairId,
      playerId,
      offerA,
      offerB,
    });
  };

  const handleSubmitResponse = (responseValue) => {
    if (!pendingOffer) return;

    socket.emit('submit_response', {
      pairId,
      playerId,
      response: responseValue,
      offerA: pendingOffer.offerA,
      offerB: pendingOffer.offerB,
    });

    setShowResponseModal(false);
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Negotiation in Progress
          </h1>
          <p className="text-gray-600">Pair ID: {pairId}</p>
        </motion.div>

        {/* Status-Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-6 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Role</p>
              <p className="text-2xl font-bold text-blue-600">
                YOU ARE PERSON {role}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your alternative (BATNA, if no agreement):
              </p>
              <p className="text-xl font-bold text-blue-600">€{batna}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Round</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentRound} / {maxRounds}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentRound / maxRounds) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Current Turn</p>
              <p className="text-2xl font-bold text-green-600">
                Person {currentTurn}
              </p>
              {isMyTurn ? (
                <motion.p
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-xs text-green-600 font-semibold mt-1"
                >
                  🚨 YOUR TURN – MAKE AN OFFER
                </motion.p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Waiting for the other player...
                </p>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Opponent’s alternative (BATNA, if no agreement):
              </p>
              <p className="text-xl font-bold text-red-600">
                €{opponentAlternative}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Linke Seite: Angebot */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isMyTurn ? 'Make Your Offer' : 'Waiting for Opponent...'}
              </h2>

              {/* Eine gemeinsame Skala */}
              <div className="space-y-6 mb-8">
                <p className="font-semibold text-gray-700">
                  How should the{' '}
                  <span className="font-bold">€1,000</span> be split between
                  Person A and Person B?
                </p>

                {/* A/B Labels + Beitrag zum Fahrrad */}
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-blue-600">
                    Person A
                    <span className="block text-[11px] font-normal text-gray-500">
                      Contributed €200 (wheels)
                    </span>
                  </span>
                  <span className="text-purple-600 text-right">
                    Person B
                    <span className="block text-[11px] font-normal text-gray-500">
                      Contributed €600 (frame)
                    </span>
                  </span>
                </div>

                {/* farblich geteilte Skala + Eingabefelder */}
                <div className="bg-blue-50 rounded-xl p-6">
                  {/* Slider */}
                  <div className="relative w-full h-3 rounded-lg overflow-hidden bg-gray-200">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to right,
                          #3b82f6 0%,
                          #3b82f6 ${(offerA / TOTAL_AMOUNT) * 100}%,
                          #a855f7 ${(offerA / TOTAL_AMOUNT) * 100}%,
                          #a855f7 100%)`,
                        opacity: isMyTurn ? 1 : 0.5,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={TOTAL_AMOUNT}
                      value={offerA}
                      onChange={handleSingleSliderChange}
                      disabled={!isMyTurn || isWaitingResponse}
                      className="relative z-10 w-full h-3 appearance-none bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* Eingabefelder */}
                  <div className="flex justify-between items-center mt-4 gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 mb-1">
                        A receives
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-600">
                          €
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={TOTAL_AMOUNT}
                          value={offerA}
                          onChange={handleOfferAInputChange}
                          disabled={!isMyTurn || isWaitingResponse}
                          className="w-24 border border-blue-300 rounded-lg px-2 py-1 text-blue-600 font-bold text-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 mb-1">
                        B receives
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-purple-600">
                          €
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={TOTAL_AMOUNT}
                          value={offerB}
                          onChange={handleOfferBInputChange}
                          disabled={!isMyTurn || isWaitingResponse}
                          className="w-24 border border-purple-300 rounded-lg px-2 py-1 text-purple-600 font-bold text-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div
                  className={`text-center p-4 rounded-xl ${
                    offerA + offerB === TOTAL_AMOUNT
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-red-50 border-2 border-red-300'
                  }`}
                >
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p
                    className={`text-3xl font-bold ${
                      offerA + offerB === TOTAL_AMOUNT
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    €{offerA + offerB}
                  </p>
                  {offerA + offerB !== TOTAL_AMOUNT && (
                    <p className="text-xs text-red-600 mt-1">
                      Must equal €1,000
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button / Status */}
              {isMyTurn && !isWaitingResponse && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitOffer}
                  disabled={offerA + offerB !== TOTAL_AMOUNT}
                  className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Offer
                </motion.button>
              )}

              {isWaitingResponse && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-600">
                    Waiting for opponent&apos;s response...
                  </p>
                </div>
              )}

              {!isMyTurn && !showResponseModal && (
                <div className="text-center text-gray-500">
                  <div className="text-5xl mb-3">⏳</div>
                  <p>Waiting for Person {currentTurn} to make an offer...</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Rechte Seite: History */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-2xl p-6 sticky top-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📜</span>
                Negotiation History
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rounds.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No rounds yet
                  </p>
                ) : (
                  rounds.map((round, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/70 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-500">
                          Round {round.roundNumber || round.round}
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          Person {round.proposer}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          A:{' '}
                          <span className="font-bold">€{round.offerA}</span>
                        </p>
                        <p>
                          B:{' '}
                          <span className="font-bold">€{round.offerB}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Response:{' '}
                          <span className="text-xs font-semibold">
                            {formatResponse(round.response)}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && pendingOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) =>
              e.target === e.currentTarget && setShowResponseModal(false)
            }
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                Offer Received!
              </h2>

              {/* Angebot + Alternativen */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Person {pendingOffer.proposer} proposes:
                </p>

                {/* vorgeschlagene Aufteilung */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Person A</p>
                    <p className="text-3xl font-bold text-blue-600">
                      €{pendingOffer.offerA}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Person B</p>
                    <p className="text-3xl font-bold text-purple-600">
                      €{pendingOffer.offerB}
                    </p>
                  </div>
                </div>

                {/* Alternativen anzeigen */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      Your alternative (BATNA)
                    </p>
                    <p className="text-lg font-bold text-blue-700">€{batna}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      Opponent&apos;s alternative (BATNA)
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      €{opponentAlternative}
                    </p>
                  </div>
                </div>
              </div>

              {/* Antwort-Buttons */}
              <p className="text-center text-gray-600 mb-4 font-semibold">
                Choose your response:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {responseOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSubmitResponse(option.value)}
                    className={`bg-gradient-to-r ${option.color} text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="text-lg mb-1">{option.label}</div>
                    <div className="text-xs opacity-90">
                      {option.description}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function formatResponse(response) {
  const map = {
    too_low: 'Too Low',
    accept: 'Accept',
    better_offer: 'Better Offer',
    not_accept: 'Not Accept',
  };
  return map[response] || response;
}

export default NegotiationScreen;
