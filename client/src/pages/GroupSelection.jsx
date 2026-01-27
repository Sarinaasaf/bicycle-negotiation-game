import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';

const groups = [
  { id: 1, bgColor: 'bg-blue-500',   softBtn: 'bg-blue-200' },
  { id: 2, bgColor: 'bg-green-500',  softBtn: 'bg-green-200' },
  { id: 3, bgColor: 'bg-orange-500', softBtn: 'bg-orange-200' },
  { id: 4, bgColor: 'bg-red-500',    softBtn: 'bg-red-200' },
  { id: 5, bgColor: 'bg-indigo-500', softBtn: 'bg-indigo-200' },
  { id: 6, bgColor: 'bg-pink-500',   softBtn: 'bg-pink-200' },
  { id: 7, bgColor: 'bg-yellow-500', softBtn: 'bg-yellow-200' },
];

export default function GroupSelection() {
  const navigate = useNavigate();

  // ✅ WICHTIG: playerId setzen, sonst pairt der Server nicht sauber (dein Server nutzt playerId als key)
  const { socket, setGroupNumber, setPlayerId } = useGame();

  const isReady = !!socket && socket.connected;

  const handleJoin = (g) => {
    if (!socket || !socket.connected) {
      toast.error('No connection to server yet. Please wait a moment.');
      return;
    }

    // ✅ Group speichern
    setGroupNumber(g.id);

    // ✅ playerId speichern (wir nehmen socket.id, weil dein socketHandlers join_game playerId erwartet)
    setPlayerId(socket.id);

    // ✅ weiter wie früher
    navigate('/waiting');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold gradient-text mb-3">Select Your Group</h1>
          <p className="text-xl text-gray-600">
            Choose one of the groups to begin the negotiation
          </p>

          {!isReady && (
            <p className="mt-4 text-orange-600 font-semibold">
              Connecting to server… (first load can take ~30 seconds)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {groups.map((g) => (
            <motion.div
              key={g.id}
              whileHover={{ scale: isReady ? 1.01 : 1 }}
              className={`${g.bgColor} rounded-3xl p-10 text-white shadow-lg`}
            >
              <div className="flex justify-center mb-6">
                <div className="px-10 py-3 rounded-full bg-white/15 text-4xl font-extrabold">
                  Group {g.id}
                </div>
              </div>

              <p className="text-center text-lg md:text-xl font-semibold mb-8">
                You will be randomly assigned as Person A or Person B in this group.
              </p>

              <button
                onClick={() => handleJoin(g)}
                disabled={!isReady}
                className={`w-full ${g.softBtn} text-gray-900 font-extrabold text-2xl py-6 rounded-2xl shadow-sm ${
                  !isReady ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Click to Join
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
