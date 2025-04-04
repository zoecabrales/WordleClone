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

// Updated API endpoints
const RANDOM_WORD_API = 'https://random-word-api.vercel.app/api?length=5';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Test function for Random Word API
export const testRandomWordAPI = async () => {
    try {
        const response = await fetch(RANDOM_WORD_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawResponse = await response.text();
        console.log('Random Word API Raw Response:', rawResponse);
        const data = JSON.parse(rawResponse);
        console.log('Random Word API Parsed Response:', data);
        return data;
    } catch (error) {
        console.error('Random Word API Error:', error);
        return null;
    }
};

// Test function for Dictionary API
export const testDictionaryAPI = async (word: string) => {
    try {
        const response = await fetch(`${DICTIONARY_API}${word}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawResponse = await response.text();
        console.log('Dictionary API Raw Response:', rawResponse);
        const data = JSON.parse(rawResponse);
        console.log('Dictionary API Parsed Response:', data);
        return data;
    } catch (error) {
        console.error('Dictionary API Error:', error);
        return null;
    }
};

export const fetchRandomWord = async (): Promise<WordDefinition> => {
    try {
        // First test the Random Word API
        const randomWordData = await testRandomWordAPI();
        if (!randomWordData || !Array.isArray(randomWordData) || randomWordData.length === 0) {
            throw new Error('Failed to get random word');
        }

        const word = randomWordData[0].toUpperCase();

        // Then test the Dictionary API with the word
        const dictionaryData = await testDictionaryAPI(word);

        let hint = '';
        if (dictionaryData && dictionaryData[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
            hint = dictionaryData[0].meanings[0].definitions[0].definition;
        } else {
            // Fallback hint if dictionary API fails
            hint = 'A common five-letter word';
        }

        return { word, hint };
    } catch (error) {
        console.error('Error fetching word:', error);
        // Fallback to a predefined list of words if both APIs fail
        const fallbackWords: WordDefinition[] = [
            { word: 'APPLE', hint: 'A common fruit' },
            { word: 'BEACH', hint: 'Sandy shore by the ocean' },
            { word: 'CLOUD', hint: 'White fluffy thing in the sky' },
            { word: 'DREAM', hint: 'What you see when you sleep' },
            { word: 'EARTH', hint: 'The planet we live on' }
        ];
        return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
}; 