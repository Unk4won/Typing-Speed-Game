// src/sections/Finish.tsx
import React from 'react';
import type { FinishProps } from '../types'; // Importa FinishProps como un tipo

const Finish: React.FC<FinishProps> = ({ wpm, accuracy, score, onRestartGame, onGoHome }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-6 text-4xl font-bold text-emerald-500">¡Juego Terminado!</h2>

      <div className="grid w-full max-w-xl grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-zinc-700">WPM</h3>
          <p className="text-3xl font-bold text-emerald-600">{wpm.toFixed(0)}</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-zinc-700">Precisión</h3>
          <p className="text-3xl font-bold text-emerald-600">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-zinc-700">Puntuación</h3>
          <p className="text-3xl font-bold text-emerald-600">{score.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onRestartGame}
          className="w-64 px-6 py-3 text-lg font-medium text-white transition-colors duration-300 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Reintentar
        </button>
        <button
          onClick={onGoHome}
          className="w-64 px-6 py-3 text-lg font-medium text-white transition-colors duration-300 bg-gray-500 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default Finish;