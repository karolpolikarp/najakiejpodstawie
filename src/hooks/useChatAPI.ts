/**
 * useChatAPI Hook
 * Handles chat message sending and streaming
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';
import { StreamingService } from '@/services/streamingService';
import { apiLogger as logger } from '@/lib/logger';
import { isRateLimitError } from '@/lib/retry';

const streamingService = new StreamingService();

export const useChatAPI = () => {
  const { addMessage, updateMessageContent, setLoading, attachedFile } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (content: string, usePremiumModel: boolean) => {
      // Add user message
      addMessage({ role: 'user', content });
      setLoading(true);
      setIsStreaming(true);

      logger.debug('Sending message:', {
        content: content.substring(0, 100),
        hasFile: !!attachedFile,
        premium: usePremiumModel,
      });

      // Create temp message ID for streaming
      const tempMessageId = crypto.randomUUID();

      // Get or create session ID
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('session_id', sessionId);
      }

      // Add empty assistant message for streaming
      addMessage({ role: 'assistant', content: '', id: tempMessageId });

      try {
        await streamingService.streamMessage(
          {
            message: content,
            fileContext: attachedFile?.content || null,
            sessionId,
            messageId: tempMessageId,
            usePremiumModel,
          },
          {
            onMessageStart: () => {
              logger.debug('Stream started');
            },
            onContentDelta: (streamedContent) => {
              updateMessageContent(tempMessageId, streamedContent);
            },
            onMessageComplete: (fullContent) => {
              logger.debug('Stream completed:', fullContent.length, 'chars');
              updateMessageContent(tempMessageId, fullContent);
            },
            onError: (error) => {
              logger.error('Stream error:', error);
              throw error;
            },
          }
        );
      } catch (error: any) {
        logger.error('Error calling legal assistant:', error);

        const errorMessage = error.message?.toLowerCase() || '';

        // Show appropriate error message
        if (isRateLimitError(error)) {
          toast.error('Przekroczono limit zapytań. Spróbuj za chwilę.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          toast.error('Błąd połączenia. Sprawdź połączenie z internetem.');
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          toast.error('Błąd autoryzacji. Skontaktuj się z administratorem.');
        } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          toast.error(error.message || 'Nieprawidłowe zapytanie');
        } else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
          toast.error('Błąd serwera. Spróbuj ponownie za chwilę.');
        } else if (errorMessage.includes('timeout')) {
          toast.error('Przekroczono limit czasu. Spróbuj ponownie.');
        } else {
          toast.error('Nie udało się przetworzyć pytania');
        }

        // Add error message
        addMessage({
          role: 'assistant',
          content:
            'Niestety coś poszło nie tak. Spróbuj zadać pytanie ponownie lub sformułuj je inaczej.',
        });
      } finally {
        setLoading(false);
        setIsStreaming(false);
      }
    },
    [addMessage, updateMessageContent, setLoading, attachedFile]
  );

  return {
    sendMessage,
    isStreaming,
  };
};
