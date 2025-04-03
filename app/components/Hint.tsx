import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type HintProps = {
    hint: string;
};

export const Hint = ({ hint }: HintProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Hint:</Text>
            <Text style={styles.hint}>{hint}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
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
    },
}); 