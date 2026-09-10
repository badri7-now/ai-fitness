import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { WeeklyCalendarDay } from "../types";

interface WeeklyCalendarProps {
  days: WeeklyCalendarDay[];
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ days }) => {
  const { theme } = useTheme();

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
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Weekly Workout Activity</Text>
        <Text style={[styles.streakText, { color: theme.primary }]}>
          {days.filter((d) => d.completed).length} of 7 Days Active
        </Text>
      </View>

      <View style={styles.daysRow}>
        {days.map((item, index) => (
          <View
            key={index}
            style={[
              styles.dayCard,
              {
                backgroundColor: item.isToday ? theme.primaryLight : "transparent",
                borderColor: item.isToday ? theme.primary : "transparent"
              }
            ]}
          >
            <Text
              style={[
                styles.dayLabel,
                { color: item.isToday ? theme.primary : theme.textMuted }
              ]}
            >
              {item.day}
            </Text>

            <View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: item.completed
                    ? theme.success
                    : item.isToday
                    ? theme.cardBorder
                    : theme.ringBg
                }
              ]}
            >
              {item.completed ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text style={[styles.dashText, { color: theme.textMuted }]}>—</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 8
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  title: {
    fontSize: 15,
    fontWeight: "700"
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700"
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  dayCard: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  dashText: {
    fontSize: 13,
    fontWeight: "600"
  }
});
