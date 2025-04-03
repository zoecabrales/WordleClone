import { View, StyleSheet } from 'react-native';
import { Tile } from './Tile';

type GameBoardProps = {
    targetWord: string;
    currentGuess: string;
    guesses: string[];
};

export const GameBoard = ({ targetWord, currentGuess, guesses }: GameBoardProps) => {
    const getTileStatus = (rowIndex: number, colIndex: number) => {
        // If this is the current row being typed
        if (rowIndex === guesses.length) {
            return currentGuess[colIndex] ? 'empty' : 'empty';
        }

        // If this is a previous guess
        const guess = guesses[rowIndex];
        if (!guess) return 'empty';

        const letter = guess[colIndex];
        if (!letter) return 'empty';

        // Check if letter is in correct position
        if (letter === targetWord[colIndex]) {
            return 'correct';
        }

        // Check if letter is in word but wrong position
        if (targetWord.includes(letter)) {
            return 'present';
        }

        // Letter is not in word
        return 'absent';
    };

    const getTileLetter = (rowIndex: number, colIndex: number) => {
        // If this is the current row being typed
        if (rowIndex === guesses.length) {
            return currentGuess[colIndex];
        }

        // If this is a previous guess
        return guesses[rowIndex]?.[colIndex];
    };

    const isTileRevealing = (rowIndex: number, colIndex: number) => {
        // Only reveal tiles in completed rows
        return rowIndex < guesses.length;
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {Array(6).fill(null).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {Array(5).fill(null).map((_, colIndex) => (
                            <Tile
                                key={`${rowIndex}-${colIndex}`}
                                letter={getTileLetter(rowIndex, colIndex)}
                                status={getTileStatus(rowIndex, colIndex)}
                                isRevealing={isTileRevealing(rowIndex, colIndex)}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    grid: {
        gap: 5,
    },
    row: {
        flexDirection: 'row',
        gap: 5,
    },
}); 