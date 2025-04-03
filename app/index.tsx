import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { GameBoard } from "./components/GameBoard";
import { Keyboard } from "./components/Keyboard";
import { GameStatus } from "./components/GameStatus";
import { Timer } from "./components/Timer";
import { Hint } from "./components/Hint";
import { useGame } from "./hooks/useGame";
import { COLORS } from "./constants/colors";
import { Difficulty, DIFFICULTY_SETTINGS } from "./constants/gameSettings";
import { useState } from "react";

export default function Index() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGameStarted, setIsGameStarted] = useState(false);

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
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    stats,
  } = useGame(difficulty);

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
              <Text style={styles.difficultyText}>
                {DIFFICULTY_SETTINGS[level].label}
                {'\n'}
                ({DIFFICULTY_SETTINGS[level].time / 60} minutes)
              </Text>
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
        onPlayAgain={() => setIsGameStarted(false)}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    paddingTop: 40,
  },
  difficultyContainer: {
    width: '80%',
    gap: 20,
    alignSelf: 'center',
  },
  difficultyButton: {
    backgroundColor: COLORS.KEYBOARD_BG,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  difficultyText: {
    color: COLORS.TEXT,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
