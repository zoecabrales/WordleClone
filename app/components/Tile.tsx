import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type TileProps = {
    letter?: string;
    status?: 'empty' | 'correct' | 'present' | 'absent';
};

export const Tile = ({ letter, status = 'empty' }: TileProps) => {
    const getBackgroundColor = () => {
        switch (status) {
            case 'correct':
                return COLORS.TILE_CORRECT;
            case 'present':
                return COLORS.TILE_PRESENT;
            case 'absent':
                return COLORS.TILE_ABSENT;
            default:
                return COLORS.TILE_EMPTY;
        }
    };

    return (
        <View style={[styles.tile, { backgroundColor: getBackgroundColor() }]}>
            <Text style={styles.letter}>{letter?.toUpperCase()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tile: {
        width: 52,
        height: 52,
        borderWidth: 2,
        borderColor: '#3a3a3c',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
    },
    letter: {
        color: COLORS.TEXT,
        fontSize: 28,
        fontWeight: 'bold',
    },
}); 