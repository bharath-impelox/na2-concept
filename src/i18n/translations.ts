// Centralized translations for NA2 Platform
// Add or modify translations here

export type Language = 'en' | 'ja';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    operations: string;
    studio: string;
  };
  
  // Common
  common: {
    today: string;
    week: string;
    month: string;
    thisWeek: string;
    thisMonth: string;
    search: string;
    filter: string;
    all: string;
    view: string;
    close: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    cancelAction: string;
    loading: string;
    noData: string;
    noResults: string;
    tryAdjustingFilters: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    performanceInsights: string;
    utilizationTrend: string;
    acrossTimePeriods: string;
    channelPerformance: string;
    messagesSentVsConverted: string;
    riskBreakdown: string;
    safe: string;
    atRisk: string;
    revenueProtected: string;
    cumulativeProtection: string;
    risksPrevented: string;
    recovered: string;
    revenueProtectedLabel: string;
    seeExecutionDetails: string;
    channelsDecisionsConversations: string;
    overallConversion: string;
    utilization: string;
    from: string;
    seeHowAchieved: string;
    outcomes: string;
    channels: string;
    conversations: string;
    howDidAchieve: string;
    completeBreakdown: string;
    breakdownFor: string;
  };

  // Operations
  operations: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    dateFilter: string;
    statusFilter: string;
    byChannel: string;
    byCustomer: string;
    sent: string;
    read: string;
    done: string;
    converted: string;
    conversions: string;
    conversations: string;
    conversation: string;
    noConversations: string;
    noConversationsForChannel: string;
    interactions: string;
    viewInOperations: string;
    viewFullHistory: string;
    risk: string;
    executionDetails: string;
    forTrustAudits: string;
    totalActions: string;
    messages: string;
    channels: string;
    clickAnyToSee: string;
    openOperationsConsole: string;
    doctorPrefix: string;
    am: string;
    pm: string;
    allRecords: string;
    riskScore: string;
    riskFactors: string;
    decisionAuditTrail: string;
    decision: string;
    confidence: string;
    agent: string;
    manualNotes: string;
    appointment: string;
    vip: string;
    quickActions: string;
    callNow: string;
    sendMessage: string;
    markConfirmed: string;
    reassignSlot: string;
    addNote: string;
    flagIssue: string;
    callPatient: string;
    markAsConfirmed: string;
    reassignSlotAction: string;
    messageLabel: string;
    noteOptional: string;
    typeYourMessage: string;
    addNoteAboutAction: string;
    initiateCall: string;
    confirm: string;
    reassign: string;
    saveNote: string;
  };

  // Studio
  studio: {
    title: string;
    agents: string;
    tools: string;
    settings: string;
    agentName: string;
    model: string;
    modality: string;
    description: string;
    status: string;
    performance: string;
    performanceSnapshot: string;
    toolsLabel: string;
    toolsUsed: string;
    lastActivity: string;
    instructions: string;
    followUpInstructions: string;
    config: string;
    active: string;
    inactive: string;
    paused: string;
    testAgent: string;
    editAgent: string;
    deleteAgent: string;
    configureAgent: string;
    basicConfiguration: string;
    agentInstructions: string;
    agentTools: string;
    configuration: string;
    testConfiguration: string;
    availableTools: string;
    memoryLayer: string;
    learnedPatterns: string;
    contactLimits: string;
    maxAttemptsPerDay: string;
    quietHours: string;
    noOutboundDuring: string;
    escalationThreshold: string;
    whenConfidenceBelow: string;
    vipOverride: string;
    alwaysEscalateVip: string;
    enabled: string;
    executionLogs: string;
    stepByStepBreakdown: string;
    runSimulation: string;
    pause: string;
    resume: string;
    startingPoints: string;
    workflows: string;
    agentNames: {
      followUpAgent: string;
      leadGenerationAgent: string;
      noShowPreventionAgent: string;
      bookingAgent: string;
      feedbackAgent: string;
    };
    agentDescriptions: {
      followUpAgent: string;
      leadGenerationAgent: string;
      noShowPreventionAgent: string;
      bookingAgent: string;
      feedbackAgent: string;
    };
    toolNames: {
      scheduleRecurringEmail: string;
      scheduleRecurringVoice: string;
      deleteRecurringEmail: string;
      createSession: string;
      createSessionBatch: string;
      findLeads: string;
      checkCalendarAvailability: string;
      sendMail: string;
      cancelAppointment: string;
      bookGoogleCalendar: string;
      makeTwilioCall: string;
    };
    memoryTexts: {
      respondBetter: string;
      voiceCallsSuccess: string;
      secondFollowUp: string;
      callsAfter6PM: string;
    };
    // Main header
    studioTitle: string;
    studioSubtitle: string;
    import: string;
    createAgent: string;
    // Tab labels
    teamOfAgents: string;
    workspaceWorkflow: string;
    testYourAgent: string;
    memory: string;
    guardrails: string;
    // Workflows
    addTrigger: string;
    testWorkflow: string;
    defineWorkflowSteps: string;
    versions: string;
    addStep: string;
    agentsLabel: string;
    saveWorkflow: string;
    // Starting Points
    startingPointNames: {
      typeFormLeadGeneration: string;
      test: string;
      voiceListener: string;
      preFollowUp: string;
      emailTrigger: string;
      leadGenerator: string;
    };
    startingPointTypes: {
      typeForm: string;
      twilioCallListener: string;
      preFollowUp: string;
      emailListener: string;
      fileUpload: string;
    };
    // Workflow Steps
    workflowStepTitles: {
      createLeadSession: string;
      bookAppointment: string;
      followUpReminder: string;
      noShowPrevention: string;
      cancelAppointment: string;
      rescheduleAppointment: string;
      deleteFollowUpReminder: string;
      collectFeedback: string;
      insuranceVerification: string;
    };
    workflowStepDescriptions: {
      createLeadSession: string;
      bookAppointment: string;
      followUpReminder: string;
      noShowPrevention: string;
      cancelAppointment: string;
      rescheduleAppointment: string;
      deleteFollowUpReminder: string;
      collectFeedback: string;
      insuranceVerification: string;
    };
    // Test Tab
    testTabSubtitle: string;
    needHelpTesting: string;
    selectAgentsToTest: string;
    agentSelected: string;
    clickAgentToSelect: string;
    testPrompt: string;
    voiceProvider: string;
    uploadFilesOptional: string;
    uploadFiles: string;
    createTestEnvironment: string;
    conversationPreview: string;
    realtimeConversation: string;
    startConversationToSeeMessages: string;
    typeMessage: string;
    used: string;
    // Additional tool names
    listUpcomingAppointments: string;
    deleteRecurringVoice: string;
    updateSessionInfo: string;
    manageInsuranceClaims: string;
    // Voice providers
    deepgram: string;
    gemini: string;
    openai: string;
    sttAndTts: string;
    nativeAudio: string;
    realtimeModel: string;
  };

  // Industry specific
  industries: {
    clinic: {
      name: string;
      capacityUnit: string;
      capacityUnitSingular: string;
      entityName: string;
      entityNamePlural: string;
      slotsScheduled: string;
      slotsScheduledToday: string;
      slotsScheduledThisWeek: string;
      slotsScheduledThisMonth: string;
      proceededNormally: string;
      flaggedAsNoShowRisk: string;
      cancelledByPatients: string;
      confirmedThroughOutreach: string;
      escalatedToFrontDesk: string;
      filledFromWaitlist: string;
      wentEmpty: string;
      filled: string;
    };
    hotel: {
      name: string;
      capacityUnit: string;
      capacityUnitSingular: string;
      entityName: string;
      entityNamePlural: string;
      roomsScheduled: string;
      roomsScheduledToday: string;
      roomsScheduledThisWeek: string;
      roomsScheduledThisMonth: string;
      proceededNormally: string;
      flaggedAsVacancyRisk: string;
      cancelledByGuests: string;
      confirmedThroughOutreach: string;
      escalatedToReception: string;
      filledFromWaitlist: string;
      wentEmpty: string;
      filled: string;
    };
    sales: {
      name: string;
      capacityUnit: string;
      capacityUnitSingular: string;
      entityName: string;
      entityNamePlural: string;
      quotesGenerated: string;
      quotesGeneratedToday: string;
      quotesGeneratedThisWeek: string;
      quotesGeneratedThisMonth: string;
      proceededNormally: string;
      flaggedAsGoingCold: string;
      cancelledByCustomers: string;
      confirmedThroughOutreach: string;
      escalatedToSalesTeam: string;
      convertedFromFollowUp: string;
      lost: string;
      converted: string;
    };
    insurance: {
      name: string;
      capacityUnit: string;
      capacityUnitSingular: string;
      entityName: string;
      entityNamePlural: string;
      policiesGenerated: string;
      policiesGeneratedToday: string;
      policiesGeneratedThisWeek: string;
      policiesGeneratedThisMonth: string;
      proceededNormally: string;
      flaggedAsRenewalRisk: string;
      cancelledByCustomers: string;
      confirmedThroughOutreach: string;
      escalatedToAgent: string;
      renewedFromFollowUp: string;
      lapsed: string;
      renewed: string;
    };
  };

  // Status labels
  status: {
    confirmed: string;
    renewed: string;
    recovered: string;
    wonBack: string;
    meetingSet: string;
    paymentReceived: string;
    escalated: string;
    pending: string;
    unconfirmed: string;
    error: string;
    delivered: string;
    read: string;
    notOpened: string;
    noAnswer: string;
    warning: string;
    connected: string;
    success: string;
  };

  // Channels
  channels: {
    whatsapp: string;
    voice: string;
    voiceCalls: string;
    email: string;
    waitlist: string;
    sms: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      operations: 'Operations',
      studio: 'Studio',
    },
    common: {
      today: 'Today',
      week: 'Week',
      month: 'Month',
      thisWeek: 'this week',
      thisMonth: 'this month',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      view: 'View',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      cancelAction: 'Cancel',
      loading: 'Loading...',
      noData: 'No data available',
      noResults: 'No records found',
      tryAdjustingFilters: 'Try adjusting your search or filters',
    },
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Performance insights for',
      performanceInsights: 'Performance insights',
      utilizationTrend: 'Utilization Trend',
      acrossTimePeriods: 'Across time periods',
      channelPerformance: 'Channel Performance',
      messagesSentVsConverted: 'Messages sent vs converted',
      riskBreakdown: 'Risk Breakdown',
      safe: 'Safe',
      atRisk: 'At Risk',
      revenueProtected: 'Revenue Protected',
      cumulativeProtection: 'Cumulative protection',
      risksPrevented: 'Risks Prevented',
      recovered: 'Recovered',
      revenueProtectedLabel: 'Revenue Protected',
      seeExecutionDetails: 'See execution details',
      channelsDecisionsConversations: 'Channels, decisions, and conversations',
      overallConversion: 'Overall Conversion',
      utilization: 'Utilization',
      from: 'from',
      seeHowAchieved: 'See how NA2 achieved this',
      outcomes: 'Outcomes',
      channels: 'Channels',
      conversations: 'Conversations',
      howDidAchieve: 'How did NA2 achieve',
      completeBreakdown: 'Complete',
      breakdownFor: 'breakdown for',
    },
    operations: {
      title: 'Operations Console',
      subtitle: 'All records and execution history',
      searchPlaceholder: 'Search by name, phone, or ID...',
      dateFilter: 'Date',
      statusFilter: 'Status',
      byChannel: 'By Channel',
      byCustomer: 'By',
      sent: 'Sent',
      read: 'Read',
      done: 'Done',
      converted: 'Converted',
      conversions: 'conversions',
      conversations: 'Conversations',
      conversation: 'Conversation',
      noConversations: 'No conversations yet',
      noConversationsForChannel: 'No conversations for this channel yet',
      interactions: 'interactions',
      viewInOperations: 'View in Operations →',
      viewFullHistory: 'View Full History',
      risk: 'Risk',
      executionDetails: 'Execution Details',
      forTrustAudits: 'For trust, audits, and debugging',
      totalActions: 'Total Actions',
      messages: 'messages',
      channels: 'channels',
      clickAnyToSee: 'Click any {entity} to see full audit trail, decisions, and take actions',
      openOperationsConsole: 'Open Operations Console →',
      doctorPrefix: 'Dr.',
      am: 'AM',
      pm: 'PM',
      allRecords: 'All {count} records',
      riskScore: 'Risk Score',
      riskFactors: 'Risk Factors',
      decisionAuditTrail: 'Decision Audit Trail',
      decision: 'Decision',
      confidence: 'Confidence',
      agent: 'Agent',
      manualNotes: 'Manual Notes',
      appointment: 'Appointment',
      vip: 'VIP',
      quickActions: 'Quick Actions',
      callNow: 'Call Now',
      sendMessage: 'Send Message',
      markConfirmed: 'Mark Confirmed',
      reassignSlot: 'Reassign',
      addNote: 'Add Note',
      flagIssue: 'Flag Issue',
      callPatient: 'Call Patient',
      markAsConfirmed: 'Mark as Confirmed',
      reassignSlotAction: 'Reassign Slot',
      messageLabel: 'Message',
      noteOptional: 'Note (optional)',
      typeYourMessage: 'Type your message...',
      addNoteAboutAction: 'Add a note about this action...',
      initiateCall: 'Initiate Call',
      confirm: 'Confirm',
      reassign: 'Reassign',
      saveNote: 'Save Note',
    },
    studio: {
      title: 'AI Studio',
      agents: 'Agents',
      tools: 'Tools',
      settings: 'Settings',
      agentName: 'Agent Name',
      model: 'Model',
      modality: 'Modality',
      description: 'Description',
      status: 'Status',
      performance: 'Performance',
      performanceSnapshot: 'Performance Snapshot',
      toolsLabel: 'Tools',
      toolsUsed: 'Tools Used',
      lastActivity: 'Last Activity',
      instructions: 'Instructions',
      followUpInstructions: 'Follow-up Instructions',
      config: 'Config',
      active: 'Active',
      inactive: 'Inactive',
      paused: 'Paused',
      testAgent: 'Test Agent',
      editAgent: 'Edit Agent',
      deleteAgent: 'Delete Agent',
      configureAgent: 'Configure',
      basicConfiguration: 'Basic Configuration',
      agentInstructions: 'Agent Instructions',
      agentTools: 'Agent Tools',
      configuration: 'Configuration',
      testConfiguration: 'Test Configuration',
      availableTools: 'Available Tools:',
      memoryLayer: 'NA2 Memory Layer',
      learnedPatterns: 'Learned patterns from execution',
      contactLimits: 'Contact Limits',
      maxAttemptsPerDay: 'Max attempts per day',
      quietHours: 'Quiet Hours',
      noOutboundDuring: 'No outbound during',
      escalationThreshold: 'Escalation Threshold',
      whenConfidenceBelow: 'When confidence below',
      vipOverride: 'VIP Override',
      alwaysEscalateVip: 'Always escalate VIP',
      enabled: 'Enabled',
      executionLogs: 'Execution Logs & Results',
      stepByStepBreakdown: 'Step-by-step breakdown of agent actions',
      runSimulation: 'Run a simulation to see execution logs',
      pause: 'Pause',
      resume: 'Resume',
      startingPoints: 'Starting Points',
      workflows: 'Workflows',
      agentNames: {
        followUpAgent: 'Follow-up Agent',
        leadGenerationAgent: 'Lead Generation Agent',
        noShowPreventionAgent: 'No-Show Prevention Agent',
        bookingAgent: 'Booking Agent',
        feedbackAgent: 'Feedback Agent',
      },
      agentDescriptions: {
        followUpAgent: 'Creates scheduled reminders when appointments are successfully booked',
        leadGenerationAgent: 'Handles lead intake and creates sessions from various sources',
        noShowPreventionAgent: 'Proactively prevents cancellations and no-shows',
        bookingAgent: 'Handles appointment booking and calendar management',
        feedbackAgent: 'Collects feedback after appointments',
      },
      toolNames: {
        scheduleRecurringEmail: 'Schedule Recurring Email',
        scheduleRecurringVoice: 'Schedule Recurring Voice',
        deleteRecurringEmail: 'Delete Recurring Email',
        createSession: 'Create session',
        createSessionBatch: 'Create session (batch)',
        findLeads: 'Find leads',
        checkCalendarAvailability: 'Check Calendar Availability',
        sendMail: 'Send Mail',
        cancelAppointment: 'Cancel Appointment',
        bookGoogleCalendar: 'Book Google Calendar',
        makeTwilioCall: 'Make Twilio call',
      },
      memoryTexts: {
        respondBetter: 'respond better to WhatsApp in evenings',
        voiceCallsSuccess: 'Voice calls have 3x success for same-day confirmations',
        secondFollowUp: 'Second follow-up closes faster than third',
        callsAfter6PM: 'Calls after 6 PM have higher success rate',
      },
      // Main header
      studioTitle: 'AI Agent Studio',
      studioSubtitle: 'Design, configure, and test your autonomous agents',
      import: 'Import',
      createAgent: '+ Create Agent',
      // Tab labels
      teamOfAgents: 'Team of Agents',
      workspaceWorkflow: 'Workspace Workflow',
      testYourAgent: 'Test your Agent',
      memory: 'Memory',
      guardrails: 'Guardrails',
      // Workflows
      addTrigger: 'Add Trigger',
      testWorkflow: 'Test Workflow',
      defineWorkflowSteps: 'Define the workflow steps that agents will follow',
      versions: 'Versions',
      addStep: '+ Add Step',
      agentsLabel: 'Agents',
      saveWorkflow: 'Save Workflow',
      // Starting Points
      startingPointNames: {
        typeFormLeadGeneration: 'Type Form Lead Generation',
        test: 'Test',
        voiceListener: 'Voice Listener',
        preFollowUp: 'Pre Follow Up',
        emailTrigger: 'Email Trigger',
        leadGenerator: 'Lead Generator',
      },
      startingPointTypes: {
        typeForm: 'TypeForm',
        twilioCallListener: 'Twilio Call_listener',
        preFollowUp: 'Pre-Follow_up',
        emailListener: 'Email Listener',
        fileUpload: 'File Upload',
      },
      // Workflow Steps
      workflowStepTitles: {
        createLeadSession: 'Create Lead Session',
        bookAppointment: 'Book an Appointment',
        followUpReminder: 'Follow-up Reminder',
        noShowPrevention: 'No-Show Prevention',
        cancelAppointment: 'Cancel an Appointment',
        rescheduleAppointment: 'Reschedule Appointment',
        deleteFollowUpReminder: 'Delete Follow Up Reminder',
        collectFeedback: 'Collect Feedback',
        insuranceVerification: 'Insurance Verification',
      },
      workflowStepDescriptions: {
        createLeadSession: 'Handle cases where only uploaded data (such as contact lists or leads) is provided. Use this data to immediately create a lead session — no further steps, analysis, or actions should occur after the session is created.',
        bookAppointment: 'Interact with the lead via email to confirm slot availability and complete the appointment booking. Politely encourage the lead to choose a suitable time, reassuring them about the benefits of timely care.',
        followUpReminder: 'After successfully booking an appointment, schedule and send a follow-up reminder email.',
        noShowPrevention: 'If the user attempts to cancel a booked appointment or Not interested in booking appointment, try to convince them to reconsider and retain the booking.',
        cancelAppointment: 'If the user cannot be convinced to keep the appointment, proceed to cancel it.',
        rescheduleAppointment: 'Manage rescheduling by verifying details, canceling the old slot, and booking a new one through the booking agent.',
        deleteFollowUpReminder: 'When the patient replies with an attendance confirmation (e.g., they will attend, be present, join, or are available) or lead asked to stop reminders, delete all follow up scheduled reminders.',
        collectFeedback: 'When the chiropractor updates the calendar event indicating whether the lead attended, trigger feedback collection flow.',
        insuranceVerification: 'When a patient provides insurance information, collect all required insurance details (patient info, insurance card details, subscriber info, accident info, and authorization requirements).',
      },
      // Test Tab
      testTabSubtitle: 'The sandbox where your AI Employee (and their team) can practice before going live',
      needHelpTesting: '💡 Need help testing? Ask your AI Employee to simulate scenarios →',
      selectAgentsToTest: 'Select agents to test',
      agentSelected: '1 Agent selected',
      clickAgentToSelect: 'Click an agent below to select',
      testPrompt: 'Test Prompt',
      voiceProvider: 'Voice Provider',
      uploadFilesOptional: 'Upload Files (Optional)',
      uploadFiles: 'Upload Files',
      createTestEnvironment: 'Create Test Environment',
      conversationPreview: 'Conversation Preview',
      realtimeConversation: 'Real-time conversation between user and agent',
      startConversationToSeeMessages: 'Start a conversation to see messages here',
      typeMessage: 'Type a message...',
      used: 'Used',
      // Additional tool names
      listUpcomingAppointments: 'List Upcoming Appointments',
      deleteRecurringVoice: 'Delete Recurring Voice',
      updateSessionInfo: 'Update Session Info',
      manageInsuranceClaims: 'Manage Insurance Claims',
      // Voice providers
      deepgram: 'Deepgram',
      gemini: 'Gemini',
      openai: 'OpenAI',
      sttAndTts: 'STT & TTS',
      nativeAudio: 'Native audio',
      realtimeModel: 'Realtime model',
    },
    industries: {
      clinic: {
        name: 'Healthcare',
        capacityUnit: 'Slots',
        capacityUnitSingular: 'Slot',
        entityName: 'Patient',
        entityNamePlural: 'Patients',
        slotsScheduled: 'slots scheduled',
        slotsScheduledToday: 'slots scheduled today',
        slotsScheduledThisWeek: 'slots scheduled this week',
        slotsScheduledThisMonth: 'slots scheduled this month',
        proceededNormally: 'proceeded normally',
        flaggedAsNoShowRisk: 'flagged as no-show risk',
        cancelledByPatients: 'cancelled by patients',
        confirmedThroughOutreach: 'confirmed through outreach',
        escalatedToFrontDesk: 'escalated to front desk',
        filledFromWaitlist: 'filled from waitlist',
        wentEmpty: 'went empty',
        filled: 'Filled',
      },
      hotel: {
        name: 'Hospitality',
        capacityUnit: 'Rooms',
        capacityUnitSingular: 'Room',
        entityName: 'Guest',
        entityNamePlural: 'Guests',
        roomsScheduled: 'rooms scheduled',
        roomsScheduledToday: 'rooms scheduled today',
        roomsScheduledThisWeek: 'rooms scheduled this week',
        roomsScheduledThisMonth: 'rooms scheduled this month',
        proceededNormally: 'proceeded normally',
        flaggedAsVacancyRisk: 'flagged as vacancy risk',
        cancelledByGuests: 'cancelled by guests',
        confirmedThroughOutreach: 'confirmed through outreach',
        escalatedToReception: 'escalated to reception',
        filledFromWaitlist: 'filled from waitlist',
        wentEmpty: 'went empty',
        filled: 'Filled',
      },
      sales: {
        name: 'Sales & Trading',
        capacityUnit: 'Quotes',
        capacityUnitSingular: 'Quote',
        entityName: 'Customer',
        entityNamePlural: 'Customers',
        quotesGenerated: 'quotes generated',
        quotesGeneratedToday: 'quotes generated today',
        quotesGeneratedThisWeek: 'quotes generated this week',
        quotesGeneratedThisMonth: 'quotes generated this month',
        proceededNormally: 'proceeded normally',
        flaggedAsGoingCold: 'flagged as going cold',
        cancelledByCustomers: 'cancelled by customers',
        confirmedThroughOutreach: 'confirmed through outreach',
        escalatedToSalesTeam: 'escalated to sales team',
        convertedFromFollowUp: 'converted from follow-up',
        lost: 'lost',
        converted: 'Converted',
      },
      insurance: {
        name: 'Insurance',
        capacityUnit: 'Policies',
        capacityUnitSingular: 'Policy',
        entityName: 'Lead',
        entityNamePlural: 'Leads',
        policiesGenerated: 'policies generated',
        policiesGeneratedToday: 'policies generated today',
        policiesGeneratedThisWeek: 'policies generated this week',
        policiesGeneratedThisMonth: 'policies generated this month',
        proceededNormally: 'proceeded normally',
        flaggedAsRenewalRisk: 'flagged as renewal risk',
        cancelledByCustomers: 'cancelled by customers',
        confirmedThroughOutreach: 'confirmed through outreach',
        escalatedToAgent: 'escalated to agent',
        renewedFromFollowUp: 'renewed from follow-up',
        lapsed: 'lapsed',
        renewed: 'Renewed',
      },
    },
    status: {
      confirmed: 'CONFIRMED',
      renewed: 'RENEWED',
      recovered: 'RECOVERED',
      wonBack: 'WON BACK',
      meetingSet: 'MEETING SET',
      paymentReceived: 'PAYMENT RECEIVED',
      escalated: 'ESCALATED',
      pending: 'PENDING',
      unconfirmed: 'UNCONFIRMED',
      error: 'ERROR',
      delivered: 'delivered',
      read: 'read',
      notOpened: 'not opened',
      noAnswer: 'no answer',
      warning: 'warning',
      connected: 'connected',
      success: 'success',
    },
    channels: {
      whatsapp: 'WhatsApp',
      voice: 'Voice',
      voiceCalls: 'Voice Calls',
      email: 'Email',
      waitlist: 'Waitlist',
      sms: 'SMS',
    },
  },
  ja: {
    nav: {
      dashboard: 'ダッシュボード',
      operations: 'オペレーション',
      studio: 'スタジオ',
    },
    common: {
      today: '今日',
      week: '週',
      month: '月',
      thisWeek: '今週',
      thisMonth: '今月',
      search: '検索',
      filter: 'フィルター',
      all: 'すべて',
      view: '表示',
      close: '閉じる',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      confirm: '確認',
      cancelAction: 'キャンセル',
      loading: '読み込み中...',
      noData: 'データがありません',
      noResults: 'レコードが見つかりません',
      tryAdjustingFilters: '検索またはフィルターを調整してみてください',
    },
    dashboard: {
      title: 'ダッシュボード概要',
      subtitle: 'パフォーマンスインサイト',
      performanceInsights: 'パフォーマンスインサイト',
      utilizationTrend: '利用率の傾向',
      acrossTimePeriods: '期間全体',
      channelPerformance: 'チャネルパフォーマンス',
      messagesSentVsConverted: '送信されたメッセージと変換されたメッセージ',
      riskBreakdown: 'リスク内訳',
      safe: '安全',
      atRisk: 'リスクあり',
      revenueProtected: '保護された収益',
      cumulativeProtection: '累積保護',
      risksPrevented: '防止されたリスク',
      recovered: '回復',
      revenueProtectedLabel: '保護された収益',
      seeExecutionDetails: '実行詳細を表示',
      channelsDecisionsConversations: 'チャネル、決定、会話',
      overallConversion: '全体の変換率',
      utilization: '利用率',
      from: 'から',
      seeHowAchieved: 'NA2がこれを達成した方法を見る',
      outcomes: '成果',
      channels: 'チャネル',
      conversations: '会話',
      howDidAchieve: 'NA2はどのように達成しましたか',
      completeBreakdown: '完全な',
      breakdownFor: '内訳',
    },
    operations: {
      title: 'オペレーションコンソール',
      subtitle: 'すべてのレコードと実行履歴',
      searchPlaceholder: '名前、電話番号、またはIDで検索...',
      dateFilter: '日付',
      statusFilter: 'ステータス',
      byChannel: 'チャネル別',
      byCustomer: '別',
      sent: '送信',
      read: '読了',
      done: '完了',
      converted: '変換',
      conversions: '変換',
      conversations: '会話',
      conversation: '会話',
      noConversations: '会話がまだありません',
      noConversationsForChannel: 'このチャネルの会話がまだありません',
      interactions: 'インタラクション',
      viewInOperations: 'オペレーションで表示 →',
      viewFullHistory: '完全な履歴を表示',
      risk: 'リスク',
      executionDetails: '実行詳細',
      forTrustAudits: '信頼、監査、デバッグのため',
      totalActions: '総アクション',
      messages: 'メッセージ',
      channels: 'チャネル',
      clickAnyToSee: '{entity}をクリックして、完全な監査証跡、決定、およびアクションを表示',
      openOperationsConsole: 'オペレーションコンソールを開く →',
      doctorPrefix: '医師',
      am: '午前',
      pm: '午後',
      allRecords: 'すべて {count} 件のレコード',
      riskScore: 'リスクスコア',
      riskFactors: 'リスク要因',
      decisionAuditTrail: '決定監査証跡',
      decision: '決定',
      confidence: '信頼度',
      agent: 'エージェント',
      manualNotes: '手動メモ',
      appointment: '予約',
      vip: 'VIP',
      quickActions: 'クイックアクション',
      callNow: '今すぐ電話',
      sendMessage: 'メッセージを送信',
      markConfirmed: '確認済みとしてマーク',
      reassignSlot: '再割り当て',
      addNote: 'メモを追加',
      flagIssue: '問題をフラグ',
      callPatient: '患者に電話',
      markAsConfirmed: '確認済みとしてマーク',
      reassignSlotAction: 'スロットを再割り当て',
      messageLabel: 'メッセージ',
      noteOptional: 'メモ（オプション）',
      typeYourMessage: 'メッセージを入力...',
      addNoteAboutAction: 'このアクションについてメモを追加...',
      initiateCall: '通話を開始',
      confirm: '確認',
      reassign: '再割り当て',
      saveNote: 'メモを保存',
    },
    studio: {
      title: 'AIスタジオ',
      agents: 'エージェント',
      tools: 'ツール',
      settings: '設定',
      agentName: 'エージェント名',
      model: 'モデル',
      modality: 'モダリティ',
      description: '説明',
      status: 'ステータス',
      performance: 'パフォーマンス',
      performanceSnapshot: 'パフォーマンススナップショット',
      toolsLabel: 'ツール',
      toolsUsed: '使用されたツール',
      lastActivity: '最終アクティビティ',
      instructions: '指示',
      followUpInstructions: 'フォローアップ指示',
      config: '設定',
      active: 'アクティブ',
      inactive: '非アクティブ',
      paused: '一時停止',
      testAgent: 'エージェントをテスト',
      editAgent: 'エージェントを編集',
      deleteAgent: 'エージェントを削除',
      configureAgent: '設定',
      basicConfiguration: '基本設定',
      agentInstructions: 'エージェント指示',
      agentTools: 'エージェントツール',
      configuration: '設定',
      testConfiguration: 'テスト設定',
      availableTools: '利用可能なツール:',
      memoryLayer: 'NA2メモリレイヤー',
      learnedPatterns: '実行から学習したパターン',
      contactLimits: '連絡制限',
      maxAttemptsPerDay: '1日あたりの最大試行回数',
      quietHours: '静かな時間',
      noOutboundDuring: '送信なし',
      escalationThreshold: 'エスカレーション閾値',
      whenConfidenceBelow: '信頼度が以下になった場合',
      vipOverride: 'VIPオーバーライド',
      alwaysEscalateVip: '常にVIPをエスカレート',
      enabled: '有効',
      executionLogs: '実行ログと結果',
      stepByStepBreakdown: 'エージェントアクションのステップバイステップの内訳',
      runSimulation: 'シミュレーションを実行して実行ログを表示',
      pause: '一時停止',
      resume: '再開',
      startingPoints: '開始ポイント',
      workflows: 'ワークフロー',
      agentNames: {
        followUpAgent: 'フォローアップエージェント',
        leadGenerationAgent: 'リード生成エージェント',
        noShowPreventionAgent: 'ノーショー防止エージェント',
        bookingAgent: '予約エージェント',
        feedbackAgent: 'フィードバックエージェント',
      },
      agentDescriptions: {
        followUpAgent: '予約が正常に予約されたときにスケジュールされたリマインダーを作成',
        leadGenerationAgent: 'リードの受け取りを処理し、さまざまなソースからセッションを作成',
        noShowPreventionAgent: 'キャンセルとノーショーを積極的に防止',
        bookingAgent: '予約の予約とカレンダー管理を処理',
        feedbackAgent: '予約後にフィードバックを収集',
      },
      toolNames: {
        scheduleRecurringEmail: '定期メールをスケジュール',
        scheduleRecurringVoice: '定期音声をスケジュール',
        deleteRecurringEmail: '定期メールを削除',
        createSession: 'セッションを作成',
        createSessionBatch: 'セッションを作成（バッチ）',
        findLeads: 'リードを検索',
        checkCalendarAvailability: 'カレンダーの空き状況を確認',
        sendMail: 'メールを送信',
        cancelAppointment: '予約をキャンセル',
        bookGoogleCalendar: 'Googleカレンダーを予約',
        makeTwilioCall: 'Twilio通話を行う',
      },
      memoryTexts: {
        respondBetter: '夕方にWhatsAppに反応しやすい',
        voiceCallsSuccess: '音声通話は当日確認で3倍の成功率',
        secondFollowUp: '2回目のフォローアップは3回目より早く終了',
        callsAfter6PM: '午後6時以降の通話は成功率が高い',
      },
      // Main header
      studioTitle: 'AIエージェントスタジオ',
      studioSubtitle: '自律エージェントを設計、設定、テストする',
      import: 'インポート',
      createAgent: '+ エージェントを作成',
      // Tab labels
      teamOfAgents: 'エージェントチーム',
      workspaceWorkflow: 'ワークスペースワークフロー',
      testYourAgent: 'エージェントをテスト',
      memory: 'メモリ',
      guardrails: 'ガードレール',
      // Workflows
      addTrigger: 'トリガーを追加',
      testWorkflow: 'ワークフローをテスト',
      defineWorkflowSteps: 'エージェントが従うワークフローステップを定義',
      versions: 'バージョン',
      addStep: '+ ステップを追加',
      agentsLabel: 'エージェント',
      saveWorkflow: 'ワークフローを保存',
      // Starting Points
      startingPointNames: {
        typeFormLeadGeneration: 'タイプフォームリード生成',
        test: 'テスト',
        voiceListener: '音声リスナー',
        preFollowUp: '事前フォローアップ',
        emailTrigger: 'メールトリガー',
        leadGenerator: 'リードジェネレーター',
      },
      startingPointTypes: {
        typeForm: 'タイプフォーム',
        twilioCallListener: 'Twilio通話リスナー',
        preFollowUp: '事前フォローアップ',
        emailListener: 'メールリスナー',
        fileUpload: 'ファイルアップロード',
      },
      // Workflow Steps
      workflowStepTitles: {
        createLeadSession: 'リードセッションを作成',
        bookAppointment: '予約を予約',
        followUpReminder: 'フォローアップリマインダー',
        noShowPrevention: 'ノーショー防止',
        cancelAppointment: '予約をキャンセル',
        rescheduleAppointment: '予約を再スケジュール',
        deleteFollowUpReminder: 'フォローアップリマインダーを削除',
        collectFeedback: 'フィードバックを収集',
        insuranceVerification: '保険確認',
      },
      workflowStepDescriptions: {
        createLeadSession: 'アップロードされたデータ（連絡先リストやリードなど）のみが提供されるケースを処理します。このデータを使用してすぐにリードセッションを作成します—セッション作成後は、それ以上のステップ、分析、またはアクションは発生しません。',
        bookAppointment: 'メールでリードとやり取りし、スロットの空き状況を確認して予約の予約を完了します。リードに適切な時間を選択するよう丁寧に促し、タイムリーなケアの利点を安心させます。',
        followUpReminder: '予約が正常に予約された後、フォローアップリマインダーメールをスケジュールして送信します。',
        noShowPrevention: 'ユーザーが予約済みの予約をキャンセルしようとした場合、または予約に興味がない場合、再考して予約を保持するよう説得します。',
        cancelAppointment: 'ユーザーが予約を維持できない場合、キャンセルに進みます。',
        rescheduleAppointment: '詳細を確認し、古いスロットをキャンセルし、予約エージェントを通じて新しいスロットを予約することで、再スケジュールを管理します。',
        deleteFollowUpReminder: '患者が出席確認で返信した場合（例：出席する、参加する、利用可能など）、またはリードがリマインダーを停止するよう依頼した場合、すべてのフォローアップスケジュールされたリマインダーを削除します。',
        collectFeedback: 'カイロプラクターがリードが出席したかどうかを示すカレンダーイベントを更新したとき、フィードバック収集フローをトリガーします。',
        insuranceVerification: '患者が保険情報を提供した場合、必要なすべての保険詳細（患者情報、保険カード詳細、加入者情報、事故情報、承認要件）を収集します。',
      },
      // Test Tab
      testTabSubtitle: 'AI従業員（とそのチーム）が本番前に練習できるサンドボックス',
      needHelpTesting: '💡 テストのヘルプが必要ですか？AI従業員にシナリオをシミュレートするよう依頼 →',
      selectAgentsToTest: 'テストするエージェントを選択',
      agentSelected: '1つのエージェントが選択されました',
      clickAgentToSelect: '下のエージェントをクリックして選択',
      testPrompt: 'テストプロンプト',
      voiceProvider: '音声プロバイダー',
      uploadFilesOptional: 'ファイルをアップロード（オプション）',
      uploadFiles: 'ファイルをアップロード',
      createTestEnvironment: 'テスト環境を作成',
      conversationPreview: '会話プレビュー',
      realtimeConversation: 'ユーザーとエージェント間のリアルタイム会話',
      startConversationToSeeMessages: '会話を開始してメッセージを表示',
      typeMessage: 'メッセージを入力...',
      used: '使用',
      // Additional tool names
      listUpcomingAppointments: '今後の予約を一覧表示',
      deleteRecurringVoice: '定期音声を削除',
      updateSessionInfo: 'セッション情報を更新',
      manageInsuranceClaims: '保険請求を管理',
      // Voice providers
      deepgram: 'Deepgram',
      gemini: 'Gemini',
      openai: 'OpenAI',
      sttAndTts: 'STT & TTS',
      nativeAudio: 'ネイティブオーディオ',
      realtimeModel: 'リアルタイムモデル',
    },
    industries: {
      clinic: {
        name: 'ヘルスケア',
        capacityUnit: 'スロット',
        capacityUnitSingular: 'スロット',
        entityName: '患者',
        entityNamePlural: '患者',
        slotsScheduled: '予約されたスロット',
        slotsScheduledToday: '今日予約されたスロット',
        slotsScheduledThisWeek: '今週予約されたスロット',
        slotsScheduledThisMonth: '今月予約されたスロット',
        proceededNormally: '正常に進行',
        flaggedAsNoShowRisk: 'ノーショーリスクとしてフラグ付け',
        cancelledByPatients: '患者によってキャンセル',
        confirmedThroughOutreach: 'アウトリーチで確認',
        escalatedToFrontDesk: 'フロントデスクにエスカレート',
        filledFromWaitlist: '待機リストから埋められた',
        wentEmpty: '空になった',
        filled: '埋められた',
      },
      hotel: {
        name: 'ホスピタリティ',
        capacityUnit: '部屋',
        capacityUnitSingular: '部屋',
        entityName: 'ゲスト',
        entityNamePlural: 'ゲスト',
        roomsScheduled: '予約された部屋',
        roomsScheduledToday: '今日予約された部屋',
        roomsScheduledThisWeek: '今週予約された部屋',
        roomsScheduledThisMonth: '今月予約された部屋',
        proceededNormally: '正常に進行',
        flaggedAsVacancyRisk: '空室リスクとしてフラグ付け',
        cancelledByGuests: 'ゲストによってキャンセル',
        confirmedThroughOutreach: 'アウトリーチで確認',
        escalatedToReception: '受付にエスカレート',
        filledFromWaitlist: '待機リストから埋められた',
        wentEmpty: '空になった',
        filled: '埋められた',
      },
      sales: {
        name: 'セールス＆トレーディング',
        capacityUnit: '見積もり',
        capacityUnitSingular: '見積もり',
        entityName: '顧客',
        entityNamePlural: '顧客',
        quotesGenerated: '生成された見積もり',
        quotesGeneratedToday: '今日生成された見積もり',
        quotesGeneratedThisWeek: '今週生成された見積もり',
        quotesGeneratedThisMonth: '今月生成された見積もり',
        proceededNormally: '正常に進行',
        flaggedAsGoingCold: '冷えているとしてフラグ付け',
        cancelledByCustomers: '顧客によってキャンセル',
        confirmedThroughOutreach: 'アウトリーチで確認',
        escalatedToSalesTeam: '営業チームにエスカレート',
        convertedFromFollowUp: 'フォローアップから変換',
        lost: '失われた',
        converted: '変換',
      },
      insurance: {
        name: '保険',
        capacityUnit: 'ポリシー',
        capacityUnitSingular: 'ポリシー',
        entityName: 'リード',
        entityNamePlural: 'リード',
        policiesGenerated: '生成されたポリシー',
        policiesGeneratedToday: '今日生成されたポリシー',
        policiesGeneratedThisWeek: '今週生成されたポリシー',
        policiesGeneratedThisMonth: '今月生成されたポリシー',
        proceededNormally: '正常に進行',
        flaggedAsRenewalRisk: '更新リスクとしてフラグ付け',
        cancelledByCustomers: '顧客によってキャンセル',
        confirmedThroughOutreach: 'アウトリーチで確認',
        escalatedToAgent: 'エージェントにエスカレート',
        renewedFromFollowUp: 'フォローアップから更新',
        lapsed: '失効',
        renewed: '更新',
      },
    },
    status: {
      confirmed: '確認済み',
      renewed: '更新済み',
      recovered: '回復済み',
      wonBack: '取り戻した',
      meetingSet: '会議設定済み',
      paymentReceived: '支払い受領済み',
      escalated: 'エスカレート',
      pending: '保留中',
      unconfirmed: '未確認',
      error: 'エラー',
      delivered: '配信済み',
      read: '読了',
      notOpened: '未開封',
      noAnswer: '応答なし',
      warning: '警告',
      connected: '接続済み',
      success: '成功',
    },
    channels: {
      whatsapp: 'WhatsApp',
      voice: '音声',
      voiceCalls: '音声通話',
      email: 'メール',
      waitlist: '待機リスト',
      sms: 'SMS',
    },
  },
};
