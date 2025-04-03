export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_SETTINGS = {
    easy: {
        time: 180, // 3 minutes in seconds
        label: 'Easy',
        baseScore: 1000,
    },
    medium: {
        time: 120, // 2 minutes in seconds
        label: 'Medium',
        baseScore: 2000,
    },
    hard: {
        time: 60, // 1 minute in seconds
        label: 'Hard',
        baseScore: 3000,
    },
};

// Score multipliers
export const SCORE_MULTIPLIERS = {
    timeBonus: 10, // points per second remaining
    attemptBonus: 200, // points per unused attempt
}; 