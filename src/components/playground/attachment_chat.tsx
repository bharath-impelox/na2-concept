import React, { useState, useRef, useEffect, JSX } from 'react';
import { X, Paperclip, Send, Image, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AudioRecorderIcon from './audio-icon';

/* eslint-disable */

export interface Attachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
}

export interface MessageAttachment {
  name: string;
  size: number;
  type: string;
  preview: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  attachments?: MessageAttachment[];
  timestamp: Date;
}

interface ChatWithAttachmentsProps {
  sessionId: string | null;
  chatMessagesProps: ChatMessage[];
  sendWebsocketMessage: (inputData: string, attachment?: Attachment[] | undefined) => Promise<void>;
  isTyping: boolean;
  agentType: 'text' | 'voice';
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  startRecord: () => void;
  endRecord: () => void;
  connected?: boolean;
}

const ChatWithAttachments: React.FC<ChatWithAttachmentsProps> = ({
  sessionId,
  chatMessagesProps,
  sendWebsocketMessage,
  isTyping,
  agentType = 'text',
  duration,
  setDuration,
  startRecord,
  endRecord,
  connected
}: ChatWithAttachmentsProps) => {
  const [inputData, setInputData] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(chatMessagesProps);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollMessageElement = useRef<HTMLDivElement>(null);

  // Update when props changes
  useEffect(() => {
    setChatMessages(chatMessagesProps);
  }, [chatMessagesProps]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: `${Date.now().toString() + file.name}`,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id: string): void => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const sendMessage = (): void => {
    if (!inputData.trim() && attachments.length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputData,
      attachments: attachments.map(a => ({
        name: a.name,
        size: a.size,
        type: a.type,
        preview: a.preview,
      })),
      timestamp: new Date()
    };
    sendWebsocketMessage(inputData, attachments);
    setChatMessages(prev => [...prev, newMessage]);
    setInputData('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string): JSX.Element => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  useEffect(() => {
    if (scrollMessageElement.current) {
      scrollMessageElement.current.scrollTop = scrollMessageElement.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const [typingStatusText, setTypingStatus] = useState("");
  const typingStatus = ["Processing Request", "Starting Analysis", "Agent Typing"];

  useEffect(() => {
    let index = 0;
    let interval: NodeJS.Timeout;

    if (isTyping) {
      setTypingStatus(typingStatus[0]!);
      interval = setInterval(() => {
        index++;
        if (index < typingStatus.length) {
          setTypingStatus(typingStatus[index]!);
        } else {
          clearInterval(interval);
        }
      }, 2500);
    } else {
      setTypingStatus("");
    }

    return () => clearInterval(interval);
  }, [isTyping]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Conversation Preview{' '}
          {sessionId ? (
            <span className="animate-pulse w-3 h-3 bg-green-500 border-2 border-white rounded-full inline-block"></span>
          ) : (
            <span className="animate-pulse w-3 h-3 bg-red-500 border-2 border-white rounded-full inline-block"></span>
          )}{' '}
        </h3>
        {sessionId && (
          <p className="text-xs text-slate-500">Connected to session: {sessionId}</p>
        )}
        <p className="text-sm text-gray-600">Real-time conversation between user and agent</p>
      </div>

      {/* Messages */}
      <div ref={scrollMessageElement} className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 min-h-0">
        {chatMessages.length === 0 && agentType !== 'voice' && (
          <div className="text-center mt-25 text-gray-500">
            <p className="text-sm">Create Testing Environment to see the conversation...</p>
          </div>
        )}
        {agentType == 'voice'  && (
          <div>
            <div className="relative mx-auto mt-10 flex items-center justify-center w-40 h-40">
              <div className={`absolute w-40 h-40 rounded-full ${connected ? 'animate-ping' : ''}`} style={{ background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)', opacity: 0.3 }}></div>
              <div className="absolute w-32 h-32 rounded-full animate-pulse" style={{ background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)', opacity: 0.5 }}></div>
              <div className="relative w-24 h-24 rounded-full flex text-xs text-white text-center justify-center items-center" style={{ background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' }}>
                {connected ? 'Connected' : 'Not Connect'}
              </div>
            </div>
          </div>
        )}
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="space-y-2">
              {/* Message Text */}
              {message.content && (
                <div
                  className={`px-4 py-2 rounded-lg break-words text-sm ${
                    message.sender === "user"
                      ? "text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                  style={message.sender === "user" ? { background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' } : {}}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2">
                  {message.attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg overflow-hidden ${
                        message.sender === "user" ? "" : "bg-gray-100"
                      }`}
                      style={message.sender === "user" ? { background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' } : {}}
                    >
                      {attachment.preview ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.name}
                          className="max-w-full h-auto"
                        />
                      ) : (
                        <div
                          className={`p-3 flex items-center gap-2 ${
                            message.sender === "user" ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-900 animate-pulse">
              {typingStatusText}...
            </div>
          </div>
        )}
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative group bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2 max-w-[200px]"
              >
                {attachment.preview ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(attachment.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex-shrink-0 border-t border-gray-300 p-4">
        {agentType === 'voice' ? (
          <AudioRecorderIcon
            duration={duration}
            setDuration={setDuration}
            startRecord={startRecord}
            endRecord={endRecord}
          />
        ) : null}
        {agentType === 'text' ? (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              placeholder="Type your message"
              className="flex-1 outline-none text-sm px-2 bg-transparent"
              type="text"
              value={inputData}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInputData(e.target.value)}
            />

            <button
              onClick={sendMessage}
              disabled={!inputData.trim() && attachments.length === 0 || isTyping}
              className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatWithAttachments;
