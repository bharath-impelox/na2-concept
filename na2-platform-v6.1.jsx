import React, { useState } from 'react';

// NA2 Platform V6 - With Operations Console
// Three modes: Dashboard (top-down), Operations (bottom-up), Studio (config)

const NA2PlatformV6 = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedIndustry, setSelectedIndustry] = useState('clinic');
  const [drillDownLevel, setDrillDownLevel] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('channel');
  const [timePeriod, setTimePeriod] = useState('today');
  const [studioTab, setStudioTab] = useState('agents');
  
  // Operations Console State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('2026-01-16');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionNote, setActionNote] = useState('');

  // Color system
  const colors = {
    clinic: { primary: '#059669', light: '#ECFDF5', dark: '#047857', name: 'Healthcare' },
    hotel: { primary: '#7C3AED', light: '#F5F3FF', dark: '#6D28D9', name: 'Hospitality' },
    sales: { primary: '#D97706', light: '#FFFBEB', dark: '#B45309', name: 'Sales & Trading' },
    insurance: { primary: '#0284C7', light: '#F0F9FF', dark: '#0369A1', name: 'Insurance' }
  };

  const theme = colors[selectedIndustry];

  // Operations data - all records with full audit trail
  // Status types explained:
  // - confirmed/renewed/recovered/meeting_set/payment_received = Successfully completed
  // - escalated = Handed off to human, awaiting resolution
  // - pending/unconfirmed = In progress, waiting for response
  // - error = System failure, needs manual intervention
  
  const operationsData = {
    clinic: {
      entityName: 'Patient',
      entityNamePlural: 'Patients',
      slotLabel: 'Appointment',
      idPrefix: 'APT',
      records: [
        // CONFIRMED - Successfully completed via automation
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
        // ESCALATED - Handed to human staff
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
        // PENDING - Awaiting response
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
        // ERROR - System failures
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
        // CONFIRMED
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
        // ESCALATED
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
        // PENDING
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
        // ERROR
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
        // CONFIRMED (meeting_set, payment_received)
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
        // ESCALATED
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
        // PENDING
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
        // ERROR
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
        // CONFIRMED (renewed, won_back)
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
        // ESCALATED
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
        // PENDING
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
        // ERROR
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

  const industryData = {
    clinic: {
      icon: '🏥',
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
            { icon: '✓', count: 28, label: 'proceeded normally', type: 'success', resolutions: [] },
            { icon: '⚠', count: 12, label: 'flagged as no-show risk', type: 'warning', resolutions: [
              { count: 10, label: 'confirmed through outreach', type: 'success' },
              { count: 2, label: 'escalated to front desk', type: 'warning' }
            ]},
            { icon: '✕', count: 5, label: 'cancelled by patients', type: 'danger', resolutions: [
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
          { id: 'whatsapp', name: 'WhatsApp', icon: '💬', sent: 12, read: 10, converted: 6 },
          { id: 'voice', name: 'Voice Calls', icon: '📞', sent: 6, read: 5, converted: 4 },
          { id: 'email', name: 'Email', icon: '✉️', sent: 4, read: 2, converted: 1 },
          { id: 'waitlist', name: 'Waitlist', icon: '🔄', sent: 5, read: 5, converted: 3 }
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
      conversations: operationsData.clinic.records.slice(0, 4).map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        event: r.slot,
        channel: r.timeline.find(t => t.action.includes('whatsapp') || t.action.includes('voice'))?.action.includes('voice') ? 'voice' : 'whatsapp',
        status: r.status,
        risk: r.riskScore,
        timeline: r.timeline.map(t => ({
          time: t.time,
          dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('system') || t.action.includes('status') || t.action.includes('escalation') || t.action.includes('match') || t.action.includes('assigned') || t.action.includes('released') ? 'system' : 'out',
          channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined,
          msg: t.message,
          status: t.status
        }))
      }))
    },
    hotel: {
      icon: '🏨',
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
      conversations: operationsData.hotel.records.map(r => ({
        id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'voice', status: r.status, risk: r.riskScore,
        timeline: r.timeline.map(t => ({ time: t.time, dir: t.action.includes('received') ? 'in' : t.action.includes('status') || t.action.includes('escalation') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
      }))
    },
    sales: {
      icon: '📊',
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
          { icon: '💰', count: 6, label: 'invoices overdue', type: 'info', resolutions: [
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
      conversations: operationsData.sales.records.map(r => ({
        id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'email', status: r.status, risk: r.riskScore,
        timeline: r.timeline.map(t => ({ time: t.time, dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('quote_sent') || t.action.includes('quote_viewed') || t.action.includes('escalation') || t.action.includes('meeting') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
      }))
    },
    insurance: {
      icon: '🛡️',
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
          { icon: '↩', count: 8, label: 'previously lapsed (win-back)', type: 'info', resolutions: [
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
      conversations: operationsData.insurance.records.map(r => ({
        id: r.id, name: r.name, phone: r.phone, event: r.slot, channel: 'whatsapp', status: r.status, risk: r.riskScore,
        timeline: r.timeline.map(t => ({ time: t.time, dir: t.action.includes('received') || t.action.includes('reply') ? 'in' : t.action.includes('renewal') || t.action.includes('payment') ? 'system' : 'out', channel: t.action.includes('whatsapp') ? 'whatsapp' : t.action.includes('voice') ? 'voice' : t.action.includes('email') ? 'email' : undefined, msg: t.message, status: t.status }))
      }))
    }
  };

  const data = industryData[selectedIndustry];
  const opsData = operationsData[selectedIndustry];
  const outcomes = data.outcomes[timePeriod];
  const capacity = data.capacity[timePeriod];
  const channels = data.channels[timePeriod];
  const timeLabel = data.timeLabels[timePeriod];
  const periodLabel = timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month';

  // ============ REUSABLE COMPONENTS ============

  const Card = ({ children, className = '', onClick, hover = false }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 ${hover ? 'cursor-pointer transition-all hover:border-gray-200 hover:shadow-lg' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  const Stat = ({ value, label, color, size = 'md' }) => (
    <div className="text-center">
      <div className={`font-bold ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'}`} style={{ color: color || theme.primary }}>{value}</div>
      <div className={`text-gray-500 ${size === 'lg' ? 'text-sm mt-1' : 'text-xs mt-0.5'}`}>{label}</div>
    </div>
  );

  const Badge = ({ children, type = 'default' }) => {
    const styles = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200',
      default: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>{children}</span>;
  };

  const ListRow = ({ icon, title, subtitle, right, onClick, last = false }) => (
    <div className={`flex items-center gap-4 p-5 ${!last ? 'border-b border-gray-50' : ''} ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`} onClick={onClick}>
      {icon && <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ background: theme.light }}>{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{title}</div>
        {subtitle && <div className="text-sm text-gray-500 truncate">{subtitle}</div>}
      </div>
      {right}
      {onClick && <span className="text-gray-300 text-sm">›</span>}
    </div>
  );

  const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false }) => {
    const base = 'font-medium rounded-xl transition-all disabled:opacity-50';
    const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3' };
    const variants = {
      primary: 'text-white',
      secondary: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
      ghost: 'text-gray-600 hover:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600'
    };
    return (
      <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} style={variant === 'primary' ? { background: theme.primary } : {}} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  };

  // ============ DASHBOARD COMPONENTS ============

  const Layer1Outcomes = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }].map(period => (
            <button key={period.id} onClick={() => setTimePeriod(period.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timePeriod === period.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <Card hover onClick={() => setDrillDownLevel(2)} className="overflow-hidden">
        <div className="p-8" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})` }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white/70 text-sm font-medium mb-4">{theme.name} • {periodLabel}</div>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-bold text-white">{outcomes.rate}%</span>
                <span className="text-white/80 text-xl">{data.capacityUnit} Utilization</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-1 rounded-lg bg-white/20 text-emerald-200 text-sm font-medium">↑ {outcomes.rate - outcomes.prev}%</span>
                <span className="text-white/60 text-sm">from {outcomes.prev}%</span>
              </div>
            </div>
            <div className="text-6xl opacity-30">{data.icon}</div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-2 text-white/80 text-sm">
            <span>See how NA2 achieved this {timeLabel}</span>
            <span>→</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🛡️', value: outcomes.prevented, label: 'Risks Prevented' },
          { icon: '↩️', value: outcomes.recovered, label: 'Recovered' },
          { icon: '₹', value: outcomes.revenue, label: 'Revenue Protected' }
        ].map((item, i) => (
          <Card key={i} hover onClick={() => setDrillDownLevel(2)} className="p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4" style={{ background: theme.light }}>{item.icon}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
            <div className="text-sm text-gray-500">{item.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  const Layer2Capacity = () => (
    <div className="space-y-6">
      <SectionHeader title={`How did NA2 achieve ${outcomes.rate}% ${data.capacityUnit} utilization?`} subtitle={`Complete ${data.capacityUnit.toLowerCase()} breakdown for ${timeLabel}`} />
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: theme.light }}>{data.icon}</div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{capacity.total}</div>
              <div className="text-sm text-gray-500">{capacity.label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>{capacity.filled} / {capacity.total}</div>
            <div className="text-sm text-gray-500">filled</div>
          </div>
        </div>
      </Card>
      <Card>
        {capacity.sections.map((section, idx) => (
          <div key={idx} className={`p-5 ${idx < capacity.sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${section.type === 'success' ? 'bg-emerald-50 text-emerald-600' : section.type === 'warning' ? 'bg-amber-50 text-amber-600' : section.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{section.icon}</div>
              <div className="flex-1"><div className="font-medium text-gray-900">{section.count} {data.capacityUnit.toLowerCase()} {section.label}</div></div>
              <div className="text-2xl font-bold text-gray-300">{section.count}</div>
            </div>
            {section.resolutions.length > 0 && (
              <div className="mt-4 space-y-2" style={{ marginLeft: '60px' }}>
                {section.resolutions.map((res, ridx) => (
                  <div key={ridx} className="flex items-center gap-3 py-2 px-4 rounded-xl bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${res.type === 'success' ? 'bg-emerald-500' : res.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <div className="flex-1 text-sm text-gray-600">{res.label}</div>
                    <div className={`text-sm font-semibold ${res.type === 'success' ? 'text-emerald-600' : res.type === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>{res.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>
      <Card hover onClick={() => setDrillDownLevel(3)} className="p-5">
        <div className="flex items-center justify-between">
          <div><div className="font-medium text-gray-900">See execution details</div><div className="text-sm text-gray-500">Channels, decisions, and conversations</div></div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: theme.primary }}>→</div>
        </div>
      </Card>
    </div>
  );

  // Helper to open customer in Operations
  const openInOperations = (customerName) => {
    setActiveView('operations');
    setSearchQuery(customerName);
    setStatusFilter('all');
    // Find and select the matching record
    const matchingRecord = opsData.records.find(r => r.name.toLowerCase().includes(customerName.toLowerCase()));
    if (matchingRecord) {
      setSelectedRecord(matchingRecord);
    }
  };

  const Layer3Channels = () => (
    <div className="space-y-6">
      <SectionHeader title="Execution Details" subtitle={`For trust, audits, and debugging • ${periodLabel}`} action={
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {['channel', 'customer'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {mode === 'channel' ? '📊 By Channel' : `👤 By ${data.entityName}`}
            </button>
          ))}
        </div>
      } />

      {/* Hint for Operations link when viewing by customer */}
      {viewMode === 'customer' && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>💡</span>
            <span>Click any {data.entityName.toLowerCase()} to see full audit trail, decisions, and take actions</span>
          </div>
          <button 
            onClick={() => { setActiveView('operations'); setStatusFilter('all'); }}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            Open Operations Console →
          </button>
        </div>
      )}

      <Card>
        {viewMode === 'channel' ? (
          channels.map((ch, idx) => (
            <ListRow key={ch.id} icon={ch.icon} title={ch.name} subtitle={`${ch.converted} conversions`} last={idx === channels.length - 1}
              onClick={() => { setSelectedChannel(ch); setSelectedCustomer(null); setDrillDownLevel(4); }}
              right={<div className="flex items-center gap-6 text-sm mr-4"><Stat value={ch.sent} label="Sent" size="sm" color="#6B7280" /><span className="text-gray-300">→</span><Stat value={ch.read} label="Read" size="sm" color="#6B7280" /><span className="text-gray-300">→</span><Stat value={ch.converted} label="Done" size="sm" color="#10B981" /></div>}
            />
          ))
        ) : (
          // Customer view - links to Operations
          opsData.records.slice(0, 6).map((record, idx) => (
            <ListRow 
              key={record.id} 
              icon={
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: theme.light, color: theme.primary }}>
                  {record.name.split(' ').map(n => n[0]).join('')}
                </div>
              }
              title={
                <div className="flex items-center gap-2">
                  <span>{record.name}</span>
                  {record.vip && <span className="text-amber-500 text-xs">⭐</span>}
                </div>
              }
              subtitle={record.slot}
              last={idx === 5}
              onClick={() => openInOperations(record.name)}
              right={
                <div className="flex items-center gap-3 mr-4">
                  <div className="text-right mr-2">
                    <div className={`text-sm font-bold ${record.riskScore > 70 ? 'text-red-500' : record.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {record.riskScore}%
                    </div>
                    <div className="text-xs text-gray-400">risk</div>
                  </div>
                  <Badge type={
                    ['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received'].includes(record.status) ? 'success' : 
                    record.status === 'escalated' ? 'warning' : 
                    record.status === 'error' ? 'danger' : 'info'
                  }>
                    {record.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              }
            />
          ))
        )}
      </Card>
      <Card className="p-5" style={{ background: theme.light }}>
        <div className="flex items-center justify-between">
          <div><div className="font-medium" style={{ color: theme.dark }}>Total Actions • {periodLabel}</div><div className="text-2xl font-bold" style={{ color: theme.primary }}>{channels.reduce((s, c) => s + c.sent, 0)} messages • {channels.length} channels</div></div>
          <div className="text-right"><div className="text-sm" style={{ color: theme.dark }}>Overall Conversion</div><div className="text-2xl font-bold text-emerald-600">{Math.round((channels.reduce((s, c) => s + c.converted, 0) / channels.reduce((s, c) => s + c.sent, 0)) * 100)}%</div></div>
        </div>
      </Card>
    </div>
  );

  const Layer4Conversations = () => {
    const conversations = selectedChannel ? data.conversations.filter(c => c.channel === selectedChannel.id) : selectedCustomer ? [selectedCustomer] : data.conversations;
    const channelStats = selectedChannel ? channels.find(c => c.id === selectedChannel.id) : null;

    if (conversations.length === 0) {
      return (
        <div className="space-y-6">
          <SectionHeader title="No conversations found" subtitle="Try selecting a different channel" />
          <Card className="p-12 text-center"><div className="text-4xl mb-4">📭</div><div className="text-gray-500">No conversations for this channel yet</div></Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionHeader title={selectedChannel ? `${selectedChannel.name} Conversations` : selectedCustomer ? selectedCustomer.name : 'All Conversations'} subtitle={`${conversations.length} conversation${conversations.length !== 1 ? 's' : ''} • ${periodLabel}`} />
        {selectedChannel && channelStats && (
          <Card className="p-5">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: theme.light }}>{selectedChannel.icon}</div>
              <div className="flex-1 flex items-center justify-around"><Stat value={channelStats.sent} label="Sent" /><div className="text-gray-300">→</div><Stat value={channelStats.read} label="Read" /><div className="text-gray-300">→</div><Stat value={channelStats.converted} label="Converted" color="#10B981" /></div>
            </div>
          </Card>
        )}
        {conversations.map(conv => (
          <Card key={conv.id}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: theme.light, color: theme.primary }}>{conv.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1"><div className="font-semibold text-gray-900">{conv.name}</div><div className="text-sm text-gray-500">{conv.phone}</div></div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><div className={`text-lg font-bold ${conv.risk > 70 ? 'text-red-500' : conv.risk > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{conv.risk}%</div><div className="text-xs text-gray-400">Risk</div></div>
                  <Badge type={['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received'].includes(conv.status) ? 'success' : conv.status === 'escalated' ? 'warning' : 'info'}>{conv.status.replace(/_/g, ' ').toUpperCase()}</Badge>
                </div>
              </div>
              <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: theme.light }}><div className="text-sm font-medium" style={{ color: theme.dark }}>{conv.event}</div></div>
            </div>
            <div className="p-5 bg-gray-50 space-y-4">
              {conv.timeline.map((item, idx) => (
                <div key={idx} className={`flex gap-3 ${item.dir === 'in' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${item.dir === 'system' ? 'bg-gray-200 text-gray-500' : item.dir === 'out' ? 'text-white' : 'text-white'}`} style={item.dir === 'out' ? { background: theme.primary } : item.dir === 'in' ? { background: '#10B981' } : {}}>{item.dir === 'system' ? '⚙' : item.dir === 'out' ? '→' : '←'}</div>
                  <div className={`max-w-[80%] ${item.dir === 'in' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${item.dir === 'system' ? 'bg-white border border-gray-200 text-gray-600 italic' : item.dir === 'out' ? 'bg-white border border-gray-200 text-gray-800' : 'text-white'}`} style={item.dir === 'in' ? { background: theme.primary } : {}}>{item.msg}</div>
                    <div className={`flex items-center gap-2 mt-1.5 text-xs text-gray-400 flex-wrap ${item.dir === 'in' ? 'justify-end' : ''}`}>
                      {item.channel && <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">{item.channel}</span>}
                      <span>{item.time}</span>
                      {item.status && <span className={`px-1.5 py-0.5 rounded ${item.status === 'delivered' || item.status === 'connected' || item.status === 'success' ? 'bg-emerald-100 text-emerald-600' : item.status === 'read' ? 'bg-blue-100 text-blue-600' : item.status === 'not_opened' || item.status === 'no_answer' || item.status === 'warning' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{item.status.replace(/_/g, ' ')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">{conv.timeline.length} interactions</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openInOperations(conv.name)}>View in Operations →</Button>
                <Button variant="secondary" size="sm">View Full History</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // ============ OPERATIONS CONSOLE ============

  const OperationsConsole = () => {
    // Filter records based on search and status
    // Note: Date filter is now optional - shows all records if date doesn't match any
    const recordsForDate = opsData.records.filter(r => r.date === searchDate);
    const recordsToUse = recordsForDate.length > 0 ? recordsForDate : opsData.records;
    
    const filteredRecords = recordsToUse.filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slotId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'errors' && r.status === 'error') ||
        (statusFilter === 'escalated' && r.status === 'escalated') ||
        (statusFilter === 'pending' && (r.status === 'unconfirmed' || r.status === 'pending')) ||
        (statusFilter === 'confirmed' && ['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received', 'rescheduled'].includes(r.status));

      return matchesSearch && matchesStatus;
    });

    const statusCounts = {
      all: recordsToUse.length,
      errors: recordsToUse.filter(r => r.status === 'error').length,
      escalated: recordsToUse.filter(r => r.status === 'escalated').length,
      pending: recordsToUse.filter(r => (r.status === 'unconfirmed' || r.status === 'pending')).length,
      confirmed: recordsToUse.filter(r => ['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received', 'rescheduled'].includes(r.status)).length
    };

    // Filter descriptions for clarity
    const filterDescriptions = {
      all: `All ${recordsToUse.length} records`,
      errors: 'System failures requiring manual fix (invalid contact info, delivery failures)',
      escalated: 'Handed off to human staff (complex queries, VIP handling, all attempts failed)',
      pending: 'Awaiting customer response (messages sent, no reply yet)',
      confirmed: 'Successfully completed (confirmed, renewed, recovered, meetings set)'
    };

    const getStatusBadgeType = (status) => {
      if (['confirmed', 'renewed', 'recovered', 'meeting_set', 'payment_received', 'won_back'].includes(status)) return 'success';
      if (['escalated', 'rescheduled'].includes(status)) return 'warning';
      if (['error', 'failed'].includes(status)) return 'danger';
      if (['unconfirmed', 'pending'].includes(status)) return 'info';
      return 'default';
    };

    const handleAction = (action, record) => {
      setShowActionModal({ action, record });
      setActionNote('');
    };

    const executeAction = () => {
      console.log('Executing action:', showActionModal.action, 'for', showActionModal.record.id, 'with note:', actionNote);
      setShowActionModal(null);
      setActionNote('');
    };

    return (
      <div className="space-y-6">
        {/* Search & Filters */}
        <Card className="p-5">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder={`Search by name, phone, ${opsData.idPrefix} ID, ${opsData.slotLabel.toLowerCase()} ID...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>
          
          {/* Filter Buttons with Descriptions */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All', icon: '📋' },
                { id: 'errors', label: 'Errors', icon: '🚨' },
                { id: 'escalated', label: 'Escalated', icon: '⚠️' },
                { id: 'pending', label: 'Pending', icon: '⏳' },
                { id: 'confirmed', label: 'Resolved', icon: '✓' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    statusFilter === filter.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={statusFilter === filter.id ? { background: theme.primary } : {}}
                >
                  {filter.icon} {filter.label}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${statusFilter === filter.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {statusCounts[filter.id]}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 px-1">
              {filterDescriptions[statusFilter]}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="flex gap-6">
          {/* Records List */}
          <div className="w-2/5 space-y-3">
            {filteredRecords.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-gray-500">No records found</div>
                <div className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</div>
              </Card>
            ) : (
              filteredRecords.map(record => (
                <Card
                  key={record.id}
                  hover
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 ${selectedRecord?.id === record.id ? 'ring-2' : ''}`}
                  style={selectedRecord?.id === record.id ? { '--tw-ring-color': theme.primary, borderColor: theme.light } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: theme.light, color: theme.primary }}>
                      {record.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{record.name}</span>
                        {record.vip && <span className="text-amber-500 text-xs">⭐ VIP</span>}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{record.slot}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge type={getStatusBadgeType(record.status)}>
                          {record.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-gray-400">{record.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${record.riskScore > 70 ? 'text-red-500' : record.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {record.riskScore}%
                      </div>
                      <div className="text-xs text-gray-400">Risk</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Record Detail */}
          <div className="flex-1">
            {selectedRecord ? (
              <Card className="overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold" style={{ background: theme.light, color: theme.primary }}>
                        {selectedRecord.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">{selectedRecord.name}</span>
                          {selectedRecord.vip && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">⭐ VIP</span>}
                        </div>
                        <div className="text-sm text-gray-500">{selectedRecord.phone} • {selectedRecord.email}</div>
                      </div>
                    </div>
                    <Badge type={getStatusBadgeType(selectedRecord.status)}>
                      {selectedRecord.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: theme.light }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{opsData.slotLabel}</div>
                        <div className="font-semibold" style={{ color: theme.dark }}>{selectedRecord.slot}</div>
                        <div className="text-sm text-gray-500">{selectedRecord.slotId} • {selectedRecord.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Risk Score</div>
                        <div className={`text-3xl font-bold ${selectedRecord.riskScore > 70 ? 'text-red-500' : selectedRecord.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {selectedRecord.riskScore}%
                        </div>
                      </div>
                    </div>
                    {selectedRecord.riskFactors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Risk Factors</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.riskFactors.map((factor, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-white text-xs text-gray-600">{factor}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-5 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Decision Audit Trail</div>
                  <div className="space-y-4">
                    {selectedRecord.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? 'bg-emerald-100 text-emerald-600' :
                          item.status === 'warning' || item.status === 'escalated' ? 'bg-amber-100 text-amber-600' :
                          item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' ? 'bg-red-100 text-red-600' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? '✓' :
                           item.status === 'warning' || item.status === 'escalated' ? '!' :
                           item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' ? '✕' : '•'}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-xl p-3 border border-gray-200">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm text-gray-800">{item.message}</div>
                                {item.decision && (
                                  <div className="mt-2 p-2 rounded-lg bg-gray-50 text-xs">
                                    <div className="text-gray-500">
                                      <span className="font-medium text-gray-700">Decision:</span> {item.decision.reason}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-gray-400">Confidence: <span className="font-medium" style={{ color: theme.primary }}>{item.decision.confidence}%</span></span>
                                      <span className="text-gray-400">Agent: <span className="font-medium text-gray-600">{item.decision.agent}</span></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-gray-400">{item.time}</div>
                                <div className="text-xs mt-1">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? 'bg-emerald-100 text-emerald-600' :
                                    item.status === 'warning' || item.status === 'escalated' ? 'bg-amber-100 text-amber-600' :
                                    item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' || item.status === 'not_opened' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>{item.status.replace(/_/g, ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {selectedRecord.notes.length > 0 && (
                    <div className="mt-6">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Manual Notes</div>
                      {selectedRecord.notes.map((note, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-amber-800">{note.by}</span>
                            <span className="text-xs text-amber-600">{note.time}</span>
                          </div>
                          <div className="text-amber-900">{note.note}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-gray-100 bg-white">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleAction('call', selectedRecord)}>📞 Call Now</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('message', selectedRecord)}>💬 Send Message</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('confirm', selectedRecord)}>✓ Mark Confirmed</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('reassign', selectedRecord)}>🔄 Reassign {opsData.capacityUnitSingular || 'Slot'}</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('note', selectedRecord)}>📝 Add Note</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction('flag', selectedRecord)}>🚨 Flag Issue</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">👈</div>
                <div className="text-gray-500 font-medium">Select a record to view details</div>
                <div className="text-sm text-gray-400 mt-1">Search by name, phone, or ID</div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowActionModal(null)}>
            <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showActionModal.action === 'call' && '📞 Call Patient'}
                {showActionModal.action === 'message' && '💬 Send Message'}
                {showActionModal.action === 'confirm' && '✓ Mark as Confirmed'}
                {showActionModal.action === 'reassign' && '🔄 Reassign Slot'}
                {showActionModal.action === 'note' && '📝 Add Note'}
                {showActionModal.action === 'flag' && '🚨 Flag Issue'}
              </h3>
              <div className="mb-4 p-3 rounded-xl bg-gray-50">
                <div className="font-medium text-gray-900">{showActionModal.record.name}</div>
                <div className="text-sm text-gray-500">{showActionModal.record.slot}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showActionModal.action === 'message' ? 'Message' : 'Note (optional)'}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                  rows={3}
                  placeholder={showActionModal.action === 'message' ? 'Type your message...' : 'Add a note about this action...'}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setShowActionModal(null)}>Cancel</Button>
                <Button onClick={executeAction}>
                  {showActionModal.action === 'call' ? 'Initiate Call' :
                   showActionModal.action === 'message' ? 'Send Message' :
                   showActionModal.action === 'confirm' ? 'Confirm' :
                   showActionModal.action === 'reassign' ? 'Reassign' :
                   showActionModal.action === 'note' ? 'Save Note' :
                   'Flag Issue'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // ============ STUDIO ============

  const AgentStudio = () => {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditingAgent, setIsEditingAgent] = useState(false);
    const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(null);
    const [testMessages, setTestMessages] = useState([]);
    const [testInput, setTestInput] = useState('');
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [selectedTestAgent, setSelectedTestAgent] = useState(null);

    // Real agent data matching NA2 platform
    const [studioAgents, setStudioAgents] = useState([
      { 
        id: 1, 
        name: 'Follow-up Agent', 
        model: 'gpt-4.1',
        modality: 'text',
        description: 'Creates scheduled reminders when appointments are successfully booked',
        status: 'active',
        performance: { tasks: 4, success: 100, label: 'Sent 4 reminders' },
        tools: ['Schedule Recurring Email', 'Schedule Recurring Voice', 'Delete Recurring Email'],
        lastActivity: '4d ago',
        instructions: '## ROLE: Post-Booking Communications Assistant\n\n### PRIMARY DIRECTIVE\nYou are a specialized assistant that activates **only after a new appointment has been successfully booked**.\nYour sole purpose is to **schedule a series of reminder emails** and After **lead confirms attendance for the appointment** or lead asked to stop the reminders. → **delete all scheduled reminders**.',
        followUpInstructions: '**Determine the reminders:**\n- Send 1 follow up reminder after 5 minutes of booking the appointment.\n- Compute the relevant date/time values and intervals from current date/time and appointment_start_time.',
        config: { llm: 'Open AI 4.1', maxTokens: 2000, temperature: 0.7 }
      },
      { 
        id: 2, 
        name: 'Lead Generation Agent', 
        model: 'gpt-4.1',
        modality: 'text',
        description: 'Handles lead intake and creates sessions from various sources',
        status: 'paused',
        performance: { tasks: 176, success: 99, label: 'Handled 176 tasks' },
        tools: ['Create session', 'Create session (batch)', 'Find leads'],
        lastActivity: '1w ago',
        instructions: '## ROLE: Lead Intake Specialist\n\nHandle cases where only uploaded data (such as contact lists or leads) is provided. Use this data to immediately create a lead session — no further steps, analysis, or actions should occur after the session is created.',
        followUpInstructions: '',
        config: { llm: 'Open AI 4.1', maxTokens: 2000, temperature: 0.5 }
      },
      { 
        id: 3, 
        name: 'No-Show Prevention Agent', 
        model: 'gpt-4.1',
        modality: 'text',
        description: 'Proactively prevents cancellations and no-shows',
        status: 'active',
        performance: { tasks: 0, success: 0, label: 'Handled 0 tasks' },
        tools: ['Check Calendar Availability', 'Send Mail'],
        lastActivity: '3w ago',
        instructions: '## ROLE: No-Show Prevention Specialist\n\nIf the user attempts to cancel a booked appointment or is not interested in booking, try to convince them to reconsider and retain the booking.',
        followUpInstructions: '',
        config: { llm: 'Open AI 4.1', maxTokens: 2000, temperature: 0.7 }
      },
      { 
        id: 4, 
        name: 'Booking Agent', 
        model: 'gpt-4.1',
        modality: 'text',
        description: 'Handles appointment booking and calendar management',
        status: 'active',
        performance: { tasks: 14, success: 100, label: 'Handled 14 Conversations' },
        tools: ['Check Calendar Availability', 'Cancel Appointment', 'Book Google Calendar'],
        lastActivity: '19h ago',
        instructions: '## ROLE: Appointment Booking Specialist\n\nInteract with the lead via email to confirm slot availability and complete the appointment booking. Politely encourage the lead to choose a suitable time, reassuring them about the benefits of timely care.',
        followUpInstructions: 'Proceed with booking if the slot is available, or offer alternatives if not, and stop only if the lead clearly declines to book.',
        config: { llm: 'Open AI 4.1', maxTokens: 2000, temperature: 0.7 }
      },
      { 
        id: 5, 
        name: '自動予約対応ボイスエージェント', 
        model: 'gpt-4o',
        modality: 'voice',
        description: 'Japanese voice agent for automated appointment handling',
        status: 'paused',
        performance: { tasks: 4, success: 100, label: 'Handled 4 Conversations' },
        tools: ['Check Calendar Availability', 'Cancel Appointment', 'Schedule Recurring Voice'],
        lastActivity: '19h ago',
        instructions: 'ROLE: You are a polite, human-like voice agent for a chiropractor clinic. You ALWAYS say you are calling from Yamada Clinic (Yamada Chiropractic Clinic, Osaka). Greet naturally like a human. Never say you\'re AI.\nSpeak in Japanese at all times unless the user explicitly asks to switch to another language.',
        followUpInstructions: '',
        config: { llm: 'Open AI 4o', maxTokens: 2000, temperature: 0.7 }
      },
      { 
        id: 6, 
        name: 'Feedback Agent', 
        model: 'gpt-4.1',
        modality: 'text',
        description: 'Collects feedback after appointments',
        status: 'active',
        performance: { tasks: 0, success: 0, label: 'Handled 0 tasks' },
        tools: ['Send Mail', 'Make Twilio call'],
        lastActivity: '2w ago',
        instructions: '## ROLE: Feedback Collection Specialist\n\nWhen the chiropractor updates the calendar event title or description indicating whether the lead attended or did not attend the session, this agent should trigger and initiate the feedback collection flow from the lead.',
        followUpInstructions: '',
        config: { llm: 'Open AI 4.1', maxTokens: 2000, temperature: 0.7 }
      }
    ]);

    // Starting Points (Triggers)
    const startingPoints = [
      { id: 1, name: 'Type Form Lead Generation', type: 'TypeForm', icon: '📝', color: '#7C3AED' },
      { id: 2, name: 'Test', type: 'Twilio Call_listener', icon: '🧪', color: '#EC4899' },
      { id: 3, name: 'Voice Listener', type: 'Twilio Call_listener', icon: '📞', color: '#06B6D4' },
      { id: 4, name: 'Pre Follow Up', type: 'Pre-Follow_up', icon: '📊', color: '#F59E0B' },
      { id: 5, name: 'Email Trigger', type: 'Email Listener', icon: '✉️', color: '#10B981' },
      { id: 6, name: 'Lead Generator', type: 'File Upload', icon: '📁', color: '#3B82F6' }
    ];

    // Workflow steps
    const workflowSteps = [
      { id: 1, title: 'Create Lead Session', description: 'Handle cases where only uploaded data (such as contact lists or leads) is provided. Use this data to immediately create a lead session — no further steps, analysis, or actions should occur after the session is created.', agents: ['Lead Generation Agent'] },
      { id: 2, title: 'Book an Appointment', description: 'Interact with the lead via email to confirm slot availability and complete the appointment booking. Politely encourage the lead to choose a suitable time, reassuring them about the benefits of timely care.', agents: ['Booking Agent'] },
      { id: 3, title: 'Follow-up Reminder', description: 'After successfully booking an appointment, schedule and send a follow-up reminder email.', agents: ['Follow-up Agent'] },
      { id: 4, title: 'No-Show Prevention', description: 'If the user attempts to cancel a booked appointment or Not interested in booking appointment, try to convince them to reconsider and retain the booking.', agents: ['No-Show Prevention Agent'] },
      { id: 5, title: 'Cancel an Appointment', description: 'If the user cannot be convinced to keep the appointment, proceed to cancel it.', agents: ['Booking Agent'] },
      { id: 6, title: 'Reschedule Appointment', description: 'Manage rescheduling by verifying details, canceling the old slot, and booking a new one through the booking agent.', agents: ['Booking Agent'] },
      { id: 7, title: 'Delete Follow Up Reminder', description: 'When the patient replies with an attendance confirmation (e.g., they will attend, be present, join, or are available) or lead asked to stop reminders, delete all follow up scheduled reminders.', agents: ['Follow-up Agent'] },
      { id: 8, title: 'Collect Feedback', description: 'When the chiropractor updates the calendar event indicating whether the lead attended, trigger feedback collection flow.', agents: ['Feedback Agent'] },
      { id: 9, title: 'Insurance Verification', description: 'When a patient provides insurance information, collect all required insurance details (patient info, insurance card details, subscriber info, accident info, and authorization requirements).', agents: ['Booking Agent'] }
    ];

    // Available tools for testing
    const availableTools = [
      'Check Calendar Availability', 'Cancel Appointment', 'Schedule Recurring Email',
      'List Upcoming Appointments', 'Book Google Calendar', 'Schedule Recurring Voice',
      'Delete Recurring Voice', 'Update Session Info', 'Manage Insurance Claims'
    ];

    const toggleAgentStatus = (agentId) => {
      setStudioAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
      ));
    };

    const sendTestMessage = () => {
      if (!testInput.trim()) return;
      setTestMessages(prev => [...prev, { role: 'user', content: testInput }]);
      setTestInput('');
      
      // Simulate agent response
      setTimeout(() => {
        setTestMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I understand you\'d like to schedule an appointment. Let me check the available slots for you. I can see openings tomorrow at 10:00 AM, 2:00 PM, and 4:30 PM. Which time works best for you?',
          tools: ['Check Calendar Availability']
        }]);
      }, 1500);
    };

    // Agent Card Component
    const AgentCard = ({ agent }) => (
      <Card 
        hover 
        onClick={() => { setSelectedAgent(agent); setIsEditingAgent(false); }}
        className={`p-5 ${selectedAgent?.id === agent.id ? 'ring-2' : ''}`}
        style={selectedAgent?.id === agent.id ? { '--tw-ring-color': theme.primary } : {}}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: theme.light }}>
              {agent.modality === 'voice' ? '🎤' : '💬'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{agent.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{agent.model}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${agent.modality === 'voice' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{agent.modality}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }} className="p-1.5 rounded-lg hover:bg-gray-100" title={agent.status === 'active' ? 'Pause' : 'Resume'}>
              {agent.status === 'active' ? '⏸️' : '▶️'}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100" title="Settings">⚙️</button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-red-400" title="Delete">🗑️</button>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Performance Snapshot</div>
          <div className="text-sm font-medium text-gray-800">
            {agent.performance.label} — <span className={agent.performance.success >= 90 ? 'text-emerald-600' : agent.performance.success >= 70 ? 'text-amber-600' : 'text-red-600'}>{agent.performance.success}% success</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1.5">Tools Used</div>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.slice(0, 3).map((tool, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                <span className="text-gray-400">⚡</span> {tool}
              </span>
            ))}
            {agent.tools.length > 3 && <span className="px-2 py-1 text-xs text-gray-400">+{agent.tools.length - 3} more</span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Last Activity: {agent.lastActivity}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setIsEditingAgent(true); }}>View / Edit</Button>
            <Button 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }}
              className={agent.status === 'active' ? '' : 'bg-emerald-500'}
            >
              {agent.status === 'active' ? '⏸ Pause' : '▶ Resume'}
            </Button>
          </div>
        </div>
      </Card>
    );

    // Agent Detail/Edit Panel
    const AgentDetailPanel = () => {
      if (!selectedAgent) return null;
      
      return (
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between" style={{ background: theme.light }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600">←</button>
                <h3 className="text-lg font-semibold text-gray-900">Agent Settings</h3>
              </div>
              <p className="text-sm text-gray-500">Configure {selectedAgent.name} and their capabilities</p>
            </div>
            <Button onClick={() => toggleAgentStatus(selectedAgent.id)}>
              {selectedAgent.status === 'active' ? '⏸ Pause Agent' : '▶ Resume Agent'}
            </Button>
          </div>

          {selectedAgent.status === 'active' && (
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-700">
              <span>💡</span> This agent is currently active. Pause the agent to make changes.
            </div>
          )}

          <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Basic Configuration */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Basic Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                  <input 
                    type="text" 
                    value={selectedAgent.name} 
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modalities</label>
                  <select 
                    value={selectedAgent.modality}
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50"
                  >
                    <option value="text">Text</option>
                    <option value="voice">Voice</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={selectedAgent.description}
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent Instructions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Agent Instructions</h4>
              <p className="text-sm text-gray-500 mb-3">Define how this agent should behave. Add rules, examples, or conditions.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea 
                    value={selectedAgent.instructions}
                    disabled={selectedAgent.status === 'active'}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50 disabled:text-gray-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Instructions</label>
                  <textarea 
                    value={selectedAgent.followUpInstructions}
                    disabled={selectedAgent.status === 'active'}
                    rows={3}
                    placeholder="Additional instructions for follow-up behavior..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Agent Tools */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Agent Tools</h4>
                  <p className="text-sm text-gray-500">Manage the tools your AI agent can use to perform actions</p>
                </div>
                <Button variant="secondary" size="sm" disabled={selectedAgent.status === 'active'}>+ Add Tool</Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedAgent.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme.light }}>
                      {tool.includes('Email') ? '✉️' : tool.includes('Voice') || tool.includes('Call') ? '📞' : tool.includes('Calendar') ? '📅' : '⚡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{tool}</div>
                      <div className="text-xs text-gray-500">
                        {tool.includes('Email') ? 'Mailing • Google' : tool.includes('Voice') || tool.includes('Call') ? 'Voice • Twilio' : 'System'}
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">📋</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LLM Connection</label>
                  <select 
                    value={selectedAgent.config.llm}
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50"
                  >
                    <option>Open AI 4.1</option>
                    <option>Open AI 4o</option>
                    <option>Claude 3.5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                  <input 
                    type="number" 
                    value={selectedAgent.config.maxTokens}
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={selectedAgent.config.temperature}
                    disabled={selectedAgent.status === 'active'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 flex justify-end">
            <Button variant="secondary" disabled={selectedAgent.status === 'active'}>View Only Mode</Button>
          </div>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        <SectionHeader 
          title="AI Agent Studio" 
          subtitle="Design, configure, and test your autonomous agents"
          action={
            <div className="flex gap-2">
              <Button variant="secondary">Import</Button>
              <Button>+ Create Agent</Button>
            </div>
          }
        />
        
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: 'agents', label: 'Team of Agents', icon: '🤖' }, 
            { id: 'workflows', label: 'Workspace Workflow', icon: '⚡' }, 
            { id: 'test', label: 'Test your Agent', icon: '🧪' },
            { id: 'memory', label: 'Memory', icon: '🧠' }, 
            { id: 'guardrails', label: 'Guardrails', icon: '🛡️' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setStudioTab(tab.id); setSelectedAgent(null); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${studioTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* AGENTS TAB */}
        {studioTab === 'agents' && (
          <div className="flex gap-6">
            {/* Agent List */}
            <div className={`${selectedAgent ? 'w-1/2' : 'w-full'} space-y-4 transition-all`}>
              <div className="grid grid-cols-1 gap-4">
                {studioAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* Agent Detail Panel */}
            {selectedAgent && (
              <div className="w-1/2">
                <AgentDetailPanel />
              </div>
            )}
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {studioTab === 'workflows' && (
          <div className="space-y-6">
            {/* Starting Points */}
            <Card className="p-5">
              <h4 className="font-semibold text-gray-900 mb-4">Starting Points</h4>
              <div className="flex flex-wrap gap-3">
                {startingPoints.map(sp => (
                  <div 
                    key={sp.id} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer hover:border-solid transition-all"
                    style={{ borderColor: sp.color + '40', background: sp.color + '10' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: sp.color + '20' }}>
                      {sp.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{sp.name}</div>
                      <div className="text-xs text-gray-500">{sp.type}</div>
                    </div>
                  </div>
                ))}
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all">
                  <span className="text-lg">+</span>
                  <span className="text-sm font-medium">Add Trigger</span>
                </button>
              </div>
            </Card>

            {/* Workflow Steps */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Test Workflow</h4>
                  <p className="text-sm text-gray-500">Define the workflow steps that agents will follow</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">📋 Versions</Button>
                  <Button size="sm">+ Add Step</Button>
                </div>
              </div>

              <div className="space-y-3">
                {workflowSteps.map((step, idx) => (
                  <div 
                    key={step.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedWorkflowStep?.id === step.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    onClick={() => setSelectedWorkflowStep(step)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900">{step.title}</div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">📋</button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Agents:</span>
                          {step.agents.map((agent, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: theme.light, color: theme.primary }}>
                              {agent}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Button>Save Workflow</Button>
              </div>
            </Card>
          </div>
        )}

        {/* TEST TAB */}
        {studioTab === 'test' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card className="p-5">
              <h4 className="font-semibold text-gray-900 mb-1">Test your Agent</h4>
              <p className="text-sm text-gray-500 mb-4">The sandbox where your AI Employee (and their team) can practice before going live</p>
              <div className="text-sm text-blue-600 mb-6 cursor-pointer hover:underline">💡 Need help testing? Ask your AI Employee to simulate scenarios →</div>

              {/* Agent Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{selectedTestAgent ? '1 Agent selected' : 'Select agents to test'}</label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 min-h-[48px]">
                  {selectedTestAgent ? (
                    <span className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: theme.light, color: theme.primary }}>
                      ⚡ {selectedTestAgent.name}
                      <button onClick={() => setSelectedTestAgent(null)} className="hover:text-red-500">×</button>
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Click an agent below to select</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {studioAgents.slice(0, 4).map(agent => (
                    <button 
                      key={agent.id}
                      onClick={() => setSelectedTestAgent(agent)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedTestAgent?.id === agent.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Tools */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Tools:</label>
                <div className="flex flex-wrap gap-2">
                  {availableTools.map((tool, i) => (
                    <span key={i} className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                      <span className="text-emerald-500">⚡</span> {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Test Configuration */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Test Configuration</h5>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Prompt</label>
                  <textarea 
                    rows={4}
                    placeholder="ROLE: You are a polite, human-like agent..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    defaultValue={selectedTestAgent?.instructions?.substring(0, 200) || ''}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vodice Provider</label>
                  <div className="flex gap-3">
                    {[
                      { name: 'Deepgram', sub: 'STT & TTS', icon: '🎙️' },
                      { name: 'Gemini', sub: 'Native audio', icon: '🔮' },
                      { name: 'OpenAI', sub: 'Realtime model', icon: '🤖' }
                    ].map(provider => (
                      <label key={provider.name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300">
                        <input type="radio" name="voice" className="accent-blue-500" />
                        <div className="text-lg">{provider.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files (Optional)</label>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-gray-400">
                    <span>📤</span> Upload Files
                  </button>
                </div>
              </div>

              <Button className="w-full" disabled={!selectedTestAgent}>Create Test Environment</Button>
            </Card>

            {/* Conversation Preview */}
            <div className="space-y-4">
              <Card className="p-5 flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-semibold text-gray-900">Conversation Preview</h4>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Real-time conversation between user and agent</p>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {testMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Start a conversation to see messages here
                    </div>
                  ) : (
                    testMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.content}
                          {msg.tools && (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1 text-xs text-gray-500">
                              <span>⚡</span> Used: {msg.tools.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <input 
                    type="text" 
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendTestMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200"
                    disabled={!selectedTestAgent}
                  />
                  <button 
                    onClick={sendTestMessage}
                    disabled={!selectedTestAgent || !testInput.trim()}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white disabled:opacity-50"
                  >
                    🎤
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 text-white">
                    ⚙️
                  </button>
                </div>
              </Card>

              {/* Execution Logs */}
              <Card className="p-5">
                <h4 className="font-semibold text-gray-900 mb-1">Execution Logs & Results</h4>
                <p className="text-sm text-gray-500 mb-4">Step-by-step breakdown of agent actions</p>
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm">Run a simulation to see execution logs</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MEMORY TAB */}
        {studioTab === 'memory' && (
          <Card>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🧠</div>
                <div>
                  <div className="font-semibold text-gray-900">NA2 Memory Layer</div>
                  <div className="text-sm text-gray-500">Learned patterns from execution</div>
                </div>
              </div>
            </div>
            {[
              { text: `${data.entityName}s respond better to WhatsApp in evenings`, confidence: 87 },
              { text: 'Voice calls have 3x success for same-day confirmations', confidence: 92 },
              { text: 'Second follow-up closes faster than third', confidence: 79 },
              { text: 'Calls after 6 PM have higher success rate', confidence: 84 }
            ].map((m, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0">
                <div className="text-sm text-gray-800 mb-3">"{m.text}"</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.confidence}%`, background: theme.primary }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: theme.primary }}>{m.confidence}%</span>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* GUARDRAILS TAB */}
        {studioTab === 'guardrails' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🔢', title: 'Contact Limits', desc: 'Max attempts per day', value: '3' },
              { icon: '🌙', title: 'Quiet Hours', desc: 'No outbound during', value: '10PM-7AM' },
              { icon: '⚠️', title: 'Escalation Threshold', desc: 'When confidence below', value: '60%' },
              { icon: '⭐', title: 'VIP Override', desc: 'Always escalate VIP', value: 'Enabled' }
            ].map((g, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="text-xl">{g.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{g.title}</div>
                    <div className="text-sm text-gray-500 mb-3">{g.desc}</div>
                    <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: theme.light, color: theme.primary }}>
                      {g.value}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Navigation helper
  const goToLevel = (level) => {
    setDrillDownLevel(level);
    if (level < 4) { setSelectedChannel(null); setSelectedCustomer(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: theme.primary }}>NA2</div>
            <span className="font-semibold text-gray-900">Next Action</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'operations', label: '🔍 Operations' },
              { id: 'studio', label: '🤖 Studio' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => { setActiveView(view.id); if (view.id === 'dashboard') goToLevel(1); if (view.id === 'operations') setSelectedRecord(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === view.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <select value={selectedIndustry} onChange={(e) => { setSelectedIndustry(e.target.value); goToLevel(1); setSelectedRecord(null); }} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white cursor-pointer">
            {Object.entries(colors).map(([key, val]) => (<option key={key} value={key}>{industryData[key].icon} {val.name}</option>))}
          </select>
        </div>
      </nav>

      {/* Layer Navigation (Dashboard only) */}
      {activeView === 'dashboard' && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2">
            {[{ level: 1, label: 'Outcomes' }, { level: 2, label: `${data.capacityUnit}` }, { level: 3, label: 'Channels' }, { level: 4, label: 'Conversations' }].map((layer, idx) => (
              <React.Fragment key={layer.level}>
                {idx > 0 && <span className="text-gray-300 text-sm">›</span>}
                <button onClick={() => layer.level <= drillDownLevel && goToLevel(layer.level)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${drillDownLevel === layer.level ? 'text-white' : drillDownLevel > layer.level ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-gray-300'}`} style={drillDownLevel === layer.level ? { background: theme.primary } : {}} disabled={layer.level > drillDownLevel}>{layer.label}</button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeView === 'dashboard' ? (
          drillDownLevel === 1 ? <Layer1Outcomes /> :
          drillDownLevel === 2 ? <Layer2Capacity /> :
          drillDownLevel === 3 ? <Layer3Channels /> :
          <Layer4Conversations />
        ) : activeView === 'operations' ? (
          <OperationsConsole />
        ) : (
          <AgentStudio />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <span className="text-sm text-gray-400"><span className="font-semibold" style={{ color: theme.primary }}>NA2</span> decides and executes — humans supervise</span>
      </footer>
    </div>
  );
};

export default NA2PlatformV6;
