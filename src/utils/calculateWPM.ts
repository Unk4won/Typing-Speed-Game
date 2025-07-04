// src/utils/calculateWPM.ts

interface WPMResult {
    wpm: number;
    accuracy: number;
}

export const calculateWPMAndAccuracy = (
    correctTypedChars: number,
    totalTypedChars: number,
    durationInSeconds: number
): WPMResult => {
    const durationInMinutes = durationInSeconds / 60;

    let wpm = 0;
    if (durationInMinutes > 0) {
        wpm = (correctTypedChars / 5) / durationInMinutes;
    }

    let accuracy = 0;
    if (totalTypedChars > 0) {
        accuracy = (correctTypedChars / totalTypedChars) * 100;
    }

    return { wpm, accuracy };
};