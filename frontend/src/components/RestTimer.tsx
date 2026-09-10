import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface RestTimerProps {
  initialSeconds?: number;
  onFinish?: () => void;
  onSkip?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 60,
  onFinish,
  onSkip
}) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onFinish]);

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View
      style={[
        styles.timerCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.primary
        }
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Ionicons name="hourglass-outline" size={18} color={theme.primary} />
          <Text style={[styles.timerTitle, { color: theme.primary }]}>Rest Timer</Text>
        </View>
        <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.timeText, { color: theme.textPrimary }]}>
        {formatTime(timeLeft)}
      </Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor: theme.ringBg }]}
          onPress={() => addTime(-15)}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: theme.textPrimary }]}>-15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: theme.primary }]}
          onPress={() => setIsRunning(!isRunning)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor: theme.ringBg }]}
          onPress={() => addTime(15)}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: theme.textPrimary }]}>+15s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginVertical: 12,
    alignItems: "center"
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600"
  },
  timeText: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1,
    marginVertical: 4
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12
  },
  btnText: {
    fontSize: 13,
    fontWeight: "700"
  },
  mainBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center"
  }
});
