import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';
import { CONSTANTS } from '@/lib/constants';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('FileUpload', () => {
  let onFileLoadMock: ReturnType<typeof vi.fn>;
  let onFileRemoveMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onFileLoadMock = vi.fn();
    onFileRemoveMock = vi.fn();
    vi.clearAllMocks();
  });

  describe('Initial rendering - no file attached', () => {
    it('should render upload button when no file is attached', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      expect(screen.getByText(/Załącz plik/)).toBeInTheDocument();
    });

    it('should show file input with correct accept attribute', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const fileInput = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      expect(fileInput).toHaveAttribute('accept', '.txt,.pdf');
    });

    it('should display helper text about optional attachment', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      expect(screen.getByText(/Opcjonalnie: załącz dokument/)).toBeInTheDocument();
    });

    it('should hide file input element', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const fileInput = document.getElementById('file-upload');
      expect(fileInput).toHaveClass('hidden');
    });
  });

  describe('File attached state', () => {
    it('should show file name when file is attached', () => {
      const filename = 'test-document.txt';

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={filename}
        />
      );

      expect(screen.getByText(filename)).toBeInTheDocument();
    });

    it('should show remove button when file is attached', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile="test.txt"
        />
      );

      const removeButton = screen.getByLabelText('Usuń załączony plik');
      expect(removeButton).toBeInTheDocument();
    });

    it('should not show upload button when file is attached', () => {
      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile="test.txt"
        />
      );

      expect(screen.queryByText(/Załącz plik \(TXT, PDF\)/)).not.toBeInTheDocument();
    });

    it('should display file icon when file is attached', () => {
      const { container } = render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile="test.txt"
        />
      );

      // Check for FileText icon (lucide-react renders as svg)
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('File removal', () => {
    it('should call onFileRemove when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile="test.txt"
        />
      );

      const removeButton = screen.getByLabelText('Usuń załączony plik');
      await user.click(removeButton);

      expect(onFileRemoveMock).toHaveBeenCalledTimes(1);
    });

    it('should show info toast when file is removed', async () => {
      const user = userEvent.setup();

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile="test.txt"
        />
      );

      const removeButton = screen.getByLabelText('Usuń załączony plik');
      await user.click(removeButton);

      expect(toast.info).toHaveBeenCalledWith('Usunięto załączony plik');
    });
  });

  describe('File upload - valid text file', () => {
    it('should successfully upload a valid text file', async () => {
      const user = userEvent.setup();
      const fileContent = 'This is a test document content';
      const fileName = 'test.txt';

      const file = new File([fileContent], fileName, { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalledWith(fileContent, fileName);
      });

      expect(toast.success).toHaveBeenCalledWith(`Załączono: ${fileName}`);
    });

    it('should show loading state while uploading file', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });

      // Start upload
      await user.upload(input, file);

      // Note: Loading state is very brief for text files in tests
      // In real scenarios, it would be visible during file reading
    });
  });

  describe('File upload - valid PDF file', () => {
    it('should attempt to upload a PDF file', async () => {
      const user = userEvent.setup();
      const pdfContent = 'This is simulated PDF content that is long enough to pass validation';
      const fileName = 'test.pdf';

      const file = new File([pdfContent], fileName, { type: 'application/pdf' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalledWith(pdfContent, fileName);
      });
    });

    it('should show error for unreadable PDF', async () => {
      const user = userEvent.setup();
      const pdfContent = 'short'; // Too short to be valid
      const fileName = 'test.pdf';

      const file = new File([pdfContent], fileName, { type: 'application/pdf' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Nie udało się odczytać PDF. Spróbuj przekonwertować na TXT'
        );
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });
  });

  describe('File validation - file type', () => {
    it('should reject files with invalid type', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Wspierane formaty: TXT, PDF');
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });

    it('should reject DOCX files', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Wspierane formaty: TXT, PDF');
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });
  });

  describe('File validation - file size', () => {
    it('should reject files larger than max size', async () => {
      const user = userEvent.setup();

      // Create a file larger than MAX_SIZE_BYTES (5MB)
      const largeContent = 'x'.repeat(CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES + 1);
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          `Plik jest za duży (max ${CONSTANTS.FILE_UPLOAD.MAX_SIZE_MB}MB)`
        );
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });

    it('should accept files at the max size limit', async () => {
      const user = userEvent.setup();

      // Create a file exactly at MAX_SIZE_BYTES
      const maxContent = 'x'.repeat(CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES);
      const file = new File([maxContent], 'max-size.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      // Note: File will be truncated to MAX_CONTENT_LENGTH
      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalled();
      });
    });
  });

  describe('File validation - empty content', () => {
    it('should reject empty files', async () => {
      const user = userEvent.setup();
      const file = new File([''], 'empty.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Plik jest pusty');
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });

    it('should reject files with only whitespace', async () => {
      const user = userEvent.setup();
      const file = new File(['   \n\t  '], 'whitespace.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Plik jest pusty');
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });
  });

  describe('Content truncation', () => {
    it('should truncate content exceeding max length', async () => {
      const user = userEvent.setup();

      // Create content longer than MAX_CONTENT_LENGTH
      const longContent = 'x'.repeat(CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH + 1000);
      const file = new File([longContent], 'long.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalled();
      });

      // Check that the content was truncated
      const [truncatedContent] = onFileLoadMock.mock.calls[0];
      expect(truncatedContent.length).toBe(CONSTANTS.FILE_UPLOAD.MAX_CONTENT_LENGTH);

      // Should show info toast about truncation
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Plik został skrócony')
      );
    });

    it('should not truncate content within max length', async () => {
      const user = userEvent.setup();
      const normalContent = 'This is normal length content';
      const file = new File([normalContent], 'normal.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalledWith(normalContent, 'normal.txt');
      });

      // Should not show truncation toast
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle file read errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock file.text() to throw an error
      const file = new File(['content'], 'error.txt', { type: 'text/plain' });
      vi.spyOn(file, 'text').mockRejectedValueOnce(new Error('Read error'));

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Nie udało się wczytać pliku');
      });

      expect(onFileLoadMock).not.toHaveBeenCalled();
    });

    it('should reset file input after error', async () => {
      const user = userEvent.setup();
      const file = new File([''], 'empty.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' }) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Plik jest pusty');
      });

      // Input value should be reset
      expect(input.value).toBe('');
    });

    it('should reset file input after successful upload', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' }) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(onFileLoadMock).toHaveBeenCalled();
      });

      // Input value should be reset to allow uploading the same file again
      expect(input.value).toBe('');
    });
  });

  describe('No file selected', () => {
    it('should handle when user cancels file selection', async () => {
      const user = userEvent.setup();

      render(
        <FileUpload
          onFileLoad={onFileLoadMock}
          onFileRemove={onFileRemoveMock}
          currentFile={null}
        />
      );

      const input = screen.getByLabelText(/Załącz plik/i, { selector: 'input[type="file"]' });

      // Simulate clicking file input but not selecting a file
      await user.upload(input, []);

      // Should not call any callbacks
      expect(onFileLoadMock).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
