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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegistered: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegistered
}) => {
  const { theme } = useTheme();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setErrorMessage("Please complete all registration fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    const res = await register({
      name: fullName.trim(),
      email: email.trim(),
      username: username.trim().toLowerCase(),
      password,
      confirmPassword
    });
    setLoading(false);

    if (res.success) {
      onRegistered();
    } else {
      setErrorMessage(res.message || "Failed to create account.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Start your AI-guided fitness & nutrition program
          </Text>
        </View>

        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: theme.danger + "15", borderColor: theme.danger }]}>
            <Ionicons name="alert-circle" size={18} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="e.g. Alex Parker"
              placeholderTextColor={theme.textMuted}
              value={fullName}
              onChangeText={(t) => { setFullName(t); setErrorMessage(""); }}
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>Email</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="e.g. alex@example.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrorMessage(""); }}
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>Username</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="at-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="e.g. alexfit"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={(t) => { setUsername(t); setErrorMessage(""); }}
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Minimum 6 characters"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrorMessage(""); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>Confirm Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Re-enter password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrorMessage(""); }}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 20 }}
          />

          <View style={styles.loginPrompt}>
            <Text style={[styles.promptText, { color: theme.textMuted }]}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
              <Text style={[styles.loginLink, { color: theme.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 30
  },
  header: {
    marginBottom: 20
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1
  },
  form: {
    width: "100%"
  },
  inputLabel: {
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
  eyeBtn: {
    padding: 6
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18
  },
  promptText: {
    fontSize: 14
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "800"
  }
});
