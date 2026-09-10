import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateToLogin }) => {
  const { theme } = useTheme();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "info" | "error" | "success" } | null>(null);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage({ text: "Please enter your registered email.", type: "error" });
      return;
    }
    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);
    if (res.success) {
      setStep(2);
      if (res.debugCode) {
        setCode(res.debugCode);
      }
      setMessage({
        text: `Verification code sent to ${email}.`,
        type: "info"
      });
    } else {
      setMessage({ text: res.message || "Failed to send code.", type: "error" });
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      setMessage({ text: "Please enter verification code and new password.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim(), code.trim(), newPassword);
    setLoading(false);
    if (res.success) {
      setMessage({ text: "Password reset successful! You may now log in.", type: "success" });
      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);
    } else {
      setMessage({ text: res.message || "Failed to reset password.", type: "error" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="key-outline" size={36} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Password Recovery</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {step === 1
              ? "Enter your account email to receive a 6-digit verification code"
              : "Enter the code and choose a secure new password"}
          </Text>
        </View>

        {message ? (
          <View
            style={[
              styles.msgBox,
              {
                backgroundColor:
                  message.type === "error"
                    ? theme.danger + "15"
                    : message.type === "success"
                    ? theme.success + "15"
                    : theme.primaryLight,
                borderColor:
                  message.type === "error"
                    ? theme.danger
                    : message.type === "success"
                    ? theme.success
                    : theme.primary
              }
            ]}
          >
            <Ionicons
              name={
                message.type === "error"
                  ? "alert-circle"
                  : message.type === "success"
                  ? "checkmark-circle"
                  : "information-circle"
              }
              size={18}
              color={
                message.type === "error"
                  ? theme.danger
                  : message.type === "success"
                  ? theme.success
                  : theme.primary
              }
            />
            <Text
              style={[
                styles.msgText,
                {
                  color:
                    message.type === "error"
                      ? theme.danger
                      : message.type === "success"
                      ? theme.success
                      : theme.primary
                }
              ]}
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Registered Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="your.email@example.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); setMessage(null); }}
              />
            </View>

            <Button
              title="Send Verification Code"
              onPress={handleSendCode}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>6-Digit Verification Code</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="shield-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="e.g. 123456"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={code}
                onChangeText={(t) => { setCode(t); setMessage(null); }}
              />
            </View>

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 14 }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setMessage(null); }}
              />
            </View>

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              style={{ marginTop: 20 }}
            />

            <TouchableOpacity onPress={() => setStep(1)} style={styles.resendBtn} activeOpacity={0.7}>
              <Text style={[styles.resendText, { color: theme.primary }]}>Didn't get code? Send again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16
  },
  header: {
    alignItems: "center",
    marginBottom: 24
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  title: {
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 290
  },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8
  },
  msgText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "500"
  },
  resendBtn: {
    alignItems: "center",
    marginTop: 16
  },
  resendText: {
    fontSize: 14,
    fontWeight: "700"
  }
});
