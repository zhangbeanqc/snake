import { AuthProvider, useAuth } from './context/AuthContext';
import { GameDataProvider } from './context/GameDataContext';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import GameCanvas from './components/GameCanvas';
import ScoreBoard from './components/ScoreBoard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center" style={{ flex: 1 }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <>
      <Header />
      <div className="game-container">
        <GameCanvas />
        <div className="game-sidebar">
          <ScoreBoard />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameDataProvider>
        <AppContent />
      </GameDataProvider>
    </AuthProvider>
  );
}
