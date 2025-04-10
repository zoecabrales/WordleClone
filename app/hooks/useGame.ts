import { useState, useEffect, useCallback } from 'react';
import { Difficulty, DIFFICULTY_SETTINGS, SCORE_MULTIPLIERS } from '../constants/gameSettings';
import { useWordQuery } from './useWordQuery';

type GameStatus = 'playing' | 'won' | 'lost';
type LetterState = {
    letter: string;
    status: 'unused' | 'correct' | 'present' | 'absent';
    position?: number;
};

type GameStats = {
    totalGames: number;
    wins: number;
    currentStreak: number;
    bestStreak: number;
    totalScore: number;
};

export const useGame = (difficulty: Difficulty = 'medium') => {
    const { data: wordData, isLoading, refetch: refetchWord } = useWordQuery();
    const [targetWord, setTargetWord] = useState<string>('');
    const [hint, setHint] = useState<string>('');
    const [currentGuess, setCurrentGuess] = useState('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(() => DIFFICULTY_SETTINGS[difficulty].time);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
    const [stats, setStats] = useState<GameStats>({
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalScore: 0,
    });

    // Update timeRemaining when difficulty changes
    useEffect(() => {
        setTimeRemaining(DIFFICULTY_SETTINGS[difficulty].time);
    }, [difficulty]);

    // Update target word and hint when word data changes
    useEffect(() => {
        if (wordData) {
            setTargetWord(wordData.word);
            setHint(wordData.hint);
            setIsTimerRunning(true);
        }
    }, [wordData]);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTimerRunning && timeRemaining > 0 && gameStatus === 'playing') {
            timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setGameStatus('lost');
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, gameStatus]);

    const calculateScore = useCallback(() => {
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const timeBonus = timeRemaining * SCORE_MULTIPLIERS.timeBonus;
        const attemptsBonus = (6 - guesses.length) * SCORE_MULTIPLIERS.attemptBonus;
        return settings.baseScore + timeBonus + attemptsBonus;
    }, [difficulty, timeRemaining, guesses.length]);

    const updateLetterStates = (guess: string) => {
        const newStates = { ...letterStates };
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');

        // First pass: Mark correct letters
        guessLetters.forEach((letter, index) => {
            if (letter === targetLetters[index]) {
                newStates[letter] = {
                    letter,
                    status: 'correct',
                    position: index,
                };
            }
        });

        // Second pass: Mark present and absent letters
        guessLetters.forEach((letter, index) => {
            // Skip if we've already marked this letter as correct at this position
            if (newStates[letter]?.position === index) return;

            if (targetLetters.includes(letter)) {
                // If the letter exists in the target word
                // Only mark as present if it's not already marked as correct
                if (!newStates[letter] || newStates[letter].status !== 'correct') {
                    newStates[letter] = {
                        letter,
                        status: 'present',
                    };
                }
            } else {
                // Only mark as absent if the letter doesn't exist in the target word at all
                newStates[letter] = {
                    letter,
                    status: 'absent',
                };
            }
        });

        setLetterStates(newStates);
    };

    const addLetter = (letter: string) => {
        if (currentGuess.length < 5) {
            setCurrentGuess(prev => prev + letter);
        }
    };

    const deleteLetter = () => {
        setCurrentGuess(prev => prev.slice(0, -1));
    };

    const submitGuess = () => {
        if (currentGuess.length !== 5) return;

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        updateLetterStates(currentGuess);

        if (currentGuess === targetWord) {
            setGameStatus('won');
            setIsTimerRunning(false);
            const calculatedScore = calculateScore();
            setScore(calculatedScore);

            // Update stats for win
            setStats(prev => {
                const newStats = {
                    ...prev,
                    totalGames: prev.totalGames + 1,
                    wins: prev.wins + 1,
                    currentStreak: prev.currentStreak + 1,
                    bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
                    totalScore: prev.totalScore + calculatedScore,
                };
                return newStats;
            });
        } else if (newGuesses.length >= 6) {
            setGameStatus('lost');
            setIsTimerRunning(false);

            // Update stats for loss
            setStats(prev => ({
                ...prev,
                totalGames: prev.totalGames + 1,
                currentStreak: 0,
            }));
        }

        setCurrentGuess('');
    };

    const resetGame = async () => {
        setCurrentGuess('');
        setGuesses([]);
        setGameStatus('playing');
        setScore(0);
        setTimeRemaining(DIFFICULTY_SETTINGS[difficulty].time);
        setLetterStates({});
        setIsTimerRunning(false);
        await refetchWord();
    };

    return {
        targetWord,
        hint,
        currentGuess,
        guesses,
        gameStatus,
        score,
        timeRemaining,
        isTimerRunning,
        isLoading,
        letterStates,
        stats,
        addLetter,
        deleteLetter,
        submitGuess,
        resetGame,
        calculateScore,
    };
}; 