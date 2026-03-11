import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = API_BASE ? `${API_BASE.replace(/\/+$/, '')}/api/game` : '/api/game';

export const joinGame = async (groupNumber, socketId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/join`, {
      groupNumber,
      socketId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getGameState = async (pairId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/state/${pairId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitOffer = async (pairId, playerId, offerA, offerB) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/offer`, {
      pairId,
      playerId,
      offerA,
      offerB
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitResponse = async (pairId, playerId, response, offerA, offerB) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/response`, {
      pairId,
      playerId,
      response,
      offerA,
      offerB
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportGameData = async (pairId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/${pairId}`, {
      responseType: 'blob'
    });
    
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `negotiation_${pairId}_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};
