import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../FileUpload';
import { CONSTANTS } from '@/lib/constants';

describe('FileUpload', () => {
  const mockOnFileLoad = vi.fn();
  const mockOnFileRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial render', () => {
    it('shows upload button when no file is attached', () => {
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      // Check for the label text (visible on both mobile and desktop)
      const uploadLabel = screen.getByLabelText(/Załącz plik/i);
      expect(uploadLabel).toBeInTheDocument();
    });

    it('shows file name when file is attached', () => {
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile="test-document.pdf"
        />
      );

      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });

    it('shows remove button when file is attached', () => {
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile="test.pdf"
        />
      );

      const removeButton = screen.getByRole('button', { name: /usuń załączony plik/i });
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('File selection', () => {
    it('shows warning dialog when file is selected', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Ostrzeżenie o danych osobowych/i)).toBeInTheDocument();
      });
    });

    it('rejects file larger than max size', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      // Create file larger than MAX_SIZE_BYTES
      const largeContent = 'a'.repeat(CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES + 1);
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;
      await user.upload(input, largeFile);

      // Toast error should be shown (we'd need to mock toast for proper testing)
      expect(mockOnFileLoad).not.toHaveBeenCalled();
    });

    it('rejects unsupported file type', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const unsupportedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, unsupportedFile);

      expect(mockOnFileLoad).not.toHaveBeenCalled();
    });
  });

  describe('Warning dialog', () => {
    it('shows checkbox for confirming no personal data', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
      });
    });

    it('disables attach button when checkbox is not checked', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const attachButton = screen.getByRole('button', { name: /Załącz plik/i });
        expect(attachButton).toBeDisabled();
      });
    });

    it('enables attach button when checkbox is checked', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(async () => {
        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);
      });

      await waitFor(() => {
        const attachButton = screen.getByRole('button', { name: /Załącz plik/i });
        expect(attachButton).not.toBeDisabled();
      });
    });

    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Ostrzeżenie/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Anuluj/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Ostrzeżenie/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('File processing', () => {
    // TODO: Fix async file processing tests - they timeout due to file.text() async behavior
    it.skip('processes text file correctly', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const fileContent = 'This is a test text file';
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      // Check the checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Click attach button
      const attachButton = screen.getByRole('button', { name: /Załącz plik/i });
      await user.click(attachButton);

      // Wait for file to be processed with longer timeout
      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalledWith(fileContent, 'test.txt');
      }, { timeout: 3000 });
    });

    // TODO: Fix async file processing tests - they timeout due to file.text() async behavior
    it.skip('truncates file content if it exceeds max length', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile={null}
        />
      );

      const longContent = 'a'.repeat(CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH + 1000);
      const file = new File([longContent], 'long.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Załącz plik/i) as HTMLInputElement;

      await user.upload(input, file);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      // Check the checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Click attach button
      const attachButton = screen.getByRole('button', { name: /Załącz plik/i });
      await user.click(attachButton);

      // Wait for file to be processed with longer timeout
      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalled();
      }, { timeout: 3000 });

      const [content] = mockOnFileLoad.mock.calls[0];
      expect(content.length).toBe(CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH);
    });
  });

  describe('File removal', () => {
    it('calls onFileRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileLoad={mockOnFileLoad}
          onFileRemove={mockOnFileRemove}
          currentFile="attached-file.pdf"
        />
      );

      const removeButton = screen.getByRole('button', { name: /usuń załączony plik/i });
      await user.click(removeButton);

      expect(mockOnFileRemove).toHaveBeenCalled();
    });
  });
});
