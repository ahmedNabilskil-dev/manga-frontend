import { useMemo } from "react";

export const useColorScheme = (darkMode: boolean = true) => {
  return useMemo(
    () => ({
      bg: darkMode ? "bg-gray-950" : "bg-gray-50",
      cardBg: darkMode ? "bg-gray-900/90" : "bg-white/90",
      panelBg: darkMode ? "bg-gray-800/80" : "bg-gray-100/80",
      border: darkMode ? "border-gray-700" : "border-gray-300",
      text: darkMode ? "text-white" : "text-gray-900",
      textSecondary: darkMode ? "text-gray-300" : "text-gray-600",
      textMuted: darkMode ? "text-gray-400" : "text-gray-500",
      accent: "from-purple-500 via-blue-500 to-cyan-500",
      accentSecondary: "from-pink-500 via-rose-500 to-orange-500",
    }),
    [darkMode]
  );
};
