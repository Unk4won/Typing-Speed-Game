// src/App.tsx
import { useState } from "react";
import { AppState } from "./types";

import Game from "./Sections/Game";
import Finish from "./Sections/Finish";

// Definir los tipos para la dificultad
type GameDifficulty = 'easy' | 'medium' | 'hard';

// Map de dificultad a número de palabras
const difficultyWordCounts: Record<GameDifficulty, number> = {
  easy: 30,
  medium: 60,
  hard: 100,
};

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [gameResults, setGameResults] = useState<{ wpm: number; accuracy: number; score: number } | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('easy'); // Estado para la dificultad

  const handleStartGame = () => {
    console.log("Starting game with difficulty:", selectedDifficulty);
    setAppState('game');
    setGameResults(null);
  }

  const handleGameFinish = (wpm: number, accuracy: number, score: number) => {
    console.log('Cambiando a estado: results', { wpm, accuracy, score });
    setGameResults({ wpm, accuracy, score });
    setAppState('results');
  };

  const handleGoHome = () => {
    console.log('Cambiando a estado: home');
    setAppState('home');
    setSelectedDifficulty('easy'); // Resetear dificultad al volver a casa
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
            <h1 className="mb-4 text-5xl font-extrabold md:text-6xl">
              TYPE <span className="text-emerald-500">MASTER </span>
            </h1>
            <p className="mb-8 text-xl text-center text-gray-300">
              Test your typing speed and accuracy!
            </p>

            {/* Selector de Dificultad */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300
                  ${selectedDifficulty === 'easy' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Easy (30)
              </button>
              <button
                onClick={() => setSelectedDifficulty('medium')}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300
                  ${selectedDifficulty === 'medium' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Medium (60)
              </button>
              <button
                onClick={() => setSelectedDifficulty('hard')}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300
                  ${selectedDifficulty === 'hard' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Hard (100)
              </button>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-3 text-lg font-bold text-white transition-all ease-in-out transform border rounded-full bg-emerald-500 border-emerald-500 hover:bg-transparent hover:text-emerald-600 duration-400 hover:scale-105 "
            >
              Start Typing
            </button>
          </div>
        );
      case 'game':
        // Pasar la cantidad de palabras basada en la dificultad seleccionada
        return <Game
                 onGameFinish={handleGameFinish}
                 numWords={difficultyWordCounts[selectedDifficulty]}
               />;
      case 'results':
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