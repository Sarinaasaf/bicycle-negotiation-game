import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { joinGame } from '../services/api';
import { toast } from 'react-toastify';

const groups = [
  { id: 1, batnaA: 0, batnaB: 0, color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 2, batnaA: 0, batnaB: 300, color: 'from-green-400 to-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { id: 3, batnaA: 0, batnaB: 500, color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { id: 4, batnaA: 0, batnaB: 600, color: 'from-red-400 to-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
];

const GroupSelection = () => {
  const navigate = useNavigate();
  const { socket, setPlayerId, setGroupNumber, setGameStatus } = useGame();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectGroup = async (groupId) => {
    if (!socket) {
      toast.error('Connection not established. Please refresh the page.');
      return;
    }

    setLoading(true);
    setSelectedGroup(groupId);

    try {
      // Join game via API
      const response = await joinGame(groupId, socket.id);
      
      if (response.success) {
        setPlayerId(response.player.playerId);
        setGroupNumber(response.player.groupNumber);
        setGameStatus('waiting');
        
        toast.success('Joined successfully! Finding a partner...');
        
        // Navigate to waiting room
        navigate('/waiting');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error(error.message || 'Failed to join game. Please try again.');
      setLoading(false);
      setSelectedGroup(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold gradient-text mb-4"
          >
            Select Your Group
          </motion.h1>
          <p className="text-xl text-gray-600">
            Choose one of the four groups to begin the negotiation
          </p>
        </div>

        {/* Group Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !loading && handleSelectGroup(group.id)}
              className={`
                ${group.bgColor} 
                ${selectedGroup === group.id ? 'ring-4 ring-offset-2 ring-blue-500' : ''}
                border-2 ${group.borderColor}
                rounded-3xl p-8 cursor-pointer
                transform transition-all duration-300
                hover:shadow-2xl
                ${loading && selectedGroup !== group.id ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="text-center">
                <div className={`inline-block bg-gradient-to-r ${group.color} text-white text-3xl font-bold px-6 py-3 rounded-full mb-4`}>
                  Group {group.id}
                </div>

                <div className="space-y-4 mt-6">
                  <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Group Configuration</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {group.id === 1 && "Equal negotiation (No alternatives)"}
                      {group.id === 2 && "Moderate advantage for one side"}
                      {group.id === 3 && "Strong advantage for one side"}
                      {group.id === 4 && "Very strong advantage for one side"}
                    </p>
                  </div>
                </div>

                {loading && selectedGroup === group.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
                    <p className="text-sm text-gray-600 mt-2">Joining...</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1 text-gray-700">
              <p className="font-semibold mb-2">About Groups:</p>
              <p className="text-sm leading-relaxed">
                Each group has different negotiation dynamics. You will be randomly assigned as Person A or Person B after joining.
                Your alternative selling option (the amount you can receive if negotiation fails) will be revealed after pairing.
                Choose a group and find out your role!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate('/')}
            disabled={loading}
            className="button-secondary"
          >
            ← Back to Introduction
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GroupSelection;
