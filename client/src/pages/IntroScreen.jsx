import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useState, useEffect } from 'react';

const IntroScreen = () => {
  const navigate = useNavigate();
  const { socket } = useGame();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket) {
      setIsConnected(socket.connected);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold gradient-text mb-4">
            🚲 Bicycle Negotiation Game
          </h1>
          <p className="text-xl text-gray-600">
            A Strategic Two-Player Negotiation Simulation
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-3xl p-8 md:p-12 mb-8"
        >
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p className="text-center font-semibold text-2xl text-gray-800 mb-6">
              Welcome to the Bicycle Negotiation Game!
            </p>

            {/* Text explanation only */}
            <p className="text-center">
              Two people each own different parts of a bicycle.
              One year ago, <span className="font-semibold">Person A paid €200</span>
              {' '}for the wheels, and <span className="font-semibold">Person B paid €600</span>
              {' '}for the bicycle frame.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 my-6"
            >
              <p className="text-center text-xl">
                <span className="font-bold text-green-700">Only together</span>{' '}
                can they assemble a complete bicycle and sell it today for{' '}
                <span className="text-3xl font-bold text-green-600">€1,000</span>.
              </p>
            </motion.div>

            <p className="text-center">
              They must now decide how the <span className="font-bold">€1,000</span>
              {' '}should be divided between them.
            </p>

            <p className="text-center text-sm text-gray-600">
              The old amounts (€200 and €600) are simply historical purchase prices.
              They do <span className="font-semibold">not</span> determine how the €1,000
              {' '}is split today—they only describe what each person originally paid
              {' '}one year ago.
            </p>

            {/* 🔥 BATNA-Kasten wurde komplett entfernt */}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 150 }}
          className="text-center"
        >
          {!isConnected && (
            <div className="mb-4 bg-orange-100 border-2 border-orange-300 rounded-xl p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <p className="text-orange-700 font-semibold">
                  Connecting to server... (This may take up to 30 seconds on first load)
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/select-group')}
            disabled={!isConnected}
            className={`button-primary inline-flex items-center gap-3 text-xl ${
              !isConnected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            👉 Start the Game
          </button>

          {isConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-semibold mt-3"
            >
              ✅ Connected and ready!
            </motion.p>
          )}
        </motion.div>

        {/* Decorative Icons */}
        <div className="fixed top-10 left-10 text-6xl opacity-20 animate-float">🚲</div>
        <div
          className="fixed bottom-10 right-10 text-6xl opacity-20 animate-float"
          style={{ animationDelay: '1s' }}
        >
          💰
        </div>
      </motion.div>
    </div>
  );
};

export default IntroScreen;
