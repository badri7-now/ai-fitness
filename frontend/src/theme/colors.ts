export interface ThemeColors {
  isDark: boolean;
  background: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  inputBg: string;
  navBg: string;
  navActive: string;
  navInactive: string;
  ringBg: string;
  waterBlue: string;
  calorieOrange: string;
  stepGreen: string;
}

export const lightTheme: ThemeColors = {
  isDark: false,
  background: "#FFFFFF",
  card: "#F0F4F8", // Ice Blue
  cardBorder: "#D9E2EC",
  textPrimary: "#102A43", // Dark Navy
  textSecondary: "#334E68",
  textMuted: "#627D98",
  primary: "#0077FF", // Modern Health Blue
  primaryHover: "#005ECC",
  primaryLight: "#E1EFFF",
  accent: "#0077FF",
  success: "#00B37E",
  warning: "#FF8C00",
  danger: "#E53E3E",
  border: "#D9E2EC",
  inputBg: "#FFFFFF",
  navBg: "#FFFFFF",
  navActive: "#0077FF",
  navInactive: "#829AB1",
  ringBg: "#E2E8F0",
  waterBlue: "#00B4D8",
  calorieOrange: "#FF7849",
  stepGreen: "#10B981"
};

export const darkTheme: ThemeColors = {
  isDark: true,
  background: "#0B1320",
  card: "#162338",
  cardBorder: "#243650",
  textPrimary: "#F0F4F8",
  textSecondary: "#BCCCDC",
  textMuted: "#829AB1",
  primary: "#2B8CFF",
  primaryHover: "#0077FF",
  primaryLight: "#102A43",
  accent: "#2B8CFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  border: "#243650",
  inputBg: "#101B2B",
  navBg: "#0E1826",
  navActive: "#2B8CFF",
  navInactive: "#627D98",
  ringBg: "#1F2E45",
  waterBlue: "#38BDF8",
  calorieOrange: "#FB923C",
  stepGreen: "#34D399"
};
