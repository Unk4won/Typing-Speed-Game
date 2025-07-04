// src/App.tsx
import { useState } from "react";
import { AppState } from "./types";

import Game from "./Sections/Game";
import Finish from "./Sections/Finish";

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  // Modificar gameResults para incluir el score
  const [gameResults, setGameResults] = useState<{ wpm: number; accuracy: number; score: number } | null>(null);

  const handleStartGame = () => {
    console.log("Starting game...");
    setAppState('game');
    setGameResults(null);
  }

  // Modificar handleGameFinish para aceptar el score
  const handleGameFinish = (wpm: number, accuracy: number, score: number) => {
    console.log('Cambiando a estado: results', { wpm, accuracy, score });
    setGameResults({ wpm, accuracy, score });
    setAppState('results');
  };

  const handleGoHome = () => {
    console.log('Cambiando a estado: home');
    setAppState('home');
  };

  const handleRetry = () => {
    console.log('Cambiando a estado: game (reintentar)');
    setAppState('game');
    setGameResults(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="mb-4 text-5xl font-extrabold md:text6xl">
              TYPE <span className="text-emerald-500">MASTER </span>
            </h1>
            <p className="mb-8 text-xl text-center text-gray-300">
              Test your typing speed and accuracy!
            </p>
            <button
              onClick={handleStartGame}
              className="px-8 py-3 text-lg font-bold text-white transition-all ease-in-out transform border rounded-full bg-emerald-500 border-emerald-500 hover:bg-transparent hover:text-emerald-600 duration-400 hover:scale-105 "
            >
              Start Typing
            </button>
          </div>
        );
      case 'game':
        return <Game onGameFinish={handleGameFinish} />;
      case 'results':
        // Pasar los resultados, incluyendo el score
        return <Finish onRetry={handleRetry} onGoHome={handleGoHome} results={gameResults} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 text-zinc-800 ">
      <div className="w-full max-w-4xl">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;