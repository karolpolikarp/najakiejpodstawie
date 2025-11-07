import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from './chatStore';

// Mock crypto.randomUUID for consistent test IDs
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
});

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      isLoading: false,
      attachedFile: null,
    });
  });

  describe('addMessage', () => {
    it('should add a message with generated ID and timestamp', () => {
      const { addMessage } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Hello' });

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello',
      });
      expect(messages[0].id).toBeDefined();
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should use provided ID if given', () => {
      const { addMessage } = useChatStore.getState();
      const customId = 'custom-id-123';

      addMessage({ role: 'assistant', content: 'Hi there', id: customId });

      const { messages } = useChatStore.getState();
      expect(messages[0].id).toBe(customId);
    });

    it('should add multiple messages in order', () => {
      const { addMessage } = useChatStore.getState();

      addMessage({ role: 'user', content: 'First message' });
      addMessage({ role: 'assistant', content: 'Second message' });
      addMessage({ role: 'user', content: 'Third message' });

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First message');
      expect(messages[1].content).toBe('Second message');
      expect(messages[2].content).toBe('Third message');
    });
  });

  describe('updateMessageContent', () => {
    it('should update content of specific message', () => {
      const { addMessage, updateMessageContent } = useChatStore.getState();

      addMessage({ role: 'assistant', content: 'Initial content', id: 'msg-1' });
      updateMessageContent('msg-1', 'Updated content');

      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('Updated content');
    });

    it('should not affect other messages', () => {
      const { addMessage, updateMessageContent } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Message 1', id: 'msg-1' });
      addMessage({ role: 'assistant', content: 'Message 2', id: 'msg-2' });
      addMessage({ role: 'user', content: 'Message 3', id: 'msg-3' });

      updateMessageContent('msg-2', 'Updated Message 2');

      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('Message 1');
      expect(messages[1].content).toBe('Updated Message 2');
      expect(messages[2].content).toBe('Message 3');
    });

    it('should do nothing if message ID not found', () => {
      const { addMessage, updateMessageContent } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Message', id: 'msg-1' });
      updateMessageContent('non-existent-id', 'New content');

      const { messages } = useChatStore.getState();
      expect(messages[0].content).toBe('Message');
    });
  });

  describe('removeMessage', () => {
    it('should remove message by ID', () => {
      const { addMessage, removeMessage } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Message 1', id: 'msg-1' });
      addMessage({ role: 'user', content: 'Message 2', id: 'msg-2' });

      removeMessage('msg-1');

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-2');
    });

    it('should do nothing if message ID not found', () => {
      const { addMessage, removeMessage } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Message', id: 'msg-1' });
      removeMessage('non-existent-id');

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(1);
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const { addMessage, clearMessages } = useChatStore.getState();

      addMessage({ role: 'user', content: 'Message 1' });
      addMessage({ role: 'assistant', content: 'Message 2' });
      addMessage({ role: 'user', content: 'Message 3' });

      clearMessages();

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(0);
    });

    it('should work when there are no messages', () => {
      const { clearMessages } = useChatStore.getState();

      clearMessages();

      const { messages } = useChatStore.getState();
      expect(messages).toHaveLength(0);
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const { setLoading } = useChatStore.getState();

      setLoading(true);

      const { isLoading } = useChatStore.getState();
      expect(isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const { setLoading } = useChatStore.getState();

      setLoading(true);
      setLoading(false);

      const { isLoading } = useChatStore.getState();
      expect(isLoading).toBe(false);
    });
  });

  describe('setAttachedFile', () => {
    it('should set attached file', () => {
      const { setAttachedFile } = useChatStore.getState();
      const file = { name: 'document.pdf', content: 'file content' };

      setAttachedFile(file);

      const { attachedFile } = useChatStore.getState();
      expect(attachedFile).toEqual(file);
    });

    it('should clear attached file when set to null', () => {
      const { setAttachedFile } = useChatStore.getState();
      const file = { name: 'document.pdf', content: 'file content' };

      setAttachedFile(file);
      setAttachedFile(null);

      const { attachedFile } = useChatStore.getState();
      expect(attachedFile).toBeNull();
    });
  });

  describe('setMessageFeedback', () => {
    it('should set positive feedback on message', () => {
      const { addMessage, setMessageFeedback } = useChatStore.getState();

      addMessage({ role: 'assistant', content: 'Answer', id: 'msg-1' });
      setMessageFeedback('msg-1', 'positive');

      const { messages } = useChatStore.getState();
      expect(messages[0].feedback).toBe('positive');
    });

    it('should set negative feedback on message', () => {
      const { addMessage, setMessageFeedback } = useChatStore.getState();

      addMessage({ role: 'assistant', content: 'Answer', id: 'msg-1' });
      setMessageFeedback('msg-1', 'negative');

      const { messages } = useChatStore.getState();
      expect(messages[0].feedback).toBe('negative');
    });

    it('should clear feedback when set to null', () => {
      const { addMessage, setMessageFeedback } = useChatStore.getState();

      addMessage({ role: 'assistant', content: 'Answer', id: 'msg-1' });
      setMessageFeedback('msg-1', 'positive');
      setMessageFeedback('msg-1', null);

      const { messages } = useChatStore.getState();
      expect(messages[0].feedback).toBeNull();
    });

    it('should not affect other messages', () => {
      const { addMessage, setMessageFeedback } = useChatStore.getState();

      addMessage({ role: 'assistant', content: 'Answer 1', id: 'msg-1' });
      addMessage({ role: 'assistant', content: 'Answer 2', id: 'msg-2' });

      setMessageFeedback('msg-1', 'positive');

      const { messages } = useChatStore.getState();
      expect(messages[0].feedback).toBe('positive');
      expect(messages[1].feedback).toBeUndefined();
    });
  });
});
