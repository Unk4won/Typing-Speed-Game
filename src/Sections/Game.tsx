// src/sections/Game.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { words } from '../data/words';
import { calculateWPMAndAccuracy } from '../utils/calculateWPM';
import { useTimer } from '../hooks/useTimer';

interface GameProps {
  onGameFinish: (wpm: number, accuracy: number, score: number) => void;
  numWords: number;
}

const Game: React.FC<GameProps> = ({ onGameFinish, numWords }) => {
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
    initialTime: 60,
    onTimerEnd: () => {
      if (isGameStarted && endTime === null) {
        stopGame();
      }
    },
    startOnMount: false,
  });

  useEffect(() => {
    const generatedWords: string[] = [];
    for (let i = 0; i < numWords; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      let word = words[randomIndex];
      word += ','; // Añade una coma al final de CADA palabra
      generatedWords.push(word);
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
  }, [numWords]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isGameStarted) {
      setIsGameStarted(true);
      setStartTime(Date.now());
      startTimer();
    }

    if (value.endsWith(' ') || value.endsWith('\n')) {
      const typedWordClean = value.trim(); // Lo que el usuario tecleó, sin espacios al final
      const currentTargetWord = targetWords[currentWordIndex];
      
      // Elimina la coma del final de la palabra objetivo para la comparación
      const currentTargetWordWithoutComma = currentTargetWord.endsWith(',') 
                                        ? currentTargetWord.slice(0, -1) 
                                        : currentTargetWord;

      // COMPARA AHORA LA PALABRA ESCRITA CON LA PALABRA OBJETIVO SIN LA COMA
      if (typedWordClean === currentTargetWordWithoutComma) {
        setCorrectWordsCount((prev) => prev + 1);
        // Si es correcta, se asume que también tecleó la coma y el espacio
        setCorrectTypedChars((prev) => prev + currentTargetWord.length + 1); 
      } else {
        setIncorrectWordsCount((prev) => prev + 1);
        
        // Calcula caracteres correctos parciales, comparando sin la coma en el target
        const actualComparisonLength = Math.min(typedWordClean.length, currentTargetWordWithoutComma.length);
        for (let i = 0; i < actualComparisonLength; i++) {
            if (typedWordClean[i] === currentTargetWordWithoutComma[i]) {
                setCorrectTypedChars((prev) => prev + 1);
            }
        }
        // Si el usuario escribió al menos la longitud de la palabra (sin la coma), considera el espacio como correcto.
        // Si el usuario escribió también la coma (que no se compara), eso también se cuenta como "totalTypedChars" pero no "correctTypedChars" en la palabra.
        // Solo el espacio cuenta como char correcto si la palabra base es al menos igual en longitud.
        if (typedWordClean.length >= currentTargetWordWithoutComma.length) {
            setCorrectTypedChars((prev) => prev + 1); // Sumar el espacio si se intentó escribir al menos la misma longitud
        }
      }
      setTotalTypedChars((prev) => prev + value.length); // Suma la longitud total de lo tecleado (incluyendo el espacio)
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

    const { wpm, accuracy } = calculateWPMAndAccuracy(
      correctTypedChars,
      totalTypedChars,
      durationInSeconds
    );

    let score = 0;
    score += correctWordsCount * 10;
    score += Math.floor(correctWordsCount * (numWords / 30));

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
        // Renderiza la palabra actual, incluyendo la coma
        return (
          <span key={wordIndex} className="mr-2">
            {word.split('').map((char, charIndex) => {
              let charClass = 'text-zinc-700';
              // Compara el caracter tecleado con el caracter objetivo (incluyendo la coma)
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
  const { wpm: currentWPM, accuracy: currentAccuracy } = calculateWPMAndAccuracy(
    correctTypedChars,
    totalTypedChars,
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

      <div className="bg-transparent border border-black/35 p-6 rounded-lg shadow-md w-full max-w-xl mb-8 min-h-[150px] text-left">
        <p className="flex flex-wrap text-xl leading-relaxed text-zinc-700">
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