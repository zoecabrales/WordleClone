import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';

type TimerProps = {
    initialTime: number; // in seconds
    onTimeUp: () => void;
    isRunning: boolean;
    timeRemaining: number;
};

export const Timer = ({ initialTime, onTimeUp, isRunning, timeRemaining }: TimerProps) => {
    const [progressWidth] = useState(new Animated.Value(1));
    const updateTimer = useGameStore(state => state.updateTimer);
    const { theme } = useThemeStore();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning) {
            timer = setInterval(() => {
                updateTimer();
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, updateTimer]);

    useEffect(() => {
        if (isRunning) {
            // Animate progress bar
            Animated.timing(progressWidth, {
                toValue: 0,
                duration: timeRemaining * 1000, // convert to milliseconds
                useNativeDriver: false,
            }).start();
        } else {
            // Reset or pause animation
            progressWidth.setValue(timeRemaining / initialTime);
        }
    }, [isRunning, initialTime, timeRemaining]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate color based on remaining time
    const getColor = () => {
        const percentage = timeRemaining / initialTime;
        if (percentage > 0.6) return theme.tile.correct;
        if (percentage > 0.3) return theme.tile.present;
        return theme.tile.absent;
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.time, { color: theme.text }]}>{formatTime(timeRemaining)}</Text>
            <View style={[styles.progressBackground, { backgroundColor: theme.border }]}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressWidth.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: getColor(),
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        padding: 10,
    },
    time: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBackground: {
        width: '80%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
}); 