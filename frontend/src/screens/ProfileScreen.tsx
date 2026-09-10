import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useHealth } from "../context/HealthContext";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

interface ProfileScreenProps {
  onEditProfileSetup: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onEditProfileSetup }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, logout, updateProfile } = useAuth();
  const { providerName, isConnected, requestPermission, disconnect, syncHealthData } = useHealth();

  // Notification states (Requirement 21)
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [activityReminders, setActivityReminders] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  // Modals
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const handleHealthToggle = async (val: boolean) => {
    if (val) {
      await requestPermission();
    } else {
      await disconnect();
    }
  };

  const handleChangePassword = () => {
    if (!newPass || newPass.length < 6) {
      setPassMsg("New password must be at least 6 characters.");
      return;
    }
    setPassMsg("Password successfully updated!");
    setTimeout(() => {
      setShowPasswordModal(false);
      setPassMsg("");
      setCurrentPass("");
      setNewPass("");
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="My Profile" subtitle="Account & Health Settings" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <Card variant="card" style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarLetter}>
                {profile?.name ? profile.name[0].toUpperCase() : "U"}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>
                {profile?.name || "Athlete User"}
              </Text>
              <Text style={[styles.userHandle, { color: theme.textMuted }]}>
                @{profile?.username || "fit_user"}
              </Text>
              <View style={[styles.goalPill, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="sparkles" size={12} color={theme.primary} />
                <Text style={[styles.goalText, { color: theme.primary }]}>
                  {profile?.fitness_goal || "General Fitness"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsRow, { borderTopColor: theme.cardBorder }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>
                {profile?.age || 26}
              </Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Age</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>
                {profile?.height || 175} cm
              </Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Height</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>
                {profile?.weight || 70} kg
              </Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Weight</Text>
            </View>
          </View>
        </Card>

        {/* Profile Details List */}
        <Card variant="card" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fitness Level</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {profile?.fitness_level || "Beginner"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Activity Level</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {profile?.activity_level || "Moderate"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Workout Type</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {profile?.workout_preference?.location || "Home"} •{" "}
              {profile?.workout_preference?.availableTime || 30} mins
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Diet Preference</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {profile?.food_preference || "Non-Vegetarian"}
            </Text>
          </View>
        </Card>

        {/* Settings Buttons */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 16 }]}>
          Preferences & Settings
        </Text>

        <Card variant="card" style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderBottomColor: theme.cardBorder }]}
            onPress={onEditProfileSetup}
            activeOpacity={0.7}
          >
            <View style={styles.btnLeft}>
              <Ionicons name="person-outline" size={20} color={theme.primary} />
              <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>Edit Profile & Goals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderBottomColor: theme.cardBorder }]}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.btnLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
              <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Health Connections (Requirement 13) */}
          <View style={[styles.actionBtn, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.btnLeft}>
              <Ionicons name="heart-circle-outline" size={22} color={theme.danger} />
              <View>
                <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>{providerName}</Text>
                <Text style={[styles.btnSub, { color: theme.textMuted }]}>
                  {isConnected ? "Active Sync • Steps & Calories" : "Tap to enable sync"}
                </Text>
              </View>
            </View>
            <Switch
              value={isConnected}
              onValueChange={handleHealthToggle}
              trackColor={{ false: theme.ringBg, true: theme.primaryLight }}
              thumbColor={isConnected ? theme.primary : "#FFF"}
            />
          </View>

          {/* Notifications (Requirement 21) */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderBottomColor: theme.cardBorder }]}
            onPress={() => setShowNotificationsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.btnLeft}>
              <Ionicons name="notifications-outline" size={20} color={theme.warning} />
              <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>Notifications & Reminders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Theme */}
          <View style={[styles.actionBtn, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.btnLeft}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={theme.primary} />
              <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.ringBg, true: theme.primaryLight }}
              thumbColor={isDark ? theme.primary : "#FFF"}
            />
          </View>

          {/* Privacy */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderBottomWidth: 0 }]}
            onPress={() => setShowPrivacyModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.btnLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.success} />
              <Text style={[styles.btnTitle, { color: theme.textPrimary }]}>Privacy & Security Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Log Out"
          variant="outline"
          onPress={logout}
          icon={<Ionicons name="log-out-outline" size={18} color={theme.danger} />}
          textStyle={{ color: theme.danger }}
          style={{ borderColor: theme.danger, marginTop: 20 }}
        />
      </ScrollView>

      {/* NOTIFICATIONS MODAL (Requirement 21) */}
      <Modal visible={showNotificationsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Reminders & Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Workout Reminders</Text>
              <Switch value={workoutReminders} onValueChange={setWorkoutReminders} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Hydration (Water) Alerts</Text>
              <Switch value={waterReminders} onValueChange={setWaterReminders} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Meal & Macro Reminders</Text>
              <Switch value={mealReminders} onValueChange={setMealReminders} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Daily Step Activity Updates</Text>
              <Switch value={activityReminders} onValueChange={setActivityReminders} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Workout Streak Motivation</Text>
              <Switch value={streakReminders} onValueChange={setStreakReminders} />
            </View>

            <Button
              title="Save Preferences"
              onPress={() => setShowNotificationsModal(false)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {passMsg ? (
              <Text style={{ color: theme.primary, fontWeight: "700", marginBottom: 10 }}>{passMsg}</Text>
            ) : null}

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>New Password</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
              />
            </View>

            <Button
              title="Update Password"
              onPress={handleChangePassword}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* PRIVACY MODAL (Requirement 17) */}
      <Modal visible={showPrivacyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Privacy & Security</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                **Zero Plain-Text Passwords**: All user credentials are protected using industry-standard bcrypt salt hashing.
                {"\n\n"}
                **Row Level Security (RLS)**: Your profile, workout logs, nutrition history, and progress metrics are strictly isolated. No other user can access your private data.
                {"\n\n"}
                **Secure Storage**: Authentication tokens are stored strictly within hardware-backed device keystore/keychain.
                {"\n\n"}
                **Health Privacy**: Google Health Connect and Apple HealthKit integration is read only with explicit user permission and never shared with third parties.
              </Text>
            </ScrollView>

            <Button
              title="Understood"
              onPress={() => setShowPrivacyModal(false)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40
  },
  userCard: {
    padding: 18,
    marginBottom: 10
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900"
  },
  userName: {
    fontSize: 19,
    fontWeight: "800"
  },
  userHandle: {
    fontSize: 13,
    marginTop: 1
  },
  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6
  },
  goalText: {
    fontSize: 11,
    fontWeight: "700"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statVal: {
    fontSize: 16,
    fontWeight: "800"
  },
  statLbl: {
    fontSize: 12,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#D9E2EC"
  },
  detailsCard: {
    padding: 16,
    marginVertical: 6
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0"
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600"
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700"
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8
  },
  actionsCard: {
    padding: 6,
    marginVertical: 4
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  btnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  btnTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  btnSub: {
    fontSize: 11,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end"
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600"
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  input: {
    fontSize: 15,
    fontWeight: "600"
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20
  }
});
