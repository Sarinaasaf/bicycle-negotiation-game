import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [playerId, setPlayerId] = useState(() => localStorage.getItem('playerId') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [pairId, setPairId] = useState(() => localStorage.getItem('pairId') || null);
  const [groupNumber, setGroupNumber] = useState(() => {
    const saved = localStorage.getItem('groupNumber');
    return saved ? parseInt(saved) : null;
  });
  const [batna, setBatna] = useState(() => {
    const saved = localStorage.getItem('batna');
    return saved ? parseInt(saved) : 0;
  });
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, active, completed, failed
  const [rounds, setRounds] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  // Save to localStorage when values change
  useEffect(() => {
    if (playerId) localStorage.setItem('playerId', playerId);
    else localStorage.removeItem('playerId');
  }, [playerId]);

  useEffect(() => {
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [role]);

  useEffect(() => {
    if (pairId) localStorage.setItem('pairId', pairId);
    else localStorage.removeItem('pairId');
  }, [pairId]);

  useEffect(() => {
    if (groupNumber) localStorage.setItem('groupNumber', groupNumber.toString());
    else localStorage.removeItem('groupNumber');
  }, [groupNumber]);

  useEffect(() => {
    if (batna !== null) localStorage.setItem('batna', batna.toString());
  }, [batna]);

  useEffect(() => {
    // Initialize socket connection
    const serverUrl = import.meta.env.VITE_API_URL || '';
    const socketOptions = {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 60000 // 60 seconds for Render cold start
    };
    const newSocket = serverUrl ? io(serverUrl, socketOptions) : io(socketOptions);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      toast.success('Connected to server!');
      
      // Try to reconnect if we have a saved playerId
      const savedPlayerId = localStorage.getItem('playerId');
      const savedPairId = localStorage.getItem('pairId');
      if (savedPlayerId && savedPairId) {
        console.log('🔄 Attempting to reconnect player:', savedPlayerId);
        newSocket.emit('reconnect_player', { playerId: savedPlayerId });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Server is waking up... Please wait 30 seconds', {
        autoClose: 10000
      });
    });

    newSocket.on('reconnected', (data) => {
      console.log('✅ Reconnected successfully:', data);
      setPairId(data.pairId);
      setRole(data.role);
      setBatna(data.batna);
      setCurrentTurn(data.currentTurn);
      setCurrentRound(data.currentRound);
      setGroupNumber(data.groupNumber);
      setGameStatus('active');
      toast.success('Reconnected to game!');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      toast.warning('Disconnected from server. Reconnecting...');
    });

    newSocket.on('error', (data) => {
      toast.error(data.message || 'An error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    playerId,
    setPlayerId,
    role,
    setRole,
    pairId,
    setPairId,
    groupNumber,
    setGroupNumber,
    batna,
    setBatna,
    currentTurn,
    setCurrentTurn,
    currentRound,
    setCurrentRound,
    gameStatus,
    setGameStatus,
    rounds,
    setRounds,
    gameResult,
    setGameResult
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
