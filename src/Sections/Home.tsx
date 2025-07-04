// src/sections/Home.tsx
import React from 'react';

interface HomeProps {
  onStartGame: (numWords: number) => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-6 text-5xl font-bold text-emerald-600">
        TYPE MASTER
      </h1>
      <p className="mb-10 text-xl text-zinc-700">
        ¡Mejora tu velocidad y precisión de escritura!
      </p>

      <h2 className="mb-4 text-2xl font-semibold text-zinc-800">
        Selecciona la Dificultad:
      </h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => onStartGame(10)}
          className="w-64 px-6 py-3 text-lg font-medium text-white transition-colors duration-300 rounded-lg shadow-md bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
        >
          Fácil (10 Palabras)
        </button>
        <button
          onClick={() => onStartGame(25)}
          className="w-64 px-6 py-3 text-lg font-medium text-white transition-colors duration-300 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Normal (25 Palabras)
        </button>
        <button
          onClick={() => onStartGame(50)}
          className="w-64 px-6 py-3 text-lg font-medium text-white transition-colors duration-300 bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Difícil (50 Palabras)
        </button>
      </div>
    </div>
  );
};

export default Home;