import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from '../constants/colors';

type GameStats = {
    totalGames: number;
    wins: number;
    currentStreak: number;
    bestStreak: number;
    totalScore: number;
};

type GameStatusProps = {
    status: 'playing' | 'won' | 'lost';
    word?: string;
    onPlayAgain?: () => void;
    score?: number;
    stats?: GameStats;
};

export const GameStatus = ({ status, word, onPlayAgain, score, stats }: GameStatusProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (status !== 'playing') {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [status]);

    if (status === 'playing') return null;

    const winRate = stats ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <Text style={styles.title}>
                    {status === 'won' ? 'Congratulations!' : 'Game Over!'}
                </Text>

                {status === 'lost' && word && (
                    <Text style={styles.word}>The word was: {word}</Text>
                )}

                {status === 'won' && score !== undefined && (
                    <Text style={styles.score}>Score: {score}</Text>
                )}

                {stats && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Games Played:</Text>
                            <Text style={styles.statValue}>{stats.totalGames}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Win Rate:</Text>
                            <Text style={styles.statValue}>{winRate}%</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Current Streak:</Text>
                            <Text style={styles.statValue}>{stats.currentStreak}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Best Streak:</Text>
                            <Text style={styles.statValue}>{stats.bestStreak}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Total Score:</Text>
                            <Text style={styles.statValue}>{stats.totalScore}</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={onPlayAgain}
                >
                    <Text style={styles.buttonText}>Play Again</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    title: {
        color: COLORS.TEXT,
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    word: {
        color: COLORS.TEXT,
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center',
    },
    score: {
        color: COLORS.TEXT,
        fontSize: 28,
        marginBottom: 30,
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        marginBottom: 30,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statLabel: {
        color: COLORS.TEXT,
        fontSize: 16,
        opacity: 0.8,
    },
    statValue: {
        color: COLORS.TEXT,
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: COLORS.KEYBOARD_CORRECT,
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    buttonText: {
        color: COLORS.TEXT,
        fontSize: 24,
        fontWeight: 'bold',
    },
}); 