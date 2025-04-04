import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useEffect, useRef } from 'react';

type SplashScreenProps = {
    onAnimationComplete: () => void;
};

export const SplashScreen = ({ onAnimationComplete }: SplashScreenProps) => {
    const { theme } = useThemeStore();
    const { width, height } = Dimensions.get('window');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let mounted = true;

        // Start with a small delay to ensure proper rendering
        const startAnimation = setTimeout(() => {
            if (mounted) {
                // Sequence of fade in, delay, and fade out
                Animated.sequence([
                    // Fade in
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    // Delay
                    Animated.delay(1000),
                    // Fade out
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    if (mounted) {
                        onAnimationComplete();
                    }
                });
            }
        }, 100);

        return () => {
            mounted = false;
            clearTimeout(startAnimation);
        };
    }, []);

    return (
        <View style={[styles.container, {
            backgroundColor: theme.background,
            width,
            height,
        }]}>
            <Animated.View style={[styles.content, {
                opacity: fadeAnim
            }]}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Word</Text>
                    <Text style={[styles.title, { color: theme.text }]}>Master</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '600',
        letterSpacing: 2,
        lineHeight: 45,
    }
}); 