// Updated Chat Service for NestJS Backend Integration
import { apiRequest } from "@/lib/api-client";

export class ChatService {
  // Send message to AI chat
  async sendMessage(data: {
    sessionId?: string;
    entityType?: string;
    entityId?: string;
    message?: string;
    imageData?: string;
    tools?: string[];
    params?: Record<string, any>;
    provider?: string;
  }) {
    try {
      // Remove projectId, use entityType/entityId/sessionId as per new backend
      return await apiRequest.post("/ai/chat", data);
    } catch (error: any) {
      console.error("Send message error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }

  // Get chat sessions (now uses entityType/entityId)
  async getSessions(
    entityType: string,
    entityId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    try {
      const params = new URLSearchParams({
        entityType,
        entityId,
        limit: (options.limit || 50).toString(),
        offset: (options.offset || 0).toString(),
      });
      return await apiRequest.get(`/ai/sessions?${params}`);
    } catch (error: any) {
      console.error("Get sessions error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get sessions"
      );
    }
  }

  // Create new AI session (use entityType/entityId/title/description)
  async createSession(sessionData: {
    entityType: string;
    entityId: string;
    title: string;
    description?: string;
  }) {
    try {
      return await apiRequest.post("/ai/sessions", sessionData);
    } catch (error: any) {
      console.error("Create session error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create session"
      );
    }
  }

  // Get specific session
  async getSession(sessionId: string) {
    try {
      return await apiRequest.get(`/ai/sessions/${sessionId}`);
    } catch (error: any) {
      console.error("Get session error:", error);
      throw new Error(error.response?.data?.message || "Failed to get session");
    }
  }

  // Get session messages
  // Get session messages with pagination
  async getSessionMessages({
    sessionId,
    page = 1,
    limit = 30,
  }: {
    sessionId: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams({
        offset: page.toString(),
        limit: limit.toString(),
      });
      return await apiRequest.get(
        `/ai/sessions/${sessionId}/messages?${params}`
      );
    } catch (error: any) {
      console.error("Get session messages error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get session messages"
      );
    }
  }

  // Generate image using AI
  async generateImage(data: {
    prompt: string;
    style?: string;
    dimensions?: string;
    projectId?: string;
  }) {
    try {
      return await apiRequest.post("/ai/generate-image", data);
    } catch (error: any) {
      console.error("Generate image error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate image"
      );
    }
  }

  async listAvailableTools() {
    try {
      const response = await apiRequest.get("/ai/tools");

      return response.data;
    } catch (error: any) {
      console.error("List available tools error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to list available tools"
      );
    }
  }

  async listAvailablePrompts() {
    try {
      const response = await apiRequest.get("/ai/prompts");
      return response.data.data;
    } catch (error: any) {
      console.error("List available prompts error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to list available prompts"
      );
    }
  }

  async getPrompt(name: string, args: any) {
    try {
      const response = await apiRequest.get(`/ai/prompts/${name}`, {
        params: { args },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Get prompt error:", error);
      throw new Error(error.response?.data?.message || "Failed to get prompt");
    }
  }

  // Clear all messages from a chat session
  async clearChatSession(sessionId: string) {
    try {
      return await apiRequest.post(`/ai/sessions/${sessionId}/clear`);
    } catch (error: any) {
      console.error("Clear chat session error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to clear chat session"
      );
    }
  }

  // Edit a message and regenerate conversation from that point
  async editMessage(data: {
    sessionId: string;
    messageId: string;
    message: string;
    tools?: string[];
    params?: any;
    provider?: string;
    base64?: string;
    mimeType?: string;
  }) {
    const { sessionId, messageId, ...payload } = data;
    try {
      return await apiRequest.post(
        `/ai/sessions/${sessionId}/messages/${messageId}/edit`,
        payload
      );
    } catch (error: any) {
      console.error("Edit message error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to edit message"
      );
    }
  }
}

export const chatService = new ChatService();
