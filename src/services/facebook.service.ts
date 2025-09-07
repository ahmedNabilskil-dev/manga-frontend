import apiClient from "@/lib/api-client";

// ============================================================================
// TYPES
// ============================================================================

export interface FacebookPage {
  pageId: string;
  name: string;
  profilePicture: string;
  category?: string;
  accessToken?: string;
  canPost?: boolean;
  followersCount?: number;
  isPublic?: boolean;
}

export interface FacebookIntegrationStatus {
  connected: boolean;
  userInfo?: {
    name: string;
    email: string;
    picture: string;
  };
  pages: FacebookPage[];
  permissions: string[];
  lastSync?: string;
}

export interface FacebookPostData {
  message: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
}

export interface FacebookPostResponse {
  success: boolean;
  data?: {
    postId: string;
    url: string;
  };
  error?: string;
}

// ============================================================================
// FACEBOOK SERVICE
// ============================================================================

class FacebookService {
  private baseUrl = "/api/facebook";

  /**
   * Get Facebook integration status for current user
   */
  async getStatus(): Promise<{
    success: boolean;
    data: FacebookIntegrationStatus;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/status`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting Facebook status:", error);
      return {
        success: false,
        data: {
          connected: false,
          pages: [],
          permissions: [],
        },
        error: error.response?.data?.error || "Failed to get Facebook status",
      };
    }
  }

  /**
   * Get Facebook OAuth login URL
   */
  async getLoginUrl(): Promise<{
    success: boolean;
    data?: { loginUrl: string };
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/login`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting Facebook login URL:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get login URL",
      };
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getPages(): Promise<{
    success: boolean;
    data?: { pages: FacebookPage[] };
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/pages`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting Facebook pages:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get pages",
      };
    }
  }

  /**
   * Post content to a Facebook page
   */
  async postToPage(postData: {
    pageId: string;
    message: string;
    imageUrl?: string;
    linkUrl?: string;
  }): Promise<FacebookPostResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/post`, postData);
      return response.data;
    } catch (error: any) {
      console.error("Error posting to Facebook:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to post to Facebook",
      };
    }
  }

  /**
   * Revoke Facebook access (disconnect)
   */
  async revokeAccess(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/revoke`);
      return response.data;
    } catch (error: any) {
      console.error("Error revoking Facebook access:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to revoke access",
      };
    }
  }

  /**
   * Get posting logs/history
   */
  async getPostingLogs(options?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data?: {
      logs: Array<{
        id: string;
        pageId: string;
        pageName: string;
        message: string;
        postId?: string;
        status: "success" | "failed";
        error?: string;
        createdAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
    };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const response = await apiClient.get(
        `${this.baseUrl}/logs${params.toString() ? `?${params}` : ""}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting Facebook logs:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get posting logs",
      };
    }
  }
}

// ============================================================================
// AI ENHANCEMENT SERVICE
// ============================================================================

class AIEnhancementService {
  private baseUrl = "/api/ai";

  /**
   * Generate a social media post using AI
   */
  async generateSocialPost(params: {
    platform: "facebook" | "twitter" | "instagram";
    content: {
      message?: string;
      imageUrl?: string;
      context?: string;
    };
    options: {
      tone: "professional" | "casual" | "exciting" | "creative" | "friendly";
      includeHashtags: boolean;
      includeCallToAction: boolean;
      targetAudience: "general" | "manga-fans" | "artists" | "creators";
    };
  }): Promise<{
    success: boolean;
    data?: {
      generatedPost: {
        message: string;
        linkUrl?: string;
        linkTitle?: string;
        linkDescription?: string;
        hashtags?: string[];
      };
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/generate-social-post`,
        params
      );
      return response.data;
    } catch (error: any) {
      console.error("Error generating social post:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to generate social post",
      };
    }
  }

  /**
   * Enhance existing post content using AI
   */
  async enhanceSocialPost(params: {
    platform: "facebook" | "twitter" | "instagram";
    message: string;
    options: {
      tone: "professional" | "casual" | "exciting" | "creative" | "friendly";
      includeHashtags: boolean;
      includeCallToAction: boolean;
      targetAudience: "general" | "manga-fans" | "artists" | "creators";
    };
    context?: string;
  }): Promise<{
    success: boolean;
    data?: {
      enhancedMessage: string;
      originalMessage: string;
      improvements: string[];
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/enhance-social-post`,
        params
      );
      return response.data;
    } catch (error: any) {
      console.error("Error enhancing social post:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to enhance social post",
      };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const facebookService = new FacebookService();
export const aiEnhancementService = new AIEnhancementService();
