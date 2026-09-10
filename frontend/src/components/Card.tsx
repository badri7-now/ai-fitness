import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "card" | "white" | "elevated";
}

export const Card: React.FC<CardProps> = ({ children, style, variant = "card" }) => {
  const { theme } = useTheme();

  const getBg = () => {
    if (variant === "white") return theme.background;
    return theme.card;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBg(),
          borderColor: theme.cardBorder
        },
        variant === "elevated" && styles.elevated,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 6
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  }
});
