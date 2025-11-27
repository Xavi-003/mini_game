import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TicTacToe from './games/TicTacToe/TicTacToe';
import MemoryMatch from './games/MemoryMatch/MemoryMatch';
import Snake from './games/Snake/Snake';
import RockPaperScissors from './games/RPS/RockPaperScissors';
import SimonSays from './games/SimonSays/SimonSays';
import Profile from './components/Profile';
import SettingsBar from './components/SettingsBar';
import { GameProvider, useGame } from './context/GameContext';
import { Gamepad2, Trophy, Flame, User } from 'lucide-react';
import SoundManager from './utils/SoundManager';

const Header = () => {
  const { points, streak, profile } = useGame();

  return (
    <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }} onClick={() => SoundManager.playClick()}>
        <Gamepad2 color="var(--accent)" />
        <span>MiniGames</span>
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }} title="Total Points">
          <Trophy size={18} />
          <span style={{ fontWeight: 'bold' }}>{points}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316' }} title="Current Streak">
          <Flame size={18} />
          <span style={{ fontWeight: 'bold' }}>{streak}</span>
        </div>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2rem' }} onClick={() => SoundManager.playClick()}>
          <span style={{ fontSize: '1.2rem' }}>{profile.avatar}</span>
          <span style={{ fontWeight: '600' }}>{profile.name}</span>
        </Link>
      </div>
    </nav>
  );
};

const Layout = () => {
  const { scale } = useGame();
  const location = useLocation();
  const isGameRoute = ['/tictactoe', '/memory', '/snake', '/rps', '/simon'].includes(location.pathname);

  return (
    <div className="app-container" style={{
      height: isGameRoute ? '100vh' : 'auto',
      overflow: isGameRoute ? 'hidden' : 'auto'
    }}>
      <Header />
      <main style={{
        flex: 1,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.3s ease',
        overflowY: isGameRoute ? 'hidden' : 'visible',
        height: isGameRoute ? '100%' : 'auto',
        position: 'relative'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/memory" element={<MemoryMatch />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/simon" element={<SimonSays />} />
        </Routes>
      </main>
      <SettingsBar />
    </div>
  );
};

const AppContent = () => {
  return (
    <Router basename="/mini_game">
      <Layout />
    </Router>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
