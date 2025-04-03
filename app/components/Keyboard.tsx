import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
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
    const handlePress = (key: string) => {
        if (disabled) return;
        onKeyPress(key);
    };

    const getKeyStyle = (key: string) => {
        if (key === 'ENTER' || key === 'DELETE') return styles.key;

        const letterState = letterStates[key];
        if (!letterState) return styles.key;

        switch (letterState.status) {
            case 'correct':
                return [styles.key, styles.correctKey];
            case 'present':
                return [styles.key, styles.presentKey];
            case 'absent':
                return [styles.key, styles.absentKey];
            default:
                return styles.key;
        }
    };

    const isKeyDisabled = (key: string): boolean => {
        if (disabled) return true;
        if (key === 'ENTER' || key === 'DELETE') return false;

        const letterState = letterStates[key];
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
                                key === 'ENTER' && styles.enterKey,
                                key === 'DELETE' && styles.deleteKey,
                            ]}
                            onPress={() => handlePress(key)}
                            disabled={isKeyDisabled(key)}
                            activeOpacity={isKeyDisabled(key) ? 1 : 0.7}
                        >
                            <Text style={[
                                styles.keyText,
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
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    key: {
        backgroundColor: COLORS.KEYBOARD_BG,
        padding: 10,
        margin: 3,
        borderRadius: 5,
        minWidth: 30,
        alignItems: 'center',
    },
    enterKey: {
        minWidth: 65,
    },
    deleteKey: {
        minWidth: 65,
    },
    correctKey: {
        backgroundColor: COLORS.KEYBOARD_CORRECT,
    },
    presentKey: {
        backgroundColor: COLORS.KEYBOARD_PRESENT,
    },
    absentKey: {
        backgroundColor: COLORS.KEYBOARD_ABSENT,
    },
    keyText: {
        color: COLORS.KEYBOARD_TEXT,
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledKeyText: {
        opacity: 0.5,
    },
}); 