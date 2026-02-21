import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';

import MemoryMatch from './games/MemoryMatch/MemoryMatch';
import Snake from './games/Snake/Snake';
import RockPaperScissors from './games/RPS/RockPaperScissors';
import SimonSays from './games/SimonSays/SimonSays';

// New Games
import TRexRunner from './games/TRexRunner/TRexRunner';
import FlappyBird from './games/FlappyBird/FlappyBird';
import JetpackJoyride from './games/JetpackJoyride/JetpackJoyride';
import CrossyRoad from './games/CrossyRoad/CrossyRoad';
import Stack from './games/Stack/Stack';
import WhacAMole from './games/WhacAMole/WhacAMole';
import Breakout from './games/Breakout/Breakout';
import BubbleShooter from './games/BubbleShooter/BubbleShooter';
import Peggle from './games/Peggle/Peggle';
import PacMan from './games/PacMan/PacMan';
import Tron from './games/Tron/Tron';
import VampireSurvivors from './games/VampireSurvivors/VampireSurvivors';
import Profile from './components/Profile';
import SettingsBar from './components/SettingsBar';
import { GameProvider, useGame } from './context/GameContext';
import { Gamepad2, Trophy, Flame } from 'lucide-react';
import SoundManager from './utils/SoundManager';
import PageLoader from './components/PageLoader';

/* ===================================
   HEADER COMPONENT
   =================================== */

const Header = () => {
  const { points, streak, profile } = useGame();
  const location = useLocation();
  const isGameRoute = ['/memory', '/snake', '/rps', '/simon', '/trex', '/flappy', '/jetpack', '/crossy', '/stack', '/whac-a-mole', '/breakout', '/bubble', '/peggle', '/pacman', '/tron', '/vampire'].includes(location.pathname);

  return (
    <nav className="glass-header" style={{
      height: 'var(--header-height)',
      padding: '0 var(--space-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 100,
      gap: 'var(--space-sm)'
    }}>
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          fontSize: isGameRoute ? 'var(--text-base)' : 'var(--text-lg)',
          fontWeight: 'bold',
          transition: 'font-size var(--transition-base)',
          flexShrink: 0
        }}
        onClick={() => SoundManager.playClick()}
      >
        <Gamepad2 size={24} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span className="hide-mobile">MiniGames</span>
      </Link>

      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        alignItems: 'center',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            color: 'var(--accent)',
            fontSize: 'var(--text-sm)',
            background: 'var(--bg-surface)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--radius-full)'
          }}
          title="Total Points"
        >
          <Trophy size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 'bold' }}>{points}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            color: 'var(--warning)',
            fontSize: 'var(--text-sm)',
            background: 'var(--bg-surface)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--radius-full)'
          }}
          title="Current Streak"
        >
          <Flame size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 'bold' }}>{streak}</span>
        </div>

        <Link
          to="/profile"
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)',
            height: 'auto',
            border: 'none'
          }}
          onClick={() => SoundManager.playClick()}
        >
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{profile.avatar}</span>
          <span style={{ fontWeight: '600' }} className="hide-mobile">{profile.name}</span>
        </Link>
      </div>
    </nav>
  );
};

/* ===================================
   LAYOUT COMPONENT
   =================================== */

const Layout = () => {
  const location = useLocation();
  const isGameRoute = ['/memory', '/snake', '/rps', '/simon', '/trex', '/flappy', '/jetpack', '/crossy', '/stack', '/whac-a-mole', '/breakout', '/bubble', '/peggle', '/pacman', '/tron', '/vampire'].includes(location.pathname);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content" style={{ overflowY: isGameRoute ? 'hidden' : 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/memory" element={<MemoryMatch />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/simon" element={<SimonSays />} />

          {/* New Games */}
          <Route path="/trex" element={<TRexRunner />} />
          <Route path="/flappy" element={<FlappyBird />} />
          <Route path="/jetpack" element={<JetpackJoyride />} />
          <Route path="/crossy" element={<CrossyRoad />} />
          <Route path="/stack" element={<Stack />} />
          <Route path="/whac-a-mole" element={<WhacAMole />} />
          <Route path="/breakout" element={<Breakout />} />
          <Route path="/bubble" element={<BubbleShooter />} />
          <Route path="/peggle" element={<Peggle />} />
          <Route path="/pacman" element={<PacMan />} />
          <Route path="/tron" element={<Tron />} />
          <Route path="/vampire" element={<VampireSurvivors />} />
        </Routes>
      </main>
      <SettingsBar />
    </div>
  );
};

/* ===================================
   APP CONTENT WRAPPER
   =================================== */

const AppContent = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Layout />
    </Router>
  );
};

/* ===================================
   MAIN APP COMPONENT
   =================================== */

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // After fade-out animation completes, remove loader entirely
      setTimeout(() => setIsLoading(false), 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GameProvider>
      {isLoading && <PageLoader fadingOut={isFadingOut} />}
      <AppContent />
    </GameProvider>
  );
}

export default App;
