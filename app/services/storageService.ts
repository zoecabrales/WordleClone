import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty } from '../constants/gameSettings';

const STORAGE_KEYS = {
    GAME_STATS: 'wordle_game_stats',
};

export type DifficultyStats = {
    gamesPlayed: number;
    wins: number;
    bestStreak: number;
    bestScore: number;
};

export type GameStats = Record<Difficulty, DifficultyStats>;

const DEFAULT_STATS: GameStats = {
    easy: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
    medium: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
    hard: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
};

export const storageService = {
    saveGameStats: async (stats: GameStats): Promise<void> => {
        try {
            const jsonValue = JSON.stringify(stats);
            await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, jsonValue);
        } catch (error) {
            console.error('Error saving game stats:', error);
        }
    },

    loadGameStats: async (): Promise<GameStats> => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATS);
            if (jsonValue) {
                const parsedStats = JSON.parse(jsonValue);
                // Ensure all difficulties exist in loaded stats
                return {
                    ...DEFAULT_STATS,
                    ...parsedStats,
                };
            }
            return DEFAULT_STATS;
        } catch (error) {
            console.error('Error loading game stats:', error);
            return DEFAULT_STATS;
        }
    },

    clearGameStats: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATS);
        } catch (error) {
            console.error('Error clearing game stats:', error);
        }
    },
}; 