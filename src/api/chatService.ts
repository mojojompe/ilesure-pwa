import { apiClient } from './client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ChatParticipant {
  _id: string;
  fullName: string;
  avatar?: string;
  role: string;
}

export interface ChatListingPreview {
  _id: string;
  title: string;
  images: string[];
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  listingId?: ChatListingPreview;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  text: string;
  type: 'text' | 'image' | 'location' | 'file' | 'video' | 'audio' | 'call';
  /** Present on type: 'call' — the transcript record of a voice/video call. */
  call?: {
    callId: string;
    callType: 'audio' | 'video';
    status: 'ended' | 'declined' | 'missed' | 'failed';
    durationSeconds: number;
  };
  fileUrl?: string;
  fileName?: string;
  replyTo?: string;
  replyPreview?: string;
  readAt?: string;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    chats: Conversation[];
    pagination: Pagination;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    pagination: Pagination;
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const chatService = {
  /** Get all conversations for the current user */
  async getConversations(page = 1, limit = 20): Promise<ConversationsResponse> {
    const response = await apiClient.get<ConversationsResponse>(`/chats?page=${page}&limit=${limit}`);
    return response.data;
  },

  /** Get messages in a chat */
  async getMessages(chatId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    const response = await apiClient.get<MessagesResponse>(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Start a new conversation (or reuse existing) with a participant.
   * Optionally attach a listing context and send an initial message.
   */
  async startChat(
    participantId: string,
    listingId?: string,
    initialMessage?: string
  ): Promise<{ success: boolean; data: { id: string; participant: ChatParticipant; listingId?: string } }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { id: string; participant: ChatParticipant; listingId?: string };
    }>('/chats', { participantId, listingId, initialMessage });
    return response.data;
  },

  /** Send a message in an existing chat */
  async sendMessage(
    chatId: string,
    text: string,
    type: 'text' | 'image' | 'location' | 'file' | 'video' | 'audio' = 'text',
    fileUrl?: string,
    fileName?: string,
    replyTo?: string,
    replyPreview?: string
  ): Promise<{ success: boolean; data: ChatMessage }> {
    const response = await apiClient.post<{ success: boolean; data: ChatMessage }>(
      `/chats/${chatId}/messages`,
      { text, type, fileUrl, fileName, replyTo, replyPreview }
    );
    return response.data;
  },

  /** Upload an attachment */
  async uploadAttachment(
    chatId: string,
    fileUri: string,
    mimeType: string,
    fileName: string
  ): Promise<{ success: boolean; data: { fileUrl: string; fileName: string; fileSize: number; fileType: string } }> {
    const formData = new FormData();
    formData.append('attachment', {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as any);

    const response = await apiClient.post<{ success: boolean; data: { fileUrl: string; fileName: string; fileSize: number; fileType: string } }>(
      `/chats/${chatId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /** Mark all messages in a chat as read */
  async markAsRead(chatId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      `/chats/${chatId}/read`
    );
    return response.data;
  },

  /** Send a message as an agent responding to a user's inquiry */
  async sendAgentMessage(
    chatId: string,
    text: string,
    type: 'text' | 'image' | 'location' = 'text'
  ): Promise<{ success: boolean; data: ChatMessage }> {
    const response = await apiClient.post<{ success: boolean; data: ChatMessage }>(
      `/chats/${chatId}/messages`,
      { text, type }
    );
    return response.data;
  },

  /** Get all conversations for an agent (including user inquiries) */
  async getAgentConversations(): Promise<ConversationsResponse> {
    const response = await apiClient.get<ConversationsResponse>('/chats');
    return response.data;
  },

  /** Delete a chat entirely */
  async deleteChat(chatId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/chats/${chatId}`);
    return response.data;
  },

  /** Delete a specific message in a chat */
  async deleteMessage(chatId: string, messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/chats/${chatId}/messages/${messageId}`);
    return response.data;
  },
};

export default chatService;
