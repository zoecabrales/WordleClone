import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export const ThemeToggle = () => {
    const { isDarkMode, toggleTheme, theme } = useThemeStore();

    return (
        <TouchableOpacity
            onPress={toggleTheme}
            style={styles.container}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons
                name={isDarkMode ? 'sunny' : 'moon'}
                size={24}
                color={theme.text}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        marginLeft: 12,
    },
}); 