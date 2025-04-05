import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
    background: '#FFFFFF',
    text: '#121213',
    border: '#D3D6DA',
    title: '#121213',
    keyboard: {
        bg: '#D3D6DA',
        text: '#121213',
        correct: '#6AAA64',
        present: '#C9B458',
        absent: '#787C7E'
    },
    tile: {
        empty: '#FFFFFF',
        correct: '#6AAA64',
        present: '#C9B458',
        absent: '#787C7E'
    },
    modal: {
        background: 'rgba(255, 255, 255, 0.9)',
        overlay: 'rgba(0, 0, 0, 0.5)'
    },
    stats: {
        background: 'rgba(255, 255, 255, 0.9)',
        text: '#121213',
        border: '#D3D6DA'
    }
};

export const darkTheme = {
    background: '#121213',
    text: '#FFFFFF',
    border: '#3A3A3C',
    title: '#FFFFFF',
    keyboard: {
        bg: '#818384',
        text: '#FFFFFF',
        correct: '#538D4E',
        present: '#B59F3B',
        absent: '#3A3A3C'
    },
    tile: {
        empty: '#121213',
        correct: '#538D4E',
        present: '#B59F3B',
        absent: '#3A3A3C'
    },
    modal: {
        background: 'rgba(0, 0, 0, 0.9)',
        overlay: 'rgba(0, 0, 0, 0.8)'
    },
    stats: {
        background: 'rgba(0, 0, 0, 0.8)',
        text: '#FFFFFF',
        border: '#3A3A3C'
    }
};

export type Theme = typeof lightTheme;

interface ThemeState {
    isDarkMode: boolean;
    theme: Theme;
    toggleTheme: () => Promise<void>;
    initializeTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@theme_mode';

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: true, // Default to dark mode
    theme: darkTheme,

    toggleTheme: async () => {
        set((state) => {
            const newIsDarkMode = !state.isDarkMode;
            const newTheme = newIsDarkMode ? darkTheme : lightTheme;

            // Save theme preference
            AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newIsDarkMode))
                .catch(error => console.error('[ThemeStore] Failed to save theme preference:', error));

            return {
                isDarkMode: newIsDarkMode,
                theme: newTheme
            };
        });
    },

    initializeTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme !== null) {
                const isDarkMode = JSON.parse(savedTheme);
                set({
                    isDarkMode,
                    theme: isDarkMode ? darkTheme : lightTheme
                });
            }
        } catch (error) {
            console.error('[ThemeStore] Failed to load theme preference:', error);
        }
    }
})); 