import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Image,
  Loader2,
  MessageSquare,
  Save,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { apiRequest } from "../../lib/api-client";

// Types
interface AIProvider {
  id: string;
  name: string;
}

interface AIModel {
  id: string;
  name: string;
}

interface AISettingsData {
  providers: AIProvider[];
  textModels: AIModel[];
  imageModels: AIModel[];
  imageHosts: AIModel[];
}

interface UserAISettings {
  provider: string;
  textModel: string;
  imageModel: string;
  imageHost: string;
  textModelApiKey?: string;
  imageModelApiKey?: string;
  imageHostApiKey?: string;
  enableTextModel: boolean;
  enableImageModel: boolean;
  enableImageHost: boolean;
}

// API Functions
const fetchAISettings = async (): Promise<UserAISettings> => {
  try {
    return await apiRequest.get("/user/ai-settings");
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch AI settings");
  }
};

const fetchAIProviders = async (): Promise<AISettingsData> => {
  try {
    return await apiRequest.get("/user/ai-settings/providers");
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch AI providers");
  }
};

const updateAISettings = async (
  settings: UserAISettings
): Promise<{ message: string; success: boolean }> => {
  try {
    return await apiRequest.patch("/user/ai-settings", settings);
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update AI settings");
  }
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isExpanded: boolean;
  onExpandToggle: () => void;
}

