/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import {
  CpuChipIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { CalendarIcon, DatabaseIcon, FileText, Mic, Mic2Icon, SheetIcon } from 'lucide-react';
import { Bot, Loader2 } from 'lucide-react';
import { AgentsLog, Agent } from './types';
import { AGENT_ENV_1, AGENT_ENV_1_WS, useWorkspace, useGetAgentListsQuery, useGetConnectionsQuery, useGetVoicesQuery, toast } from './mockApi';
import { useRealtimeAudio } from './voice';
import ChatWithAttachments, { Attachment } from './attachment_chat';
import ConnectionSelect from './connectionDropdown';
import { useForm } from 'react-hook-form';

interface TestResult {
  success: boolean;
  confidence: number;
  reasoning: string;
  actionsTriggered: any[];
  executionTime: number;
  status: string;
}

const TestYourAgent: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toolCalling, setToolCalling] = useState({
    state: false,
    message: ""
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const socketMapping = {
    "NA2-ENV-1": `${AGENT_ENV_1_WS}/ws/execute_agent`
  };

  const [uploadError, setUploadError] = useState("");
  const { currentWorkspaceId } = useWorkspace();
  const { data: agentListDB } = useGetAgentListsQuery({
    aiEmployeeId: currentWorkspaceId!
  }, {
    skip: !currentWorkspaceId
  });

  const sessionSocket = useRef<WebSocket | null>(null);
  const [filteredAgents, setFilteredAgents] = useState<Agent[] | undefined>([]);

  interface WebsocketMessageContent {
    type: string;
    payload: string | any;
    session_id?: string;
  }

  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [agentType, setAgentType] = useState<'text' | 'voice'>('text');

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentType(e.target.checked ? 'voice' : 'text');
  };

  const clearSession = () => {
    setIsRunning(false);
    setIsTyping(false);
    sessionSocket.current = null;
    setChatMessages([]);
    setSessionId(null);
    stop();
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const scrollMessageElement = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [agentPrompts, setAgentPrompts] = useState<Record<string, string>>({});

  const handleClick = () => {
    if (sessionId != null) return;
    fileInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    let error = "";

    for (const file of Array.from(files)) {
      validFiles.push(file);
    }

    setUploadError(error);
    setSelectedFiles((file) => [...file, ...validFiles]);
  };

  const createSessionForPlayGroundV2 = async () => {
    if (agentType === 'voice') {
      const provider = getValues("provider");
      if (!provider || provider.trim() === '') {
        toast.error("Please select a voice provider");
        return;
      }
    }

    const formData = new FormData();
    const agentsList = [];
    for (const agent of selectedAgents) {
      const agentData = agentListDB?.data.agents.filter((a) => a.id == agent);
      if (agentData && agentData.length) {
        const currentAgent = agentData[0];
        agentsList.push({
          name: currentAgent?.name,
          id: currentAgent?.id,
          system_prompt: agentPrompts[agent] || currentAgent?.configuration.systemInstructions,
          tools: currentAgent?.tools?.map((t: any) => t.toolId) ?? []
        });
      }
    }
    formData.append("agents", JSON.stringify(agentsList));
    formData.append("workspace_id", currentWorkspaceId!);
    formData.append("modality", agentType!);
    formData.append("connectionId", getValues("connectionId") || "");
    const provider = getValues("provider");
    if (provider) {
      formData.append("provider", provider);
      formData.append("voice_provider", provider);
    }
    const voiceId = getValues("voiceId");
    if (voiceId) {
      formData.append("voiceId", voiceId);
    }
    if (provider === 'deepgram-cartesia') {
      formData.append("ttsProvider", "cartesia");
    } else if (provider === 'deepgram-elevenlabs') {
      formData.append("ttsProvider", "elevenlabs");
    }
    const files = fileInputRef.current?.files;
    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
    }
    try {
      setCreatingSession(true);
      const response = await fetch(`${AGENT_ENV_1}/create_agent_session`, {
        method: "POST",
        body: formData,
      }).then((body) => body.json());
      const sessionId = response.session_id;
      setSessionId(sessionId);

      if (agentType == "text") {
        createSessionAndListen(sessionId);
      } else {
        if (sessionId) {
          setIsRunning(true);
        }
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error while creating session");
    } finally {
      setCreatingSession(false);
    }
  };

  const createSessionAndListen = (uuid: string) => {
    if (uuid) {
      sessionSocket.current = new WebSocket(`${socketMapping['NA2-ENV-1']}/${uuid}`);
      setIsRunning(true);
      sessionSocket.current.onopen = (_event) => {
        setIsRunning(true);
      };
      if (sessionSocket.current) {
        sessionSocket.current.onmessage = async (message: MessageEvent) => {
          try {
            const content: WebsocketMessageContent = JSON.parse(message.data);
            switch (content.type) {
              case 'status':
                break;
              case 'transcript':
                setIsTyping(false);
                const agentMessage = {
                  id: Date.now().toString(),
                  content: content.payload,
                  sender: 'agent' as const,
                  timestamp: new Date(),
                  type: 'text' as const
                };
                setChatMessages(prev => [...prev, agentMessage]);
                break;
              case 'agents_logs':
                setExecutionLogs((agents: any) => [...agents, content.payload]);
                break;
              case 'status_update':
                let statusMessage = JSON.parse(content.payload.message);
                setExecutionLogs((prev) => [...prev, {
                  type: "handoff",
                  status: "completed",
                  tool_name: statusMessage.title || "Agent Handoff",
                  message: `${statusMessage.message} (${statusMessage.decision})`,
                  details: {},
                  confidence: 1,
                  timestamp: new Date().toISOString()
                }]);
                break;
              case 'tool_calling':
                setToolCalling({
                  state: content?.payload?.state,
                  message: content?.payload?.message ? content.payload.message.replace(/_/g, " ") : "Tool is calling..."
                });
                break;
            }
          } catch (error) {
            console.error("Error processing websocket message:", error);
            setIsTyping(false);
          }
        };
      }
    }
  };

  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    content: string;
    sender: 'user' | 'agent' | 'system';
    type: 'text' | 'voice';
    timestamp: Date;
    audioPath?: string;
    attachments?: any[];
  }>>([]);

  const [sanboxEnv, setSelectSandboxEnv] = useState<string | null>("NA2-ENV-1");
  const [agentTools, setAgentTools] = useState<{
    toolName: string;
    isSelected: boolean;
    label: string;
    id: number;
    hide: boolean;
    type?: string;
  }[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>({
    success: true,
    confidence: 0.6,
    reasoning: "",
    actionsTriggered: [],
    executionTime: 10,
    status: 'pending',
  });

  const selectTool = (toolName: string) => {
    const mappedTool = agentTools.map((t) => {
      if (t.toolName == toolName) {
        t.isSelected = !t.isSelected;
      }
      return t;
    });
    setAgentTools(mappedTool);
  };

  useEffect(() => {
    if (selectedAgent && agentListDB) {
      const prompt = agentListDB?.data.agents.find((a) => a.id.toString() == selectedAgent);
      setAgentTools(prompt?.tools?.map((t: any) => ({ isSelected: true, toolName: t.name, label: t.name, id: t.toolId, hide: false, type: t.type })) || []);
      setAgentPrompts(prev => ({
        ...prev,
        [selectedAgent]: prev[selectedAgent] || prompt?.configuration.systemInstructions || "Your instruction"
      }));
      setTestPrompt(prompt?.configuration.systemInstructions || "Your instruction");
    }
  }, [sanboxEnv, selectedAgent, agentListDB]);

  useEffect(() => {
    const filteredAgents = agentListDB?.data.agents.filter((a) => a.configuration?.modalities?.includes(agentType));
    setFilteredAgents(filteredAgents || []);
  }, [agentType, agentListDB]);

  const handleRunSimulation = async () => {
    if (!testPrompt.trim()) return;
    try {
      await createSessionForPlayGroundV2();
    } catch (error) {
      toast.error("Error creating test environment");
    }
  };

  const handleReset = () => {
    setTestPrompt('');
    setIsTyping(false);
    setChatMessages([]);
    setIsRunning(false);
    setSessionId(null);
    setExecutionLogs([]);
    setSelectedAgent('');
    setSelectSandboxEnv('');
    setSelectedAgents([]);
    setUploadError('');
    setSelectedFiles([]);
    setAgentTools([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    stop();
    sessionSocket.current = null;
  };

  const handleExportResults = () => {
    const results = {
      testPrompt,
      selectedAgent,
      timestamp: new Date().toISOString(),
      result: testResult,
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [executionLogs, setExecutionLogs] = useState<AgentsLog[]>([]);

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as any);
    }

    return btoa(binary);
  }

  const sendMessage = async (inputData: string, attachment?: Attachment[]) => {
    let agentMessage;
    agentMessage = {
      id: (Date.now() + 1).toString(),
      content: inputData,
      sender: 'user' as const,
      timestamp: new Date(),
      type: 'text' as any,
      attachments: attachment || []
    };
    const b64Files = [];
    try {
      if (attachment && attachment.length) {
        for (const file of attachment) {
          const arrayBuffer = await file.file.arrayBuffer();
          const base64 = arrayBufferToBase64(arrayBuffer);
          b64Files.push({
            file_name: file.name,
            type: file.type,
            data: base64
          });
        }
      }
    } catch (error) {
      console.log("File error", error);
    }
    if (sessionSocket.current) {
      const payload: any = {
        type: "text",
        payload: inputData
      };
      if (b64Files && b64Files.length) {
        payload['attachment'] = b64Files;
      }
      const parsedJson = JSON.stringify(payload);
      sessionSocket.current.send(parsedJson);
    }
    setChatMessages(prev => [...prev, agentMessage]);
    setIsTyping(true);
    setAudioURL(null);
    setDuration(0);
    setIsRecording(false);
  };

  const getLogIcon = (level: 'info' | 'success' | 'warning' | 'error') => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" style={{ color: '#1b44fe' }} />;
    }
  };

  const { connected, transcript, start, stop } = useRealtimeAudio({
    wsUrl: `${AGENT_ENV_1_WS}/ws/voice_agent`,
    sessionId: sessionId,
    setExecutionLogs
  });

  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAgents.length) {
      setSelectedAgent(selectedAgents[0]!);
    }
  }, [selectedAgents]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => {
      const newSelection = prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId];
      return newSelection;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('[data-voice-dropdown]')) {
        setIsVoiceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (scrollMessageElement.current) {
      scrollMessageElement.current.scrollTo({
        top: scrollMessageElement.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatMessages]);

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'llm':
        return <CpuChipIcon className="h-3 w-3 mr-1" />;
      case 'email':
        return <PaperAirplaneIcon className="h-3 w-3 mr-1" />;
      case 'sms':
        return <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />;
      case 'voice':
        return <Mic2Icon className="h-3 w-3 mr-1" />;
      case 'api':
        return <ServerIcon className="h-3 w-3 mr-1" />;
      case 'database':
        return <DatabaseIcon className="h-3 w-3 mr-1" />;
      case 'spreadsheet':
        return <SheetIcon className="h-3 w-3 mr-1" />;
      case 'calendar':
        return <CalendarIcon className="h-3 w-3 mr-1" />;
      default:
        return <ServerIcon className="h-3 w-3 mr-1" />;
    }
  };

  const { register, setValue, watch, getValues } = useForm<{ connectionId: string; provider: string; voiceId?: string; voiceName?: string; ttsProvider?: string }>();
  const { data: connectionsData } = useGetConnectionsQuery(
    { aiEmployeeId: currentWorkspaceId! },
    { skip: !currentWorkspaceId }
  );

  const selectedProvider = watch('provider');
  const isDeepgramProvider = selectedProvider === 'deepgram-cartesia' || selectedProvider === 'deepgram-elevenlabs';
  const hasProviderSelected = agentType === 'voice' && selectedProvider && selectedProvider !== '' && selectedProvider !== undefined && selectedProvider.trim() !== '';

  const { data: voicesData, isLoading: isLoadingVoices, refetch: refetchVoices } = useGetVoicesQuery(
    {
      aiEmployeeId: currentWorkspaceId!,
      provider: selectedProvider || undefined,
      q: voiceSearchQuery || undefined,
      limit: 20,
    },
    {
      skip: !currentWorkspaceId || !hasProviderSelected,
    }
  );

  const filterConnections = useMemo(() => {
    let filtered = connectionsData?.data?.filter((conn: any) => {
      if (conn.connectionType !== 'llm') {
        return false;
      }

      if (selectedProvider && selectedProvider !== '') {
        const connProvider = conn.config?.provider?.toLowerCase() || '';

        if (selectedProvider === 'gemini') {
          return conn.modalities === 'voice' &&
            (connProvider === 'gemini' || connProvider === 'vertex_ai' || connProvider === 'google');
        } else if (selectedProvider === 'openai') {
          return conn.modalities === 'voice' && connProvider === 'openai';
        } else if (selectedProvider === 'deepgram-cartesia' || selectedProvider === 'deepgram-elevenlabs') {
          return conn.modalities === 'text';
        }
        return conn.modalities === 'text';
      }

      return conn.modalities === agentType;
    }) || [];
    return filtered;
  }, [connectionsData, agentType, selectedProvider]);

  return (
    <>
      <style>{`
        .playground-scrollable::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .playground-scrollable::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .playground-scrollable::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .playground-scrollable::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test your Agent</h1>
            <p className="text-gray-600">The sandbox where your AI Employee (and their team) can practice before going live</p>
            <p className="text-sm text-gray-500 mt-1">💡 Need help testing? Ask your AI Employee to simulate scenarios →</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch playground-scrollable h-[800px] overflow-y-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af #f3f4f6' }}>
          {/* Prompt Console */}
          <div className="bg-white h-[750px] overflow-y-scroll rounded-lg shadow p-6 playground-scrollable" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af #f3f4f6' }}>
            {/* Agent Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalities</label>
                  <div className="flex mt-1 mb-5 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium">Text</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentType === 'voice'}
                        disabled={(sessionId != null) || (selectedAgents?.length > 0)}
                        onChange={handleToggle}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-gradient"></div>
                    </label>
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium">Voice</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
                  <div className="relative">
                    <div
                      onClick={() => !sessionId && setIsDropdownOpen(!isDropdownOpen)}
                      className={`block w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[42px] ${sessionId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
                        }`}
                    >
                      {selectedAgents.length > 0 ? (
                        <span className="text-sm">{selectedAgents.length} Agents selected</span>
                      ) : (
                        <span className="text-gray-500">Select team of agents</span>
                      )}
                    </div>

                    {isDropdownOpen && !sessionId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredAgents && filteredAgents.length > 0 ? (
                          filteredAgents.map(agent => (
                            <div
                              key={agent.id}
                              onClick={() => handleAgentToggle(agent.id)}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${selectedAgents.includes(agent.id) ? 'bg-blue-50' : ''
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAgents.includes(agent.id)}
                                onChange={() => { }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                              />
                              <div className="flex items-center gap-2">
                                <Bot className="text-blue-400" />
                                <p className="text-sm"> {agent.name}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500">No agents available</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              {selectedAgents.length > 0 ? (
                <div className="flex overflow-x-auto whitespace-nowrap no-scrollbar cursor-grab active:cursor-grabbing">
                  {selectedAgents.map(agentId => {
                    const agent = agentListDB?.data.agents.find(a => a.id === agentId);
                    return (
                      <span
                        key={agentId}
                        onClick={() => setSelectedAgent(agentId)}
                        className={`inline-flex cursor-pointer items-center gap-1 px-2 py-1 mx-1 flex-shrink-0
            ${selectedAgent == agentId ? 'text-white' : 'bg-blue-100 text-blue-800'}
            hover:text-white rounded-full text-xs transition-colors duration-150`}
                      style={selectedAgent == agentId ? { background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' } : {}}
                      >
                        <Bot width={'15px'} height={'15px'} />
                        {agent?.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!sessionId) handleAgentToggle(agentId);
                          }}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {agentTools && agentTools.length > 0 && (
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1 mt-2">Available Tools:</p>
                <div className="flex flex-wrap">
                  {agentTools.filter(t => !t.hide).map((t, i) => {
                    return (<span key={i}
                      onClick={() => {
                        selectTool(t.toolName);
                      }}
                      className={`inline-flex mt-2 cursor-pointer
                         mx-2 bg-blue-50 ${t.isSelected ? '' : ''} text-blue-600 
                          ${t.isSelected ? 'text-white' : ''}
                         items-center px-2 py-1 rounded-full text-xs flex-shrink-0
                    `}
                      style={t.isSelected ? { background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' } : {}}>
                      {getToolIcon(t.type ?? "")}
                      {t.label}
                    </span>);
                  })}
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-3">Test Configuration</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Prompt</label>
                <textarea
                  disabled={sessionId != null}
                  rows={4}
                  value={agentPrompts[selectedAgent] || ''}
                  onChange={(e) => setAgentPrompts(prev => ({
                    ...prev,
                    [selectedAgent]: e.target.value
                  }))}
                  placeholder="Type your test instruction... (e.g., 'Reschedule John's appointment to Tuesday at 3 PM')"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {agentType === 'voice' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Voice Provider
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div
                        onClick={() => {
                          if (sessionId == null) {
                            const currentValue = watch('provider');
                            if (currentValue === 'deepgram-cartesia') {
                              setValue('provider', '');
                            } else {
                              setValue('provider', 'deepgram-cartesia');
                            }
                            setValue('connectionId', '');
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 border rounded-lg cursor-pointer transition-all ${
                          watch('provider') === 'deepgram-cartesia'
                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        } ${sessionId != null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${
                            watch('provider') === 'deepgram-cartesia' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <MicrophoneIcon className={`h-4 w-4 ${
                              watch('provider') === 'deepgram-cartesia' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Deepgram</p>
                            <p className="text-[10px] text-gray-500">Cartesia TTS</p>
                          </div>
                        </div>
                        {watch('provider') === 'deepgram-cartesia' ? (
                          <CheckIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Deepgram (ElevenLabs) */}
                      <div
                        onClick={() => {
                          if (sessionId == null) {
                            const currentValue = watch('provider');
                            if (currentValue === 'deepgram-elevenlabs') {
                              setValue('provider', '');
                            } else {
                              setValue('provider', 'deepgram-elevenlabs');
                            }
                            setValue('connectionId', '');
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 border rounded-lg cursor-pointer transition-all ${
                          watch('provider') === 'deepgram-elevenlabs'
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        } ${sessionId != null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${
                            watch('provider') === 'deepgram-elevenlabs' ? 'bg-orange-100' : 'bg-gray-100'
                          }`}>
                            <MicrophoneIcon className={`h-4 w-4 ${
                              watch('provider') === 'deepgram-elevenlabs' ? 'text-orange-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">ElevenLabs</p>
                            <p className="text-[10px] text-gray-500">TTS Modal</p>
                          </div>
                        </div>
                        {watch('provider') === 'deepgram-elevenlabs' ? (
                          <CheckIcon className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Gemini */}
                      <div
                        onClick={() => {
                          if (sessionId == null) {
                            const currentValue = watch('provider');
                            if (currentValue === 'gemini') {
                              setValue('provider', '');
                            } else {
                              setValue('provider', 'gemini');
                            }
                            setValue('connectionId', '');
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 border rounded-lg cursor-pointer transition-all ${
                          watch('provider') === 'gemini'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        } ${sessionId != null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${
                            watch('provider') === 'gemini' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <MicrophoneIcon className={`h-4 w-4 ${
                              watch('provider') === 'gemini' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Gemini</p>
                            <p className="text-[10px] text-gray-500">Native audio</p>
                          </div>
                        </div>
                        {watch('provider') === 'gemini' ? (
                          <CheckIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                        )}
                      </div>

                      {/* OpenAI */}
                      <div
                        onClick={() => {
                          if (sessionId == null) {
                            const currentValue = watch('provider');
                            if (currentValue === 'openai') {
                              setValue('provider', '');
                            } else {
                              setValue('provider', 'openai');
                            }
                            setValue('connectionId', '');
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 border rounded-lg cursor-pointer transition-all ${
                          watch('provider') === 'openai'
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        } ${sessionId != null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${
                            watch('provider') === 'openai' ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <MicrophoneIcon className={`h-4 w-4 ${
                              watch('provider') === 'openai' ? 'text-emerald-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">OpenAI</p>
                            <p className="text-[10px] text-gray-500">Realtime model</p>
                          </div>
                        </div>
                        {watch('provider') === 'openai' ? (
                          <CheckIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {hasProviderSelected && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Voice
                        </label>
                        <div className="relative" data-voice-dropdown>
                          <button
                            type="button"
                            onClick={() => {
                              if (hasProviderSelected && sessionId == null) {
                                setIsVoiceDropdownOpen(!isVoiceDropdownOpen);
                              }
                            }}
                            disabled={!hasProviderSelected || sessionId != null}
                            className={`w-full px-3 py-2.5 border border-gray-300 rounded-md text-left text-sm flex items-center justify-between transition-colors ${
                              !hasProviderSelected || sessionId != null
                                ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                                : 'bg-white hover:border-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <span className={selectedVoiceName ? 'text-gray-900' : 'text-gray-500'}>
                              {selectedVoiceName || 'Select a voice...'}
                            </span>
                            <ChevronRightIcon
                              className={`h-4 w-4 text-gray-400 transition-transform ${isVoiceDropdownOpen ? 'rotate-90' : ''}`}
                            />
                          </button>

                          {isVoiceDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[400px] flex flex-col">
                              <div className="p-2 border-b">
                                <input
                                  type="text"
                                  placeholder="Search voices..."
                                  value={voiceSearchQuery}
                                  onChange={(e) => setVoiceSearchQuery(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div className="flex-1 overflow-y-auto">
                                {isLoadingVoices ? (
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    Loading voices...
                                  </div>
                                ) : (voicesData?.data && voicesData.data.length > 0) ? (
                                  (voicesData.data).map((voice: any) => (
                                    <button
                                      key={voice.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedVoiceId(voice.id);
                                        setSelectedVoiceName(voice.name);
                                        setValue('voiceId', voice.id);
                                        setValue('voiceName', voice.name);
                                        setIsVoiceDropdownOpen(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center justify-between transition-colors ${
                                        selectedVoiceId === voice.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900">{voice.name}</p>
                                        {voice.description && (
                                          <p className="text-xs text-gray-500 mt-0.5">{voice.description}</p>
                                        )}
                                      </div>
                                      {selectedVoiceId === voice.id && (
                                        <CheckIcon className="h-5 w-5 text-blue-600" />
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    No voices found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isDeepgramProvider ? 'Intelligence' : 'Voice Model'}
                        </label>
                        {filterConnections && (
                          <ConnectionSelect
                            options={filterConnections.map((conn: any) => ({
                              id: conn.id,
                              name: conn.name,
                              description: conn.description || '',
                              email: conn.config?.model_name || '',
                              type: conn.connectionType,
                              config: conn.config,
                            }))}
                            filterByType="llm"
                            name="connectionId"
                            setValue={setValue}
                            register={register}
                            watch={watch}
                            disabled={sessionId != null}
                            validation={{ required: 'Connection is required' }}
                            placeholder="Select an LLM connection"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {agentType === 'text' && (
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">LLM Model</label>
                  {filterConnections && (
                    <ConnectionSelect
                      options={filterConnections.map((conn: any) => ({
                        id: conn.id,
                        name: conn.name,
                        description: conn.description || '',
                        email: conn.config?.model_name || '',
                        type: conn.connectionType,
                        config: conn.config,
                      }))}
                      filterByType="llm"
                      name="connectionId"
                      setValue={setValue}
                      register={register}
                      watch={watch}
                      disabled={sessionId != null}
                      validation={{ required: 'Connection is required' }}
                      placeholder="Select an LLM connection"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files (Optional)
              </label>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={sessionId != null}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Upload Files
                </button>

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleChange}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="max-h-[4rem]">
                  <div className="mt-5 flex gap-2 overflow-x-auto space-y-1 text-sm text-gray-600 scrollbar-hide">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center h-[3rem] justify-between bg-gray-50 border border-gray-200 px-3 py-1 rounded whitespace-nowrap"
                      >
                        <DocumentIcon width={'25px'} height={'25px'} />
                        <span className="truncate max-w-xs">{file.name}</span>
                        <span className="text-gray-400 ml-1 text-xs">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadError && (
                <span className="mt-2 text-sm text-red-600 block">{uploadError}</span>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (!isRunning) {
                      handleRunSimulation();
                    } else {
                      clearSession();
                    }
                  }}
                  disabled={!testPrompt.trim() || !selectedAgent || uploadError !== ""}
                  className="inline-flex mt-4 items-center cursor-pointer px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b44fe] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)' }}
                >
                  {creatingSession ? <Loader2 className="animate-spin mx-2" /> : null}
                  {isRunning ? (
                    <>
                      <span className="animate-pulse w-3 h-3 mx-2 bg-white rounded-full inline-block"></span>
                      End Test
                    </>
                  ) : (
                    <>
                      Create Test Environment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Chatbox */}
          <ChatWithAttachments
            duration={duration}
            setDuration={setDuration}
            startRecord={start}
            endRecord={stop}
            agentType={agentType}
            isTyping={isTyping}
            sendWebsocketMessage={sendMessage}
            chatMessagesProps={chatMessages}
            sessionId={sessionId}
            connected={connected}
          />
        </div>

        {/* Logs & Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Execution Logs & Results</h3>
              <p className="text-sm text-gray-600">Step-by-step breakdown of agent actions</p>
            </div>
            {testResult && testResult.status == "completed" && (
              <button
                onClick={handleExportResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm rounded-md text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Results
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {executionLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <DocumentTextIcon className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">Run a simulation to see execution logs</p>
                </div>
              ) : (
                executionLogs.map((log, idx) => (
                  <div key={log.timestamp || idx} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    {getLogIcon('success')}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-medium text-gray-900">Tool Call</span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      {log.message && (
                        <p className="text-sm mt-1">{log.message}</p>
                      )}
                      {log.description && (
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestYourAgent;
