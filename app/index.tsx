import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { GameBoard } from "./components/GameBoard";
import { Keyboard } from "./components/Keyboard";
import { GameStatus } from "./components/GameStatus";
import { Timer } from "./components/Timer";
import { Hint } from "./components/Hint";
import { useGame } from "./hooks/useGame";
import { COLORS } from "./constants/colors";
import { Difficulty, DIFFICULTY_SETTINGS } from "./constants/gameSettings";
import { useState, useEffect } from "react";
import { storageService, GameStats } from "./services/storageService";

const DEFAULT_STATS: GameStats = {
  easy: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
  medium: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
  hard: { gamesPlayed: 0, wins: 0, bestStreak: 0, bestScore: 0 },
};

export default function Index() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameStats>(DEFAULT_STATS);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const {
    targetWord,
    hint,
    currentGuess,
    guesses,
    gameStatus,
    setGameStatus,
    score,
    timeRemaining,
    isTimerRunning,
    isLoading,
    letterStates,
    stats,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
  } = useGame(difficulty);

  // Load saved stats when component mounts
  useEffect(() => {
    loadSavedStats();
  }, []);

  const loadSavedStats = async () => {
    try {
      const savedStats = await storageService.loadGameStats();
      setGameHistory(savedStats);
    } catch (error) {
      console.error('Error loading saved stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Update game history and save to storage
  const updateGameHistory = async (status: 'won' | 'lost', finalScore: number) => {
    const newHistory = {
      ...gameHistory,
      [difficulty]: {
        gamesPlayed: gameHistory[difficulty].gamesPlayed + 1,
        wins: status === 'won' ? gameHistory[difficulty].wins + 1 : gameHistory[difficulty].wins,
        bestStreak: stats.currentStreak > gameHistory[difficulty].bestStreak
          ? stats.currentStreak
          : gameHistory[difficulty].bestStreak,
        bestScore: status === 'won' && finalScore > gameHistory[difficulty].bestScore
          ? finalScore
          : gameHistory[difficulty].bestScore,
      }
    };

    setGameHistory(newHistory);
    try {
      await storageService.saveGameStats(newHistory);
    } catch (error) {
      console.error('Error saving game stats:', error);
    }
  };

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

  const startNewGame = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setIsGameStarted(true);
    await resetGame();
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
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Difficulty</Text>
        <View style={styles.difficultyContainer}>
          {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.difficultyButton}
              onPress={() => startNewGame(level)}
            >
              <View style={styles.difficultyContent}>
                <View style={styles.difficultyHeader}>
                  <Text style={styles.difficultyText}>
                    {DIFFICULTY_SETTINGS[level].label}
                    {'\n'}
                    ({DIFFICULTY_SETTINGS[level].time / 60} minutes)
                  </Text>
                </View>
                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Games:</Text>
                    <Text style={styles.statValue}>{gameHistory[level].gamesPlayed}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Wins:</Text>
                    <Text style={styles.statValue}>
                      {gameHistory[level].gamesPlayed > 0
                        ? Math.round((gameHistory[level].wins / gameHistory[level].gamesPlayed) * 100)
                        : 0}%
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Streak:</Text>
                    <Text style={styles.statValue}>{gameHistory[level].bestStreak}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Score:</Text>
                    <Text style={styles.statValue}>{gameHistory[level].bestScore}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
          setIsGameStarted(false);
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
  },
  difficultyContainer: {
    width: '85%',
    gap: 12,
    alignSelf: 'center',
  },
  difficultyButton: {
    backgroundColor: COLORS.KEYBOARD_BG,
    padding: 12,
    borderRadius: 8,
  },
  difficultyContent: {
    width: '100%',
  },
  difficultyHeader: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
  },
  difficultyText: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  statLabel: {
    color: COLORS.TEXT,
    fontSize: 14,
    opacity: 0.8,
    marginRight: 5,
  },
  statValue: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
