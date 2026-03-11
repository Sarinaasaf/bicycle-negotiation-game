import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const [playerId, setPlayerId] = useState(() => localStorage.getItem('playerId') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [pairId, setPairId] = useState(() => localStorage.getItem('pairId') || null);

  const [groupNumber, setGroupNumber] = useState(() => {
    const saved = localStorage.getItem('groupNumber');
    return saved ? parseInt(saved, 10) : null;
  });

  const [batna, setBatna] = useState(() => {
    const saved = localStorage.getItem('batna');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState('idle'); 
  const [rounds, setRounds] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  
  const wakingToastIdRef = useRef(null);
  const lastWakingToastAtRef = useRef(0);

  const showWakingToast = () => {
    const now = Date.now();
    const cooldownMs = 8000; 
    if (now - lastWakingToastAtRef.current < cooldownMs) return;
    lastWakingToastAtRef.current = now;

    // if already shown, don't stack
    if (wakingToastIdRef.current && toast.isActive(wakingToastIdRef.current)) return;

    wakingToastIdRef.current = toast.error('Server is waking up... Please wait ~30 seconds', {
      autoClose: 10000,
    });
  };

  const clearWakingToast = () => {
    if (wakingToastIdRef.current && toast.isActive(wakingToastIdRef.current)) {
      toast.dismiss(wakingToastIdRef.current);
    }
    wakingToastIdRef.current = null;
  };

  // localStorage sync 
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
    if (groupNumber) localStorage.setItem('groupNumber', String(groupNumber));
    else localStorage.removeItem('groupNumber');
  }, [groupNumber]);

  useEffect(() => {
    if (batna !== null) localStorage.setItem('batna', String(batna));
  }, [batna]);

  
  useEffect(() => {
    const raw = import.meta.env.VITE_API_URL;

    
    const serverUrl = (raw || '').trim().replace(/\/+$/, '');

    if (!serverUrl) {
      console.error('❌ VITE_API_URL is missing. Set it in client/.env');
      toast.error('Config error: VITE_API_URL missing (client/.env)');
      return;
    }

    const newSocket = io(serverUrl, {
      
      transports: ['websocket', 'polling'],
      withCredentials: true,

      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,

      timeout: 60000, // Render cold start
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      clearWakingToast();
      toast.success('Connected to server!');

      const savedPlayerId = localStorage.getItem('playerId');
      const savedPairId = localStorage.getItem('pairId');

      
      if (savedPlayerId && savedPairId) {
        console.log('🔄 Attempting to reconnect player:', savedPlayerId);
        newSocket.emit('reconnect_player', { playerId: savedPlayerId });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ connect_error:', error?.message || error);
      showWakingToast();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected:', reason);
      
      toast.warn('Disconnected. Trying to reconnect...', { autoClose: 4000 });
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

      clearWakingToast();
      toast.success('Reconnected to game!');
    });

    newSocket.on('error', (data) => {
      toast.error(data?.message || 'An error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
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
    setGameResult,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
