import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const {
    socket,
    playerId,
    groupNumber,
    setRole,
    setPairId,
    setBatna,
    setCurrentTurn,
    setGameStatus
  } = useGame();

  useEffect(() => {
    if (!socket || !playerId) {
      navigate('/select-group');
      return;
    }

    socket.emit('join_game', { playerId });

    socket.on('pair_found', (data) => {
      console.log('Pair found:', data);

      setRole(data.role);
      setPairId(data.pairId);
      setBatna(data.batna);
      setCurrentTurn(data.currentTurn);
      setGameStatus('active');

      toast.success(`Paired successfully! You are Person ${data.role}`);

      setTimeout(() => {
        navigate('/negotiate');
      }, 1500);
    });

    socket.on('waiting_for_pair', (data) => {
      console.log('Waiting for pair:', data.message);
    });

    socket.on('reconnected', (data) => {
      console.log('Reconnected to active game:', data);
      navigate('/negotiate');
    });

    return () => {
      socket.off('pair_found');
      socket.off('waiting_for_pair');
      socket.off('reconnected');
    };
  }, [socket, playerId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="glass-effect rounded-3xl p-12">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-8xl mb-8"
          >
            🔄
          </motion.div>

          <h1 className="text-4xl font-bold gradient-text mb-4">
            Finding Your Partner
          </h1>

          <div className="flex justify-center items-center gap-2 mb-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            ))}
          </div>

          <p className="text-xl text-gray-600 mb-6">
            Please wait while we find another player in your group...
          </p>

          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500 mb-1">Player ID</p>
                <p className="font-mono font-bold text-gray-800">{playerId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Group</p>
                <p className="font-bold text-gray-800">Group {groupNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8"
        >
          <button
            onClick={() => navigate('/select-group')}
            className="button-secondary"
          >
            Cancel & Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WaitingRoom;
