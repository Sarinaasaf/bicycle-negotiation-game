import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { exportGameData } from '../services/api';
import { toast } from 'react-toastify';

const ResultScreen = () => {
  const navigate = useNavigate();
  const { gameResult, role, pairId, rounds, batna } = useGame();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!gameResult) {
      navigate('/');
    }
  }, [gameResult, navigate]);

  if (!gameResult) return null;

  const isSuccess = gameResult.type === 'success';
  const myPayout = role === 'A' ? gameResult.payoutA : gameResult.payoutB;
  const opponentPayout = role === 'A' ? gameResult.payoutB : gameResult.payoutA;

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportGameData(pairId);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePlayAgain = () => {
    
    navigate('/select-group');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        {/* Success/Failure Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="text-center mb-8"
        >
          {isSuccess ? (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 1, repeat: 3 }}
                className="text-9xl mb-4"
              >
                🎉
              </motion.div>
              <h1 className="text-5xl font-bold text-green-600 mb-2">
                Negotiation Successful!
              </h1>
              <p className="text-xl text-gray-600">
                Congratulations! An agreement has been reached.
              </p>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-9xl mb-4"
              >
                ❌
              </motion.div>
              <h1 className="text-5xl font-bold text-red-600 mb-2">
                Negotiation Failed
              </h1>
              <p className="text-xl text-gray-600">
                {gameResult.reason || 'No agreement reached'}
              </p>
            </>
          )}
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-3xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Final Distribution
          </h2>

          {isSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Person A receives</p>
                  <p className="text-5xl font-bold text-green-600">€{gameResult.finalOfferA || gameResult.payoutA}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Person B receives</p>
                  <p className="text-5xl font-bold text-green-600">€{gameResult.finalOfferB || gameResult.payoutB}</p>
                </div>
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-red-200">
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-red-700 mb-4">
                  Alternative options activated:
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/70 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Person A receives</p>
                  <p className="text-4xl font-bold text-gray-800">€{gameResult.payoutA}</p>
                  <p className="text-xs text-gray-500 mt-2">(Alternative option)</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Person B receives</p>
                  <p className="text-4xl font-bold text-gray-800">€{gameResult.payoutB}</p>
                  <p className="text-xs text-gray-500 mt-2">(Alternative option)</p>
                </div>
              </div>
            </div>
          )}

          {/* Your Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 rounded-xl p-6 border border-blue-200"
          >
            <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">
              Your Performance (Person {role})
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Payout</p>
                <p className="text-3xl font-bold text-blue-600">€{myPayout}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Alternative</p>
                <p className="text-3xl font-bold text-gray-700">€{batna}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Difference</p>
                <p className={`text-3xl font-bold ${myPayout - batna >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {myPayout - batna >= 0 ? '+' : ''}€{myPayout - batna}
                </p>
              </div>
            </div>

            {myPayout > batna && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 bg-green-100 rounded-lg p-3 text-center"
              >
                <p className="text-green-700 font-semibold">
                  🎊 You gained €{myPayout - batna} more than your alternative!
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Negotiation Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect rounded-2xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            Negotiation Summary
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Pair ID</p>
              <p className="font-mono font-bold text-gray-800">{pairId}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Rounds</p>
              <p className="text-2xl font-bold text-purple-600">{rounds.length}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className={`text-lg font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {isSuccess ? 'Success' : 'Failed'}
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Opponent Payout</p>
              <p className="text-2xl font-bold text-gray-800">€{opponentPayout}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>Export Data (Excel)</span>
              </>
            )}
          </button>

          <button
            onClick={handlePlayAgain}
            className="button-primary inline-flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Play Again</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="button-secondary"
          >
            Back to Home
          </button>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <div className="glass-effect rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-600">
              💡 <span className="font-semibold">Did you know?</span> This game is based on the classic "Bicycle Negotiation Experiment" 
              used to study negotiation strategies and alternative options in decision-making.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultScreen;
