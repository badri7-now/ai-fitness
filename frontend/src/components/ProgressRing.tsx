import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ProgressCardProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  label,
  current,
  target,
  unit,
  icon,
  color
}) => {
  const { theme } = useTheme();
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder
        }
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + "1A" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.percentText, { color }]}>{percentage}%</Text>
      </View>

      <Text style={[styles.labelText, { color: theme.textMuted }]}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.valueText, { color: theme.textPrimary }]}>
          {current.toLocaleString()}
        </Text>
        <Text style={[styles.unitText, { color: theme.textMuted }]}>
          {" "}/ {target.toLocaleString()} {unit}
        </Text>
      </View>

      {/* Progress Bar Line */}
      <View style={[styles.barBg, { backgroundColor: theme.ringBg }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: `${percentage}%`
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    margin: 5
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  percentText: {
    fontSize: 13,
    fontWeight: "800"
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
    marginBottom: 10
  },
  valueText: {
    fontSize: 18,
    fontWeight: "800"
  },
  unitText: {
    fontSize: 12,
    fontWeight: "500"
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 3
  }
});
