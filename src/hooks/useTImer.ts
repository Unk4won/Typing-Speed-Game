// src/hooks/useTimer.ts
import { useState, useEffect, useRef } from 'react';

interface UseTimerProps {
  initialTime: number; // El tiempo inicial en segundos (e.g., 60)
  onTimerEnd: () => void; // Función a llamar cuando el temporizador llega a cero
  startOnMount?: boolean; // Si el temporizador debe iniciar automáticamente
}

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimer = ({ initialTime, onTimerEnd, startOnMount = false }: UseTimerProps): UseTimerReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(startOnMount);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeRef = useRef<number>(initialTime); // Para resetear al valor inicial

  // Efecto para iniciar/detener el temporizador
  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      // El temporizador ha terminado
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onTimerEnd(); // Llama a la función de callback
    }

    // Función de limpieza para clearInterval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [time, isRunning, onTimerEnd]);

  // Funciones de control del temporizador
  const startTimer = () => {
    if (!isRunning && time > 0) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(initialTimeRef.current); // Restablecer al tiempo inicial original
  };

  return { time, isRunning, startTimer, stopTimer, resetTimer };
};