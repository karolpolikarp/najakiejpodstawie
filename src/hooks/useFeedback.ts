/**
 * useFeedback Hook
 * Handles feedback submission with retry logic
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/retry';
import { logger } from '@/lib/logger';

const MAX_FEEDBACK_RETRIES = 3;
const FEEDBACK_RETRY_DELAYS = [2000, 4000, 6000]; // 2s, 4s, 6s

export const useFeedback = () => {
  const { setMessageFeedback } = useChatStore();

  const submitFeedback = useCallback(
    async (messageId: string, feedbackType: 'positive' | 'negative' | null) => {
      // Update local state immediately for better UX
      setMessageFeedback(messageId, feedbackType);

      logger.debug('Submitting feedback:', { messageId, feedbackType });

      try {
        await withRetry(
          async () => {
            const { data, error } = await supabase.functions.invoke('submit-feedback', {
              body: {
                messageId,
                feedbackType,
              },
            });

            if (error) {
              logger.error('Error submitting feedback:', error);
              throw new Error(error.message || 'Failed to submit feedback');
            }

            // Check if the response indicates the question is still being saved
            if (data?.pending === true) {
              logger.warn('Question not yet saved, will retry');
              throw new Error('Question pending');
            }

            logger.info('Feedback saved successfully:', data);
            return data;
          },
          {
            maxRetries: MAX_FEEDBACK_RETRIES,
            baseDelayMs: FEEDBACK_RETRY_DELAYS[0],
            shouldRetry: (error) => {
              // Retry if question is still pending
              return error.message.includes('pending');
            },
            onRetry: (attempt, error) => {
              if (attempt === MAX_FEEDBACK_RETRIES - 1) {
                toast.info('Feedback zostanie zapisany wkrótce');
              }
            },
          }
        );
      } catch (error) {
        logger.error('Error submitting feedback after retries:', error);
        toast.error('Błąd podczas zapisywania feedbacku');
      }
    },
    [setMessageFeedback]
  );

  return {
    submitFeedback,
  };
};
