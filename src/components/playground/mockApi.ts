// API utilities for fetching real data
import React from 'react';
import { SERVER_URL } from '../../common/api/base.api';
import { ACCESS_TOKEN } from '../../common/constants/client-storage-keys';

export const AGENT_ENV_1 = import.meta.env.VITE_AGENT_ENV_1 || 'http://localhost:8000';
export const AGENT_ENV_1_WS = import.meta.env.VITE_AGENT_ENV_1_WS || 'ws://localhost:8000';

// Hardcoded workspace ID for healthcare industry
const HEALTHCARE_WORKSPACE_ID = '68e2b2161c4d15d8aa049b4e';

// AI Employee Header constant (matching reference)
const AI_EMPLOYEE_HEADER = 'X-AI-Employee-ID';

// Workspace hook - returns hardcoded workspace ID
export const useWorkspace = () => {
  return {
    currentWorkspaceId: HEALTHCARE_WORKSPACE_ID
  };
};

// Mock agent data
const mockAgents = [
  {
    id: '1',
    name: 'Customer Support Agent',
    configuration: {
      systemInstructions: 'You are a helpful customer support agent. Help users with their questions and issues.',
      modalities: ['text', 'voice']
    },
    triggerType: 'manual',
    tools: [
      { toolId: '101', name: 'bookCalendar', type: 'calendar' },
      { toolId: '102', name: 'sendEmail', type: 'email' }
    ]
  },
  {
    id: '2',
    name: 'Sales Agent',
    configuration: {
      systemInstructions: 'You are a sales agent. Help customers find the right products.',
      modalities: ['text']
    },
    triggerType: 'manual',
    tools: [
      { toolId: '103', name: 'schedule_email_with_cron', type: 'email' }
    ]
  }
];

// Mock connections data
const mockConnections = [
  {
    id: 'conn-1',
    name: 'OpenAI GPT-4',
    description: 'OpenAI GPT-4 connection',
    connectionType: 'llm',
    modalities: 'text',
    config: {
      model_name: 'gpt-4',
      provider: 'openai'
    }
  },
  {
    id: 'conn-2',
    name: 'OpenAI GPT-4 Voice',
    description: 'OpenAI GPT-4 voice connection',
    connectionType: 'llm',
    modalities: 'voice',
    config: {
      model_name: 'gpt-4',
      provider: 'openai'
    }
  }
];

// Fetch agents from API
export const useGetAgentListsQuery = (params: any, options?: any) => {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    if (options?.skip || !params?.aiEmployeeId) {
      setIsLoading(false);
      return;
    }

    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(`${SERVER_URL}/agent`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            [AI_EMPLOYEE_HEADER]: params.aiEmployeeId,
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err);
        // Fallback to mock data on error
        setData({
          data: {
            agents: mockAgents
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [params?.aiEmployeeId, options?.skip]);

  return { data, isLoading, error };
};

// Fetch connections from API
export const useGetConnectionsQuery = (params: any, options?: any) => {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    if (options?.skip || !params?.aiEmployeeId) {
      setIsLoading(false);
      return;
    }

    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(`${SERVER_URL}/connection?aiEmployeeId=${params.aiEmployeeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            [AI_EMPLOYEE_HEADER]: params.aiEmployeeId,
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch connections: ${response.statusText}`);
        }

        const result = await response.json();
        // Transform response to match expected format
        if (result?.data) {
          result.data = result.data.map((conn: any) => ({
            ...conn,
            id: conn._id || conn.id
          }));
        }
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching connections:', err);
        setError(err);
        // Fallback to mock data on error
        setData({
          data: mockConnections
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [params?.aiEmployeeId, options?.skip]);

  return { data, isLoading, error };
};

// Fetch voices from API
export const useGetVoicesQuery = (params: any, options?: any) => {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  const refetch = React.useCallback(async () => {
    if (options?.skip || !params?.aiEmployeeId || !params?.provider) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = sessionStorage.getItem(ACCESS_TOKEN);
      const queryParams = new URLSearchParams({
        aiEmployeeId: params.aiEmployeeId,
        ...(params.provider && { provider: params.provider }),
        ...(params.q && { q: params.q }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.starting_after && { starting_after: params.starting_after }),
        ...(params.ending_before && { ending_before: params.ending_before })
      });

      const response = await fetch(`${SERVER_URL}/connection/voices/list?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching voices:', err);
      setError(err);
      // Fallback to mock data on error
      setData({
        data: [
          { id: 'voice-1', name: 'Alloy', description: 'Neutral voice' },
          { id: 'voice-2', name: 'Echo', description: 'Male voice' },
          { id: 'voice-3', name: 'Fable', description: 'British accent' }
        ],
        has_more: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [params, options?.skip]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
};

// Mock toast function - simplified version
// In a real app, this would use sonner or another toast library
export const toast = {
  error: (message: string) => {
    console.error('Toast Error:', message);
    alert(`Error: ${message}`);
  },
  success: (message: string) => {
    console.log('Toast Success:', message);
    // Could add a simple notification here
  }
};
