import { useCallback } from 'react';

export const useSpeech = () => {
    const speak = useCallback((text) => {
        if (!window.speechSynthesis) {
            console.error("Browser does not support speech synthesis");
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Optional: Select a specific voice preference if needed
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(voice => voice.name.includes("Google US English"));

        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }, []);

    return { speak };
};
