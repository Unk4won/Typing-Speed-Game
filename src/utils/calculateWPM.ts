// src/utils/calculateWPM.ts

interface WPMResult {
    wpm: number;
    accuracy: number;
}

export const calculateWPMAndAccuracy = (
    // REMOVIDO: totalTargetChars: number,
    correctTypedChars: number,
    totalTypedChars: number,
    durationInSeconds: number
): WPMResult => {
    const durationInMinutes = durationInSeconds / 60;

    // Calcular WPM (Palabras por minuto)
    // Una palabra se considera 5 caracteres (incluyendo espacios, pero aquí ya manejamos espacios por separado)
    // Usamos correctTypedChars ya que es lo que realmente contribuye a WPM.
    let wpm = 0;
    if (durationInMinutes > 0) {
        wpm = (correctTypedChars / 5) / durationInMinutes;
    }

    // Calcular Precisión
    let accuracy = 0;
    if (totalTypedChars > 0) {
        accuracy = (correctTypedChars / totalTypedChars) * 100;
    }

    return { wpm, accuracy };
};