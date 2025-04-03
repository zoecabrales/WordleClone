import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Dimensions, useWindowDimensions, ScrollView } from "react-native";
import { GameBoard } from "./components/GameBoard";
import { Keyboard } from "./components/Keyboard";
import { GameStatus } from "./components/GameStatus";
import { Timer } from "./components/Timer";
import { Hint } from "./components/Hint";
import { useGameStore } from "./store/gameStore";
import { COLORS } from "./constants/colors";
import { Difficulty, DIFFICULTY_SETTINGS } from "./constants/gameSettings";
import { useEffect } from "react";

export default function Index() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const isSmallScreen = windowHeight < 700; // For devices like iPhone SE

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

  // Load saved stats when component mounts
  useEffect(() => {
    const initializeApp = async () => {
      await loadSavedStats();
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.TEXT} />
        <Text style={styles.loadingText}>Loading game stats...</Text>
      </View>
    );
  }

  if (!isGameStarted) {
    const DifficultyContent = () => (
      <View style={[
        styles.difficultyContainer,
        isTablet && styles.difficultyContainerTablet,
        isSmallScreen && styles.difficultyContainerSmall
      ]}>
        {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyButton,
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
                isSmallScreen && styles.difficultyHeaderSmall
              ]}>
                <Text style={[
                  styles.difficultyText,
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
                  isTablet && styles.statRowTablet,
                  isSmallScreen && styles.statRowSmall
                ]}>
                  <Text style={[
                    styles.statLabel,
                    isTablet && styles.statLabelTablet,
                    isSmallScreen && styles.statLabelSmall
                  ]}>Games:</Text>
                  <Text style={[
                    styles.statValue,
                    isTablet && styles.statValueTablet,
                    isSmallScreen && styles.statValueSmall
                  ]}>{gameHistory[level].gamesPlayed}</Text>
                </View>
                <View style={[styles.statRow, isTablet && styles.statRowTablet]}>
                  <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Wins:</Text>
                  <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>
                    {gameHistory[level].gamesPlayed > 0
                      ? Math.round((gameHistory[level].wins / gameHistory[level].gamesPlayed) * 100)
                      : 0}%
                  </Text>
                </View>
                <View style={[styles.statRow, isTablet && styles.statRowTablet]}>
                  <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Best Streak:</Text>
                  <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>{gameHistory[level].bestStreak}</Text>
                </View>
                <View style={[styles.statRow, isTablet && styles.statRowTablet]}>
                  <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Best Score:</Text>
                  <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>{gameHistory[level].bestScore}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <View style={styles.container}>
        <Text style={[
          styles.title,
          isSmallScreen && styles.titleSmall
        ]}>Select Difficulty</Text>
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
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.TEXT} />
        <Text style={styles.loadingText}>Loading new word...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GameStatus
        status={gameStatus}
        word={targetWord}
        score={score}
        stats={stats}
        onPlayAgain={() => {
          if (gameStatus !== 'playing') {
            updateGameHistory(gameStatus, score || 0);
          }
          startGame(difficulty);
        }}
      />
      <View style={[
        styles.gameContent,
        gameStatus !== 'playing' && styles.blurred
      ]}>
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
        <Keyboard
          onKeyPress={handleKeyPress}
          disabled={gameStatus !== 'playing'}
          letterStates={letterStates}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  gameContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
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
    color: COLORS.TEXT,
    fontSize: 18,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 30,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  difficultyContainer: {
    width: '90%',
    gap: 12,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  difficultyButton: {
    backgroundColor: 'rgba(129, 131, 132, 0.1)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 8,
  },
  difficultyText: {
    color: COLORS.TEXT,
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
    backgroundColor: 'rgba(58, 58, 60, 0.3)',
    padding: 8,
    borderRadius: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    color: COLORS.TEXT,
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
  titleSmall: {
    fontSize: 24,
    marginBottom: 15,
    paddingTop: 20,
  },
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
});
