import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

interface WaterTrackerProps {
  targetGlasses?: number;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ targetGlasses = 10 }) => {
  const { theme } = useTheme();
  const [glasses, setGlasses] = useState<number>(4);
  const todayKey = `@water_${new Date().toISOString().split("T")[0]}`;

  useEffect(() => {
    AsyncStorage.getItem(todayKey).then((val) => {
      if (val !== null) setGlasses(Number(val));
    });
  }, []);

  const updateWater = async (delta: number) => {
    const updated = Math.max(0, Math.min(25, glasses + delta));
    setGlasses(updated);
    await AsyncStorage.setItem(todayKey, updated.toString());
  };

  const liters = (glasses * 0.25).toFixed(2);
  const targetLiters = (targetGlasses * 0.25).toFixed(1);

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
        <View style={styles.titleWithIcon}>
          <View style={[styles.waterIconBg, { backgroundColor: theme.waterBlue + "20" }]}>
            <Ionicons name="water" size={20} color={theme.waterBlue} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Hydration Tracker</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {liters}L / {targetLiters}L Goal ({glasses} of {targetGlasses} glasses)
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.ringBg }]}
            onPress={() => updateWater(-1)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.waterBlue }]}
            onPress={() => updateWater(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Visual Glass Dots */}
      <View style={styles.glassRow}>
        {Array.from({ length: Math.min(targetGlasses, 12) }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.glassDot,
              {
                backgroundColor: i < glasses ? theme.waterBlue : theme.ringBg
              }
            ]}
          />
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  waterIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 15,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500"
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  glassRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    justifyContent: "space-between"
  },
  glassDot: {
    flex: 1,
    height: 8,
    borderRadius: 4
  }
});
