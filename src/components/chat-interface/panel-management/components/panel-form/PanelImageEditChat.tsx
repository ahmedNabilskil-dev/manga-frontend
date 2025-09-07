import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/stores/auth-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Copy,
  Edit2,
  Loader2,
  RefreshCw,
  Send,
  User,
  Zap,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface PanelImageEditChatProps {
  entityType: string;
  entityId: string;
}

interface ChatMessage {
  id: string;
  _id?: string; // MongoDB ID from backend
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  type?: "text" | "image" | "component-created" | "component-updated";
  metadata?: {
    componentType?: "character" | "scene" | "chapter" | "panel";
    componentId?: string;
    action?: "created" | "updated" | "deleted" | "error";
    retryMessageId?: string;
  };
  imageUrl?: string;
  imageData?: string;
  url?: string;
  mimeType?: string;
  attachments?: {
    type: "image" | "file";
    url: string;
    name: string;
    size?: number;
  }[];
}

// ============================================================================
// EDIT MESSAGE COMPONENT
// ============================================================================

interface EditMessageComponentProps {
  messageId: string;
  originalContent: string;
  isLoading: boolean;
  onSubmit: (messageId: string, newContent: string) => void;
  onCancel: () => void;
}

const EditMessageComponent = ({
  messageId,
  originalContent,
  isLoading,
  onSubmit,
  onCancel,
}: EditMessageComponentProps) => {
  const [editContent, setEditContent] = useState(originalContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset content when originalContent changes (different message being edited)
  useEffect(() => {
    setEditContent(originalContent);
  }, [originalContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && !isLoading) {
      onSubmit(messageId, editContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-gray-700 border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-400 text-gray-100 transition-colors p-3 text-sm min-h-[80px]"
          placeholder="Edit your message..."
          disabled={isLoading}
        />

        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-2 text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Cancel
          </button>

          <motion.button
            type="submit"
            disabled={!editContent.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed font-medium text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Update
              </>
            )}
          </motion.button>
        </div>
      </form>

      <p className="text-gray-400 text-xs">
        <strong>Tip:</strong> Press Enter to send, Shift+Enter for new line,
        Escape to cancel
      </p>
    </div>
  );
};

// ============================================================================
// WAITING RESPONSE LOADING COMPONENT
// ============================================================================

const WaitingResponseLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 justify-start"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: [
              "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #8b5cf6)",
              "conic-gradient(from 120deg, #8b5cf6, #3b82f6, #8b5cf6)",
              "conic-gradient(from 240deg, #8b5cf6, #3b82f6, #8b5cf6)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <Zap className="w-4 h-4 text-white relative z-10" />
      </div>

      {/* Message Bubble */}
      <div className="bg-purple-900/80 text-purple-100 rounded-xl px-4 py-3 border border-purple-700/50 relative min-w-[120px] max-w-xs">
        {/* Speech bubble tail */}
        <div className="absolute -left-2 top-4 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-purple-900/80" />

        {/* Animated background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-purple-700/20 to-transparent animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          <motion.span
            className="text-purple-200 font-medium text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI is thinking...
          </motion.span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-purple-300 rounded-full"
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PanelImageEditChat = React.memo(function PanelImageEditChat({
  entityType,
  entityId,
}: PanelImageEditChatProps) {
  // Use a ref to store the stable entity ID to prevent unnecessary re-fetches
  const stableEntityIdRef = useRef<string>(entityId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Edit message state
  const [editingMessage, setEditingMessage] = useState<{
    messageId: string | null;
    originalContent: string;
    isLoading: boolean;
  }>({ messageId: null, originalContent: "", isLoading: false });

  const { toast } = useToast();
  const { user } = useAuthStore();

  // Update stable entity ID only when it actually changes (not on every render)
  useEffect(() => {
    if (entityId !== stableEntityIdRef.current) {
      stableEntityIdRef.current = entityId;
      // Reset messages and session when entity changes
      setMessages([]);
      setSessionId(undefined);
    }
  }, [entityId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch existing messages when component mounts or entity changes
  const fetchSessionsAndMessages = useCallback(
    async (initialLoading = true) => {
      const currentEntityId = stableEntityIdRef.current;
      if (
        !user?.id ||
        !currentEntityId ||
        !entityType ||
        currentEntityId === "preview-panel"
      )
        return;

      setIsMessagesLoading(initialLoading);
      try {
        const response = await chatService.getSessions(
          entityType,
          currentEntityId,
          {
            limit: 1,
          }
        );

        let sessionIdToSet: string | undefined = undefined;
        let messagesToSet: ChatMessage[] = [];

        if (
          response &&
          response.success &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const latestSession = response.data[0];
          sessionIdToSet = latestSession._id;

          if (sessionIdToSet) {
            const msgRes = await chatService.getSessionMessages({
              sessionId: sessionIdToSet,
              page: 1,
              limit: 50,
            });

            if (
              msgRes &&
              msgRes.success &&
              Array.isArray(msgRes.data?.messages) &&
              msgRes.data.messages.length > 0
            ) {
              messagesToSet = msgRes.data.messages;
              // Sort messages by timestamp (oldest first)
              messagesToSet.sort(
                (a: ChatMessage, b: ChatMessage) =>
                  new Date(a.timestamp || 0).getTime() -
                  new Date(b.timestamp || 0).getTime()
              );
            }
          }
        }

        setSessionId(sessionIdToSet);
        setMessages(messagesToSet);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        setMessages([]);
        setSessionId(undefined);
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [user?.id, entityType]
  );

  useEffect(() => {
    fetchSessionsAndMessages();
  }, [fetchSessionsAndMessages]);

  // Helper to add a message
  const addMessage = useCallback((newMsg: ChatMessage) => {
    setMessages((prev) => [...prev, newMsg]);
  }, []);

  // Edit message handler
  const handleEditMessage = useCallback(
    (id: string) => {
      const message = messages.find((msg) => (msg.id || msg._id) === id);
      if (message) {
        setEditingMessage({
          messageId: id,
          originalContent: message.content,
          isLoading: false,
        });
      }
    },
    [messages]
  );

  // Handle retry message (same as edit but with same content)
  const handleRetryMessage = useCallback(
    async (id: string) => {
      const message = messages.find((msg) => (msg.id || msg._id) === id);
      if (!message || !sessionId) return;

      setEditingMessage({
        messageId: id,
        originalContent: message.content,
        isLoading: true,
      });

      try {
        const response = await chatService.editMessage({
          sessionId,
          messageId: id,
          message: message.content,
          tools: [],
        });

        if (response.success) {
          await fetchSessionsAndMessages(false);
          toast({
            title: "Success",
            description: "Message retried successfully.",
          });
        } else {
          throw new Error(response.error || "Failed to retry message");
        }
      } catch (error: any) {
        console.error("Retry message error:", error);
        toast({
          title: "Error",
          description: "Failed to retry message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setEditingMessage({
          messageId: null,
          originalContent: "",
          isLoading: false,
        });
      }
    },
    [messages, sessionId, toast, fetchSessionsAndMessages]
  );

  // Handle submit edit message
  const handleSubmitEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim() || !sessionId) return;

      // Find the index of the message being edited
      const editingMessageIndex = messages.findIndex(
        (msg) => (msg.id || msg._id) === messageId
      );

      if (editingMessageIndex === -1) return;

      // Remove all messages that come after the edited message
      const messagesUpToEdited = messages.slice(0, editingMessageIndex + 1);
      setMessages(messagesUpToEdited);

      // Set loading state
      setEditingMessage((prev) => ({ ...prev, isLoading: true }));
      setIsLoading(true);

      try {
        const response = await chatService.editMessage({
          sessionId,
          messageId,
          message: newContent.trim(),
          tools: [],
        });

        if (response.success) {
          await fetchSessionsAndMessages(false);
          toast({
            title: "Success",
            description: "Message edited successfully.",
          });
        } else {
          throw new Error(response.error || "Failed to edit message");
        }
      } catch (error: any) {
        console.error("Edit message error:", error);
        toast({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          variant: "destructive",
        });

        // On error, restore the original messages
        setMessages(messages);
      } finally {
        setEditingMessage({
          messageId: null,
          originalContent: "",
          isLoading: false,
        });
        setIsLoading(false);
      }
    },
    [messages, sessionId, toast, fetchSessionsAndMessages]
  );

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingMessage({
      messageId: null,
      originalContent: "",
      isLoading: false,
    });
  }, []);

  // Message action handlers
  const handleCopyMessage = useCallback(
    (content: string) => {
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
      });
    },
    [toast]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading || !user?.id) return;

      // Check user credits
      if (!user?.credits || user.credits <= 0) {
        toast({
          title: "Insufficient Credits",
          description:
            "You need credits to use AI features. Please purchase more credits.",
          variant: "destructive",
        });
        return;
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      addMessage(userMessage);
      setInput("");
      setIsLoading(true);

      try {
        const response = await chatService.sendMessage({
          entityType,
          entityId,
          message: text,
          sessionId,
          tools: [], // Panel editing specific tools can be added here
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to process message");
        }

        // Refetch messages instead of adding directly
        await fetchSessionsAndMessages(false);

        if (response.data.creditsUsed && response.data.creditsUsed > 0) {
          toast({
            title: "Credits Used",
            description: `${response.data.creditsUsed} credits used. ${response.data.remainingCredits} remaining.`,
          });
        }
      } catch (error: any) {
        console.error("Chat error:", error);

        // Add error message with retry functionality
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ **Error**: ${
            error.message || "Failed to get AI response"
          }\n\nClick the retry button to try again.`,
          timestamp: new Date().toISOString(),
          type: "text",
          metadata: {
            action: "error",
            retryMessageId: userMessage.id,
          },
        };
        addMessage(errorMessage);

        toast({
          title: "Error",
          description: "Message failed to send. You can retry it.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      isLoading,
      user,
      entityType,
      entityId,
      sessionId,
      addMessage,
      fetchSessionsAndMessages,
      toast,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  // Memoize the entity display info
  const entityDisplayInfo = useMemo(() => {
    return `AI-powered panel editing • Entity: ${entityType} • ID: ${entityId}`;
  }, [entityType, entityId]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {isMessagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-sm text-gray-400">
              Loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Panel Editor Assistant
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Start editing your panel with AI assistance
            </p>
            <p className="text-gray-500 text-xs">
              Ask for improvements, style changes, or specific edits
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isEditing =
                editingMessage?.messageId === (msg.id || msg._id);
              const isError = msg.metadata?.action === "error";

              return (
                <motion.div
                  key={msg.id || msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3 group",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        isError
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-purple-500 to-blue-500"
                      )}
                    >
                      {isError ? (
                        <AlertCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-xs rounded-xl px-4 py-3 relative shadow-sm",
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : isError
                        ? "bg-gradient-to-r from-red-900/20 to-red-800/20 text-red-100 border border-red-700/50"
                        : "bg-purple-900/80 text-purple-100 border border-purple-700/50"
                    )}
                  >
                    {/* Speech bubble tails */}
                    {msg.role === "assistant" && (
                      <div
                        className={cn(
                          "absolute -left-2 top-4 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent",
                          isError
                            ? "border-r-red-900/20"
                            : "border-r-purple-900/80"
                        )}
                      />
                    )}
                    {msg.role === "user" && (
                      <div className="absolute -right-2 top-4 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-600" />
                    )}

                    {/* Show edit component if editing, otherwise show message content */}
                    {isEditing && editingMessage ? (
                      <EditMessageComponent
                        messageId={editingMessage.messageId!}
                        originalContent={editingMessage.originalContent}
                        isLoading={editingMessage.isLoading}
                        onSubmit={handleSubmitEditMessage}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <>
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>

                        {/* Error retry button */}
                        {isError && msg.metadata?.retryMessageId && (
                          <div className="mt-3 pt-3 border-t border-red-600/30">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleRetryMessage(
                                  msg.metadata?.retryMessageId!
                                )
                              }
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors text-sm font-medium"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </motion.button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Message Actions - Only show when not editing */}
                    {!isEditing && (
                      <div
                        className={cn(
                          "absolute -bottom-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                          msg.role === "user" ? "right-0" : "left-0"
                        )}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopyMessage(msg.content)}
                          className="p-1.5 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg text-gray-300 hover:text-white transition-colors text-xs"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>

                        {msg.role === "user" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleEditMessage(msg.id || msg._id!)
                            }
                            className="p-1.5 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg text-gray-300 hover:text-white transition-colors text-xs"
                            title="Edit message"
                          >
                            <Edit2 className="w-3 h-3" />
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Loading indicator for new message */}
        {isLoading && <WaitingResponseLoader />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700/50 bg-gray-900/60 backdrop-blur-sm pt-4">
        <form className="flex gap-3" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Describe how you want to edit this panel..."
              className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none min-h-[48px] max-h-[120px] transition-all duration-200"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  120
                )}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? "Sending..." : "Send"}
            </span>
          </motion.button>
        </form>

        <div className="text-xs text-gray-400 mt-3 text-center">
          {entityDisplayInfo}
        </div>
      </div>
    </div>
  );
});

export default PanelImageEditChat;
