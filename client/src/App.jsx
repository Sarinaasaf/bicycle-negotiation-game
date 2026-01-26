// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import IntroScreen from './pages/IntroScreen';
import GroupSelection from './pages/GroupSelection';
import WaitingRoom from './pages/WaitingRoom';
import NegotiationScreen from './pages/NegotiationScreen';
import ResultScreen from './pages/ResultScreen';

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={4000} />
      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route path="/select-group" element={<GroupSelection />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/negotiate" element={<NegotiationScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