const CollapsibleSection = ({
  title,
  icon: Icon,
  iconColor,
  enabled,
  onToggle,
  children,
  isExpanded,
  onExpandToggle,
}: CollapsibleSectionProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Make header (except checkbox) clickable for collapse */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer select-none"
            onClick={(e) => {
              // Prevent collapse toggle if clicking the checkbox or its children
              if (
                e.target instanceof HTMLElement &&
                (e.target.closest("label") || e.target.tagName === "INPUT")
              ) {
                return;
              }
              onExpandToggle();
            }}
          >
            <span className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </span>
            <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
              {title}
            </h3>
          </div>

          {/* Checkbox only toggles enabled state */}
          <label
            className="flex items-center cursor-pointer flex-shrink-0 will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only"
            />
            <div
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 will-change-transform transform-gpu ${
                enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 will-change-transform transform-gpu ${
                  enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden ${isExpanded ? "" : "hidden"}`}>
        <div className="p-3 space-y-3">{children}</div>
      </div>
    </div>
  );
};

// Compact API Key Input Component
interface CompactApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CompactApiKeyInput = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: CompactApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          className={`w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
              : ""
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          disabled={disabled}
        >
          {showKey ? (
            <EyeOff className="w-3 h-3 text-gray-400" />
          ) : (
            <Eye className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

// Main Settings Component
const AISettingsPanel = ({ projectData }: { projectData?: any }) => {
  const [formData, setFormData] = useState<UserAISettings | null>(null);

  const [aiData, setAiData] = useState<AISettingsData>({
    providers: [],
    textModels: [],
    imageModels: [],
    imageHosts: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    textModel: true,
    imageModel: false,
    imageHost: false,
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [settingsData, providersData] = await Promise.all([
          fetchAISettings(),
          fetchAIProviders(),
        ]);

        // If user has saved settings, use them
        if (settingsData && settingsData.provider) {
          setFormData(settingsData);
        } else {
          // Otherwise, create default settings using first available options from API
          const defaultSettings: UserAISettings = {
            provider: providersData.providers[0]?.id || "",
            textModel: providersData.textModels[0]?.id || "",
            imageModel: providersData.imageModels[0]?.id || "",
            imageHost: providersData.imageHosts[0]?.id || "",
            textModelApiKey: "",
            imageModelApiKey: "",
            imageHostApiKey: "",
            enableTextModel: false,
            enableImageModel: false,
            enableImageHost: false,
          };
          setFormData(defaultSettings);
        }

        setAiData(providersData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateFormData = useCallback(
    (field: keyof UserAISettings, value: any) => {
      setFormData((prev) => {
        if (!prev) return null;
        return { ...prev, [field]: value };
      });
      // Clear success message when user makes changes
      if (success) setSuccess(null);
    },
    [success]
  );

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await updateAISettings(formData);
      setSuccess(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [formData]);

  // Ref to maintain scroll position during state changes
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Save scroll position before state changes
  const preserveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // Create stable toggle handlers to prevent unnecessary re-renders
  const handleTextModelToggle = useCallback(() => {
    if (!formData) return;
    preserveScrollPosition();
    updateFormData("enableTextModel", !formData.enableTextModel);
  }, [formData?.enableTextModel, updateFormData, preserveScrollPosition]);

  const handleImageModelToggle = useCallback(() => {
    if (!formData) return;
    preserveScrollPosition();
    updateFormData("enableImageModel", !formData.enableImageModel);
  }, [formData?.enableImageModel, updateFormData, preserveScrollPosition]);

  const handleImageHostToggle = useCallback(() => {
    if (!formData) return;
    preserveScrollPosition();
    updateFormData("enableImageHost", !formData.enableImageHost);
  }, [formData?.enableImageHost, updateFormData, preserveScrollPosition]);

  // Restore scroll position after state changes
  useLayoutEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  });

  // Show loading state
  if (loading || !formData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading AI settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative will-change-scroll">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-2">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Free Usage of Manga AI
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide your API keys to get free usage
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your API key is encrypted and cannot be exposed to anyone.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {success}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="p-3 space-y-3">
          {/* Provider Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                AI Provider
              </h3>
            </div>
            <div className="space-y-1">
              {aiData.providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className={`w-full flex items-center gap-2 p-2 rounded text-sm border transition-colors ${
                    formData.provider === provider.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => updateFormData("provider", provider.id)}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Model Section */}
          <CollapsibleSection
            title="Text Model"
            icon={MessageSquare}
            iconColor="text-blue-500"
            enabled={formData.enableTextModel}
            onToggle={handleTextModelToggle}
            isExpanded={expandedSections.textModel}
            onExpandToggle={() => toggleSection("textModel")}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <div className="relative">
                  <select
                    value={formData.textModel}
                    onChange={(e) =>
                      updateFormData("textModel", e.target.value)
                    }
                    disabled={!formData.enableTextModel}
                    className={`w-full px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                      !formData.enableTextModel
                        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        : ""
                    }`}
                  >
                    {aiData.textModels.map((model) => (
                      <option key={model.id} value={model.id} className="py-2">
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDown
                      className={`w-4 h-4 transition-colors ${
                        !formData.enableTextModel
                          ? "text-gray-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
              <CompactApiKeyInput
                label="API Key"
                placeholder="Enter your Gemini API key..."
                value={formData.textModelApiKey || ""}
                onChange={(value) => updateFormData("textModelApiKey", value)}
                disabled={!formData.enableTextModel}
              />
            </div>
          </CollapsibleSection>

          {/* Image Model Section */}
          <CollapsibleSection
            title="Image Model"
            icon={Image}
            iconColor="text-purple-500"
            enabled={formData.enableImageModel}
            onToggle={handleImageModelToggle}
            isExpanded={expandedSections.imageModel}
            onExpandToggle={() => toggleSection("imageModel")}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <div className="relative">
                  <select
                    value={formData.imageModel}
                    onChange={(e) =>
                      updateFormData("imageModel", e.target.value)
                    }
                    disabled={!formData.enableImageModel}
                    className={`w-full px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none ${
                      !formData.enableImageModel
                        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        : ""
                    }`}
                  >
                    {aiData.imageModels.map((model) => (
                      <option key={model.id} value={model.id} className="py-2">
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDown
                      className={`w-4 h-4 transition-colors ${
                        !formData.enableImageModel
                          ? "text-gray-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
              <CompactApiKeyInput
                label="API Key"
                placeholder="Enter your Gemini API key..."
                value={formData.imageModelApiKey || ""}
                onChange={(value) => updateFormData("imageModelApiKey", value)}
                disabled={!formData.enableImageModel}
              />
            </div>
          </CollapsibleSection>

          {/* Image Hosting Section */}
          <CollapsibleSection
            title="Image Hosting"
            icon={Server}
            iconColor="text-green-500"
            enabled={formData.enableImageHost}
            onToggle={handleImageHostToggle}
            isExpanded={expandedSections.imageHost}
            onExpandToggle={() => toggleSection("imageHost")}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service
                </label>
                <div className="relative">
                  <select
                    value={formData.imageHost}
                    onChange={(e) =>
                      updateFormData("imageHost", e.target.value)
                    }
                    disabled={!formData.enableImageHost}
                    className={`w-full px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none ${
                      !formData.enableImageHost
                        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        : ""
                    }`}
                  >
                    {aiData.imageHosts.map((host) => (
                      <option key={host.id} value={host.id} className="py-2">
                        {host.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDown
                      className={`w-4 h-4 transition-colors ${
                        !formData.enableImageHost
                          ? "text-gray-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
              <CompactApiKeyInput
                label="API Key"
                placeholder="Enter your API key..."
                value={formData.imageHostApiKey || ""}
                onChange={(value) => updateFormData("imageHostApiKey", value)}
                disabled={!formData.enableImageHost}
              />
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sticky bottom-0 z-10">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AISettingsPanel;
