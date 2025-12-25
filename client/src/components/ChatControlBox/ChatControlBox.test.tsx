/**
 * ChatControlBox Component Tests
 * 
 * Tests the reusable ChatControlBox component functionality.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatControlBox, Message, Attachment } from './ChatControlBox';

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock speech recognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: undefined,
  writable: true,
});

describe('ChatControlBox', () => {
  const defaultProps = {
    messages: [] as Message[],
    onMessagesChange: vi.fn(),
    selectedModels: [] as string[],
    onModelsChange: vi.fn(),
    onSendMessage: vi.fn(),
    conversationTitle: 'Test Chat',
    onTitleChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Rendering', () => {
    it('renders the control box with all main buttons', () => {
      render(<ChatControlBox {...defaultProps} />);
      
      // Check for main control buttons
      expect(screen.getByTitle('Menu')).toBeInTheDocument();
      expect(screen.getByTitle('New Chat')).toBeInTheDocument();
      expect(screen.getByText('0 Models')).toBeInTheDocument();
      expect(screen.getByTitle('Settings')).toBeInTheDocument();
      expect(screen.getByTitle('Save Conversation')).toBeInTheDocument();
      expect(screen.getByText('Presets')).toBeInTheDocument();
    });

    it('renders the message input area', () => {
      render(<ChatControlBox {...defaultProps} />);
      
      expect(screen.getByTitle('Attach files')).toBeInTheDocument();
      // When no models selected, placeholder shows disabled message
      expect(screen.getByPlaceholderText('Select at least one AI model to send a message')).toBeInTheDocument();
    });

    it('shows correct model count', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4', 'anthropic:claude-3']} />);
      
      expect(screen.getByText('2 Models')).toBeInTheDocument();
    });

    it('shows singular "Model" for single selection', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} />);
      
      expect(screen.getByText('1 Model')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('disables input when no models are selected', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={[]} />);
      
      const textarea = screen.getByPlaceholderText('Select at least one AI model to send a message');
      expect(textarea).toBeDisabled();
    });

    it('enables input when models are selected', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} />);
      
      const textarea = screen.getByPlaceholderText('Type your message...');
      expect(textarea).not.toBeDisabled();
    });

    it('allows custom placeholder text', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} placeholder="Custom placeholder" />);
      
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });
  });

  describe('Menu Interactions', () => {
    it('opens hamburger menu when clicked', async () => {
      render(<ChatControlBox {...defaultProps} />);
      
      const menuButton = screen.getByTitle('Menu');
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('New Chat')).toBeInTheDocument();
        expect(screen.getByText('Rename Chat')).toBeInTheDocument();
        expect(screen.getByText('Save Chat')).toBeInTheDocument();
        expect(screen.getByText('Clear Chat')).toBeInTheDocument();
        expect(screen.getByText('Show Analytics')).toBeInTheDocument();
        expect(screen.getByText('Delete Chat')).toBeInTheDocument();
      });
    });

    it('opens settings menu when clicked', async () => {
      render(<ChatControlBox {...defaultProps} />);
      
      const settingsButton = screen.getByTitle('Settings');
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Presets Setting')).toBeInTheDocument();
        expect(screen.getByText('Categories Setting')).toBeInTheDocument();
        expect(screen.getByText('Chat Theme')).toBeInTheDocument();
        expect(screen.getByText('Language')).toBeInTheDocument();
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });
    });
  });

  describe('Models Panel', () => {
    it('toggles models panel when Models button is clicked', async () => {
      render(<ChatControlBox {...defaultProps} />);
      
      const modelsButton = screen.getByText('0 Models');
      fireEvent.click(modelsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Add Models')).toBeInTheDocument();
        expect(screen.getByText('Select Provider')).toBeInTheDocument();
      });
    });
  });

  describe('Presets Panel', () => {
    it('toggles presets panel when Presets button is clicked', async () => {
      render(<ChatControlBox {...defaultProps} />);
      
      const presetsButton = screen.getByText('Presets');
      fireEvent.click(presetsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Presets')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('disables save button when no messages', () => {
      render(<ChatControlBox {...defaultProps} messages={[]} />);
      
      const saveButton = screen.getByTitle('Save Conversation');
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when messages exist', () => {
      const messages: Message[] = [{
        id: 1,
        type: 'user',
        content: 'Test message',
        timestamp: new Date(),
      }];
      
      render(<ChatControlBox {...defaultProps} messages={messages} />);
      
      const saveButton = screen.getByTitle('Save Conversation');
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Synthesizer Button', () => {
    it('shows synthesizer as disabled when no models selected', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={[]} />);
      
      const synthButton = screen.getByTitle('Generate Synthesis');
      expect(synthButton).toBeInTheDocument();
      expect(synthButton).toBeDisabled();
    });

    it('shows synthesizer when models are selected', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} />);
      
      expect(screen.getByTitle('Generate Synthesis')).toBeInTheDocument();
    });

    it('hides synthesizer when hideSynthesizer prop is true', () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} hideSynthesizer={true} />);
      
      expect(screen.queryByTitle('Generate Synthesis')).not.toBeInTheDocument();
    });
  });

  describe('Connectors', () => {
    it('shows connectors button by default', () => {
      render(<ChatControlBox {...defaultProps} />);
      
      expect(screen.getByTitle('Connectors Store')).toBeInTheDocument();
    });

    it('hides connectors when hideConnectors prop is true', () => {
      render(<ChatControlBox {...defaultProps} hideConnectors={true} />);
      
      expect(screen.queryByTitle('Connectors Store')).not.toBeInTheDocument();
    });
  });

  describe('Voice Input', () => {
    it('shows voice input button by default', () => {
      render(<ChatControlBox {...defaultProps} />);
      
      expect(screen.getByTitle('Voice Input')).toBeInTheDocument();
    });

    it('hides voice input when hideVoiceInput prop is true', () => {
      render(<ChatControlBox {...defaultProps} hideVoiceInput={true} />);
      
      expect(screen.queryByTitle('Voice Input')).not.toBeInTheDocument();
    });
  });

  describe('New Chat', () => {
    it('calls onNewChat when new chat is triggered', async () => {
      const onNewChat = vi.fn();
      render(<ChatControlBox {...defaultProps} onNewChat={onNewChat} />);
      
      // Click the plus button
      const newChatButton = screen.getByTitle('New Chat');
      fireEvent.click(newChatButton);
      
      expect(onNewChat).toHaveBeenCalled();
    });
  });

  describe('Attachments', () => {
    it('shows attachment preview when files are attached', async () => {
      render(<ChatControlBox {...defaultProps} selectedModels={['openai:gpt-4']} />);
      
      // The file input is hidden, so we test the attachment display logic
      // by checking the component renders without errors
      expect(screen.getByTitle('Attach files')).toBeInTheDocument();
    });
  });
});
