// ============================================================================
// FACEBOOK INTEGRATION TYPES
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

export interface FacebookPostComposerProps {
  selectedPage: FacebookPage | null;
  initialData?: Partial<FacebookPostData>;
  onPreview: (postData: FacebookPostData) => void;
  onAIEnhance?: (message: string) => Promise<string>;
  className?: string;
}

export interface FacebookPageSelectorProps {
  status: FacebookIntegrationStatus | null;
  selectedPage: FacebookPage | null;
  onPageSelect: (page: FacebookPage) => void;
  onConnect: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface FacebookPostPreviewProps {
  page: FacebookPage;
  postData: FacebookPostData;
  onPost: (pageId: string, postData: FacebookPostData) => Promise<void>;
  onCancel: () => void;
  isPosting?: boolean;
  className?: string;
}

export interface FacebookIntegrationManagerProps {
  userId: string;
  className?: string;
}
