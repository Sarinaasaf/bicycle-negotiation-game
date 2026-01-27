import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';

const WaitingRoom = () => {
  const navigate = useNavigate();

  const {
    socket,
    playerId,
    setPlayerId,
    groupNumber,
    setRole,
    setPairId,
    setBatna,
    setCurrentTurn,
    setGameStatus
  } = useGame();

  // ✅ verhindert mehrfaches join_game (React re-render / StrictMode)
  const didJoinRef = useRef(false);

  useEffect(() => {
    if (!socket) {
      navigate('/select-group');
      return;
    }

    if (!groupNumber) {
      navigate('/select-group');
      return;
    }

    // warten bis socket.id existiert
    const effectivePlayerId = playerId || socket.id;
    if (!effectivePlayerId) return;

    // ✅ join_game nur EINMAL senden
    if (!didJoinRef.current) {
      didJoinRef.current = true;

      if (!playerId) setPlayerId(effectivePlayerId);

      console.log('➡️ emitting join_game', { playerId: effectivePlayerId, groupNumber });
      socket.emit('join_game', { playerId: effectivePlayerId, groupNumber });
    }

    const onPairFound = (data) => {
      console.log('✅ pair_found', data);

      setRole(data.role);
      setPairId(data.pairId);
      setBatna(data.batna);
      setCurrentTurn(data.currentTurn);
      setGameStatus('active');

      toast.success(`Paired successfully! You are Person ${data.role}`);

      // schnell weiter
      setTimeout(() => navigate('/negotiate'), 500);
    };

    const onWaiting = (data) => {
      console.log('⏳ waiting_for_pair', data?.message);
    };

    const onError = (data) => {
      console.error('❌ socket error', data);
      toast.error(data?.message || 'Server error');
    };

    socket.on('pair_found', onPairFound);
    socket.on('waiting_for_pair', onWaiting);
    socket.on('error', onError);

    return () => {
      socket.off('pair_found', onPairFound);
      socket.off('waiting_for_pair', onWaiting);
      socket.off('error', onError);
    };
  }, [
    socket,
    groupNumber,
    navigate,
    playerId,
    setPlayerId,
    setRole,
    setPairId,
    setBatna,
    setCurrentTurn,
    setGameStatus
  ]);

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
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl mb-8"
          >
            🔄
          </motion.div>

          <h1 className="text-4xl font-bold gradient-text mb-4">
            Finding Your Partner
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            Please wait while we find another player in your group...
          </p>

          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500 mb-1">Player ID</p>
                <p className="font-mono font-bold text-gray-800">
                  {playerId || socket?.id || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Group</p>
                <p className="font-bold text-gray-800">Group {groupNumber}</p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/select-group')} className="button-secondary">
            Cancel & Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingRoom;
