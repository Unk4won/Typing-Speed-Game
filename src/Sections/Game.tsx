// src/sections/Game.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { words } from '../data/words'; // Importamos el nuevo array de palabras
import { calculateWPMAndAccuracy } from '../utils/calculateWPM'; // Asegúrate de que esta importación sea correcta

interface GameProps {
  onGameFinish: (wpm: number, accuracy: number, score: number) => void; // Añadir 'score'
}

const Game: React.FC<GameProps> = ({ onGameFinish }) => {
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [typedWord, setTypedWord] = useState<string>('');
  const [correctWordsCount, setCorrectWordsCount] = useState<number>(0);
  const [incorrectWordsCount, setIncorrectWordsCount] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0); // Para precisión global
  const [correctTypedChars, setCorrectTypedChars] = useState<number>(0); // Para precisión global

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Para enfocar el input

  // Generar palabras para el juego
  useEffect(() => {
    // Generar un número razonable de palabras para el juego, digamos 30-50
    const numWordsToGenerate = 30; // Puedes ajustar esto
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
    setTimer(60);

    if (inputRef.current) {
      inputRef.current.focus(); // Enfocar el input al iniciar el juego
    }
  }, []);

  // Lógica del temporizador
  useEffect(() => {
    if (isGameStarted && timer > 0 && endTime === null) {
      timerRef.current = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0 && isGameStarted && endTime === null) {
      // El juego termina si el tiempo se agota
      stopGame();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameStarted, timer, endTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isGameStarted) {
      setIsGameStarted(true);
      setStartTime(Date.now());
    }

    // Si el usuario presiona espacio o enter, es el final de una palabra
    if (value.endsWith(' ') || value.endsWith('\n')) {
      const wordToCheck = value.trim();
      const currentTargetWord = targetWords[currentWordIndex];

      if (wordToCheck === currentTargetWord) {
        setCorrectWordsCount((prev) => prev + 1);
        setCorrectTypedChars((prev) => prev + currentTargetWord.length + 1); // +1 por el espacio
      } else {
        setIncorrectWordsCount((prev) => prev + 1);
        // Contar caracteres correctos dentro de la palabra incorrecta para la precisión global
        for (let i = 0; i < wordToCheck.length && i < currentTargetWord.length; i++) {
          if (wordToCheck[i] === currentTargetWord[i]) {
            setCorrectTypedChars((prev) => prev + 1);
          }
        }
        setCorrectTypedChars((prev) => prev + 1); // Sumar el espacio si es el caso
      }
      setTotalTypedChars((prev) => prev + wordToCheck.length + 1); // +1 por el espacio
      setTypedWord(''); // Resetear para la siguiente palabra
      setCurrentWordIndex((prev) => prev + 1);

      // Si se han escrito todas las palabras, terminar el juego
      if (currentWordIndex + 1 >= targetWords.length) {
        stopGame();
      }
    } else {
      setTypedWord(value);
    }
  };

  const stopGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setEndTime(Date.now());
    setIsGameStarted(false);

    const durationInSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
    const finalTargetTextLength = targetWords.join(' ').length; // Longitud total del texto objetivo
    const finalTypedLength = totalTypedChars; // Total de caracteres que el usuario intentó escribir

    const { wpm, accuracy } = calculateWPMAndAccuracy(
      finalTargetTextLength, // Ahora pasamos la longitud total del texto objetivo
      correctTypedChars,     // Caracteres correctos totales
      finalTypedLength,      // Caracteres totales que el usuario tecleó
      durationInSeconds
    );

    // Calcular el score
    let score = 0;
    // Puntuación base por palabra correcta (puedes ajustar el valor)
    score += correctWordsCount * 10;
    // Puntuación adicional por longitud de palabra (más puntos por palabras más largas)
    targetWords.slice(0, currentWordIndex).forEach((word, index) => {
        if (index < correctWordsCount && word === targetWords[index]) { // Asegurarse de que sea una palabra correcta
            score += Math.floor(word.length / 2); // Por ejemplo, 1 punto por cada 2 letras
        }
    });

    onGameFinish(wpm, accuracy, score);
  };

  const renderCurrentWords = useMemo(() => {
    return targetWords.map((word, wordIndex) => {
      const isCurrentWord = wordIndex === currentWordIndex;
      const isTyped = wordIndex < currentWordIndex;
      const isCorrectlyTyped = targetWords[wordIndex] === typedWord; // Esto es solo para la palabra actual antes del espacio
      const actualWordTyped = targetWords.slice(0, currentWordIndex)[wordIndex]; // Palabra que realmente fue tipeada

      return (
        <span key={wordIndex} className="mr-2"> {/* Espacio entre palabras */}
          {word.split('').map((char, charIndex) => {
            let colorClass = 'text-zinc-700'; // Por defecto

            if (isCurrentWord) {
              if (charIndex < typedWord.length) {
                if (char === typedWord[charIndex]) {
                  colorClass = 'text-green-500'; // Carácter correcto en la palabra actual
                } else {
                  colorClass = 'text-red-500'; // Carácter incorrecto en la palabra actual
                }
              }
            } else if (isTyped) {
              // Si la palabra ya se tipeó (pasó al siguiente índice)
              // Necesitamos saber si fue correcta o incorrecta
              const wasWordCorrect = (actualWordTyped === word); // Cómo manejar esto:
              // Tendrías que almacenar el estado de corrección de cada palabra previa.
              // Para simplificar, asumiremos que si ya pasó, la resaltamos según si se contó como correcta o no
              // O la dejamos sin resaltar (texto normal)
              // Por ahora, solo indicamos que fue una palabra pasada, el color ya no cambia.
              // Para una UX más avanzada, se podría almacenar `correctWordStatus[wordIndex]`
              // y usarlo aquí.
              colorClass = 'text-gray-400'; // Palabras ya escritas, deshabilitadas visualmente
            }
            return (
              <span key={charIndex} className={colorClass}>
                {char}
              </span>
            );
          })}
        </span>
      );
    });
  }, [targetWords, currentWordIndex, typedWord]);


  // Calcular WPM y Accuracy en tiempo real para mostrar
  const currentDuration = startTime && !endTime ? (Date.now() - startTime) / 1000 : 0;
  const currentTargetTextLength = targetWords.join(' ').length; // Longitud del total de palabras que se espera escribir
  // Calcular los caracteres correctos que se han tipeado hasta ahora
  let currentCorrectCharsAccurate = 0;
  let currentTotalTypedAccurate = 0;

  for(let i=0; i < currentWordIndex; i++) {
    const target = targetWords[i];
    const typed = targetWords[i]; // Asumimos que si se pasó la palabra, se considera lo que se esperaba.
                                 // Esta lógica podría ser más compleja si quieres precisión por caracter
                                 // para palabras ya completadas, pero para WPM y Accuracy general
                                 // basándose en palabras correctas es suficiente.
    currentCorrectCharsAccurate += target.length + 1; // +1 por el espacio
    currentTotalTypedAccurate += target.length + 1;
  }
  // Añadir la palabra actual
  const currentTargetWord = targetWords[currentWordIndex] || '';
  for(let i=0; i < typedWord.length; i++) {
    if (i < currentTargetWord.length && typedWord[i] === currentTargetWord[i]) {
      currentCorrectCharsAccurate++;
    }
  }
  currentTotalTypedAccurate += typedWord.length;


  const { wpm: currentWPM, accuracy: currentAccuracy } = calculateWPMAndAccuracy(
    currentTargetTextLength,
    currentCorrectCharsAccurate,
    currentTotalTypedAccurate,
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
        ref={inputRef} // Asignar la referencia al input
        type="text"
        placeholder={isGameStarted ? "Start typing..." : "Type The Words"}
        className="w-full max-w-xl p-4 mb-8 text-lg transition duration-300 ease-in-out bg-transparent border rounded-lg text-zinc-600 border-black/35 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        value={typedWord}
        onChange={handleInputChange}
        disabled={!isGameStarted && typedWord.length > 0 && startTime !== null}
        onKeyDown={(e) => {
          // Prevenir el salto de línea si se presiona Enter en el input de texto
          if (e.key === 'Enter') {
            e.preventDefault();
            // Simular un espacio para que la palabra se procese
            handleInputChange({ target: { value: typedWord + ' ' } } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      />
    </div>
  );
};

export default Game;