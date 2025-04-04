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
    { word: 'FLAME', hint: 'The visible part of fire' },
    { word: 'GHOST', hint: 'A spirit or apparition' },
    { word: 'HEART', hint: 'The organ that pumps blood' },
    { word: 'IGLOO', hint: 'A dome-shaped snow house' },
    { word: 'JUICE', hint: 'Liquid extracted from fruits' }
];

// Function to fetch a random word from the API
const fetchRandomWordFromAPI = async (): Promise<string | null> => {
    try {
        // Try the primary API first
        const response = await fetch('https://random-word-api.vercel.app/api?length=5');

        if (!response.ok) {
            // If primary API fails, try the backup API
            const backupResponse = await fetch('https://random-word-form.herokuapp.com/random/word?length=5');
            if (!backupResponse.ok) {
                throw new Error(`Both APIs failed. Primary: ${response.status}, Backup: ${backupResponse.status}`);
            }
            const backupData = await backupResponse.json();
            return backupData.word?.toUpperCase() || null;
        }

        const data = await response.json();
        // The API returns an array with one word
        if (Array.isArray(data) && data.length > 0) {
            return data[0].toUpperCase();
        }
        return null;
    } catch (error) {
        console.error('Error fetching random word:', error);
        return null;
    }
};

// Function to get word definition from Free Dictionary API
const getWordDefinition = async (word: string): Promise<string | null> => {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0 && data[0].meanings?.[0]?.definitions?.[0]) {
            let hint = data[0].meanings[0].definitions[0].definition;
            if (hint.length > 100) {
                hint = hint.substring(0, 97) + '...';
            }
            return hint;
        }
        return null;
    } catch (error) {
        console.error('Error getting word definition:', error);
        return null;
    }
};

export const fetchRandomWord = async (): Promise<WordDefinition> => {
    try {
        // Try to get a random word from the API
        const randomWord = await fetchRandomWordFromAPI();

        if (randomWord) {
            // Try to get a definition for the word
            const hint = await getWordDefinition(randomWord);

            if (hint) {
                return {
                    word: randomWord,
                    hint: hint
                };
            }

            // If we got a word but no definition, use a generic hint
            return {
                word: randomWord,
                hint: `A 5-letter word starting with ${randomWord[0]}`
            };
        }

        // If API fails, use a fallback word
        const fallbackWord = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
        return fallbackWord;

    } catch (error) {
        console.error('Error in word service:', error);
        // Return a random fallback word
        return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    }
}; 