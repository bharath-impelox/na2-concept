// Operations data - all records with full audit trail
// Status types explained:
// - confirmed/renewed/recovered/meeting_set/payment_received = Successfully completed
// - escalated = Handed off to human, awaiting resolution
// - pending/unconfirmed = In progress, waiting for response
// - error = System failure, needs manual intervention

export interface TimelineItem {
  time: string;
  action: string;
  status: string;
  message: string;
  decision?: {
    reason: string;
    confidence: number;
    agent: string;
  };
}

export interface Note {
  time: string;
  by: string;
  note: string;
}

export interface OperationRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  slot: string;
  slotId: string;
  date: string;
  status: string;
  riskScore: number;
  vip: boolean;
  riskFactors: string[];
  timeline: TimelineItem[];
  notes: Note[];
}

export interface OperationsData {
  entityName: string;
  entityNamePlural: string;
  slotLabel: string;
  idPrefix: string;
  records: OperationRecord[];
}

export const operationsData: Record<string, OperationsData> = {
  clinic: {
    entityName: 'Patient',
    entityNamePlural: 'Patients',
    slotLabel: 'Appointment',
    idPrefix: 'APT',
    records: [
      {
        id: 'APT-001', name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya.sharma@email.com',
        slot: '10:30 AM - Dr. Patel', slotId: 'SLOT-1030-PATEL', date: '2026-01-16',
        status: 'confirmed', riskScore: 78, vip: false,
        riskFactors: ['3 no-shows in past year', 'Morning appointment'],
        timeline: [
          { time: '6:30 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Reminder for 10:30 AM appointment with Dr. Patel. Reply YES to confirm.', decision: { reason: 'Risk score 78% triggered early reminder', confidence: 85, agent: 'Booking Agent' }},
          { time: '8:02 AM', action: 'reply_received', status: 'success', message: 'Patient replied: "YES confirmed."' },
          { time: '8:02 AM', action: 'status_updated', status: 'success', message: 'Appointment marked as CONFIRMED', decision: { reason: 'Explicit YES received', confidence: 100, agent: 'System' }}
        ],
        notes: []
      },
      {
        id: 'APT-002', name: 'Anita Desai', phone: '+91 76543 21098', email: 'anita.desai@email.com',
        slot: '11:00 AM - Dr. Singh', slotId: 'SLOT-1100-SINGH', date: '2026-01-16',
        status: 'recovered', riskScore: 0, vip: false, riskFactors: [],
        timeline: [
          { time: '9:16 AM', action: 'waitlist_match', status: 'info', message: 'Matched from waitlist for cancelled slot.', decision: { reason: 'Slot released, waitlist queried', confidence: 100, agent: 'Recovery Agent' }},
          { time: '9:17 AM', action: 'whatsapp_sent', status: 'delivered', message: 'A slot opened at 11:00 AM today. Reply YES to confirm.' },
          { time: '9:19 AM', action: 'reply_received', status: 'success', message: 'Patient replied: "YES!"' },
          { time: '9:19 AM', action: 'slot_assigned', status: 'success', message: 'Slot recovered and assigned', decision: { reason: 'Waitlist fulfillment successful', confidence: 100, agent: 'Recovery Agent' }}
        ],
        notes: []
      },
      {
        id: 'APT-003', name: 'Vikram Mehta', phone: '+91 65432 10987', email: 'vikram.mehta@email.com',
        slot: '3:30 PM - Dr. Reddy', slotId: 'SLOT-1530-REDDY', date: '2026-01-16',
        status: 'escalated', riskScore: 92, vip: true,
        riskFactors: ['VIP patient', 'Multiple contact attempts failed'],
        timeline: [
          { time: '11:30 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Reminder for 3:30 PM appointment.', decision: { reason: 'VIP triggered early outreach', confidence: 80, agent: 'Booking Agent' }},
          { time: '1:30 PM', action: 'voice_call', status: 'no_answer', message: 'Call attempted. No answer.' },
          { time: '1:45 PM', action: 'voice_call', status: 'no_answer', message: 'Second call attempted. No answer.' },
          { time: '2:00 PM', action: 'escalation', status: 'escalated', message: 'Escalated to Front Desk Supervisor', decision: { reason: 'VIP + all attempts failed', confidence: 55, agent: 'Escalation Agent' }}
        ],
        notes: [{ time: '2:05 PM', by: 'Front Desk', note: 'Trying alternate contact number' }]
      },
      {
        id: 'APT-004', name: 'Ravi Krishnan', phone: '+91 55555 12345', email: 'ravi.k@email.com',
        slot: '4:00 PM - Dr. Sharma', slotId: 'SLOT-1600-SHARMA', date: '2026-01-16',
        status: 'escalated', riskScore: 88, vip: false,
        riskFactors: ['Requested callback', 'Insurance query'],
        timeline: [
          { time: '10:00 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Reminder for 4:00 PM appointment.' },
          { time: '10:30 AM', action: 'reply_received', status: 'info', message: 'Patient replied: "Need to check insurance coverage first"' },
          { time: '10:31 AM', action: 'escalation', status: 'escalated', message: 'Escalated - Patient has insurance query', decision: { reason: 'Complex query requiring human response', confidence: 60, agent: 'Escalation Agent' }}
        ],
        notes: []
      },
      {
        id: 'APT-005', name: 'Meera Joshi', phone: '+91 54321 09876', email: 'meera.joshi@email.com',
        slot: '2:00 PM - Dr. Patel', slotId: 'SLOT-1400-PATEL', date: '2026-01-16',
        status: 'unconfirmed', riskScore: 67, vip: false,
        riskFactors: ['Message delivered but not read'],
        timeline: [
          { time: '8:00 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Reminder for 2:00 PM appointment.' },
          { time: '11:00 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Your appointment is in 3 hours. Please confirm.', decision: { reason: 'No engagement, follow-up triggered', confidence: 68, agent: 'Follow-up Agent' }}
        ],
        notes: []
      },
      {
        id: 'APT-006', name: 'Kavitha Nair', phone: '+91 44444 55555', email: 'kavitha.n@email.com',
        slot: '5:00 PM - Dr. Gupta', slotId: 'SLOT-1700-GUPTA', date: '2026-01-16',
        status: 'pending', riskScore: 55, vip: false,
        riskFactors: ['New patient', 'Evening slot'],
        timeline: [
          { time: '9:00 AM', action: 'whatsapp_sent', status: 'delivered', message: 'Reminder for 5:00 PM appointment with Dr. Gupta.' },
          { time: '12:00 PM', action: 'status_check', status: 'info', message: 'Message read. Awaiting response.', decision: { reason: 'Monitoring engagement', confidence: 70, agent: 'System' }}
        ],
        notes: []
      },
      {
        id: 'APT-007', name: 'Suresh Reddy', phone: '+91 43210 98765', email: 'suresh.reddy@email.com',
        slot: '9:00 AM - Dr. Gupta', slotId: 'SLOT-0900-GUPTA', date: '2026-01-16',
        status: 'error', riskScore: 45, vip: false,
        riskFactors: ['Invalid phone number'],
        timeline: [
          { time: '5:00 AM', action: 'whatsapp_sent', status: 'failed', message: 'Message delivery failed. Error: Invalid phone number format' },
          { time: '5:01 AM', action: 'error_logged', status: 'error', message: 'Phone number validation failed.' },
          { time: '5:05 AM', action: 'email_sent', status: 'delivered', message: 'Fallback email sent', decision: { reason: 'WhatsApp failed, email fallback', confidence: 75, agent: 'Booking Agent' }}
        ],
        notes: []
      },
      {
        id: 'APT-008', name: 'Lakshmi Iyer', phone: '+91 33333 44444', email: 'invalid-email',
        slot: '10:00 AM - Dr. Singh', slotId: 'SLOT-1000-SINGH', date: '2026-01-16',
        status: 'error', riskScore: 50, vip: false,
        riskFactors: ['Invalid email', 'WhatsApp failed'],
        timeline: [
          { time: '6:00 AM', action: 'whatsapp_sent', status: 'failed', message: 'WhatsApp not registered on this number' },
          { time: '6:01 AM', action: 'email_sent', status: 'failed', message: 'Email delivery failed - invalid address' },
          { time: '6:02 AM', action: 'error_logged', status: 'error', message: 'All contact channels failed. Manual intervention required.' }
        ],
        notes: []
      }
    ]
  },
  hotel: {
    entityName: 'Guest',
    entityNamePlural: 'Guests',
    slotLabel: 'Booking',
    idPrefix: 'BKG',
    records: [
      {
        id: 'BKG-001', name: 'John Miller', phone: '+1 555 123 4567', email: 'john.miller@email.com',
        slot: 'Room 304 - Deluxe King', slotId: 'ROOM-304', date: '2026-01-16',
        status: 'confirmed', riskScore: 72, vip: true,
        riskFactors: ['International guest', 'Premium room'],
        timeline: [
          { time: 'Yesterday', action: 'whatsapp_sent', status: 'delivered', message: 'Looking forward to hosting you. Please confirm arrival time.' },
          { time: 'Today 10:05 AM', action: 'voice_call', status: 'connected', message: 'Guest confirmed 6 PM arrival.', decision: { reason: 'Voice fallback successful', confidence: 95, agent: 'Booking Agent' }},
          { time: 'Today 10:06 AM', action: 'status_updated', status: 'success', message: 'Arrival confirmed for 6 PM.' }
        ],
        notes: [{ time: 'Today 10:07 AM', by: 'Concierge', note: 'Airport pickup arranged' }]
      },
      {
        id: 'BKG-002', name: 'Sarah Chen', phone: '+65 9123 4567', email: 'sarah.chen@email.com',
        slot: 'Room 512 - Suite', slotId: 'ROOM-512', date: '2026-01-16',
        status: 'confirmed', riskScore: 30, vip: true,
        riskFactors: [],
        timeline: [
          { time: 'Yesterday', action: 'whatsapp_sent', status: 'read', message: 'Your suite is ready. Expected arrival time?' },
          { time: 'Yesterday', action: 'reply_received', status: 'success', message: 'Guest replied: "Will arrive at 4 PM. Please arrange spa booking."' },
          { time: 'Yesterday', action: 'status_updated', status: 'success', message: 'Confirmed. Spa booked for 5 PM.' }
        ],
        notes: []
      },
      {
        id: 'BKG-003', name: 'Robert Johnson', phone: '+1 555 987 6543', email: 'r.johnson@corp.com',
        slot: 'Room 201 - Standard', slotId: 'ROOM-201', date: '2026-01-16',
        status: 'escalated', riskScore: 85, vip: false,
        riskFactors: ['Corporate booking', 'No response', 'Late check-in'],
        timeline: [
          { time: '2 days ago', action: 'email_sent', status: 'not_opened', message: 'Booking confirmation sent' },
          { time: 'Yesterday', action: 'whatsapp_sent', status: 'delivered', message: 'Please confirm your arrival.' },
          { time: 'Today 2:00 PM', action: 'escalation', status: 'escalated', message: 'Escalated to Front Office - No response, check-in today', decision: { reason: 'All automated attempts exhausted', confidence: 50, agent: 'Escalation Agent' }}
        ],
        notes: []
      },
      {
        id: 'BKG-004', name: 'Maria Garcia', phone: '+34 612 345 678', email: 'maria.g@email.com',
        slot: 'Room 405 - Deluxe Twin', slotId: 'ROOM-405', date: '2026-01-16',
        status: 'pending', riskScore: 60, vip: false,
        riskFactors: ['International guest', 'Flight delay possible'],
        timeline: [
          { time: 'Today 8:00 AM', action: 'whatsapp_sent', status: 'read', message: 'Your room is ready. What time should we expect you?' },
          { time: 'Today 10:00 AM', action: 'status_check', status: 'info', message: 'Message read but no reply yet' }
        ],
        notes: []
      },
      {
        id: 'BKG-005', name: 'Unknown Guest', phone: 'N/A', email: 'booking@ota.com',
        slot: 'Room 102 - Standard', slotId: 'ROOM-102', date: '2026-01-16',
        status: 'error', riskScore: 90, vip: false,
        riskFactors: ['OTA booking', 'No direct contact info'],
        timeline: [
          { time: 'Today 6:00 AM', action: 'contact_attempt', status: 'failed', message: 'No guest contact information available from OTA booking' },
          { time: 'Today 6:01 AM', action: 'error_logged', status: 'error', message: 'Cannot reach guest - OTA did not provide direct contact' }
        ],
        notes: []
      }
    ]
  },
  sales: {
    entityName: 'Client',
    entityNamePlural: 'Clients',
    slotLabel: 'Deal',
    idPrefix: 'DEAL',
    records: [
      {
        id: 'DEAL-001', name: 'TechCorp Inc.', phone: '+91 98765 00001', email: 'procurement@techcorp.com',
        slot: 'Quote #4521 - ₹45L', slotId: 'QUOTE-4521', date: '2026-01-16',
        status: 'meeting_set', riskScore: 65, vip: true,
        riskFactors: ['Quote viewed but delayed response'],
        timeline: [
          { time: 'Day 1', action: 'quote_sent', status: 'delivered', message: 'Quote #4521 sent. Value: ₹45L' },
          { time: 'Day 5', action: 'whatsapp_sent', status: 'read', message: 'Would love to schedule a call.', decision: { reason: 'Quote going cold', confidence: 70, agent: 'Follow-up Agent' }},
          { time: 'Day 5', action: 'reply_received', status: 'success', message: 'Client replied: "Tomorrow 3 PM works"' },
          { time: 'Day 5', action: 'meeting_scheduled', status: 'success', message: 'Meeting scheduled for tomorrow 3 PM' }
        ],
        notes: []
      },
      {
        id: 'DEAL-002', name: 'GlobalTrade Ltd.', phone: '+91 98765 00002', email: 'finance@globaltrade.com',
        slot: 'Invoice #8842 - ₹2.1L', slotId: 'INV-8842', date: '2026-01-16',
        status: 'payment_received', riskScore: 20, vip: false,
        riskFactors: [],
        timeline: [
          { time: 'Day 7', action: 'whatsapp_sent', status: 'delivered', message: 'Gentle reminder about invoice #8842.' },
          { time: 'Day 14', action: 'voice_call', status: 'connected', message: 'Payment ETA: 3 days.' },
          { time: 'Day 17', action: 'payment_received', status: 'success', message: 'Payment received: ₹2.1L' }
        ],
        notes: []
      },
      {
        id: 'DEAL-003', name: 'StartupXYZ', phone: '+91 98765 00003', email: 'ceo@startupxyz.com',
        slot: 'Quote #4589 - ₹12L', slotId: 'QUOTE-4589', date: '2026-01-16',
        status: 'escalated', riskScore: 80, vip: false,
        riskFactors: ['Budget concerns mentioned', 'Competitor evaluation'],
        timeline: [
          { time: 'Day 3', action: 'email_sent', status: 'opened', message: 'Follow-up on Quote #4589' },
          { time: 'Day 5', action: 'reply_received', status: 'info', message: 'Client replied: "Evaluating other options, budget is tight"' },
          { time: 'Day 5', action: 'escalation', status: 'escalated', message: 'Escalated to Sales Manager - Needs discount approval', decision: { reason: 'Risk of losing deal to competitor', confidence: 55, agent: 'Escalation Agent' }}
        ],
        notes: []
      },
      {
        id: 'DEAL-004', name: 'MegaCorp', phone: '+91 98765 00004', email: 'vendor@megacorp.com',
        slot: 'Quote #4601 - ₹1.2Cr', slotId: 'QUOTE-4601', date: '2026-01-16',
        status: 'escalated', riskScore: 75, vip: true,
        riskFactors: ['High value deal', 'Legal review requested'],
        timeline: [
          { time: 'Day 2', action: 'reply_received', status: 'info', message: 'Client replied: "Need to run through legal before signing"' },
          { time: 'Day 2', action: 'escalation', status: 'escalated', message: 'Escalated to Legal Team - Contract review required' }
        ],
        notes: [{ time: 'Day 3', by: 'Legal', note: 'Reviewing NDA terms' }]
      },
      {
        id: 'DEAL-005', name: 'RetailMax', phone: '+91 98765 00005', email: 'buying@retailmax.com',
        slot: 'Quote #4612 - ₹8.5L', slotId: 'QUOTE-4612', date: '2026-01-16',
        status: 'pending', riskScore: 50, vip: false,
        riskFactors: ['New client', 'First quote'],
        timeline: [
          { time: 'Today', action: 'quote_sent', status: 'delivered', message: 'Quote #4612 sent. Value: ₹8.5L' },
          { time: 'Today', action: 'status_check', status: 'info', message: 'Quote opened twice. Awaiting response.' }
        ],
        notes: []
      },
      {
        id: 'DEAL-006', name: 'ServicePro', phone: '+91 98765 00006', email: 'ops@servicepro.com',
        slot: 'Invoice #8901 - ₹3.4L', slotId: 'INV-8901', date: '2026-01-16',
        status: 'pending', riskScore: 45, vip: false,
        riskFactors: ['Invoice overdue 7 days'],
        timeline: [
          { time: 'Day 1', action: 'email_sent', status: 'opened', message: 'Invoice #8901 reminder sent' },
          { time: 'Day 7', action: 'whatsapp_sent', status: 'delivered', message: 'Following up on pending invoice.' }
        ],
        notes: []
      },
      {
        id: 'DEAL-007', name: 'Unknown Corp', phone: 'invalid', email: 'bounced@invalid.com',
        slot: 'Quote #4620 - ₹5L', slotId: 'QUOTE-4620', date: '2026-01-16',
        status: 'error', riskScore: 95, vip: false,
        riskFactors: ['Invalid contact info', 'Lead data quality issue'],
        timeline: [
          { time: 'Today', action: 'email_sent', status: 'failed', message: 'Email bounced - invalid address' },
          { time: 'Today', action: 'whatsapp_sent', status: 'failed', message: 'WhatsApp failed - number not valid' },
          { time: 'Today', action: 'error_logged', status: 'error', message: 'All contact channels failed. Lead data needs verification.' }
        ],
        notes: []
      }
    ]
  },
  insurance: {
    entityName: 'Customer',
    entityNamePlural: 'Customers',
    slotLabel: 'Policy',
    idPrefix: 'POL',
    records: [
      {
        id: 'POL-001', name: 'Ramesh Patel', phone: '+91 98765 11111', email: 'ramesh.patel@email.com',
        slot: 'Auto Policy #AP-2847 - Due Jan 20', slotId: 'AP-2847', date: '2026-01-16',
        status: 'renewed', riskScore: 25, vip: false,
        riskFactors: [],
        timeline: [
          { time: 'Jan 5', action: 'whatsapp_sent', status: 'delivered', message: 'Your auto policy is due Jan 20. Premium: ₹18,500. Reply YES to renew.' },
          { time: 'Jan 5', action: 'reply_received', status: 'success', message: 'Customer replied: "YES"' },
          { time: 'Jan 5', action: 'payment_received', status: 'success', message: 'Payment received. Policy renewed.' }
        ],
        notes: []
      },
      {
        id: 'POL-002', name: 'Sunita Verma', phone: '+91 98765 22222', email: 'sunita.v@email.com',
        slot: 'Health Policy #HP-1923 - Lapsed', slotId: 'HP-1923', date: '2026-01-16',
        status: 'won_back', riskScore: 85, vip: false,
        riskFactors: ['Previously lapsed'],
        timeline: [
          { time: 'Dec 15', action: 'email_sent', status: 'opened', message: 'Special offer to reinstate your policy.' },
          { time: 'Dec 28', action: 'voice_call', status: 'connected', message: 'Customer interested in reinstating.' },
          { time: 'Dec 29', action: 'payment_received', status: 'success', message: 'Win-back successful. Policy reinstated.' }
        ],
        notes: []
      },
      {
        id: 'POL-003', name: 'Amit Shah', phone: '+91 98765 33333', email: 'amit.shah@email.com',
        slot: 'Life Policy #LP-4521 - Due Jan 18', slotId: 'LP-4521', date: '2026-01-16',
        status: 'escalated', riskScore: 78, vip: true,
        riskFactors: ['High-value policy', 'Coverage query'],
        timeline: [
          { time: 'Jan 10', action: 'whatsapp_sent', status: 'read', message: 'Your life policy is due for renewal.' },
          { time: 'Jan 12', action: 'reply_received', status: 'info', message: 'Customer replied: "Want to discuss coverage options before renewing"' },
          { time: 'Jan 12', action: 'escalation', status: 'escalated', message: 'Escalated to Agent - Customer wants coverage consultation', decision: { reason: 'Complex query requiring licensed agent', confidence: 60, agent: 'Escalation Agent' }}
        ],
        notes: []
      },
      {
        id: 'POL-004', name: 'Priya Menon', phone: '+91 98765 44444', email: 'priya.m@email.com',
        slot: 'Home Policy #HO-7789 - Due Jan 17', slotId: 'HO-7789', date: '2026-01-16',
        status: 'escalated', riskScore: 70, vip: false,
        riskFactors: ['Claim pending', 'Renewal due'],
        timeline: [
          { time: 'Jan 8', action: 'whatsapp_sent', status: 'delivered', message: 'Your home policy renewal is due.' },
          { time: 'Jan 10', action: 'reply_received', status: 'info', message: 'Customer replied: "Why is my claim from last month still pending?"' },
          { time: 'Jan 10', action: 'escalation', status: 'escalated', message: 'Escalated to Claims Team - Customer has pending claim query' }
        ],
        notes: [{ time: 'Jan 11', by: 'Claims', note: 'Reviewing claim #CL-4421' }]
      },
      {
        id: 'POL-005', name: 'Deepak Kumar', phone: '+91 98765 55555', email: 'deepak.k@email.com',
        slot: 'Auto Policy #AP-3012 - Due Jan 19', slotId: 'AP-3012', date: '2026-01-16',
        status: 'pending', riskScore: 55, vip: false,
        riskFactors: ['Message not read'],
        timeline: [
          { time: 'Jan 12', action: 'whatsapp_sent', status: 'delivered', message: 'Your auto policy renewal is due Jan 19. Premium: ₹22,000.' },
          { time: 'Jan 14', action: 'email_sent', status: 'delivered', message: 'Renewal reminder sent via email as backup.' }
        ],
        notes: []
      },
      {
        id: 'POL-006', name: 'Neha Gupta', phone: '+91 98765 66666', email: 'neha.g@email.com',
        slot: 'Health Policy #HP-2156 - Due Jan 20', slotId: 'HP-2156', date: '2026-01-16',
        status: 'unconfirmed', riskScore: 48, vip: false,
        riskFactors: ['First renewal'],
        timeline: [
          { time: 'Jan 10', action: 'whatsapp_sent', status: 'read', message: 'Your health policy is due for renewal.' },
          { time: 'Jan 14', action: 'status_check', status: 'info', message: 'Message read. No response yet.' }
        ],
        notes: []
      },
      {
        id: 'POL-007', name: 'Rajesh Nair', phone: '+91 00000 00000', email: 'old_email@defunct.com',
        slot: 'Auto Policy #AP-1234 - Due Jan 16', slotId: 'AP-1234', date: '2026-01-16',
        status: 'error', riskScore: 90, vip: false,
        riskFactors: ['Outdated contact info', 'Policy at risk'],
        timeline: [
          { time: 'Jan 8', action: 'whatsapp_sent', status: 'failed', message: 'WhatsApp delivery failed - number invalid' },
          { time: 'Jan 8', action: 'email_sent', status: 'failed', message: 'Email bounced - address not found' },
          { time: 'Jan 8', action: 'error_logged', status: 'error', message: 'All channels failed. Customer data needs update.' }
        ],
        notes: []
      },
      {
        id: 'POL-008', name: 'Kiran Rao', phone: 'N/A', email: 'N/A',
        slot: 'Travel Policy #TP-001 - Invalid', slotId: 'TP-001', date: '2026-01-16',
        status: 'error', riskScore: 100, vip: false,
        riskFactors: ['No contact info', 'Agent upload error'],
        timeline: [
          { time: 'Jan 15', action: 'error_logged', status: 'error', message: 'Policy created without contact information.' }
        ],
        notes: []
      }
    ]
  }
};
