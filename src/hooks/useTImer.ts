// src/hooks/useTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  onTimerEnd?: () => void;
  startOnMount?: boolean;
}

export const usetimer = ({ initialTime, onTimerEnd, startOnMount = false }: UseTimerProps) => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(startOnMount);
  const timerRef = useRef<number | null>(null); // Tipo de referencia corregido a number

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(initialTime);
    setIsRunning(false);
  }, [initialTime, stopTimer]);

  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      stopTimer();
      onTimerEnd?.();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, time, onTimerEnd, stopTimer]);

  return { time, startTimer, stopTimer, resetTimer, isRunning };
};