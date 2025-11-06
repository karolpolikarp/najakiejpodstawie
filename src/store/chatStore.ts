import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AttachedFile {
  name: string;
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  attachedFile: AttachedFile | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setAttachedFile: (file: AttachedFile | null) => void;
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
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),
      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        })),
      clearMessages: () => set({ messages: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAttachedFile: (file) => set({ attachedFile: file }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
