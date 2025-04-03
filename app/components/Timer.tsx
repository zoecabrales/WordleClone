import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

type TimerProps = {
    initialTime: number; // in seconds
    onTimeUp: () => void;
    isRunning: boolean;
    timeRemaining: number;
};

export const Timer = ({ initialTime, onTimeUp, isRunning, timeRemaining }: TimerProps) => {
    const [progressWidth] = useState(new Animated.Value(1));

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
    }, [isRunning, initialTime]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate color based on remaining time
    const getColor = () => {
        const percentage = timeRemaining / initialTime;
        if (percentage > 0.6) return COLORS.TILE_CORRECT;
        if (percentage > 0.3) return COLORS.TILE_PRESENT;
        return COLORS.TILE_ABSENT;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.time}>{formatTime(timeRemaining)}</Text>
            <View style={styles.progressBackground}>
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
        color: COLORS.TEXT,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBackground: {
        width: '80%',
        height: 8,
        backgroundColor: '#3a3a3c',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
}); 