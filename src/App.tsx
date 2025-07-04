// src/App.tsx
import React, { useState } from 'react';
import Game from './sections/Game';
import Finish from './sections/Finish';
import Home from './sections/Home';
import type { AppState } from './types'; // Importa AppState como un tipo

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [numWords, setNumWords] = useState<number>(10); // Default a 10 palabras

  const handleGameFinish = (finalWpm: number, finalAccuracy: number, finalScore: number) => {
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setScore(finalScore);
    setAppState('finish');
  };

  const handleStartGame = (selectedNumWords: number) => {
    setNumWords(selectedNumWords);
    setAppState('game');
  };

  const handleRestartGame = () => {
    setAppState('game'); // Reinicia el juego con la misma configuración de palabras
  };

  const handleGoHome = () => {
    setAppState('home'); // Vuelve a la pantalla de inicio
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 font-varela-round">
      {appState === 'home' && <Home onStartGame={handleStartGame} />}
      {appState === 'game' && <Game onGameFinish={handleGameFinish} numWords={numWords} />}
      {appState === 'finish' && (
        <Finish
          wpm={wpm}
          accuracy={accuracy}
          score={score}
          onRestartGame={handleRestartGame}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
};

export default App;