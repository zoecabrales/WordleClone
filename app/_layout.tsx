import { Stack } from "expo-router";
import { COLORS } from './constants/colors';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND,
        },
        headerTintColor: COLORS.TEXT,
        headerTitle: 'Wordle',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  );
}
