import { create } from 'zustand';
import { Difficulty, DIFFICULTY_SETTINGS } from '../constants/gameSettings';
import { fetchRandomWord } from '../services/wordService';
import { storageService, GameStats } from '../services/storageService';

type GameStatus = 'playing' | 'won' | 'lost';

interface GameState {
    // Game settings
    difficulty: Difficulty;
    isGameStarted: boolean;
    isLoadingStats: boolean;
    isLoading: boolean;

    // Game state
    targetWord: string;
    hint: string;
    currentGuess: string;
    guesses: string[];
    gameStatus: GameStatus;
    score: number;
    timeRemaining: number;
    isTimerRunning: boolean;
    letterStates: Record<string, { letter: string; status: 'unused' | 'correct' | 'present' | 'absent'; position?: number }>;

    // Stats
    gameHistory: GameStats;
    stats: {
        totalGames: number;
        wins: number;
        currentStreak: number;
        bestStreak: number;
        totalScore: number;
    };

    // Actions
    setDifficulty: (difficulty: Difficulty) => void;
    startGame: (difficulty: Difficulty) => Promise<void>;
    resetGame: () => Promise<void>;
    addLetter: (letter: string) => void;
    deleteLetter: () => void;
    submitGuess: () => void;
    updateTimer: () => void;
    loadSavedStats: () => Promise<GameStats>;
    updateGameHistory: (status: 'won' | 'lost', finalScore: number) => Promise<void>;
    setGameStatus: (status: GameStatus) => void;
}

const DEFAULT_STATS: GameStats = {
    easy: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
    medium: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
    hard: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
};

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    difficulty: 'medium',
    isGameStarted: false,
    isLoadingStats: true,
    isLoading: true,
    targetWord: '',
    hint: '',
    currentGuess: '',
    guesses: [],
    gameStatus: 'playing',
    score: 0,
    timeRemaining: DIFFICULTY_SETTINGS.medium.time,
    isTimerRunning: false,
    letterStates: {},
    gameHistory: DEFAULT_STATS,
    stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalScore: 0,
    },

    // Actions
    setDifficulty: (difficulty) => set({ difficulty }),

    startGame: async (difficulty) => {
        set({ isLoading: true, difficulty, isGameStarted: true });
        await get().resetGame();
    },

    resetGame: async () => {
        const { difficulty } = get();
        set({
            currentGuess: '',
            guesses: [],
            gameStatus: 'playing',
            timeRemaining: DIFFICULTY_SETTINGS[difficulty].time,
            score: 0,
            letterStates: {},
            isTimerRunning: true,
            isLoading: true,
        });

        try {
            const wordData = await fetchRandomWord();
            set({
                targetWord: wordData.word,
                hint: wordData.hint,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error loading word:', error);
            set({ isLoading: false });
        }
    },

    addLetter: (letter) => {
        const { currentGuess, gameStatus } = get();
        if (gameStatus !== 'playing') return;
        if (currentGuess.length < 5) {
            set({ currentGuess: currentGuess + letter });
        }
    },

    deleteLetter: () => {
        const { currentGuess, gameStatus } = get();
        if (gameStatus !== 'playing') return;
        set({ currentGuess: currentGuess.slice(0, -1) });
    },

    submitGuess: () => {
        const { currentGuess, targetWord, guesses, difficulty, timeRemaining } = get();
        if (currentGuess.length !== 5) return;

        const newGuesses = [...guesses, currentGuess];
        set({ guesses: newGuesses });

        // Update letter states
        const updateLetterStates = () => {
            const newStates = { ...get().letterStates };
            const targetLetters = targetWord.split('');
            const guessLetters = currentGuess.split('');

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
                if (newStates[letter]?.position === index) return;

                if (targetLetters.includes(letter)) {
                    if (!newStates[letter] || newStates[letter].status !== 'correct') {
                        newStates[letter] = {
                            letter,
                            status: 'present',
                        };
                    }
                } else {
                    newStates[letter] = {
                        letter,
                        status: 'absent',
                    };
                }
            });

            return newStates;
        };

        const calculateScore = () => {
            const settings = DIFFICULTY_SETTINGS[difficulty];
            const timeBonus = timeRemaining * 10;
            const attemptsBonus = (6 - newGuesses.length) * 200;
            return settings.baseScore + timeBonus + attemptsBonus;
        };

        const letterStates = updateLetterStates();
        set({ letterStates });

        if (currentGuess === targetWord) {
            const calculatedScore = calculateScore();
            set(state => ({
                gameStatus: 'won',
                isTimerRunning: false,
                score: calculatedScore,
                stats: {
                    ...state.stats,
                    totalGames: state.stats.totalGames + 1,
                    wins: state.stats.wins + 1,
                    currentStreak: state.stats.currentStreak + 1,
                    bestStreak: Math.max(state.stats.bestStreak, state.stats.currentStreak + 1),
                    totalScore: state.stats.totalScore + calculatedScore,
                }
            }));
        } else if (newGuesses.length >= 6) {
            set(state => ({
                gameStatus: 'lost',
                isTimerRunning: false,
                stats: {
                    ...state.stats,
                    totalGames: state.stats.totalGames + 1,
                    currentStreak: 0,
                }
            }));
        }

        set({ currentGuess: '' });
    },

    updateTimer: () => {
        const { timeRemaining, isTimerRunning, gameStatus } = get();
        if (isTimerRunning && timeRemaining > 0 && gameStatus === 'playing') {
            if (timeRemaining <= 1) {
                set({ gameStatus: 'lost', isTimerRunning: false, timeRemaining: 0 });
            } else {
                set({ timeRemaining: timeRemaining - 1 });
            }
        }
    },

    loadSavedStats: async () => {
        try {
            const savedStats = await storageService.loadGameStats();
            set({
                gameHistory: savedStats || DEFAULT_STATS,
                isLoadingStats: false
            });
            return savedStats;
        } catch (error) {
            console.error('Error loading saved stats:', error);
            set({
                gameHistory: DEFAULT_STATS,
                isLoadingStats: false
            });
            return DEFAULT_STATS;
        }
    },

    updateGameHistory: async (status: 'won' | 'lost', finalScore: number) => {
        const { gameHistory, difficulty, stats } = get();
        const newHistory = {
            ...gameHistory,
            [difficulty]: {
                gamesPlayed: (gameHistory[difficulty]?.gamesPlayed || 0) + 1,
                wins: status === 'won' ? (gameHistory[difficulty]?.wins || 0) + 1 : (gameHistory[difficulty]?.wins || 0),
                bestStreak: Math.max(stats.currentStreak, gameHistory[difficulty]?.bestStreak || 0),
                bestScore: status === 'won' ? Math.max(finalScore, gameHistory[difficulty]?.bestScore || 0) : gameHistory[difficulty]?.bestScore || 0,
            }
        };

        set({ gameHistory: newHistory });
        try {
            await storageService.saveGameStats(newHistory);
        } catch (error) {
            console.error('Error saving game stats:', error);
        }
    },

    setGameStatus: (status) => set({ gameStatus: status }),
})); 