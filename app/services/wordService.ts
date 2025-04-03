const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

type WordDefinition = {
    word: string;
    hint: string;
};

// Fallback words with hints in case API fails
const FALLBACK_WORDS: WordDefinition[] = [
    { word: 'APPLE', hint: 'A common fruit, often red or green' },
    { word: 'BEACH', hint: 'Sandy shore by the ocean' },
    { word: 'CHAIR', hint: 'Furniture to sit on' },
    { word: 'DANCE', hint: 'Moving to music' },
    { word: 'EAGLE', hint: 'A large bird of prey' },
];

export const fetchRandomWord = async (): Promise<WordDefinition> => {
    try {
        // First get a random word from the original API
        const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
        const [word] = await response.json();
        const upperWord = word.toUpperCase();

        // Then fetch its definition
        const definitionResponse = await fetch(`${API_URL}/${word}`);
        const data = await definitionResponse.json();

        // Extract a short definition or meaning
        let hint = '';
        if (Array.isArray(data) && data.length > 0 && data[0].meanings?.length > 0) {
            const meaning = data[0].meanings[0];
            hint = meaning.definitions[0].definition;
            // Truncate hint if it's too long
            if (hint.length > 100) {
                hint = hint.substring(0, 97) + '...';
            }
        }

        return {
            word: upperWord,
            hint: hint || 'No hint available',
        };
    } catch (error) {
        console.error('Error fetching word:', error);
        // Return a random fallback word
        return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    }
}; 