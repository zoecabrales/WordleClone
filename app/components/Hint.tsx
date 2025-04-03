import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

type HintProps = {
    hint: string;
};

const MAX_HINT_LENGTH = 100; // Maximum characters before truncating

export const Hint = ({ hint }: HintProps) => {
    // Truncate hint if it's too long
    const processedHint = hint.length > MAX_HINT_LENGTH
        ? hint.substring(0, MAX_HINT_LENGTH - 3) + '...'
        : hint;

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.label}>Hint:</Text>
                <Text
                    style={styles.hint}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {processedHint}
                </Text>
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        maxWidth: width * 0.9,
        paddingHorizontal: 10,
    },
    label: {
        color: COLORS.TEXT,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 5,
        opacity: 0.7,
    },
    hint: {
        color: COLORS.TEXT,
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.7,
        flex: 1,
        flexWrap: 'wrap',
    },
}); 