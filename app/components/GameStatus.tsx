import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

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
    const { theme } = useThemeStore();

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
        <View style={[styles.overlay, { backgroundColor: theme.modal.overlay }]}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: theme.modal.background
                    }
                ]}
            >
                <Text style={[styles.title, { color: theme.text }]}>
                    {status === 'won' ? 'Congratulations!' : 'Game Over!'}
                </Text>

                {status === 'lost' && word && (
                    <Text style={[styles.word, { color: theme.text }]}>The word was: {word}</Text>
                )}

                {status === 'won' && score !== undefined && (
                    <Text style={[styles.score, { color: theme.text }]}>Score: {score}</Text>
                )}

                {stats && (
                    <View style={[styles.statsContainer, { backgroundColor: theme.stats.background, borderColor: theme.stats.border }]}>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.stats.text }]}>Games Played:</Text>
                            <Text style={[styles.statValue, { color: theme.stats.text }]}>{stats.totalGames}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.stats.text }]}>Win Rate:</Text>
                            <Text style={[styles.statValue, { color: theme.stats.text }]}>{winRate}%</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.stats.text }]}>Current Streak:</Text>
                            <Text style={[styles.statValue, { color: theme.stats.text }]}>{stats.currentStreak}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.stats.text }]}>Best Streak:</Text>
                            <Text style={[styles.statValue, { color: theme.stats.text }]}>{stats.bestStreak}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.stats.text }]}>Total Score:</Text>
                            <Text style={[styles.statValue, { color: theme.stats.text }]}>{stats.totalScore}</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.keyboard.correct }]}
                    onPress={onPlayAgain}
                >
                    <Text style={[styles.buttonText, { color: theme.text }]}>Play Again</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    word: {
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center',
    },
    score: {
        fontSize: 28,
        marginBottom: 30,
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        marginBottom: 30,
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 16,
        opacity: 0.8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
}); 