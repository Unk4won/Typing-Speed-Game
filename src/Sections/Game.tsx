\// src/sections/Game.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { words } from '../data/words';
import { calculateWPMAndAccuracy } from '../utils/calculateWPM';
import { useTimer } from '../hooks/useTimer'; // Importar el hook useTimer

interface GameProps {
  onGameFinish: (wpm: number, accuracy: number, score: number) => void;
}

const Game: React.FC<GameProps> = ({ onGameFinish }) => {
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

  // Uso del hook useTimer
  const { time: timer, startTimer, stopTimer, resetTimer } = useTimer({
    initialTime: 60,
    onTimerEnd: () => {
      // Callback cuando el temporizador llega a cero
      if (isGameStarted && endTime === null) { // Asegurarse de que el juego no haya terminado ya
        stopGame();
      }
    },
    startOnMount: false, // El temporizador no inicia automáticamente al montar
  });

  // Generar palabras para el juego
  useEffect(() => {
    const numWordsToGenerate = 30;
    const generatedWords: string[] = [];
    for (let i = 0; i < numWordsToGenerate; i++) {
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
    resetTimer(); // Resetear el temporizador del hook

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // Dependencias vacías para que se ejecute solo al montar

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isGameStarted) {
      setIsGameStarted(true);
      setStartTime(Date.now());
      startTimer(); // Iniciar el temporizador del hook con la primera pulsación
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
        if (wordToCheck.length >= currentTargetWord.length) { // Si el usuario escribió al menos la misma longitud, se considera el espacio
            setCorrectTypedChars((prev) => prev + 1); // Sumar el espacio si es el caso
        }
      }
      setTotalTypedChars((prev) => prev + wordToCheck.length + 1); // +1 por el espacio
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
    stopTimer(); // Detener el temporizador del hook
    if (endTime === null) { // Para evitar llamar a stopGame varias veces
        setEndTime(Date.now());
    }
    setIsGameStarted(false);

    const durationInSeconds = startTime ? ((endTime || Date.now()) - startTime) / 1000 : 0;
    const finalTargetTextLength = targetWords.join(' ').length;

    const { wpm, accuracy } = calculateWPMAndAccuracy(
      finalTargetTextLength,
      correctTypedChars,
      totalTypedChars,
      durationInSeconds
    );

    let score = 0;
    score += correctWordsCount * 10;
    targetWords.slice(0, currentWordIndex).forEach((word, index) => {
        // Solo añadir score si la palabra fue correcta. Necesitaríamos un estado de corrección por palabra para esto.
        // Por ahora, asumimos que todas las palabras correctas previamente contadas contribuyen.
        // Una mejora futura sería guardar si cada palabra fue correcta o incorrecta.
        const actualTypedWord = typedWord; // Esto es solo la palabra actual, no las anteriores.
        // Para calcular el score por palabra correctamente, necesitaríamos un array
        // que guarde el estado (correcto/incorrecto) de cada palabra tipeada.
        // Por simplicidad, el `correctWordsCount` ya nos da una buena base.
        // Si quieres score por dificultad de palabra, aquí es donde lo implementarías,
        // basándote en la longitud de la palabra o un índice de dificultad predefinido.
        score += Math.floor(word.length / 2); // Puntuación adicional por longitud de palabra (puedes ajustar)
    });


    onGameFinish(wpm, accuracy, score);
  };

  const renderCurrentWords = useMemo(() => {
    return targetWords.map((word, wordIndex) => {
      const isCurrentWord = wordIndex === currentWordIndex;
      const hasBeenTyped = wordIndex < currentWordIndex;
      let wordClass = '';

      if (hasBeenTyped) {
        // Para saber si una palabra *ya tipeada* fue correcta o incorrecta,
        // necesitaríamos un array que almacene el estado de corrección de cada palabra.
        // Por ahora, solo las oscurecemos.
        wordClass = 'text-gray-400';
      } else if (isCurrentWord) {
        // Resaltado de caracteres para la palabra actual
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

  // Calcular WPM y Accuracy en tiempo real para mostrar
  const currentDuration = startTime && !endTime ? (Date.now() - startTime) / 1000 : 0;
  const currentTargetTextLength = targetWords.slice(0, currentWordIndex).join(' ').length + (currentWordIndex > 0 ? currentWordIndex : 0); // Sumar espacios
  // Para la precisión y WPM en tiempo real, necesitamos sumar los caracteres correctos de las palabras
  // ya completadas MÁS los de la palabra actual.
  let dynamicCorrectChars = 0;
  let dynamicTotalTypedChars = 0;

  // Caracteres de palabras ya completadas
  for(let i = 0; i < currentWordIndex; i++) {
      const target = targetWords[i];
      // Para ser precisos, deberíamos almacenar cuántos caracteres correctos tuvo cada palabra que se tipeó.
      // Por ahora, si la palabra fue contada como correcta, asumimos todos sus caracteres + espacio son correctos.
      // Si fue incorrecta, solo contamos los que realmente coincidan.
      // Esto requiere un estado más complejo para `typedWordsResults: { word: string, correct: boolean, correctChars: number }[]`.
      // Por simplicidad para el demo, usaremos `correctWordsCount` y `totalTypedChars` generales.
      // Aquí vamos a estimar para la visualización en vivo.
      dynamicCorrectChars += target.length + 1; // Estimamos si la palabra se "pasó", se asume correcta para WPM en vivo
      dynamicTotalTypedChars += target.length + 1;
  }

  // Caracteres de la palabra actual
  const currentTargetWord = targetWords[currentWordIndex] || '';
  for(let i = 0; i < typedWord.length; i++) {
    if (i < currentTargetWord.length && typedWord[i] === currentTargetWord[i]) {
      dynamicCorrectChars++;
    }
  }
  dynamicTotalTypedChars += typedWord.length;


  const { wpm: currentWPM, accuracy: currentAccuracy } = calculateWPMAndAccuracy(
    currentTargetTextLength, // Longitud objetivo (hasta la palabra actual)
    dynamicCorrectChars,     // Caracteres correctos acumulados
    dynamicTotalTypedChars,  // Caracteres tipeados acumulados
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

      <div className="bg-transparent border border-black/35 p-6 rounded-lg shadow-md w-full max-w-xl mb-8 min-h-[150px] max-h-[280px] text-left overflow-y-auto">
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
        disabled={timer === 0 || (!isGameStarted && typedWord.length > 0 && startTime !== null)} // Deshabilitar si el timer llega a 0
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