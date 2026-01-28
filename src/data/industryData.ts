import { operationsData } from './operationsData';

export const industryData: any = {
  clinic: {
    icon: 'clinic',
    capacityUnit: 'Slots',
    capacityUnitSingular: 'Slot',
    entityName: 'Patient',
    timeLabels: { today: 'today', week: 'this week', month: 'this month' },
    outcomes: {
      today: { rate: 91, prev: 68, prevented: 10, recovered: 3, revenue: '₹2.4L' },
      week: { rate: 88, prev: 65, prevented: 67, recovered: 21, revenue: '₹16.8L' },
      month: { rate: 86, prev: 62, prevented: 245, recovered: 78, revenue: '₹68.2L' }
    },
    capacity: {
      today: {
        total: 45, label: 'slots scheduled today',
        sections: [
          { icon: 'check', count: 28, label: 'proceeded normally', type: 'success', resolutions: [] },
          { icon: 'warning', count: 12, label: 'flagged as no-show risk', type: 'warning', resolutions: [
            { count: 10, label: 'confirmed through outreach', type: 'success' },
            { count: 2, label: 'escalated to front desk', type: 'warning' }
          ]},
          { icon: 'x', count: 5, label: 'cancelled by patients', type: 'danger', resolutions: [
            { count: 3, label: 'filled from waitlist', type: 'success' },
            { count: 2, label: 'went empty', type: 'danger' }
          ]}
        ],
        filled: 41
      },
      week: {
        total: 315, label: 'slots scheduled this week',
        sections: [
          { icon: '✓', count: 198, label: 'proceeded normally', type: 'success', resolutions: [] },
          { icon: '⚠', count: 82, label: 'flagged as no-show risk', type: 'warning', resolutions: [
            { count: 67, label: 'confirmed through outreach', type: 'success' },
            { count: 15, label: 'escalated to front desk', type: 'warning' }
          ]},
          { icon: '✕', count: 35, label: 'cancelled by patients', type: 'danger', resolutions: [
            { count: 21, label: 'filled from waitlist', type: 'success' },
            { count: 14, label: 'went empty', type: 'danger' }
          ]}
        ],
        filled: 277
      },
      month: {
        total: 1260, label: 'slots scheduled this month',
        sections: [
          { icon: '✓', count: 756, label: 'proceeded normally', type: 'success', resolutions: [] },
          { icon: '⚠', count: 340, label: 'flagged as no-show risk', type: 'warning', resolutions: [
            { count: 245, label: 'confirmed through outreach', type: 'success' },
            { count: 95, label: 'escalated to front desk', type: 'warning' }
          ]},
          { icon: '✕', count: 164, label: 'cancelled by patients', type: 'danger', resolutions: [
            { count: 78, label: 'filled from waitlist', type: 'success' },
            { count: 86, label: 'went empty', type: 'danger' }
          ]}
        ],
        filled: 1084
      }
    },
    channels: {
      today: [
        { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', sent: 12, read: 10, converted: 6 },
        { id: 'voice', name: 'Voice Calls', icon: 'voice', sent: 6, read: 5, converted: 4 },
        { id: 'email', name: 'Email', icon: 'email', sent: 4, read: 2, converted: 1 },
        { id: 'waitlist', name: 'Waitlist', icon: 'waitlist', sent: 5, read: 5, converted: 3 }
      ],
      week: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 84, read: 72, converted: 45 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 42, read: 38, converted: 28 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 28, read: 14, converted: 8 },
        { id: 'waitlist', name: 'Waitlist', icon: '🔄', sent: 35, read: 35, converted: 21 }
      ],
      month: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 336, read: 288, converted: 180 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 168, read: 152, converted: 112 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 112, read: 56, converted: 32 },
        { id: 'waitlist', name: 'Waitlist', icon: '🔄', sent: 140, read: 140, converted: 84 }
      ]
    },
    conversations: operationsData.clinic.records.slice(0, 4).map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      event: r.slot,
      channel: r.timeline.find((t: any) => t.action.includes('whatsapp') || t.action.includes('voice'))?.action.includes('voice') ? 'voice' : 'whatsapp',
      status: r.status,
      risk: r.riskScore,
      timeline: r.timeline.map((t: any) => ({
        time: t.time,
        dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('system') || t.action.includes('status') || t.action.includes('escalation') || t.action.includes('match') || t.action.includes('assigned') || t.action.includes('released') ? 'system' : 'out',
        channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined,
        msg: t.message,
        status: t.status
      }))
    }))
  },
  hotel: {
    icon: 'hotel',
    capacityUnit: 'Rooms',
    capacityUnitSingular: 'Room',
    entityName: 'Guest',
    timeLabels: { today: 'tonight', week: 'this week', month: 'this month' },
    outcomes: {
      today: { rate: 89, prev: 72, prevented: 8, recovered: 3, revenue: '₹1.8L' },
      week: { rate: 87, prev: 70, prevented: 52, recovered: 18, revenue: '₹12.4L' },
      month: { rate: 85, prev: 68, prevented: 198, recovered: 67, revenue: '₹48.6L' }
    },
    capacity: {
      today: { total: 36, label: 'rooms available tonight', sections: [
        { icon: '✓', count: 20, label: 'confirmed bookings', type: 'success', resolutions: [] },
        { icon: '⚠', count: 10, label: 'flagged as cancellation risk', type: 'warning', resolutions: [
          { count: 8, label: 'confirmed arrival', type: 'success' },
          { count: 2, label: 'escalated to front office', type: 'warning' }
        ]},
        { icon: '✕', count: 6, label: 'cancelled by guests', type: 'danger', resolutions: [
          { count: 3, label: 're-booked same day', type: 'success' },
          { count: 3, label: 'went vacant', type: 'danger' }
        ]}
      ], filled: 32 },
      week: { total: 252, label: 'room-nights this week', sections: [
        { icon: '✓', count: 145, label: 'confirmed bookings', type: 'success', resolutions: [] },
        { icon: '⚠', count: 72, label: 'flagged as cancellation risk', type: 'warning', resolutions: [
          { count: 52, label: 'confirmed arrival', type: 'success' },
          { count: 20, label: 'escalated to front office', type: 'warning' }
        ]},
        { icon: '✕', count: 35, label: 'cancelled by guests', type: 'danger', resolutions: [
          { count: 18, label: 're-booked same day', type: 'success' },
          { count: 17, label: 'went vacant', type: 'danger' }
        ]}
      ], filled: 219 },
      month: { total: 1080, label: 'room-nights this month', sections: [
        { icon: '✓', count: 612, label: 'confirmed bookings', type: 'success', resolutions: [] },
        { icon: '⚠', count: 310, label: 'flagged as cancellation risk', type: 'warning', resolutions: [
          { count: 198, label: 'confirmed arrival', type: 'success' },
          { count: 112, label: 'escalated to front office', type: 'warning' }
        ]},
        { icon: '✕', count: 158, label: 'cancelled by guests', type: 'danger', resolutions: [
          { count: 67, label: 're-booked same day', type: 'success' },
          { count: 91, label: 'went vacant', type: 'danger' }
        ]}
      ], filled: 918 }
    },
    channels: {
      today: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 12, read: 10, converted: 7 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 4, read: 4, converted: 3 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 8, read: 5, converted: 2 }
      ],
      week: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 84, read: 70, converted: 49 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 28, read: 28, converted: 21 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 56, read: 35, converted: 14 }
      ],
      month: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 336, read: 280, converted: 196 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 112, read: 112, converted: 84 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 224, read: 140, converted: 56 }
      ]
    },
    conversations: operationsData.hotel.records.map((r: any) => ({
      id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'voice', status: r.status, risk: r.riskScore,
      timeline: r.timeline.map((t: any) => ({ time: t.time, dir: t.action.includes('received') ? 'in' : t.action.includes('status') || t.action.includes('escalation') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
    }))
  },
  sales: {
    icon: 'sales',
    capacityUnit: 'Deals',
    capacityUnitSingular: 'Deal',
    entityName: 'Client',
    timeLabels: { today: 'today', week: 'this week', month: 'this month' },
    outcomes: {
      today: { rate: 78, prev: 54, prevented: 12, recovered: '₹4.2L', revenue: '₹12.6L' },
      week: { rate: 76, prev: 52, prevented: 78, recovered: '₹28.4L', revenue: '₹86.2L' },
      month: { rate: 74, prev: 50, prevented: 312, recovered: '₹1.2Cr', revenue: '₹3.6Cr' }
    },
    capacity: {
      today: { total: 32, label: 'active quotes today', sections: [
        { icon: '✓', count: 8, label: 'progressing normally', type: 'success', resolutions: [] },
        { icon: '⚠', count: 18, label: 'going cold (5+ days)', type: 'warning', resolutions: [
          { count: 12, label: 're-engaged successfully', type: 'success' },
          { count: 4, label: 'escalated to manager', type: 'warning' },
          { count: 2, label: 'marked as lost', type: 'danger' }
        ]},
        { icon: 'dollar', count: 6, label: 'invoices overdue', type: 'info', resolutions: [
          { count: 4, label: 'payment received (₹4.2L)', type: 'success' },
          { count: 2, label: 'escalated to finance', type: 'warning' }
        ]}
      ], filled: 25 },
      week: { total: 156, label: 'active quotes this week', sections: [
        { icon: '✓', count: 42, label: 'progressing normally', type: 'success', resolutions: [] },
        { icon: '⚠', count: 86, label: 'going cold (5+ days)', type: 'warning', resolutions: [
          { count: 58, label: 're-engaged successfully', type: 'success' },
          { count: 20, label: 'escalated to manager', type: 'warning' },
          { count: 8, label: 'marked as lost', type: 'danger' }
        ]},
        { icon: '💰', count: 28, label: 'invoices overdue', type: 'info', resolutions: [
          { count: 20, label: 'payment received (₹28.4L)', type: 'success' },
          { count: 8, label: 'escalated to finance', type: 'warning' }
        ]}
      ], filled: 118 },
      month: { total: 624, label: 'active quotes this month', sections: [
        { icon: '✓', count: 168, label: 'progressing normally', type: 'success', resolutions: [] },
        { icon: '⚠', count: 344, label: 'going cold (5+ days)', type: 'warning', resolutions: [
          { count: 232, label: 're-engaged successfully', type: 'success' },
          { count: 80, label: 'escalated to manager', type: 'warning' },
          { count: 32, label: 'marked as lost', type: 'danger' }
        ]},
        { icon: '💰', count: 112, label: 'invoices overdue', type: 'info', resolutions: [
          { count: 80, label: 'payment received (₹1.2Cr)', type: 'success' },
          { count: 32, label: 'escalated to finance', type: 'warning' }
        ]}
      ], filled: 462 }
    },
    channels: {
      today: [
        { id: 'email', name: 'Email', icon: '✉️', sent: 24, read: 12, converted: 6 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 12, read: 8, converted: 5 },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 8, read: 6, converted: 3 }
      ],
      week: [
        { id: 'email', name: 'Email', icon: '✉️', sent: 168, read: 84, converted: 42 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 84, read: 56, converted: 35 },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 56, read: 42, converted: 21 }
      ],
      month: [
        { id: 'email', name: 'Email', icon: '✉️', sent: 672, read: 336, converted: 168 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 336, read: 224, converted: 140 },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 224, read: 168, converted: 84 }
      ]
    },
    conversations: operationsData.sales.records.map((r: any) => ({
      id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'email', status: r.status, risk: r.riskScore,
      timeline: r.timeline.map((t: any) => ({ time: t.time, dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('quote_sent') || t.action.includes('quote_viewed') || t.action.includes('escalation') || t.action.includes('meeting') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
    }))
  },
  insurance: {
    icon: 'insurance',
    capacityUnit: 'Policies',
    capacityUnitSingular: 'Policy',
    entityName: 'Customer',
    timeLabels: { today: 'today', week: 'this week', month: 'this month' },
    outcomes: {
      today: { rate: 94, prev: 76, prevented: 18, recovered: 5, revenue: '₹8.4L' },
      week: { rate: 92, prev: 74, prevented: 124, recovered: 32, revenue: '₹58.6L' },
      month: { rate: 90, prev: 72, prevented: 486, recovered: 128, revenue: '₹2.4Cr' }
    },
    capacity: {
      today: { total: 48, label: 'policies due today', sections: [
        { icon: '✓', count: 18, label: 'auto-renewed', type: 'success', resolutions: [] },
        { icon: '⚠', count: 22, label: 'flagged as lapse risk', type: 'warning', resolutions: [
          { count: 18, label: 'renewed after outreach', type: 'success' },
          { count: 3, label: 'escalated to agent', type: 'warning' },
          { count: 1, label: 'lapsed', type: 'danger' }
        ]},
        { icon: 'rotate', count: 8, label: 'previously lapsed (win-back)', type: 'info', resolutions: [
          { count: 5, label: 'won back', type: 'success' },
          { count: 3, label: 'not recovered', type: 'danger' }
        ]}
      ], filled: 45 },
      week: { total: 336, label: 'policies due this week', sections: [
        { icon: '✓', count: 134, label: 'auto-renewed', type: 'success', resolutions: [] },
        { icon: '⚠', count: 152, label: 'flagged as lapse risk', type: 'warning', resolutions: [
          { count: 124, label: 'renewed after outreach', type: 'success' },
          { count: 21, label: 'escalated to agent', type: 'warning' },
          { count: 7, label: 'lapsed', type: 'danger' }
        ]},
        { icon: '↩', count: 50, label: 'previously lapsed (win-back)', type: 'info', resolutions: [
          { count: 32, label: 'won back', type: 'success' },
          { count: 18, label: 'not recovered', type: 'danger' }
        ]}
      ], filled: 309 },
      month: { total: 1344, label: 'policies due this month', sections: [
        { icon: '✓', count: 538, label: 'auto-renewed', type: 'success', resolutions: [] },
        { icon: '⚠', count: 608, label: 'flagged as lapse risk', type: 'warning', resolutions: [
          { count: 486, label: 'renewed after outreach', type: 'success' },
          { count: 94, label: 'escalated to agent', type: 'warning' },
          { count: 28, label: 'lapsed', type: 'danger' }
        ]},
        { icon: '↩', count: 198, label: 'previously lapsed (win-back)', type: 'info', resolutions: [
          { count: 128, label: 'won back', type: 'success' },
          { count: 70, label: 'not recovered', type: 'danger' }
        ]}
      ], filled: 1210 }
    },
    channels: {
      today: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 22, read: 20, converted: 16 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 8, read: 7, converted: 5 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 16, read: 10, converted: 4 }
      ],
      week: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 154, read: 140, converted: 112 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 56, read: 49, converted: 35 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 112, read: 70, converted: 28 }
      ],
      month: [
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 616, read: 560, converted: 448 },
        { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 224, read: 196, converted: 140 },
        { id: 'email', name: 'Email', icon: '✉️', sent: 448, read: 280, converted: 112 }
      ]
    },
    conversations: operationsData.insurance.records.map((r: any) => ({
      id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'whatsapp', status: r.status, risk: r.riskScore,
      timeline: r.timeline.map((t: any) => ({ time: t.time, dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('renewal') || t.action.includes('payment') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
    }))
  }
};
