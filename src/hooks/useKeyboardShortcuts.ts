import { useEffect, RefObject } from 'react';

interface KeyboardShortcutsOptions {
  inputRef?: RefObject<HTMLTextAreaElement>;
  onClearChat?: () => void;
  onFocusInput?: () => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  inputRef,
  onClearChat,
  onFocusInput,
  onScrollToTop,
  onScrollToBottom,
  enabled = true,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in an input/textarea (except for our specific shortcuts)
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Cmd/Ctrl + K - Focus input
      if (modKey && e.key === 'k') {
        e.preventDefault();
        if (onFocusInput) {
          onFocusInput();
        } else if (inputRef?.current) {
          inputRef.current.focus();
        }
      }

      // Escape - Clear input or blur
      if (e.key === 'Escape' && isTyping) {
        e.preventDefault();
        if (inputRef?.current) {
          inputRef.current.value = '';
          inputRef.current.blur();
        }
      }

      // Cmd/Ctrl + Shift + K - Clear chat (more complex to avoid conflicts)
      if (modKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        onClearChat?.();
      }

      // Home key - Scroll to top (when not typing)
      if (e.key === 'Home' && !isTyping) {
        e.preventDefault();
        onScrollToTop?.();
      }

      // End key - Scroll to bottom (when not typing)
      if (e.key === 'End' && !isTyping) {
        e.preventDefault();
        onScrollToBottom?.();
      }

      // Cmd/Ctrl + ↑ - Scroll to top
      if (modKey && e.key === 'ArrowUp' && !isTyping) {
        e.preventDefault();
        onScrollToTop?.();
      }

      // Cmd/Ctrl + ↓ - Scroll to bottom
      if (modKey && e.key === 'ArrowDown' && !isTyping) {
        e.preventDefault();
        onScrollToBottom?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, inputRef, onClearChat, onFocusInput, onScrollToTop, onScrollToBottom]);
};
