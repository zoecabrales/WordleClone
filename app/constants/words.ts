// Initial word list for testing
export const WORD_LIST = [
    'APPLE',
    'BEACH',
    'CHAIR',
    'DANCE',
    'EAGLE',
    'FLAME',
    'GRAPE',
    'HOUSE',
    'IMAGE',
    'JUICE',
    'KNIFE',
    'LEMON',
    'MOUSE',
    'NIGHT',
    'OCEAN',
    'PIANO',
    'QUEEN',
    'RADIO',
    'SNAKE',
    'TABLE',
];

// Get a random word from the list
export const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    return WORD_LIST[randomIndex];
}; 