import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

export interface AttachedFile {
  name: string;
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  attachedFile: AttachedFile | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'> & { id?: string }) => void;
  updateMessageContent: (messageId: string, content: string) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setAttachedFile: (file: AttachedFile | null) => void;
  setMessageFeedback: (messageId: string, feedback: 'positive' | 'negative' | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      attachedFile: null,
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: message.id || crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),
      updateMessageContent: (messageId, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
        })),
      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        })),
      clearMessages: () => set({ messages: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAttachedFile: (file) => set({ attachedFile: file }),
      setMessageFeedback: (messageId, feedback) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, feedback } : msg
          ),
        })),
    }),
    {
      name: 'chat-storage',
      // Only persist messages, not loading states or attached files
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
