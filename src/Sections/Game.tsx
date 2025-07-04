// src/sections/Game.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { words } from '../data/words';
import { calculateWPMAndAccuracy } from '../utils/calculateWPM';
import { useTimer } from '../hooks/useTimer';

interface GameProps {
  onGameFinish: (wpm: number, accuracy: number, score: number) => void;
  numWords: number; // Nueva prop: cantidad de palabras a generar
}

const Game: React.FC<GameProps> = ({ onGameFinish, numWords }) => { // Recibir numWords
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [typedWord, setTypedWord] = useState<string>('');
  const [correctWordsCount, setCorrectWordsCount] = useState<number>(0);
  const [incorrectWordsCount, setIncorrectWordsCount] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0);
  const [correctTypedChars, setCorrectTypedChars] = useState<number>(0);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { time: timer, startTimer, stopTimer, resetTimer } = useTimer({
    initialTime: 60, // Puedes mantener esto fijo o hacerlo configurable también
    onTimerEnd: () => {
      if (isGameStarted && endTime === null) {
        stopGame();
      }
    },
    startOnMount: false,
  });

  // Generar palabras para el juego basado en numWords
  useEffect(() => {
    const generatedWords: string[] = [];
    for (let i = 0; i < numWords; i++) { // Usar numWords aquí
      const randomIndex = Math.floor(Math.random() * words.length);
      generatedWords.push(words[randomIndex]);
    }
    setTargetWords(generatedWords);
    setCurrentWordIndex(0);
    setTypedWord('');
    setCorrectWordsCount(0);
    setIncorrectWordsCount(0);
    setTotalTypedChars(0);
    setCorrectTypedChars(0);
    setStartTime(null);
    setEndTime(null);
    setIsGameStarted(false);
    resetTimer();

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [numWords]); // Importante: Añadir numWords a las dependencias del useEffect

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isGameStarted) {
      setIsGameStarted(true);
      setStartTime(Date.now());
      startTimer();
    }

    if (value.endsWith(' ') || value.endsWith('\n')) {
      const wordToCheck = value.trim();
      const currentTargetWord = targetWords[currentWordIndex];

      if (wordToCheck === currentTargetWord) {
        setCorrectWordsCount((prev) => prev + 1);
        setCorrectTypedChars((prev) => prev + currentTargetWord.length + 1); // +1 por el espacio
      } else {
        setIncorrectWordsCount((prev) => prev + 1);
        for (let i = 0; i < wordToCheck.length && i < currentTargetWord.length; i++) {
          if (wordToCheck[i] === currentTargetWord[i]) {
            setCorrectTypedChars((prev) => prev + 1);
          }
        }
        if (wordToCheck.length >= currentTargetWord.length) {
            setCorrectTypedChars((prev) => prev + 1);
        }
      }
      setTotalTypedChars((prev) => prev + wordToCheck.length + 1);
      setTypedWord('');
      setCurrentWordIndex((prev) => prev + 1);

      if (currentWordIndex + 1 >= targetWords.length) {
        stopGame();
      }
    } else {
      setTypedWord(value);
    }
  };

  const stopGame = () => {
    stopTimer();
    if (endTime === null) {
        setEndTime(Date.now());
    }
    setIsGameStarted(false);

    const durationInSeconds = startTime ? ((endTime || Date.now()) - startTime) / 1000 : 0;
    const finalTargetTextLength = targetWords.join(' ').length + targetWords.length -1; // Sumar espacios entre palabras

    const { wpm, accuracy } = calculateWPMAndAccuracy(
      finalTargetTextLength,
      correctTypedChars,
      totalTypedChars,
      durationInSeconds
    );

    let score = 0;
    score += correctWordsCount * 10;
    // Aquí puedes refinar la dificultad del score, por ejemplo, más puntos por palabras más largas en nivel "hard"
    // o un multiplicador de score basado en `numWords` (dificultad)
    score += Math.floor(correctWordsCount * (numWords / 30)); // Multiplicador de score por dificultad

    onGameFinish(wpm, accuracy, score);
  };

  const renderCurrentWords = useMemo(() => {
    return targetWords.map((word, wordIndex) => {
      const isCurrentWord = wordIndex === currentWordIndex;
      const hasBeenTyped = wordIndex < currentWordIndex;
      let wordClass = '';

      if (hasBeenTyped) {
        wordClass = 'text-gray-400';
      } else if (isCurrentWord) {
        return (
          <span key={wordIndex} className="mr-2">
            {word.split('').map((char, charIndex) => {
              let charClass = 'text-zinc-700';
              if (charIndex < typedWord.length) {
                charClass = (char === typedWord[charIndex]) ? 'text-green-500' : 'text-red-500';
              }
              return (
                <span key={charIndex} className={charClass}>
                  {char}
                </span>
              );
            })}
          </span>
        );
      }

      return (
        <span key={wordIndex} className={`${wordClass} mr-2`}>
          {word}
        </span>
      );
    });
  }, [targetWords, currentWordIndex, typedWord]);

  const currentDuration = startTime && !endTime ? (Date.now() - startTime) / 1000 : 0;
  // Este cálculo de `currentTargetTextLength` y los `dynamicCorrectChars`/`dynamicTotalTypedChars`
  // es un poco más complejo cuando se usa la vista de palabras.
  // Para la visualización en vivo, simplemente podemos usar las cuentas totales hasta el momento.
  const { wpm: currentWPM, accuracy: currentAccuracy } = calculateWPMAndAccuracy(
    targetWords.join(' ').length + (targetWords.length > 0 ? targetWords.length - 1 : 0), // Longitud objetivo total
    correctTypedChars, // Caracteres correctos acumulados
    totalTypedChars,   // Caracteres tipeados acumulados
    currentDuration
  );


  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center ">
      <h2 className="mb-4 text-4xl font-bold text-emerald-500">
        TYPE MASTER
      </h2>
      <p className='text-xl text-zinc-800 mb-9'>Test your typing speed!</p>

      <div className='flex justify-between w-full max-w-xl '>

        <div className="flex flex-col items-center justify-center w-32 h-32 gap-4 mb-6 text-center ">
          <h3 className='text-2xl font-medium text-emerald-500'>WPM</h3>
          <div className='w-full py-2 border-2 rounded-lg border-emerald-500 max-w-24'>
            <p className='text-lg font-bold'>{currentWPM.toFixed(0)}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-32 h-32 gap-4 mb-6 text-center">
          <h3 className='text-2xl font-medium text-emerald-500'>Time</h3>
          <div className='w-full py-2 border-2 rounded-lg border-emerald-500 max-w-24'>
            <p className='text-lg font-bold'>{timer}s</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-32 h-32 gap-4 mb-6 text-center">
          <h3 className='text-2xl font-medium text-emerald-500'>Accuracy</h3>
          <div className='w-full py-2 border-2 rounded-lg border-emerald-500 max-w-24'>
            <p className='text-lg font-bold'>{currentAccuracy.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Contenedor de palabras: quitar scroll vertical forzado, dejar que el texto fluya */}
      {/* Ajustar min-h y max-h para controlar cuántas líneas se ven sin scroll */}
      <div className="bg-transparent border border-black/35 p-6 rounded-lg shadow-md w-full max-w-xl mb-8 min-h-[150px] max-h-[250px] text-left overflow-hidden flex flex-wrap content-start">
        <p className="text-xl leading-relaxed text-zinc-700">
          {renderCurrentWords}
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder={isGameStarted ? "Start typing..." : "Type The Words"}
        className="w-full max-w-xl p-4 mb-8 text-lg transition duration-300 ease-in-out bg-transparent border rounded-lg text-zinc-600 border-black/35 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        value={typedWord}
        onChange={handleInputChange}
        disabled={timer === 0 || (!isGameStarted && typedWord.length > 0 && startTime !== null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleInputChange({ target: { value: typedWord + ' ' } } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      />
    </div>
  );
};

export default Game;