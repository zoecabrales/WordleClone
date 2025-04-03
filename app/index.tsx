import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Dimensions, useWindowDimensions, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from "./components/GameBoard";
import { Keyboard } from "./components/Keyboard";
import { GameStatus } from "./components/GameStatus";
import { Timer } from "./components/Timer";
import { Hint } from "./components/Hint";
import { useGameStore } from "./store/gameStore";
import { COLORS } from "./constants/colors";
import { Difficulty, DIFFICULTY_SETTINGS } from "./constants/gameSettings";
import { useEffect } from "react";
import { useThemeStore } from "./store/themeStore";
import { ThemeToggle } from "./components/ThemeToggle";

export default function Index() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const isSmallScreen = windowHeight < 700; // For devices like iPhone SE
  const { theme, isDarkMode, initializeTheme } = useThemeStore();

  // Get state from Zustand store
  const {
    difficulty,
    isGameStarted,
    isLoadingStats,
    isLoading,
    targetWord,
    hint,
    currentGuess,
    guesses,
    gameStatus,
    score,
    timeRemaining,
    isTimerRunning,
    letterStates,
    gameHistory,
    stats,
    // Actions
    startGame,
    loadSavedStats,
    updateGameHistory,
    setGameStatus,
    addLetter,
    deleteLetter,
    submitGuess,
  } = useGameStore();

  // Load saved stats and theme when component mounts
  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([
        loadSavedStats(),
        initializeTheme()
      ]);
    };
    initializeApp();
  }, []);

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'DELETE') {
      deleteLetter();
    } else {
      addLetter(key);
    }
  };

  if (isLoadingStats) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <Text style={[styles.smallTitle, { color: theme.title }]}>Wordle</Text>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading game stats...</Text>
      </SafeAreaView>
    );
  }

  if (!isGameStarted) {
    const DifficultyContent = () => (
      <View style={[
        styles.difficultyContainer,
        isTablet && styles.difficultyContainerTablet,
        isSmallScreen && styles.difficultyContainerSmall
      ]}>
        <View style={styles.headerRow}>
          <Text style={[styles.smallTitle, { color: theme.title }]}>Wordle</Text>
          <ThemeToggle />
        </View>
        {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.stats.background,
              },
              isTablet && styles.difficultyButtonTablet,
              isSmallScreen && styles.difficultyButtonSmall
            ]}
            onPress={() => startGame(level)}
          >
            <View style={[
              styles.difficultyContent,
              isSmallScreen && styles.difficultyContentSmall
            ]}>
              <View style={[
                styles.difficultyHeader,
                {
                  borderBottomColor: theme.border,
                },
                isSmallScreen && styles.difficultyHeaderSmall
              ]}>
                <Text style={[
                  styles.difficultyText,
                  {
                    color: theme.text,
                  },
                  isTablet && styles.difficultyTextTablet,
                  isSmallScreen && styles.difficultyTextSmall
                ]}>
                  {DIFFICULTY_SETTINGS[level].label}
                  {'\n'}
                  ({DIFFICULTY_SETTINGS[level].time / 60} {DIFFICULTY_SETTINGS[level].time === 60 ? 'minute' : 'minutes'})
                </Text>
              </View>
              <View style={[
                styles.statsContainer,
                isTablet && styles.statsContainerTablet,
                isSmallScreen && styles.statsContainerSmall
              ]}>
                <View style={[
                  styles.statRow,
                  {
                    backgroundColor: theme.stats.background,
                    borderColor: theme.stats.border,
                  },
                  isTablet && styles.statRowTablet,
                  isSmallScreen && styles.statRowSmall
                ]}>
                  <Text style={[
                    styles.statLabel,
                    { color: theme.stats.text },
                    isTablet && styles.statLabelTablet,
                    isSmallScreen && styles.statLabelSmall
                  ]}>Games:</Text>
                  <Text style={[
                    styles.statValue,
                    { color: theme.stats.text },
                    isTablet && styles.statValueTablet,
                    isSmallScreen && styles.statValueSmall
                  ]}>{gameHistory[level].gamesPlayed}</Text>
                </View>
                <View style={[
                  styles.statRow,
                  {
                    backgroundColor: theme.stats.background,
                    borderColor: theme.stats.border,
                  },
                  isTablet && styles.statRowTablet
                ]}>
                  <Text style={[
                    styles.statLabel,
                    { color: theme.stats.text },
                    isTablet && styles.statLabelTablet
                  ]}>Wins:</Text>
                  <Text style={[
                    styles.statValue,
                    { color: theme.stats.text },
                    isTablet && styles.statValueTablet
                  ]}>
                    {gameHistory[level].gamesPlayed > 0
                      ? Math.round((gameHistory[level].wins / gameHistory[level].gamesPlayed) * 100)
                      : 0}%
                  </Text>
                </View>
                <View style={[
                  styles.statRow,
                  {
                    backgroundColor: theme.stats.background,
                    borderColor: theme.stats.border,
                  },
                  isTablet && styles.statRowTablet
                ]}>
                  <Text style={[
                    styles.statLabel,
                    { color: theme.stats.text },
                    isTablet && styles.statLabelTablet
                  ]}>Best Streak:</Text>
                  <Text style={[
                    styles.statValue,
                    { color: theme.stats.text },
                    isTablet && styles.statValueTablet
                  ]}>{gameHistory[level].bestStreak}</Text>
                </View>
                <View style={[
                  styles.statRow,
                  {
                    backgroundColor: theme.stats.background,
                    borderColor: theme.stats.border,
                  },
                  isTablet && styles.statRowTablet
                ]}>
                  <Text style={[
                    styles.statLabel,
                    { color: theme.stats.text },
                    isTablet && styles.statLabelTablet
                  ]}>Best Score:</Text>
                  <Text style={[
                    styles.statValue,
                    { color: theme.stats.text },
                    isTablet && styles.statValueTablet
                  ]}>{gameHistory[level].bestScore}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        {isSmallScreen ? (
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <DifficultyContent />
          </ScrollView>
        ) : (
          <DifficultyContent />
        )}
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <Text style={[styles.smallTitle, { color: theme.title }]}>Wordle</Text>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading new word...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Text style={[styles.smallTitle, { color: theme.title }]}>Wordle</Text>
      <GameStatus
        status={gameStatus}
        word={targetWord}
        score={score}
        stats={stats}
        onPlayAgain={() => {
          if (gameStatus !== 'playing') {
            updateGameHistory(gameStatus, score || 0);
          }
          // Reset game state and return to difficulty screen
          setGameStatus('playing');
          useGameStore.setState({ isGameStarted: false });
        }}
      />
      <View style={[
        styles.gameContent,
        gameStatus !== 'playing' && styles.blurred
      ]}>
        <View style={styles.gameTopContent}>
          <Timer
            initialTime={DIFFICULTY_SETTINGS[difficulty].time}
            timeRemaining={timeRemaining}
            isRunning={isTimerRunning}
            onTimeUp={() => {
              if (gameStatus === 'playing') {
                setGameStatus('lost');
              }
            }}
          />
          <Hint hint={hint} />
          <GameBoard
            targetWord={targetWord}
            currentGuess={currentGuess}
            guesses={guesses}
          />
        </View>
        <View style={styles.keyboardContainer}>
          <Keyboard
            onKeyPress={handleKeyPress}
            disabled={gameStatus !== 'playing'}
            letterStates={letterStates}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  gameContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  gameTopContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    gap: 15,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  blurred: {
    opacity: 0.3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  difficultyContainer: {
    width: '90%',
    gap: 12,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  difficultyButton: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 8,
  },
  difficultyContent: {
    padding: 15,
  },
  difficultyHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  difficultyText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statRow: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tablet-specific styles
  difficultyContainerTablet: {
    width: '70%',
    maxWidth: 800,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  difficultyButtonTablet: {
    width: '45%',
    minWidth: 300,
  },
  difficultyTextTablet: {
    fontSize: 26,
    lineHeight: 32,
  },
  statsContainerTablet: {
    paddingHorizontal: 15,
  },
  statRowTablet: {
    padding: 12,
    marginVertical: 8,
  },
  statLabelTablet: {
    fontSize: 16,
  },
  statValueTablet: {
    fontSize: 18,
  },
  // Small screen specific styles
  difficultyContainerSmall: {
    width: '95%',
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  difficultyButtonSmall: {
    borderRadius: 12,
    marginBottom: 6,
  },
  difficultyContentSmall: {
    padding: 12,
  },
  difficultyHeaderSmall: {
    marginBottom: 8,
    paddingBottom: 6,
  },
  difficultyTextSmall: {
    fontSize: 18,
    lineHeight: 24,
  },
  statsContainerSmall: {
    paddingHorizontal: 6,
    gap: 4,
  },
  statRowSmall: {
    padding: 6,
    marginVertical: 3,
    borderRadius: 6,
    width: '47%',
  },
  statLabelSmall: {
    fontSize: 12,
  },
  statValueSmall: {
    fontSize: 14,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
    position: 'relative',
  },
  smallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  themeToggleContainer: {
    position: 'absolute',
    right: 0,
  },
});
