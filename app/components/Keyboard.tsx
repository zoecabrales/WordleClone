import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/themeStore';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['⏎', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

type LetterState = {
    letter: string;
    status: 'unused' | 'correct' | 'present' | 'absent';
    position?: number;
};

type KeyboardProps = {
    onKeyPress: (key: string) => void;
    disabled?: boolean;
    letterStates: Record<string, LetterState>;
};

export const Keyboard = ({ onKeyPress, disabled = false, letterStates }: KeyboardProps) => {
    const { theme } = useThemeStore();

    const handlePress = async (key: string) => {
        if (disabled) return;

        // Map symbols back to commands
        const mappedKey = key === '⏎' ? 'ENTER' : key === '⌫' ? 'DELETE' : key;

        // Trigger haptic feedback
        try {
            if (Platform.OS !== 'web') {
                await Haptics.impactAsync(
                    mappedKey === 'ENTER' || mappedKey === 'DELETE'
                        ? Haptics.ImpactFeedbackStyle.Medium
                        : Haptics.ImpactFeedbackStyle.Light
                );
            }
        } catch (error) {
            // Haptics not supported, silently fail
        }

        // Call onKeyPress immediately after triggering haptics
        onKeyPress(mappedKey);
    };

    const getKeyStyle = (key: string) => {
        if (key === '⏎' || key === '⌫') return [styles.key, { backgroundColor: theme.keyboard.bg }];

        const letterState = letterStates[key];
        if (!letterState) return [styles.key, { backgroundColor: theme.keyboard.bg }];

        switch (letterState.status) {
            case 'correct':
                return [styles.key, { backgroundColor: theme.keyboard.correct }];
            case 'present':
                return [styles.key, { backgroundColor: theme.keyboard.present }];
            case 'absent':
                return [styles.key, { backgroundColor: theme.keyboard.absent }];
            default:
                return [styles.key, { backgroundColor: theme.keyboard.bg }];
        }
    };

    const isKeyDisabled = (key: string): boolean => {
        if (disabled) return true;
        if (key === '⏎' || key === '⌫') return false;

        const letterState = letterStates[key];
        // Only disable if the letter is marked as absent
        // Keep enabled if it's correct, present, or unused
        return letterState?.status === 'absent';
    };

    return (
        <View style={styles.container}>
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((key, keyIndex) => (
                        <TouchableOpacity
                            key={keyIndex}
                            style={[
                                getKeyStyle(key),
                                key === '⏎' && styles.enterKey,
                                key === '⌫' && styles.deleteKey,
                            ]}
                            onPress={() => handlePress(key)}
                            disabled={isKeyDisabled(key)}
                            activeOpacity={isKeyDisabled(key) ? 1 : 0.7}
                            pressRetentionOffset={{ top: 10, left: 10, bottom: 10, right: 10 }}
                        >
                            <Text style={[
                                styles.keyText,
                                { color: theme.keyboard.text },
                                isKeyDisabled(key) && styles.disabledKeyText
                            ]}>
                                {key}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        width: '100%',
        maxWidth: 500,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    key: {
        padding: 10,
        margin: 3,
        borderRadius: 5,
        minWidth: 30,
        alignItems: 'center',
    },
    enterKey: {
        minWidth: 60,
        marginLeft: 8,
        marginRight: 3,
    },
    deleteKey: {
        minWidth: 60,
        marginLeft: 3,
        marginRight: 8,
    },
    keyText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledKeyText: {
        opacity: 0.5,
    },
}); 