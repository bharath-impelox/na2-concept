export interface AgentsLog {
  type: string;
  status: string;
  tool_name: string;
  message: string;
  details: Details;
  confidence?: number;
  timestamp: string;
  description?: string;
}

export interface Details {
  arguments?: Arguments;
  result?: string;
}

export interface Arguments {
  args: unknown[];
  kwargs: Kwargs;
}

export interface Kwargs {
  session_id: string;
  agent_id: number;
  tool_id: number;
  event_summary: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  timezone: string;
}

export interface Agent {
  id: string;
  name: string;
  configuration: {
    systemInstructions: string;
    followUpInstructions?: string;
    modalities?: ('text' | 'voice')[];
  };
  triggerType?: string;
  tools?: Array<{
    toolId: string;
    name: string;
    type?: string;
  }>;
}

export interface Connection {
  id: string;
  name: string;
  description?: string;
  connectionType: string;
  modalities?: string;
  config?: {
    model_name?: string;
    provider?: string;
    model_id?: string;
  };
}
