useEffect(() => {
  if (!socket) {
    navigate('/select-group');
    return;
  }

  if (!groupNumber) {
    navigate('/select-group');
    return;
  }

  // ✅ nutze socket.id als "playerId", falls keine vorhanden ist
  const effectivePlayerId = playerId || socket.id;

  // ✅ join_game mit groupNumber (wichtig)
  socket.emit('join_game', { playerId: effectivePlayerId, groupNumber });

  const onPairFound = (data) => {
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
  };

  const onWaiting = (data) => {
    console.log('Waiting for pair:', data?.message);
  };

  const onReconnected = (data) => {
    console.log('Reconnected to active game:', data);
    navigate('/negotiate');
  };

  socket.on('pair_found', onPairFound);
  socket.on('waiting_for_pair', onWaiting);
  socket.on('reconnected', onReconnected);

  return () => {
    socket.off('pair_found', onPairFound);
    socket.off('waiting_for_pair', onWaiting);
    socket.off('reconnected', onReconnected);
  };
}, [socket, playerId, groupNumber, navigate, setRole, setPairId, setBatna, setCurrentTurn, setGameStatus]);
