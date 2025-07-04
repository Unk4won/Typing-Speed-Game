// src/sections/Finish.tsx
import React from 'react';

interface FinishProps {
  onRetry: () => void;
  onGoHome: () => void;
  // Modificar la interfaz para incluir score
  results: { wpm: number; accuracy: number; score: number } | null;
}

const Finish: React.FC<FinishProps> = ({ onRetry, onGoHome, results }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center">
      <h2 className="mb-6 text-4xl font-extrabold text-emerald-500">Game Over!</h2>

      {results && (
        <div className="grid grid-cols-1 gap-4 mb-8 text-xl sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-white border rounded-lg shadow-md border-emerald-300">
            <h3 className="text-xl font-semibold text-emerald-700">WPM</h3>
            <p className="mt-2 text-3xl font-bold text-zinc-800">{results.wpm.toFixed(0)}</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-md border-emerald-300">
            <h3 className="text-xl font-semibold text-emerald-700">Accuracy</h3>
            <p className="mt-2 text-3xl font-bold text-zinc-800">{results.accuracy.toFixed(1)}%</p>
          </div>
          {/* Nuevo: Mostrar Score */}
          <div className="p-4 bg-white border rounded-lg shadow-md border-emerald-300">
            <h3 className="text-xl font-semibold text-emerald-700">Score</h3>
            <p className="mt-2 text-3xl font-bold text-zinc-800">{results.score.toFixed(0)}</p>
          </div>
        </div>
      )}

      {!results && (
        <p className="mb-8 text-xl text-zinc-800">Cargando resultados...</p>
      )}


      <div className="flex gap-4 mt-8">
        <button
          onClick={onRetry}
          className="px-6 py-2 font-bold text-white transition duration-300 rounded bg-emerald-500 hover:bg-emerald-600"
        >
          Retry
        </button>
        <button
          onClick={onGoHome}
          className="px-6 py-2 font-bold text-white transition duration-300 bg-gray-700 rounded hover:bg-gray-600"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default Finish;