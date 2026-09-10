import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSync } from "../context/SyncContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSyncStatus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showSyncStatus = true
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { status, pendingCount, syncNow } = useSync();

  const getSyncBadge = () => {
    switch (status) {
      case "syncing":
        return { label: "Syncing...", color: theme.primary, bg: theme.primaryLight };
      case "offline":
        return {
          label: `Offline (${pendingCount})`,
          color: theme.warning,
          bg: isDark ? "#3A2810" : "#FEF3C7"
        };
      case "synced":
      default:
        return {
          label: "Synced",
          color: theme.success,
          bg: isDark ? "#0E3524" : "#D1FAE5"
        };
    }
  };

  const badge = getSyncBadge();

  return (
    <View style={[styles.headerContainer, { borderBottomColor: theme.cardBorder }]}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {showSyncStatus && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={syncNow}
            style={[styles.syncBadge, { backgroundColor: badge.bg }]}
          >
            <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
            <Text style={[styles.syncText, { color: badge.color }]}>{badge.label}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={20}
            color={isDark ? "#FBBF24" : theme.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1
  },
  left: {
    flex: 1
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500"
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6
  },
  syncText: {
    fontSize: 11,
    fontWeight: "700"
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginLeft: 6
  }
});
