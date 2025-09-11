"use client";

import AISettingsDialog from "@/components/ai-settings/AiSettings";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Brain,
  MessageSquare,
  Palette,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Language definitions
type Language = "en" | "ar";

interface Translations {
  en: {
    [key: string]: string;
  };
  ar: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    title: "Manga AI Agent",
    greeting: "Hello {name}! I'm your AI manga assistant.",
    guestGreeting: "Hello! I'm your AI manga assistant.",
    aiStorytelling: "AI Storytelling",
    visualGeneration: "Visual Generation",
    mangaCreation: "Manga Creation",
    stepByStep: "Step-by-Step Creation",
    placeholder:
      "Describe your manga idea... (e.g., 'A cyberpunk world where emotions are traded as currency, following a smuggler who discovers a rare emotion that could change everything...')",
    generating: "AI is crafting your manga masterpiece...",
    instruction: "Press Enter to send, or Shift+Enter for a new line",
    createError:
      "An unexpected error occurred while creating your manga project.",
    projectCreationFailed: "Project creation failed - no project ID returned",
  },
  ar: {
    title: "وكيل المانجا الذكي",
    greeting: "أهلاً {name}! أنا مساعد المانجا الذكي بتاعك.",
    guestGreeting: "أهلاً! أنا مساعد المانجا الذكي بتاعك.",
    aiStorytelling: "سرد ذكي",
    visualGeneration: "توليد بصري",
    mangaCreation: "إنشاء مانجا",
    stepByStep: "إنشاء خطوة بخطوة",
    placeholder:
      "اوصف فكرة المانجا بتاعتك... (مثال: 'عالم سايبر بانك فيه المشاعر بتتباع كعملة، وبطل القصة مهرب بيكتشف مشاعر نادرة ممكن تغير كل حاجة...')",
    generating: "الذكي الاصطناعي بيعمل تحفة المانجا بتاعتك...",
    instruction: "اضغط Enter للإرسال، أو Shift+Enter لسطر جديد",
    createError: "حدث خطأ غير متوقع أثناء إنشاء مشروع المانجا.",
    projectCreationFailed: "فشل في إنشاء المشروع - لم يتم إرجاع معرف المشروع",
  },
};

const HomePage = () => {
  const [mangaIdea, setMangaIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const toggleLanguage = () => {
    const newLanguage: Language = currentLanguage === "en" ? "ar" : "en";
    setCurrentLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
  };

  // Helper function to get translated text
  const t = (key: string, params?: { [key: string]: string }): string => {
    let text =
      translations[currentLanguage][key] || translations.en[key] || key;

    // Replace parameters in text
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }

    return text;
  };

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const { loadCredits } = useCreditStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaIdea.trim()) return;

    setIsGenerating(true);
    try {
      const response = await apiRequest.post<{
        success: boolean;
        data: { _id: string };
      }>("/manga/projects", {
        mangaIdea: mangaIdea.trim(),
        language: currentLanguage, // Send language preference to backend
      });

      await loadCredits();

      if (response.data?._id) {
        router.push(`/manga-flow/${response.data._id}`);
      } else {
        throw new Error(t("projectCreationFailed"));
      }
    } catch (error: any) {
      console.error("Failed to create manga project:", error);
      const errorMsg =
        error.response?.data?.message || error.message || t("createError");
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Floating particles animation
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );

  // AI capability badges
  const capabilities = [
    {
      icon: Brain,
      label: t("aiStorytelling"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Palette,
      label: t("visualGeneration"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      label: t("mangaCreation"),
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      label: t("stepByStep"),
      color: "from-green-500 to-teal-500",
    },
  ];

  // Get greeting text with user name
  const getGreeting = () => {
    if (user?.firstName) {
      return t("greeting", { name: user.firstName });
    }
    return t("guestGreeting");
  };

  const isRTL = currentLanguage === "ar";

  return (
    <AuthGuard>
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <FloatingParticles />

        {/* Main content container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          {/* AI Agent Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            {/* AI Bot Avatar */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative inline-block mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25 border-4 border-white/10">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 -z-10"
              />
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1
                className={`text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("title")}
              </h1>
              <p
                className={`text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {getGreeting()}
              </p>
            </motion.div>
          </motion.div>

          {/* Capability badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${capability.color} flex items-center justify-center`}
                >
                  <capability.icon className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`text-slate-300 text-sm font-medium ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {capability.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <AISettingsDialog />

          {/* Chat Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-4xl"
          >
            <form onSubmit={handleSubmit} className="relative">
              {/* Input Container */}
              <motion.div
                animate={{
                  scale: isInputFocused ? 1.02 : 1,
                  boxShadow: isInputFocused
                    ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                    : "0 10px 30px -12px rgba(0, 0, 0, 0.3)",
                }}
                transition={{ duration: 0.3 }}
                className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border-2 border-red-500 overflow-hidden"
                style={{ zIndex: 10 }}
              >
                {/* Gradient border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Message icon */}
                <div
                  className={`absolute ${
                    isRTL ? "right-6" : "left-6"
                  } top-6 z-20 pointer-events-none`}
                >
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>

                {/* Textarea */}
                <Textarea
                  ref={inputRef}
                  value={mangaIdea}
                  onChange={(e) => setMangaIdea(e.target.value)}
                  onFocus={() => {
                    setIsInputFocused(true);
                  }}
                  onBlur={() => {
                    setIsInputFocused(false);
                  }}
                  placeholder={t("placeholder")}
                  className={`w-full bg-transparent border-0 text-slate-200 placeholder:text-slate-500 ${
                    isRTL ? "pr-16 pl-24 font-arabic" : "pl-16 pr-24"
                  } py-6 text-lg leading-relaxed resize-none focus-visible:ring-0 min-h-[120px] cursor-text relative z-10`}
                  disabled={isGenerating}
                  rows={3}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                {/* Send button */}
                <motion.div
                  className={`absolute ${
                    isRTL ? "left-4" : "right-4"
                  } bottom-4 z-20 pointer-events-auto`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!mangaIdea.trim() || isGenerating}
                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                        >
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="send"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="group-hover:scale-110 transition-transform"
                        >
                          <Send
                            className={`h-5 w-5 text-white ${
                              isRTL ? "rotate-180" : ""
                            }`}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Status text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-6"
              >
                {isGenerating ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-slate-400 flex items-center justify-center gap-2 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
                    {t("generating")}
                  </motion.p>
                ) : (
                  <p
                    className={`text-slate-500 text-sm ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("instruction")}
                  </p>
                )}
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default HomePage;
