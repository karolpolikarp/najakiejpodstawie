import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  describe('Basic rendering and functionality', () => {
    it('should render textarea and send button', () => {
      const mockOnSend = vi.fn();
      render(<ChatInput onSend={mockOnSend} />);

      expect(screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should update textarea value when typing', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Test message');

      expect(textarea).toHaveValue('Test message');
    });

    it('should disable send button when textarea is empty', () => {
      const mockOnSend = vi.fn();
      render(<ChatInput onSend={mockOnSend} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable send button when there is text', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Test message');

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnSend = vi.fn();
      render(<ChatInput onSend={mockOnSend} disabled={true} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      const button = screen.getByRole('button');

      expect(textarea).toBeDisabled();
      expect(button).toBeDisabled();
    });
  });

  describe('Message submission', () => {
    it('should call onSend with trimmed message when form is submitted', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, '  Test message  ');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should clear textarea after sending message', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Test message');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(textarea).toHaveValue('');
    });

    it('should submit on Enter key (without Shift)', async () => {
      const mockOnSend = vi.fn();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await userEvent.type(textarea, 'Test message{Enter}');

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should not submit on Shift+Enter', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Test message');

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not submit empty or whitespace-only message', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, '   ');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('PII detection and warnings', () => {
    it('should show warning when PESEL is detected', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Mój PESEL to 12345678901');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText(/Wykryto potencjalne dane osobowe/i)).toBeInTheDocument();
      expect(screen.getByText(/PESEL \(11 cyfr\)/i)).toBeInTheDocument();
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should show warning when email is detected', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Mój email to jan@example.com');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText(/Wykryto potencjalne dane osobowe/i)).toBeInTheDocument();
      expect(screen.getByText(/Adres email/i)).toBeInTheDocument();
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should show warning when name is detected', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Nazywam się Jan Kowalski');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText(/Wykryto potencjalne dane osobowe/i)).toBeInTheDocument();
      expect(screen.getByText(/Potencjalne imię i nazwisko/i)).toBeInTheDocument();
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should allow editing message after warning', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Mój PESEL to 12345678901');

      const sendButton = screen.getByRole('button', { name: '' });
      await user.click(sendButton);

      const modifyButton = screen.getByText(/Zmodyfikuję pytanie/i);
      await user.click(modifyButton);

      expect(screen.queryByText(/Wykryto potencjalne dane osobowe/i)).not.toBeInTheDocument();
      expect(textarea).toHaveValue('Mój PESEL to 12345678901');
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should send message anyway when user confirms', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Mój PESEL to 12345678901');

      const sendButton = screen.getByRole('button', { name: '' });
      await user.click(sendButton);

      const sendAnywayButton = screen.getByText(/Wyślij mimo to/i);
      await user.click(sendAnywayButton);

      expect(mockOnSend).toHaveBeenCalledWith('Mój PESEL to 12345678901');
      expect(textarea).toHaveValue('');
    });

    it('should not show warning for safe questions', async () => {
      const mockOnSend = vi.fn();
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByPlaceholderText(/Zadaj pytanie o podstawę prawną/i);
      await user.type(textarea, 'Czy pracodawca może odmówić urlopu?');

      const button = screen.getByRole('button', { name: '' });
      await user.click(button);

      expect(screen.queryByText(/Wykryto potencjalne dane osobowe/i)).not.toBeInTheDocument();
      expect(mockOnSend).toHaveBeenCalledWith('Czy pracodawca może odmówić urlopu?');
    });
  });
});
