import { useQuery } from '@tanstack/react-query';
import { fetchRandomWord } from '../services/wordService';

export const useWordQuery = () => {
    return useQuery({
        queryKey: ['word'],
        queryFn: fetchRandomWord,
        staleTime: Infinity, // Since we want to keep the same word for the game
        retry: 1,
        onError: (error) => {
            console.error('Failed to fetch word:', error);
        }
    });
}; 