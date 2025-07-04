// src/utils/calculateWPM.ts
export const calculateWPMAndAccuracy = (
  totalTargetChars: number, // Longitud total de todos los caracteres del texto objetivo
  totalCorrectlyTypedChars: number, // Total de caracteres correctos que el usuario tipeó
  totalUserTypedChars: number, // Total de caracteres que el usuario tecleó (incluyendo errores)
  durationInSeconds: number
) => {
  // WPM (Palabras Por Minuto)
  // Se considera que una palabra tiene en promedio 5 caracteres.
  // Se basa en los caracteres correctos para el WPM "bruto".
  const wordsTyped = totalCorrectlyTypedChars / 5;
  const durationInMinutes = durationInSeconds / 60;
  const wpm = durationInMinutes > 0 ? wordsTyped / durationInMinutes : 0;

  // Precisión
  const accuracy = totalUserTypedChars > 0 ? (totalCorrectlyTypedChars / totalUserTypedChars) * 100 : 0;

  return { wpm, accuracy };
};