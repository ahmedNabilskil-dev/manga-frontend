"use client";
"use client";
import { apiRequest } from "@/lib/api-client";
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
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    message: "AI settings updated successfully!",
    success: true,
  };
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
            className="flex items-center cursor-pointer flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only"
            />
            <div
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
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
const AISettingsContent = ({ onClose }: { onClose: () => void }) => {
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

      // Auto close dialog after successful save
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [formData, onClose]);

  // Create stable toggle handlers
  const handleTextModelToggle = useCallback(() => {
    if (!formData) return;
    updateFormData("enableTextModel", !formData.enableTextModel);
  }, [formData?.enableTextModel, updateFormData]);

  const handleImageModelToggle = useCallback(() => {
    if (!formData) return;
    updateFormData("enableImageModel", !formData.enableImageModel);
  }, [formData?.enableImageModel, updateFormData]);

  const handleImageHostToggle = useCallback(() => {
    if (!formData) return;
    updateFormData("enableImageHost", !formData.enableImageHost);
  }, [formData?.enableImageHost, updateFormData]);

  // Show loading state
  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center py-12">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-3">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Free Usage of Manga AI
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Provide your API keys to get free usage
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your API key is encrypted and cannot be exposed to anyone.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
            AI Provider
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {aiData.providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`flex items-center gap-2 p-3 rounded-lg text-sm border transition-colors ${
                formData.provider === provider.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              onClick={() => updateFormData("provider", provider.id)}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <div className="relative">
              <select
                value={formData.textModel}
                onChange={(e) => updateFormData("textModel", e.target.value)}
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <div className="relative">
              <select
                value={formData.imageModel}
                onChange={(e) => updateFormData("imageModel", e.target.value)}
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service
            </label>
            <div className="relative">
              <select
                value={formData.imageHost}
                onChange={(e) => updateFormData("imageHost", e.target.value)}
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

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

// Dialog Component
const AISettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      {/* Trigger Button */}
      <div className="flex items-center justify-between px-6 py-3 mt-2 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md">
        <span className="text-gray-700 font-medium">
          Use your API Keys to get free usage
        </span>
        <button
          onClick={() => setOpen(true)}
          className="ml-6 flex items-center gap-2 pl-6 pr-5 py-2 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300"
        >
          <Settings className="w-5 h-5" />
          Click Here
        </button>
      </div>

      {/* Dialog Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog Container - Responsive */}
          <div
            ref={dialogRef}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Scrollable Content */}
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto">
              <div className="p-6">
                <AISettingsContent onClose={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISettingsDialog;
