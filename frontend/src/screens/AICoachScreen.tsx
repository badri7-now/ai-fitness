import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";
import { api } from "../api/client";
import { ChatMessage } from "../types";

const SUGGESTIONS = [
  "Create today's workout.",
  "Give me a 20-minute home workout.",
  "What exercise should I do for legs?",
  "How many sets should I do?",
  "I missed yesterday's workout. What should I do?",
  "Give me a beginner workout.",
  "How can I improve my strength?",
  "What should I eat after my workout?"
];

export const AICoachScreen: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello ${profile?.name || "there"}! I'm your **FitAI Coach**. I have your profile loaded (${profile?.fitness_goal || "General Fitness"}, ${profile?.fitness_level || "Beginner"}).\n\nHow can I support your workout or nutrition goals today? Tap a suggestion below or ask anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/coach", { message: query });
      const aiReply =
        res.success && res.data?.reply
          ? res.data.reply
          : "I'm having trouble connecting right now, but remember to stay hydrated, maintain good form, and stick to your workout plan!";

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an unexpected network error. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.aiRow
        ]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? theme.primary : theme.card,
              borderColor: isUser ? theme.primary : theme.cardBorder,
              borderBottomRightRadius: isUser ? 4 : 18,
              borderBottomLeftRadius: isUser ? 18 : 4
            }
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? "#FFFFFF" : theme.textPrimary }
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timeText,
              { color: isUser ? "rgba(255,255,255,0.7)" : theme.textMuted }
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="FitAI Coach" subtitle="Personalized Intelligence" />

      {/* Medical Safety Disclaimer Banner */}
      <View style={[styles.disclaimerBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primary + "40" }]}>
        <Ionicons name="medkit-outline" size={16} color={theme.primary} />
        <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          General fitness guidance only. For injuries or medical conditions, consult a qualified healthcare professional.
        </Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatList}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingIndicator}>
              <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.typingText, { color: theme.textMuted }]}>
                  FitAI is thinking...
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggested Questions */}
      <View style={[styles.suggestionsContainer, { borderTopColor: theme.cardBorder }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SUGGESTIONS}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.suggestionChip, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => sendMessage(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, { color: theme.primary }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.cardBorder }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              color: theme.textPrimary
            }
          ]}
          placeholder="Ask FitAI anything..."
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: input.trim() && !loading ? theme.primary : theme.ringBg
            }
          ]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() && !loading ? "#FFFFFF" : theme.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  disclaimerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1
  },
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
    maxWidth: "85%"
  },
  userRow: {
    alignSelf: "flex-end"
  },
  aiRow: {
    alignSelf: "flex-start",
    alignItems: "flex-end"
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 4
  },
  bubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500"
  },
  timeText: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1
  },
  typingText: {
    fontSize: 12,
    fontWeight: "600"
  },
  suggestionsContainer: {
    paddingVertical: 8,
    borderTopWidth: 1
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "700"
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1
  },
  textInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 14,
    fontWeight: "500"
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  }
});
