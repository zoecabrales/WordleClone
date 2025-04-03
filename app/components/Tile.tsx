import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { useEffect, useRef } from 'react';

type TileProps = {
    letter?: string;
    status?: 'empty' | 'correct' | 'present' | 'absent';
    isRevealing?: boolean;
};

export const Tile = ({ letter, status = 'empty', isRevealing = false }: TileProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isRevealing && status !== 'empty') {
            // Scale down and fade out
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.85,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Scale up and fade in
                Animated.parallel([
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 3,
                        tension: 15,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }
    }, [isRevealing, status]);

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
        <Animated.View
            style={[
                styles.tile,
                {
                    backgroundColor: getBackgroundColor(),
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                }
            ]}
        >
            <Text style={styles.letter}>
                {letter?.toUpperCase()}
            </Text>
        </Animated.View>
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
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    letter: {
        color: COLORS.TEXT,
        fontSize: 28,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
}); 