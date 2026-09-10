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

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword
}) => {
  const { theme } = useTheme();
  const { login, googleLogin, appleLogin } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMessage("Please enter your email/username and password.");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    const res = await login(emailOrUsername.trim(), password);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || "Invalid login credentials.");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await googleLogin();
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || "Google sign-in failed.");
    }
  };

  const handleApple = async () => {
    setLoading(true);
    const res = await appleLogin();
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || "Apple sign-in failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="fitness" size={36} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Log in to continue your personalized health journey
          </Text>
        </View>

        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: theme.danger + "15", borderColor: theme.danger }]}>
            <Ionicons name="alert-circle" size={18} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email or Username</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="e.g. alex or alex@fitai.app"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              value={emailOrUsername}
              onChangeText={(t) => {
                setEmailOrUsername(t);
                setErrorMessage("");
              }}
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrorMessage("");
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onNavigateToForgotPassword}
            style={styles.forgotPassBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.forgotPassText, { color: theme.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 10 }}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>or connect with</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
          </View>

          <View style={styles.socialRow}>
            <Button
              title="Google"
              variant="secondary"
              onPress={handleGoogle}
              style={{ flex: 1, marginRight: 6 }}
              icon={<Ionicons name="logo-google" size={18} color={theme.primary} />}
            />
            <Button
              title="Apple"
              variant="secondary"
              onPress={handleApple}
              style={{ flex: 1, marginLeft: 6 }}
              icon={<Ionicons name="logo-apple" size={18} color={theme.primary} />}
            />
          </View>

          <View style={styles.signupPrompt}>
            <Text style={[styles.promptText, { color: theme.textMuted }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
              <Text style={[styles.signupLink, { color: theme.primary }]}>Create Account</Text>
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
    paddingTop: 50,
    paddingBottom: 30
  },
  header: {
    alignItems: "center",
    marginBottom: 24
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280
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
    fontSize: 13,
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
    height: 52
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
  forgotPassBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 14
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: "700"
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "600"
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20
  },
  promptText: {
    fontSize: 14
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "800"
  }
});
