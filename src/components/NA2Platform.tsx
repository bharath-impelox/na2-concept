import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import Lottie from 'lottie-react';
import doctorAnimation from '../assets/doctor.json';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import { operationsData, OperationRecord } from '../data/operationsData';
import { industryData } from '../data/industryData';
import { translations, Language } from '../i18n/translations';
import './NA2Platform.css';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import { AGENT_ENV_1, AGENT_ENV_1_WS, useWorkspace, useGetAgentListsQuery, useGetConnectionsQuery, useGetVoicesQuery } from './playground/mockApi';
import { useRealtimeAudio } from './playground/voice';
import { useForm } from 'react-hook-form';
import { 
  FileText, 
  Mic, 
  Bot, 
  Zap, 
  FlaskConical, 
  Brain, 
  Shield, 
  Phone, 
  BarChart3, 
  Mail, 
  Folder, 
  Calendar, 
  Upload, 
  Settings, 
  Trash2, 
  Pause, 
  Play, 
  MessageSquare, 
  RotateCcw, 
  AlertTriangle, 
  Search,
  Sparkles,
  Send,
  ArrowRight,
  DollarSign,
  Coins,
  Hash,
  Moon,
  Star,
  Clipboard,
  AlertCircle,
  Clock,
  Check,
  RefreshCw,
  ArrowLeft,
  Plus,
  MessageCircle,
  RotateCw as RotateCwIcon,
  X,
  UserPlus,
  TrendingDown
} from 'lucide-react';
import ChatWithAttachments, { Attachment } from './playground/attachment_chat';
import ConnectionSelect from './playground/connectionDropdown';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// NA2 Platform V6.1 - With Operations Console
// Four modes: Dashboard (top-down), Operations (bottom-up), Studio (config), Playground (test)

interface NA2PlatformProps {
  defaultView?: 'dashboard' | 'operations' | 'studio';
}

const NA2Platform = ({ defaultView = 'dashboard' }: NA2PlatformProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  // Determine active view from current route
  const getActiveView = (): 'dashboard' | 'operations' | 'studio' => {
    const path = location.pathname;
    if (path.startsWith('/operations')) return 'operations';
    if (path.startsWith('/studio')) return 'studio';
    return 'dashboard';
  };
  
  const [activeView, setActiveView] = useState<'dashboard' | 'operations' | 'studio'>(getActiveView());
  
  // Update activeView when route changes
  useEffect(() => {
    setActiveView(getActiveView());
  }, [location.pathname]);
  const [selectedIndustry, setSelectedIndustry] = useState<'clinic' | 'hotel' | 'sales' | 'insurance'>('clinic');
  const [language, setLanguage] = useState<Language>('en');
  const [drillDownLevel, setDrillDownLevel] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'channel' | 'customer'>('channel');
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month'>('today');
  const [studioTab, setStudioTab] = useState('agents');
  
  // Operations Console State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('2026-01-16');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<OperationRecord | null>(null);
  const [showActionModal, setShowActionModal] = useState<{ action: string; record: OperationRecord } | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Color system - Based on brand palette with slight industry variations
  // Main brand color: #1b44fe (Primary)
  // Primary gradient: radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)
  const primaryGradient = 'radial-gradient(88% 75%, rgb(27, 68, 254) 37.45%, rgb(83, 117, 254) 100%)';
  const colors = {
    clinic: { 
      primary: '#1b44fe',      // Main brand blue
      light: '#EBF1F8',         // Primary - Light 01
      dark: '#1538d4',         // Primary - Dark variant
      accent: '#2F7F4D',       // Success - Light 07 (healthcare green accent)
      name: 'Healthcare' 
    },
    hotel: { 
      primary: '#1b44fe',      // Main brand blue
      light: '#EBF1F8',         // Primary - Light 01
      dark: '#1538d4',         // Primary - Dark variant
      accent: '#5DA8A8',       // Data Visualization - Soft Teal (hospitality accent)
      name: 'Hospitality' 
    },
    sales: { 
      primary: '#1b44fe',      // Main brand blue
      light: '#EBF1F8',         // Primary - Light 01
      dark: '#1538d4',         // Primary - Dark variant
      accent: '#E6A157',       // Data Visualization - Soft Orange (sales accent)
      name: 'Sales & Trading' 
    },
    insurance: { 
      primary: '#1b44fe',      // Main brand blue
      light: '#EBF1F8',         // Primary - Light 01
      dark: '#1538d4',         // Primary - Dark variant
      accent: '#7FC8D8',       // Data Visualization - Soft Cyan (insurance accent)
      name: 'Insurance' 
    }
  };

  const theme = colors[selectedIndustry];
  const opsData = operationsData[selectedIndustry];
  const rawData = industryData[selectedIndustry];
  const t = translations[language];
  
  // Helper function to translate status (handles snake_case to camelCase conversion)
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, keyof typeof t.status> = {
      'won_back': 'wonBack',
      'meeting_set': 'meetingSet',
      'payment_received': 'paymentReceived',
      'not_opened': 'notOpened',
      'no_answer': 'noAnswer',
    };
    const translationKey = statusMap[status] || status;
    return t.status[translationKey as keyof typeof t.status] || status.replace(/_/g, ' ');
  };
  
  // Helper function to translate slot information (time and doctor prefix)
  const translateSlot = (slot: string): string => {
    if (!slot) return slot;
    
    // Pattern: "10:30 AM - Dr. Patel" or "Room 304 - Deluxe King" etc.
    if (language === 'ja') {
      // Replace AM/PM with Japanese equivalents
      let translated = slot.replace(/\bAM\b/g, t.operations.am);
      translated = translated.replace(/\bPM\b/g, t.operations.pm);
      
      // Replace "Dr." with Japanese equivalent
      translated = translated.replace(/\bDr\.\b/g, t.operations.doctorPrefix);
      
      return translated;
    }
    
    return slot;
  };
  
  // Get translated industry data
  const data = useMemo(() => {
    const industryT = t.industries[selectedIndustry] as any;
    const baseData = { ...rawData };
    
    // Translate capacity labels
    if (baseData.capacity) {
      const timeKeys: ('today' | 'week' | 'month')[] = ['today', 'week', 'month'];
      timeKeys.forEach(key => {
        if (baseData.capacity[key]) {
          const period = baseData.capacity[key];
          if (selectedIndustry === 'clinic') {
            period.label = key === 'today' ? industryT.slotsScheduledToday : 
                          key === 'week' ? industryT.slotsScheduledThisWeek : 
                          industryT.slotsScheduledThisMonth;
            period.sections.forEach((s: any) => {
              if (s.label === 'proceeded normally') s.label = industryT.proceededNormally;
              else if (s.label === 'flagged as no-show risk') s.label = industryT.flaggedAsNoShowRisk;
              else if (s.label === 'cancelled by patients') s.label = industryT.cancelledByPatients;
              s.resolutions.forEach((r: any) => {
                if (r.label === 'confirmed through outreach') r.label = industryT.confirmedThroughOutreach;
                else if (r.label === 'escalated to front desk') r.label = industryT.escalatedToFrontDesk;
                else if (r.label === 'filled from waitlist') r.label = industryT.filledFromWaitlist;
                else if (r.label === 'went empty') r.label = industryT.wentEmpty;
              });
            });
          } else if (selectedIndustry === 'hotel') {
            period.label = key === 'today' ? industryT.roomsScheduledToday : 
                          key === 'week' ? industryT.roomsScheduledThisWeek : 
                          industryT.roomsScheduledThisMonth;
            period.sections.forEach((s: any) => {
              if (s.label === 'confirmed bookings') s.label = industryT.proceededNormally;
              else if (s.label === 'flagged as cancellation risk') s.label = industryT.flaggedAsVacancyRisk;
              else if (s.label === 'cancelled by guests') s.label = industryT.cancelledByGuests;
              s.resolutions.forEach((r: any) => {
                if (r.label === 'confirmed arrival') r.label = industryT.confirmedThroughOutreach;
                else if (r.label === 'escalated to front office') r.label = industryT.escalatedToReception;
                else if (r.label === 're-booked same day' || r.label === 'filled from waitlist') r.label = industryT.filledFromWaitlist;
                else if (r.label === 'went vacant' || r.label === 'went empty') r.label = industryT.wentEmpty;
              });
            });
          } else if (selectedIndustry === 'sales') {
            period.label = key === 'today' ? industryT.quotesGeneratedToday : 
                          key === 'week' ? industryT.quotesGeneratedThisWeek : 
                          industryT.quotesGeneratedThisMonth;
            period.sections.forEach((s: any) => {
              if (s.label === 'progressing normally') s.label = industryT.proceededNormally;
              else if (s.label === 'going cold (5+ days)') s.label = industryT.flaggedAsGoingCold;
              else if (s.label === 'cancelled by customers') s.label = industryT.cancelledByCustomers;
              s.resolutions.forEach((r: any) => {
                if (r.label.includes('re-engaged')) r.label = industryT.confirmedThroughOutreach;
                else if (r.label.includes('escalated to manager') || r.label.includes('escalated to sales team')) r.label = industryT.escalatedToSalesTeam;
                else if (r.label.includes('converted') || r.label.includes('filled')) r.label = industryT.convertedFromFollowUp;
                else if (r.label.includes('lost') || r.label.includes('marked as lost')) r.label = industryT.lost;
              });
            });
          } else if (selectedIndustry === 'insurance') {
            period.label = key === 'today' ? industryT.policiesGeneratedToday : 
                          key === 'week' ? industryT.policiesGeneratedThisWeek : 
                          industryT.policiesGeneratedThisMonth;
            period.sections.forEach((s: any) => {
              if (s.label === 'progressing normally') s.label = industryT.proceededNormally;
              else if (s.label === 'flagged as renewal risk') s.label = industryT.flaggedAsRenewalRisk;
              else if (s.label === 'cancelled by customers') s.label = industryT.cancelledByCustomers;
              s.resolutions.forEach((r: any) => {
                if (r.label.includes('confirmed') || r.label.includes('renewed')) r.label = industryT.confirmedThroughOutreach;
                else if (r.label.includes('escalated')) r.label = industryT.escalatedToAgent;
                else if (r.label.includes('renewed')) r.label = industryT.renewedFromFollowUp;
                else if (r.label.includes('lapsed')) r.label = industryT.lapsed;
              });
            });
          }
        }
      });
    }
    
    // Translate channels
    if (baseData.channels) {
      ['today', 'week', 'month'].forEach(period => {
        if (baseData.channels[period]) {
          baseData.channels[period].forEach((ch: any) => {
            if (ch.id === 'whatsapp') ch.name = t.channels.whatsapp;
            else if (ch.id === 'voice') ch.name = t.channels.voiceCalls;
            else if (ch.id === 'email') ch.name = t.channels.email;
            else if (ch.id === 'waitlist') ch.name = t.channels.waitlist;
          });
        }
      });
    }
    
    // Translate entity name and capacity unit
    baseData.entityName = industryT.entityName;
    baseData.capacityUnit = industryT.capacityUnit;
    baseData.capacityUnitSingular = industryT.capacityUnitSingular;
    
    return baseData;
  }, [rawData, selectedIndustry, language, t]);
  const outcomes = data.outcomes[timePeriod];
  const capacity = data.capacity[timePeriod];
  const channels = data.channels[timePeriod];
  const timeLabel = timePeriod === 'today' ? t.common.today : timePeriod === 'week' ? t.common.thisWeek : t.common.thisMonth;
  const periodLabel = timePeriod === 'today' ? t.common.today : timePeriod === 'week' ? t.common.thisWeek : t.common.thisMonth;

  // ============ REUSABLE COMPONENTS ============

  const Card = ({ children, className = '', onClick, hover = false }) => (
    <div className={`bg-white rounded-3xl border border-[#E5E5EA] shadow-sm ${hover ? 'cursor-pointer transition-all duration-300 hover:border-[#D1D1D6] hover:shadow-lg hover:-translate-y-0.5' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-[#2A2A2A] tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-[#7C7C7C] mt-2 font-medium">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  const Stat = ({ value, label, color, size = 'md' }) => (
    <div className="text-center">
      <div className={`font-bold ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'}`} style={{ color: color || theme.primary }}>{value}</div>
      <div className={`text-[#7C7C7C] ${size === 'lg' ? 'text-sm mt-1' : 'text-xs mt-0.5'}`}>{label}</div>
    </div>
  );

  const Badge = ({ children, type = 'default' }) => {
    const styles = {
      success: 'bg-[#E9FAEF] text-[#2F7F4D] border-[#9FDFB7]',
      warning: 'bg-[#FEF4E5] text-[#C8641B] border-[#FAC38D]',
      danger: 'bg-[#FDECEE] text-[#D9363E] border-[#F4BFC3]',
      info: 'bg-[#EBF1F8] text-[#1b44fe] border-[#C0D4E8]',
      default: 'bg-[#F5F5F5] text-[#5E5E5E] border-[#DBDBDB]'
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>{children}</span>;
  };

  // Channel icon mapping
  const getChannelIcon = (channelId: string) => {
    switch (channelId) {
      case 'whatsapp':
        return MessageCircle;
      case 'voice':
        return Phone;
      case 'email':
        return Mail;
      case 'waitlist':
        return RotateCwIcon;
      default:
        return MessageSquare;
    }
  };

  // Industry icon mapping
  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'clinic':
        return BarChart3;
      case 'hotel':
        return BarChart3;
      case 'sales':
        return BarChart3;
      case 'insurance':
        return Shield;
      default:
        return BarChart3;
    }
  };

  const ListRow = ({ icon, title, subtitle, right, onClick, last = false }) => {
    const IconComponent = typeof icon === 'string' ? getChannelIcon(icon) : icon;
    return (
      <div className={`flex items-center gap-4 p-5 ${!last ? 'border-b border-[#F2F2F7]' : ''} ${onClick ? 'cursor-pointer hover:bg-[#FBFBFB] transition-colors' : ''}`} onClick={onClick}>
        {icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: theme.light }}>
            {typeof icon === 'string' ? (
              <IconComponent className="w-5 h-5" style={{ color: theme.primary }} />
            ) : (
              React.createElement(icon, { className: "w-5 h-5", style: { color: theme.primary } })
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#2A2A2A] truncate">{title}</div>
          {subtitle && <div className="text-sm text-[#7C7C7C] truncate font-medium">{subtitle}</div>}
        </div>
        {right}
        {onClick && <span className="text-[#BEBEC2] text-sm">›</span>}
      </div>
    );
  };

  const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false }) => {
    const base = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2';
    const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3' };
    const variants = {
      primary: 'text-white shadow-md hover:shadow-lg',
      secondary: 'border border-[#D1D1D6] text-[#383838] hover:bg-[#FBFBFB]',
      ghost: 'text-[#5E5E5E] hover:bg-[#F5F5F5]',
      danger: 'bg-[#D9363E] text-white hover:bg-[#C72B32] shadow-md'
    };
    return (
      <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} style={variant === 'primary' ? { background: primaryGradient } : {}} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  };

  // ============ CHART COMPONENTS ============

  // Utilization Trend Chart (Line/Area chart)
  const UtilizationTrendChart = () => {
    const periods = ['today', 'week', 'month'];
    const rates = periods.map(p => data.outcomes[p as keyof typeof data.outcomes].rate);
    const maxRate = Math.max(...rates, 100);
    const heights = rates.map(r => (r / maxRate) * 100);

    return (
      <div className="p-6 flex flex-col h-full">
            <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">{t.dashboard.utilizationTrend}</h3>
          <p className="text-xs text-[#7C7C7C]">{t.dashboard.acrossTimePeriods}</p>
        </div>
        <div className="flex items-end justify-between gap-3 h-32 flex-1">
          {periods.map((period, idx) => {
            const isActive = timePeriod === period;
            return (
              <div key={period} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 relative group"
                    style={{
                      height: `${heights[idx]}%`,
                      background: isActive
                        ? primaryGradient
                        : `linear-gradient(180deg, ${theme.light}, ${theme.primary}40)`,
                      minHeight: '8px'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-[#2A2A2A] text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold">{rates[idx]}%</div>
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-xs font-semibold ${isActive ? 'text-[#2A2A2A]' : 'text-[#A5A5A5]'}`}>
                  {period === 'today' ? t.common.today : period === 'week' ? t.common.week : t.common.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Channel Performance Chart (Bar chart)
  const ChannelPerformanceChart = () => {
    // Icon mapping for channels
    const getChannelIcon = (channelId: string) => {
      const iconMap: { [key: string]: any } = {
        'whatsapp': MessageCircle,
        'voice': Phone,
        'email': Mail,
        'waitlist': RefreshCw
      };
      return iconMap[channelId.toLowerCase()] || MessageSquare;
    };

    // Color mapping for channels
    const getChannelColor = (channelId: string) => {
      const colorMap: { [key: string]: string } = {
        'whatsapp': '#25D366',
        'voice': '#1b44fe',
        'email': '#EA4335',
        'waitlist': '#8B5CF6'
      };
      return colorMap[channelId.toLowerCase()] || '#7C7C7C';
    };

    const channelData = channels.map(ch => ({
      id: ch.id || ch.name.toLowerCase().replace(/\s+/g, ''),
      name: ch.name,
      sent: ch.sent,
      converted: ch.converted,
      conversionRate: ch.sent > 0 ? (ch.converted / ch.sent) * 100 : 0
    }));
    const maxSent = Math.max(...channelData.map(d => d.sent), 1);

    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">{t.dashboard.channelPerformance}</h3>
          <p className="text-xs text-[#7C7C7C]">{t.dashboard.messagesSentVsConverted}</p>
        </div>
        <div className="space-y-4 flex-1">
          {channelData.map((ch, idx) => {
            const IconComponent = getChannelIcon(ch.id);
            const iconColor = getChannelColor(ch.id);
            
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ 
                        background: `${iconColor}15`,
                        border: `1px solid ${iconColor}30`
                      }}
                    >
                      <IconComponent className="w-3.5 h-3.5" style={{ color: iconColor }} />
                    </div>
                    <span className="font-semibold text-[#383838]">{ch.name}</span>
                  </div>
                  <span className="text-[#7C7C7C] font-medium">{ch.converted}/{ch.sent} ({Math.round(ch.conversionRate)}%)</span>
                </div>
                <div className="flex gap-1 h-6">
                  <div
                    className="rounded-l-md transition-all duration-500"
                    style={{
                      width: `${(ch.sent / maxSent) * 100}%`,
                      background: theme.light,
                      minWidth: '4px'
                    }}
                  />
                  <div
                    className="rounded-r-md transition-all duration-500"
                    style={{
                      width: `${(ch.converted / maxSent) * 100}%`,
                      background: primaryGradient,
                      minWidth: '4px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Risk Breakdown Chart (Donut chart)
  const RiskBreakdownChart = () => {
    const total = capacity.total;
    const sections = capacity.sections;
    const totalAtRisk = sections.reduce((sum, s) => sum + (s.type === 'warning' || s.type === 'danger' ? s.count : 0), 0);
    const safe = sections.find(s => s.type === 'success')?.count || 0;
    const risk = totalAtRisk;

    const chartData = {
      labels: [t.dashboard.safe, t.dashboard.atRisk],
      datasets: [
        {
          data: [safe, risk],
          backgroundColor: [
            'rgba(27, 68, 254, 0.6)',  // Primary blue with transparency for safe
            'rgba(239, 68, 68, 0.6)'   // Red with transparency for at-risk
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            'rgba(27, 68, 254, 0.85)', // More opaque on hover
            'rgba(239, 68, 68, 0.85)'
          ],
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%', // Makes it a doughnut chart with 70% inner radius
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 15,
            font: {
              size: 12,
              weight: '600' as const,
            },
            color: '#383838',
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#2A2A2A',
          padding: 12,
          titleFont: {
            size: 13,
            weight: '600' as const,
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
      },
    };

    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">{t.dashboard.riskBreakdown}</h3>
          <p className="text-xs text-[#7C7C7C]">{t.dashboard.safe} vs {t.dashboard.atRisk.toLowerCase()} {data.capacityUnit.toLowerCase()}</p>
        </div>
        <div className="h-64 flex-1">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    );
  };

  // Revenue Trend Chart
  const RevenueTrendChart = () => {
    const periods = ['today', 'week', 'month'];
    const revenues = periods.map(p => {
      const rev = data.outcomes[p as keyof typeof data.outcomes].revenue;
      return parseFloat(rev.replace(/[₹,L]/g, '')) * (rev.includes('Cr') ? 100 : 1);
    });
    const maxRev = Math.max(...revenues, 1);
    const heights = revenues.map(r => (r / maxRev) * 100);

    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">{t.dashboard.revenueProtected}</h3>
          <p className="text-xs text-[#7C7C7C]">{t.dashboard.cumulativeProtection}</p>
        </div>
        <div className="flex items-end justify-between gap-3 h-32 flex-1">
          {periods.map((period, idx) => {
            const isActive = timePeriod === period;
            const rev = data.outcomes[period as keyof typeof data.outcomes].revenue;
            return (
              <div key={period} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 relative group"
                    style={{
                      height: `${heights[idx]}%`,
                      background: isActive
                        ? `linear-gradient(180deg, #2F7F4D, #1C5331)`
                        : `linear-gradient(180deg, #E9FAEF, #2F7F4D40)`,
                      minHeight: '8px'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-[#2A2A2A] text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold">{rev}</div>
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-xs font-semibold ${isActive ? 'text-[#2A2A2A]' : 'text-[#A5A5A5]'}`}>
                  {period === 'today' ? t.common.today : period === 'week' ? t.common.week : t.common.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============ DASHBOARD COMPONENTS ============

  // Booked VS Unbooked Slots Chart (Healthcare only)
  const BookedVSUnbookedSlotsChart = () => {
    const booked = capacity.filled || 0;
    const unbooked = capacity.total - booked;

    const chartData = {
      labels: ['Booked', 'Unbooked'],
      datasets: [
        {
          label: 'Slots',
          data: [booked, unbooked],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // Bright emerald green for booked
            'rgba(245, 158, 11, 0.8)'   // Bright amber/orange for unbooked
          ],
          borderWidth: 0,
          borderRadius: 8,
          hoverBackgroundColor: [
            'rgba(16, 185, 129, 1)',    // Solid bright green on hover
            'rgba(245, 158, 11, 1)'     // Solid bright orange on hover
          ],
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 15,
            font: {
              size: 12,
              weight: '600' as const,
            },
            color: '#383838',
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#2A2A2A',
          padding: 12,
          titleFont: {
            size: 13,
            weight: '600' as const,
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed.y || 0;
              const total = booked + unbooked;
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 11,
            },
            color: '#7C7C7C',
          },
          grid: {
            display: false,
          },
        },
        x: {
          ticks: {
            font: {
              size: 11,
            },
            color: '#383838',
            font: {
              weight: '600' as const,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    };

    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">Booked VS Unbooked Slots</h3>
          <p className="text-xs text-[#7C7C7C]">Current slot utilization breakdown</p>
        </div>
        <div className="h-64 flex-1">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  // Patient Visits Vs No Show Chart (Healthcare only)
  const PatientVisitsVsNoShowChart = () => {
    const sections = capacity.sections;
    const visits = sections.find(s => s.type === 'success')?.count || 0;
    const noShows = sections.find(s => s.type === 'danger')?.count || 0;
    const total = visits + noShows;
    const visitsPercent = total > 0 ? (visits / total) * 100 : 0;
    const noShowsPercent = total > 0 ? (noShows / total) * 100 : 0;

    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#383838] mb-1">Patient Visits Vs No Show</h3>
          <p className="text-xs text-[#7C7C7C]">Visit completion rate analysis</p>
        </div>
        <div className="flex items-center justify-center gap-8 flex-1">
          <div className="relative w-36 h-36">
            <svg className="transform -rotate-90 w-36 h-36 drop-shadow-lg">
              <defs>
                <linearGradient id="visitsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="noShowsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r="50"
                stroke="#F3F4F6"
                strokeWidth="10"
                fill="none"
              />
              {/* Visits circle - bright green gradient */}
              <motion.circle
                cx="72"
                cy="72"
                r="50"
                stroke="url(#visitsGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - visitsPercent / 100) }}
                transition={{ duration: 1.5, delay: 0.3 }}
                strokeLinecap="round"
                filter="drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"
              />
              {/* No Shows circle - starts after visits */}
              <motion.circle
                cx="72"
                cy="72"
                r="50"
                stroke="url(#noShowsGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50 * noShowsPercent / 100} ${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - visitsPercent / 100) }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - visitsPercent / 100) }}
                transition={{ duration: 1.5, delay: 0.5 }}
                strokeLinecap="round"
                filter="drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {Math.round(visitsPercent)}%
              </motion.span>
              <span className="text-xs text-[#7C7C7C] font-medium">Visits</span>
            </div>
          </div>
          <div className="space-y-4">
            <motion.div 
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#10B981]/10 to-[#34D399]/10 border border-[#10B981]/20"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-sm" />
              <div>
                <div className="text-sm font-bold text-[#383838]">Visits</div>
                <div className="text-xs text-[#7C7C7C] font-medium">{visits} patients</div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F59E0B]/10 to-[#FBBF24]/10 border border-[#F59E0B]/20"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] shadow-sm" />
              <div>
                <div className="text-sm font-bold text-[#383838]">No Shows</div>
                <div className="text-xs text-[#7C7C7C] font-medium">{noShows} patients</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  // Mini Event Calendar (Healthcare only)
  const MiniEventCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Mock events data
    const events = {
      15: { count: 12, type: 'high' },
      18: { count: 8, type: 'medium' },
      22: { count: 15, type: 'high' },
      25: { count: 5, type: 'low' },
      28: { count: 10, type: 'medium' }
    };

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Get next 7 days with events
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayNum = date.getDate();
      const event = events[dayNum as keyof typeof events];
      next7Days.push({ day: dayNum, date, event, isToday: i === 0 });
    }

    return (
      <div className="p-3 w-full">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: primaryGradient }}>
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#2A2A2A]">Upcoming Appointments</h3>
              <p className="text-[9px] text-[#7C7C7C]">Next 7 days</p>
            </div>
          </div>
        </div>

        {/* Calendar Days - Show 3 items, rest scrollable */}
        <div className="max-h-[180px] overflow-y-auto overflow-x-hidden space-y-1.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
          {next7Days.map((item, idx) => {
            const weekdayName = item.date.toLocaleDateString('en-US', { weekday: 'short' });
            const isWeekend = item.date.getDay() === 0 || item.date.getDay() === 6;
            
            return (
              <motion.div
                key={idx}
                className={`group relative flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  item.isToday 
                    ? 'bg-gradient-to-r from-[#1b44fe]/10 to-[#5375fe]/10 border-2 border-[#1b44fe]/30 shadow-md shadow-[#1b44fe]/10' 
                    : 'bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-sm'
                } ${isWeekend ? 'opacity-75' : ''}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.01, x: 2 }}
              >
                {/* Today indicator glow */}
                {item.isToday && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ background: primaryGradient }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
                
                {/* Left side - Day info */}
                <div className="flex items-center gap-2">
                  {/* Day number circle */}
                  <motion.div
                    className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center font-bold ${
                      item.isToday 
                        ? 'text-white shadow-md' 
                        : 'bg-gradient-to-br from-white to-gray-50 text-[#383838] border border-gray-200'
                    }`}
                    style={item.isToday ? { background: primaryGradient } : {}}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className={`text-[8px] leading-none ${item.isToday ? 'text-white/80' : 'text-[#7C7C7C]'}`}>
                      {weekdayName.substring(0, 3).toUpperCase()}
                    </span>
                    <span className={`text-xs leading-none ${item.isToday ? 'text-white' : 'text-[#2A2A2A]'}`}>
                      {item.day}
                    </span>
                  </motion.div>

                  {/* Date info */}
                  <div>
                    <div className={`text-[10px] font-semibold ${item.isToday ? 'text-[#1b44fe]' : 'text-[#2A2A2A]'}`}>
                      {item.date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    {item.event && (
                      <div className="text-[9px] text-[#7C7C7C]">
                        {item.event.count} appointment{item.event.count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Event indicator */}
                {item.event && (
                  <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 + 0.2 }}
                  >
                    <div className={`px-2 py-1 rounded-md font-semibold text-[10px] flex items-center gap-1 shadow-sm ${
                      item.event.type === 'high' 
                        ? 'bg-gradient-to-r from-[#D9363E] to-[#EF4444] text-white' 
                        : item.event.type === 'medium'
                        ? 'bg-gradient-to-r from-[#E6A157] to-[#F59E0B] text-white'
                        : 'bg-gradient-to-r from-[#2F7F4D] to-[#10B981] text-white'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.event.type === 'high' ? 'bg-white/80' :
                        item.event.type === 'medium' ? 'bg-white/80' : 'bg-white/80'
                      }`} />
                      <span>{item.event.count}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary footer */}
        <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[9px]">
          <span className="text-[#7C7C7C] font-medium">
            Days with appointments
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[#D9363E]" />
            <div className="w-1 h-1 rounded-full bg-[#E6A157]" />
            <div className="w-1 h-1 rounded-full bg-[#2F7F4D]" />
          </div>
        </div>
      </div>
    );
  };

  // Animated Number Component
  const AnimatedNumber = ({ value, duration = 2 }: { value: number | string; duration?: number }) => {
    // If value is a string, display it directly
    if (typeof value === 'string') {
      return <motion.span>{value}</motion.span>;
    }

    // If value is not a valid number, return 0
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    const spring = useSpring(0, { duration: duration * 1000 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
      spring.set(numValue);
    }, [spring, numValue]);

    return <motion.span>{display}</motion.span>;
  };

  const Layer1Outcomes = () => {
    const allOutcomes = {
      today: data.outcomes.today,
      week: data.outcomes.week,
      month: data.outcomes.month
    };

    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      }
    };

    const cardVariants = {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      },
      hover: {
        scale: 1.02,
        transition: {
          duration: 0.2
        }
      }
    };

    return (
      <motion.div 
        ref={containerRef}
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="flex items-center justify-between" variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold text-[#2A2A2A] tracking-tight">{t.dashboard.title}</h1>
            <p className="text-[#7C7C7C] mt-1.5 font-medium">{t.dashboard.subtitle} {timeLabel}</p>
          </div>
          <div className="flex gap-2 p-1.5 bg-[#FBFBFB] rounded-2xl border border-[#E5E5EA]">
            {[{ id: 'today', label: t.common.today }, { id: 'week', label: t.common.week }, { id: 'month', label: t.common.month }].map(period => (
              <motion.button
                key={period.id}
                onClick={() => setTimePeriod(period.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  timePeriod === period.id
                    ? 'bg-white text-[#383838] shadow-md'
                    : 'text-[#7C7C7C] hover:text-[#5E5E5E]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Hero Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
        >
          <Card hover onClick={() => setDrillDownLevel(2)} className="overflow-hidden border-0 shadow-lg cursor-pointer">
            <motion.div 
              className="p-10" 
              style={{ background: primaryGradient }}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-white/80 text-sm font-semibold uppercase tracking-wider">{t.industries[selectedIndustry].name.toUpperCase()}</div>
                    <div className="h-1 w-1 rounded-full bg-white/40" />
                    <div className="text-white/60 text-sm font-medium">{periodLabel}</div>
                  </motion.div>
                  <div className="flex items-baseline gap-4 mb-4">
                    <motion.span 
                      className="text-8xl font-extrabold text-white tracking-tight"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                    >
                      <AnimatedNumber value={outcomes.rate} />%
                    </motion.span>
                    <motion.div 
                      className="flex flex-col"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="text-white/90 text-xl font-semibold">{data.capacityUnit} {t.dashboard.utilization}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <motion.span 
                          className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: "spring" }}
                        >
                          ↑ <AnimatedNumber value={outcomes.rate - outcomes.prev} />
                        </motion.span>
                        <span className="text-white/60 text-sm">{t.dashboard.from} {outcomes.prev}%</span>
                      </div>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="mt-8 pt-6 border-t border-white/20 flex items-center gap-3 text-white/90 text-sm font-medium cursor-pointer group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ x: 5 }}
                  >
                    <span>{t.dashboard.seeHowAchieved} {timeLabel}</span>
                    <motion.span 
                      className="group-hover:translate-x-1 transition-transform"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </div>
                {selectedIndustry === 'clinic' ? (
                  <motion.div 
                    className="ml-8"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 50 }}
                  >
                    <Lottie 
                      animationData={doctorAnimation} 
                      loop={true}
                      className="w-80 h-80"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="opacity-20 ml-8"
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 0.2, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 50 }}
                  >
                    {React.createElement(getIndustryIcon(selectedIndustry), { className: "w-16 h-16", style: { color: theme.primary } })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div 
          className={`grid gap-6 ${selectedIndustry === 'clinic' ? 'grid-cols-4' : 'grid-cols-3'}`}
          variants={containerVariants}
        >
          {selectedIndustry === 'clinic' ? (
            <>
              {/* Row 1: Total Appointments, Unique Patients, No Show Rate, Upcoming Appointments */}
              {[
                { icon: Calendar, value: capacity.total, label: 'Total Appointments', color: '#1b44fe' },
                { icon: UserPlus, value: capacity.total - 5, label: 'Unique Patients', color: '#8B5CF6' },
                { icon: TrendingDown, value: '12%', label: 'No Show Rate', color: '#EF4444' },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card hover onClick={() => setDrillDownLevel(2)} className="p-8 border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <motion.div 
                        className="flex items-start justify-between mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Icon container with color border */}
                          <motion.div 
                            className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" 
                            style={{ 
                              background: `${item.color}15`,
                              border: `1px solid ${item.color}30`
                            }}
                          >
                            <IconComponent 
                              className="w-8 h-8" 
                              style={{ 
                                color: item.color
                              }} 
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm" 
                          style={{ background: item.color }}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                      </motion.div>
                      <motion.div 
                        className="text-4xl font-extrabold text-[#2A2A2A] mb-2 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                      >
                        <AnimatedNumber value={item.value} />
                      </motion.div>
                      <div className="text-sm font-semibold text-[#7C7C7C] uppercase tracking-wide">{item.label}</div>
                    </Card>
                  </motion.div>
                );
              })}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/60 overflow-hidden">
                  <MiniEventCalendar />
                </Card>
              </motion.div>
              {/* Row 2: Charts below Total Appointments */}
              <motion.div variants={itemVariants} className="h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <RiskBreakdownChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <BookedVSUnbookedSlotsChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants} className="col-span-2 h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <PatientVisitsVsNoShowChart />
                </Card>
              </motion.div>
              {/* Row 3: Risks Prevented, Recovered, Revenue Protected - Full width */}
              {[
                { icon: Shield, value: outcomes.prevented, label: t.dashboard.risksPrevented, color: '#2F7F4D' },
                { icon: RotateCcw, value: outcomes.recovered, label: t.dashboard.recovered, color: theme.primary },
                { icon: Coins, value: outcomes.revenue, label: t.dashboard.revenueProtectedLabel, color: theme.accent || '#E6A157' }
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={i + 3}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="col-span-1"
                    style={{ gridColumn: i === 0 ? '1 / 2' : i === 1 ? '2 / 3' : '3 / 5' }}
                  >
                    <Card hover onClick={() => setDrillDownLevel(2)} className="p-8 border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <motion.div 
                        className="flex items-start justify-between mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + (i + 3) * 0.1 }}
                      >
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Icon container with color border */}
                          <motion.div 
                            className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" 
                            style={{ 
                              background: `${item.color}15`,
                              border: `1px solid ${item.color}30`
                            }}
                          >
                            <IconComponent 
                              className="w-8 h-8" 
                              style={{ 
                                color: item.color
                              }} 
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm" 
                          style={{ background: item.color }}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: (i + 3) * 0.3 }}
                        />
                      </motion.div>
                      <motion.div 
                        className="text-4xl font-extrabold text-[#2A2A2A] mb-2 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + (i + 3) * 0.1 }}
                      >
                        <AnimatedNumber value={item.value} />
                      </motion.div>
                      <div className="text-sm font-semibold text-[#7C7C7C] uppercase tracking-wide">{item.label}</div>
                    </Card>
                  </motion.div>
                );
              })}
            </>
          ) : (
            [
              { icon: Shield, value: outcomes.prevented, label: t.dashboard.risksPrevented, color: '#2F7F4D' },
              { icon: RotateCcw, value: outcomes.recovered, label: t.dashboard.recovered, color: theme.primary },
              { icon: Coins, value: outcomes.revenue, label: t.dashboard.revenueProtectedLabel, color: theme.accent || '#E6A157' }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card hover onClick={() => setDrillDownLevel(2)} className="p-8 border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <motion.div 
                      className="flex items-start justify-between mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                    >
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Icon container with color border */}
                        <motion.div 
                          className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" 
                          style={{ 
                            background: `${item.color}15`,
                            border: `1px solid ${item.color}30`
                          }}
                        >
                          <IconComponent 
                            className="w-8 h-8" 
                            style={{ 
                              color: item.color
                            }} 
                          />
                        </motion.div>
                      </motion.div>
                      <motion.div 
                        className="w-2.5 h-2.5 rounded-full shadow-sm" 
                        style={{ background: item.color }}
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    </motion.div>
                    <motion.div 
                      className="text-4xl font-extrabold text-[#2A2A2A] mb-2 tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      <AnimatedNumber value={item.value} />
                    </motion.div>
                    <div className="text-sm font-semibold text-[#7C7C7C] uppercase tracking-wide">{item.label}</div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Charts Grid */}
        <motion.div 
          className={`grid gap-6 ${selectedIndustry === 'clinic' ? 'grid-cols-3' : 'grid-cols-2'}`}
          variants={containerVariants}
        >
          {selectedIndustry === 'clinic' ? (
            <>
              <motion.div variants={itemVariants} className="h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <RevenueTrendChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <UtilizationTrendChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                <Card className="border-0 shadow-md h-full flex flex-col">
                  <ChannelPerformanceChart />
                </Card>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <UtilizationTrendChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <ChannelPerformanceChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <RiskBreakdownChart />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <RevenueTrendChart />
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  };

  const Layer2Capacity = () => (
    <div className="space-y-8">
      <SectionHeader 
        title={`${t.dashboard.howDidAchieve} ${outcomes.rate}% ${data.capacityUnit} ${t.dashboard.utilization.toLowerCase()}?`} 
        subtitle={`${t.dashboard.completeBreakdown} ${data.capacityUnit.toLowerCase()} ${t.dashboard.breakdownFor} ${timeLabel}`} 
      />
      
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-md" style={{ background: theme.light }}>
              {React.createElement(getIndustryIcon(selectedIndustry), { className: "w-10 h-10", style: { color: theme.primary } })}
            </div>
            <div>
              <div className="text-5xl font-extrabold text-[#2A2A2A] tracking-tight mb-2">{capacity.total}</div>
              <div className="text-base font-semibold text-[#7C7C7C]">{capacity.label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: theme.primary }}>
              {capacity.filled} / {capacity.total}
            </div>
            <div className="text-sm font-semibold text-[#7C7C7C] uppercase tracking-wide">{t.industries[selectedIndustry].filled}</div>
          </div>
        </div>
      </Card>

      <Card className="border-0 shadow-md overflow-hidden">
        {capacity.sections.map((section, idx) => (
          <div key={idx} className={`p-6 ${idx < capacity.sections.length - 1 ? 'border-b border-[#F2F2F7]' : ''} hover:bg-[#FBFBFB] transition-colors`}>
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                section.type === 'success' ? 'bg-[#E9FAEF] text-[#2F7F4D]' : 
                section.type === 'warning' ? 'bg-[#FEF4E5] text-[#C8641B]' : 
                section.type === 'danger' ? 'bg-[#FDECEE] text-[#D9363E]' : 
                'bg-[#EBF1F8] text-[#1b44fe]'
              }`}>
                {section.icon === 'check' ? (
                  <Check className={`w-6 h-6 ${section.type === 'success' ? 'text-[#2F7F4D]' : section.type === 'warning' ? 'text-[#C8641B]' : section.type === 'danger' ? 'text-[#D9363E]' : 'text-[#1b44fe]'}`} />
                ) : section.icon === 'warning' ? (
                  <AlertTriangle className={`w-6 h-6 ${section.type === 'warning' ? 'text-[#C8641B]' : section.type === 'danger' ? 'text-[#D9363E]' : 'text-[#1b44fe]'}`} />
                ) : section.icon === 'x' ? (
                  <X className={`w-6 h-6 ${section.type === 'danger' ? 'text-[#D9363E]' : 'text-[#1b44fe]'}`} />
                ) : section.icon === 'dollar' ? (
                  <DollarSign className={`w-6 h-6 ${section.type === 'info' ? 'text-[#1b44fe]' : 'text-[#1b44fe]'}`} />
                ) : section.icon === 'rotate' ? (
                  <RotateCcw className={`w-6 h-6 ${section.type === 'info' ? 'text-[#1b44fe]' : 'text-[#1b44fe]'}`} />
                ) : (
                  <span className="text-xl">{section.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-[#2A2A2A] mb-1">
                  {section.count} {data.capacityUnit.toLowerCase()} {section.label}
                </div>
                {section.resolutions.length > 0 && (
                  <div className="mt-4 space-y-2.5 ml-0">
                    {section.resolutions.map((res, ridx) => (
                      <div key={ridx} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[#FBFBFB] border border-[#F2F2F7]">
                        <div className={`w-2.5 h-2.5 rounded-full ${res.type === 'success' ? 'bg-[#2F7F4D]' : res.type === 'warning' ? 'bg-[#C8641B]' : 'bg-[#D9363E]'}`} />
                        <div className="flex-1 text-sm font-medium text-[#383838]">{res.label}</div>
                        <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                          res.type === 'success' ? 'bg-[#E9FAEF] text-[#2F7F4D]' : 
                          res.type === 'warning' ? 'bg-[#FEF4E5] text-[#C8641B]' : 
                          'bg-[#FDECEE] text-[#D9363E]'
                        }`}>
                          {res.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-3xl font-extrabold text-[#ECECEC]">{section.count}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card hover onClick={() => setDrillDownLevel(3)} className="p-6 border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-[#2A2A2A] mb-1">{t.dashboard.seeExecutionDetails}</div>
            <div className="text-sm font-medium text-[#7C7C7C]">{t.dashboard.channelsDecisionsConversations}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform" style={{ background: theme.primary }}>
            →
          </div>
        </div>
      </Card>
    </div>
  );

  // Helper to open customer in Operations
  const openInOperations = (customerName) => {
    navigate('/operations');
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
      <SectionHeader title={t.operations.executionDetails} subtitle={`${t.operations.forTrustAudits} • ${periodLabel}`} action={
        <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-xl border border-[#E5E5EA]">
          {['channel', 'customer'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === mode ? 'bg-white shadow-sm text-[#2A2A2A]' : 'text-[#7C7C7C]'}`}>
              {mode === 'channel' ? t.operations.byChannel : `${t.operations.byCustomer} ${data.entityName}`}
            </button>
          ))}
        </div>
      } />

      {/* Hint for Operations link when viewing by customer */}
      {viewMode === 'customer' && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#EBF1F8] border border-[#C0D4E8]">
          <div className="flex items-center gap-2 text-sm text-[#1b44fe] font-semibold">
            <span>💡</span>
            <span>{t.operations.clickAnyToSee.replace('{entity}', data.entityName.toLowerCase())}</span>
          </div>
          <button 
            onClick={() => { navigate('/operations'); setStatusFilter('all'); }}
            className="text-sm font-semibold text-[#1b44fe] hover:text-[#1538d4] flex items-center gap-1"
          >
            {t.operations.openOperationsConsole}
          </button>
        </div>
      )}

      <Card>
        {viewMode === 'channel' ? (
          channels.map((ch, idx) => (
            <ListRow key={ch.id} icon={ch.icon} title={ch.name} subtitle={`${ch.converted} ${t.operations.conversions}`} last={idx === channels.length - 1}
              onClick={() => { setSelectedChannel(ch); setSelectedCustomer(null); setDrillDownLevel(4); }}
              right={<div className="flex items-center gap-6 text-sm mr-4"><Stat value={ch.sent} label={t.operations.sent} size="sm" color="#7C7C7C" /><span className="text-[#BEBEC2]">→</span><Stat value={ch.read} label={t.operations.read} size="sm" color="#7C7C7C" /><span className="text-[#BEBEC2]">→</span><Stat value={ch.converted} label={t.operations.done} size="sm" color="#2F7F4D" /></div>}
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
                  {record.vip && <Star className="w-3 h-3 text-[#F18A3F]" />}
                </div>
              }
              subtitle={translateSlot(record.slot)}
              last={idx === 5}
              onClick={() => openInOperations(record.name)}
              right={
                <div className="flex items-center gap-3 mr-4">
                  <div className="text-right mr-2">
                    <div className={`text-sm font-bold ${record.riskScore > 70 ? 'text-[#D9363E]' : record.riskScore > 40 ? 'text-[#F18A3F]' : 'text-[#2F7F4D]'}`}>
                      {record.riskScore}%
                    </div>
                    <div className="text-xs text-[#A5A5A5] font-medium">{t.operations.risk.toLowerCase()}</div>
                  </div>
                  <Badge type={
                    ['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received'].includes(record.status) ? 'success' : 
                    record.status === 'escalated' ? 'warning' : 
                    record.status === 'error' ? 'danger' : 'info'
                  }>
                    {translateStatus(record.status)}
                  </Badge>
                </div>
              }
            />
          ))
        )}
      </Card>
      <Card className="p-5" style={{ background: theme.light }}>
        <div className="flex items-center justify-between">
          <div><div className="font-medium" style={{ color: theme.dark }}>{t.operations.totalActions} • {periodLabel}</div><div className="text-2xl font-bold" style={{ color: theme.primary }}>{channels.reduce((s, c) => s + c.sent, 0)} {t.operations.messages} • {channels.length} {t.operations.channels}</div></div>
          <div className="text-right"><div className="text-sm font-semibold" style={{ color: theme.dark }}>{t.dashboard.overallConversion}</div><div className="text-2xl font-bold text-[#2F7F4D]">{Math.round((channels.reduce((s, c) => s + c.converted, 0) / channels.reduce((s, c) => s + c.sent, 0)) * 100)}%</div></div>
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
          <SectionHeader title={t.operations.noConversations} subtitle={t.common.tryAdjustingFilters} />
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <Mail className="w-12 h-12 text-gray-400 mb-4" />
              <div className="text-[#7C7C7C] font-medium">{t.operations.noConversationsForChannel}</div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionHeader title={selectedChannel ? `${selectedChannel.name} ${t.operations.conversations}` : selectedCustomer ? selectedCustomer.name : t.operations.conversations} subtitle={`${conversations.length} ${conversations.length !== 1 ? t.operations.conversations : t.operations.conversation} • ${periodLabel}`} />
        {selectedChannel && channelStats && (
          <Card className="p-5">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: theme.light }}>{selectedChannel.icon}</div>
              <div className="flex-1 flex items-center justify-around"><Stat value={channelStats.sent} label={t.operations.sent} /><div className="text-[#BEBEC2]">→</div><Stat value={channelStats.read} label={t.operations.read} /><div className="text-[#BEBEC2]">→</div><Stat value={channelStats.converted} label={t.operations.converted} color="#2F7F4D" /></div>
            </div>
          </Card>
        )}
        {conversations.map(conv => (
          <Card key={conv.id}>
            <div className="p-5 border-b border-[#F2F2F7]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm" style={{ background: theme.light, color: theme.primary }}>{conv.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1"><div className="font-semibold text-[#2A2A2A]">{conv.name}</div><div className="text-sm text-[#7C7C7C] font-medium">{conv.phone}</div></div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><div className={`text-lg font-bold ${conv.risk > 70 ? 'text-[#D9363E]' : conv.risk > 40 ? 'text-[#F18A3F]' : 'text-[#2F7F4D]'}`}>{conv.risk}%</div><div className="text-xs text-[#A5A5A5] font-medium">{t.operations.risk}</div></div>
                  <Badge type={['confirmed', 'renewed', 'recovered', 'won_back', 'meeting_set', 'payment_received'].includes(conv.status) ? 'success' : conv.status === 'escalated' ? 'warning' : 'info'}>
                    {translateStatus(conv.status)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: theme.light }}><div className="text-sm font-medium" style={{ color: theme.dark }}>{translateSlot(conv.event)}</div></div>
            </div>
            <div className="p-5 bg-[#FBFBFB] space-y-4">
              {conv.timeline.map((item, idx) => (
                <div key={idx} className={`flex gap-3 ${item.dir === 'in' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${item.dir === 'system' ? 'bg-[#ECECEC] text-[#7C7C7C]' : item.dir === 'out' ? 'text-white' : 'text-white'}`} style={item.dir === 'out' ? { background: theme.primary } : item.dir === 'in' ? { background: '#2F7F4D' } : {}}>
                    {item.dir === 'system' ? (
                      <Settings className="w-4 h-4" />
                    ) : item.dir === 'out' ? (
                      <ArrowRight className="w-4 h-4" />
                    ) : (
                      <ArrowLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${item.dir === 'in' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm font-medium ${item.dir === 'system' ? 'bg-white border border-[#D1D1D6] text-[#5E5E5E] italic' : item.dir === 'out' ? 'bg-white border border-[#D1D1D6] text-[#383838]' : 'text-white'}`} style={item.dir === 'in' ? { background: theme.primary } : {}}>{item.msg}</div>
                    <div className={`flex items-center gap-2 mt-1.5 text-xs text-[#A5A5A5] flex-wrap font-medium ${item.dir === 'in' ? 'justify-end' : ''}`}>
                      {item.channel && <span className="px-1.5 py-0.5 rounded bg-[#ECECEC] text-[#7C7C7C]">{item.channel}</span>}
                      <span>{item.time}</span>
                      {item.status && <span className={`px-1.5 py-0.5 rounded font-medium ${item.status === 'delivered' || item.status === 'connected' || item.status === 'success' ? 'bg-[#E9FAEF] text-[#2F7F4D]' : item.status === 'read' ? 'bg-[#EBF1F8] text-[#1b44fe]' : item.status === 'not_opened' || item.status === 'no_answer' || item.status === 'warning' ? 'bg-[#FDECEE] text-[#D9363E]' : 'bg-[#F5F5F5] text-[#7C7C7C]'}`}>
                        {translateStatus(item.status)}
                      </span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#F2F2F7] flex items-center justify-between">
              <div className="text-sm text-[#7C7C7C] font-medium">{conv.timeline.length} {t.operations.interactions}</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openInOperations(conv.name)}>{t.operations.viewInOperations} →</Button>
                <Button variant="secondary" size="sm">{t.operations.viewFullHistory}</Button>
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
      all: t.operations.allRecords.replace('{count}', recordsToUse.length.toString()),
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
        <SectionHeader title={t.operations.title} subtitle={t.operations.subtitle} />
        {/* Search & Filters */}
        <Card className="p-5">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A5A5]" />
              <input
                type="text"
                placeholder={t.operations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1D1D6] focus:outline-none focus:border-[#1b44fe] focus:ring-2 focus:ring-[#1b44fe] focus:ring-offset-2 text-sm"
              />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#D1D1D6] focus:outline-none focus:border-[#1b44fe] focus:ring-2 focus:ring-[#1b44fe] focus:ring-offset-2 text-sm"
              title={t.operations.dateFilter}
            />
          </div>
          
          {/* Filter Buttons with Descriptions */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: t.common.all, icon: Clipboard },
                { id: 'errors', label: t.status.error, icon: AlertCircle },
                { id: 'escalated', label: t.status.escalated, icon: AlertTriangle },
                { id: 'pending', label: t.status.pending, icon: Clock },
                { id: 'confirmed', label: t.status.confirmed, icon: Check }
              ].map(filter => {
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      statusFilter === filter.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={statusFilter === filter.id ? { background: primaryGradient } : {}}
                  >
                    <IconComponent className="w-4 h-4" /> {filter.label}
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusFilter === filter.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {statusCounts[filter.id]}
                    </span>
                  </button>
                );
              })}
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
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-[#7C7C7C]">{t.common.noResults}</div>
                <div className="text-sm text-[#A5A5A5] mt-1">{t.common.tryAdjustingFilters}</div>
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
                        {record.vip && <span className="text-amber-500 text-xs flex items-center gap-1"><Star className="w-3 h-3" /> {t.operations.vip}</span>}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{translateSlot(record.slot)}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge type={getStatusBadgeType(record.status)}>
                          {translateStatus(record.status)}
                        </Badge>
                        <span className="text-xs text-gray-400">{record.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${record.riskScore > 70 ? 'text-red-500' : record.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {record.riskScore}%
                      </div>
                      <div className="text-xs text-gray-400">{t.operations.risk}</div>
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
                          {selectedRecord.vip && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1"><Star className="w-3 h-3" /> {t.operations.vip}</span>}
                        </div>
                        <div className="text-sm text-gray-500">{selectedRecord.phone} • {selectedRecord.email}</div>
                      </div>
                    </div>
                    <Badge type={getStatusBadgeType(selectedRecord.status)}>
                      {translateStatus(selectedRecord.status).toUpperCase()}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: theme.light }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{t.operations.appointment}</div>
                        <div className="font-semibold" style={{ color: theme.dark }}>{translateSlot(selectedRecord.slot)}</div>
                        <div className="text-sm text-gray-500">{selectedRecord.slotId} • {selectedRecord.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{t.operations.riskScore}</div>
                        <div className={`text-3xl font-bold ${selectedRecord.riskScore > 70 ? 'text-red-500' : selectedRecord.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {selectedRecord.riskScore}%
                        </div>
                      </div>
                    </div>
                    {selectedRecord.riskFactors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">{t.operations.riskFactors}</div>
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
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.operations.decisionAuditTrail}</div>
                  <div className="space-y-4">
                    {selectedRecord.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? 'bg-emerald-100 text-emerald-600' :
                          item.status === 'warning' || item.status === 'escalated' ? 'bg-amber-100 text-amber-600' :
                          item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' ? 'bg-red-100 text-red-600' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? (
                            <Check className="w-3 h-3" />
                          ) : item.status === 'warning' || item.status === 'escalated' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' ? (
                            <X className="w-3 h-3" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-xl p-3 border border-gray-200">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm text-gray-800">{item.message}</div>
                                {item.decision && (
                                  <div className="mt-2 p-2 rounded-lg bg-gray-50 text-xs">
                                    <div className="text-gray-500">
                                      <span className="font-medium text-gray-700">{t.operations.decision}:</span> {item.decision.reason}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-gray-400">{t.operations.confidence}: <span className="font-medium" style={{ color: theme.primary }}>{item.decision.confidence}%</span></span>
                                      <span className="text-gray-400">{t.operations.agent}: <span className="font-medium text-gray-600">{item.decision.agent}</span></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-gray-400">{translateSlot(item.time)}</div>
                                <div className="text-xs mt-1">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    item.status === 'success' || item.status === 'delivered' || item.status === 'connected' ? 'bg-emerald-100 text-emerald-600' :
                                    item.status === 'warning' || item.status === 'escalated' ? 'bg-amber-100 text-amber-600' :
                                    item.status === 'error' || item.status === 'failed' || item.status === 'no_answer' || item.status === 'not_opened' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>{translateStatus(item.status)}</span>
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
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.operations.manualNotes}</div>
                      {selectedRecord.notes.map((note, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-amber-800">{note.by}</span>
                            <span className="text-xs text-amber-600">{translateSlot(note.time)}</span>
                          </div>
                          <div className="text-amber-900">{note.note}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-gray-100 bg-white">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.operations.quickActions}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleAction('call', selectedRecord)}>
                      <Phone className="w-4 h-4" /> {t.operations.callNow}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('message', selectedRecord)}>
                      <MessageSquare className="w-4 h-4" /> {t.operations.sendMessage}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('confirm', selectedRecord)}>
                      <Check className="w-4 h-4" /> {t.operations.markConfirmed}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('reassign', selectedRecord)}>
                      <RefreshCw className="w-4 h-4" /> {t.operations.reassignSlot} {data.capacityUnitSingular}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction('note', selectedRecord)}>
                      <FileText className="w-4 h-4" /> {t.operations.addNote}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction('flag', selectedRecord)}>
                      <AlertCircle className="w-4 h-4" /> {t.operations.flagIssue}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center h-full flex flex-col items-center justify-center">
                <ArrowLeft className="w-12 h-12 text-gray-300 mb-4" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {showActionModal.action === 'call' && <><Phone className="w-5 h-5" /> {t.operations.callPatient}</>}
                {showActionModal.action === 'message' && <><MessageSquare className="w-5 h-5" /> {t.operations.sendMessage}</>}
                {showActionModal.action === 'confirm' && <><Check className="w-5 h-5" /> {t.operations.markAsConfirmed}</>}
                {showActionModal.action === 'reassign' && <><RefreshCw className="w-5 h-5" /> {t.operations.reassignSlotAction}</>}
                {showActionModal.action === 'note' && <><FileText className="w-5 h-5" /> {t.operations.addNote}</>}
                {showActionModal.action === 'flag' && <><AlertCircle className="w-5 h-5" /> {t.operations.flagIssue}</>}
              </h3>
              <div className="mb-4 p-3 rounded-xl bg-gray-50">
                <div className="font-medium text-gray-900">{showActionModal.record.name}</div>
                <div className="text-sm text-gray-500">{translateSlot(showActionModal.record.slot)}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showActionModal.action === 'message' ? t.operations.messageLabel : t.operations.noteOptional}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
                  rows={3}
                  placeholder={showActionModal.action === 'message' ? t.operations.typeYourMessage : t.operations.addNoteAboutAction}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setShowActionModal(null)}>{t.common.cancel}</Button>
                <Button onClick={executeAction}>
                  {showActionModal.action === 'call' ? t.operations.initiateCall :
                   showActionModal.action === 'message' ? t.operations.sendMessage :
                   showActionModal.action === 'confirm' ? t.operations.confirm :
                   showActionModal.action === 'reassign' ? t.operations.reassign :
                   showActionModal.action === 'note' ? t.operations.saveNote :
                   t.operations.flagIssue}
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
    
    // Test/Playground state - integrated functionality
    const [testMessages, setTestMessages] = useState<Array<{
      id: string;
      content: string;
      sender: 'user' | 'agent' | 'system';
      type: 'text' | 'voice';
      timestamp: Date;
      attachments?: any[];
    }>>([]);
    const [testInput, setTestInput] = useState('');
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [selectedTestAgent, setSelectedTestAgent] = useState<any>(null);
    const [selectedTestAgents, setSelectedTestAgents] = useState<string[]>([]);
    const [agentType, setAgentType] = useState<'text' | 'voice'>('text');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [creatingSession, setCreatingSession] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<any[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sessionSocket = useRef<WebSocket | null>(null);
    const [agentPrompts, setAgentPrompts] = useState<Record<string, string>>({});
    const [agentTools, setAgentTools] = useState<Array<{
      toolName: string;
      isSelected: boolean;
      label: string;
      id: string;
      hide: boolean;
      type?: string;
    }>>([]);
    const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
    
    const { currentWorkspaceId } = useWorkspace();
    const { data: agentListDB } = useGetAgentListsQuery({
      aiEmployeeId: currentWorkspaceId!
    }, { skip: !currentWorkspaceId });
    
    // Extract tools when selectedTestAgent changes (matching reference)
    useEffect(() => {
      if (selectedTestAgent && agentListDB) {
        const agentId = selectedTestAgent.id?.toString() || selectedTestAgent.toString();
        const prompt = agentListDB?.data.agents.find((a) => a.id.toString() === agentId);
        if (prompt) {
          setAgentTools(prompt.tools?.map((t: any) => ({ 
            isSelected: true, 
            toolName: t.name, 
            label: t.name, 
            id: t.toolId, 
            hide: false, 
            type: t.type 
          })) || []);
          setAgentPrompts(prev => ({
            ...prev,
            [agentId]: prev[agentId] || prompt.configuration?.systemInstructions || "Your instruction"
          }));
        }
      }
    }, [selectedTestAgent, agentListDB]);
    
    // Filter agents by modality when agentType changes (matching reference)
    useEffect(() => {
      if (agentListDB?.data?.agents) {
        const filtered = agentListDB.data.agents.filter((a: any) => {
          const modalities = a.configuration?.modalities;
          if (Array.isArray(modalities)) {
            return modalities.includes(agentType);
          }
          // Handle string format like "text,voice" or just "text"
          if (typeof modalities === 'string') {
            return modalities.includes(agentType);
          }
          return false;
        });
        setFilteredAgents(filtered || []);
      }
    }, [agentType, agentListDB]);
    
    const { register, setValue, watch, getValues } = useForm<{ 
      connectionId: string; 
      provider: string; 
      voiceId?: string; 
      voiceName?: string; 
      ttsProvider?: string 
    }>();
    
    const { data: connectionsData } = useGetConnectionsQuery(
      { aiEmployeeId: currentWorkspaceId! },
      { skip: !currentWorkspaceId }
    );
    
    const selectedProvider = watch('provider');
    const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
    const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
    const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
    
    const { connected, transcript, start, stop } = useRealtimeAudio({
      wsUrl: `${AGENT_ENV_1_WS}/ws/voice_agent`,
      sessionId: sessionId,
      setExecutionLogs
    });
    
    const socketMapping = {
      "NA2-ENV-1": `${AGENT_ENV_1_WS}/ws/execute_agent`
    };

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

    // Starting Points (Triggers) - translated
    const startingPoints = [
      { id: 1, name: t.studio.startingPointNames.typeFormLeadGeneration, type: t.studio.startingPointTypes.typeForm, icon: FileText, color: '#7C3AED' },
      { id: 2, name: t.studio.startingPointNames.test, type: t.studio.startingPointTypes.twilioCallListener, icon: FlaskConical, color: '#EC4899' },
      { id: 3, name: t.studio.startingPointNames.voiceListener, type: t.studio.startingPointTypes.twilioCallListener, icon: Phone, color: '#06B6D4' },
      { id: 4, name: t.studio.startingPointNames.preFollowUp, type: t.studio.startingPointTypes.preFollowUp, icon: BarChart3, color: '#F59E0B' },
      { id: 5, name: t.studio.startingPointNames.emailTrigger, type: t.studio.startingPointTypes.emailListener, icon: Mail, color: '#10B981' },
      { id: 6, name: t.studio.startingPointNames.leadGenerator, type: t.studio.startingPointTypes.fileUpload, icon: Folder, color: '#3B82F6' }
    ];

    // Workflow steps - translated
    const workflowSteps = [
      { id: 1, title: t.studio.workflowStepTitles.createLeadSession, description: t.studio.workflowStepDescriptions.createLeadSession, agents: [t.studio.agentNames.leadGenerationAgent] },
      { id: 2, title: t.studio.workflowStepTitles.bookAppointment, description: t.studio.workflowStepDescriptions.bookAppointment, agents: [t.studio.agentNames.bookingAgent] },
      { id: 3, title: t.studio.workflowStepTitles.followUpReminder, description: t.studio.workflowStepDescriptions.followUpReminder, agents: [t.studio.agentNames.followUpAgent] },
      { id: 4, title: t.studio.workflowStepTitles.noShowPrevention, description: t.studio.workflowStepDescriptions.noShowPrevention, agents: [t.studio.agentNames.noShowPreventionAgent] },
      { id: 5, title: t.studio.workflowStepTitles.cancelAppointment, description: t.studio.workflowStepDescriptions.cancelAppointment, agents: [t.studio.agentNames.bookingAgent] },
      { id: 6, title: t.studio.workflowStepTitles.rescheduleAppointment, description: t.studio.workflowStepDescriptions.rescheduleAppointment, agents: [t.studio.agentNames.bookingAgent] },
      { id: 7, title: t.studio.workflowStepTitles.deleteFollowUpReminder, description: t.studio.workflowStepDescriptions.deleteFollowUpReminder, agents: [t.studio.agentNames.followUpAgent] },
      { id: 8, title: t.studio.workflowStepTitles.collectFeedback, description: t.studio.workflowStepDescriptions.collectFeedback, agents: [t.studio.agentNames.feedbackAgent] },
      { id: 9, title: t.studio.workflowStepTitles.insuranceVerification, description: t.studio.workflowStepDescriptions.insuranceVerification, agents: [t.studio.agentNames.bookingAgent] }
    ];

    // Available tools for testing - translated
    const availableTools = [
      t.studio.toolNames.checkCalendarAvailability, 
      t.studio.toolNames.cancelAppointment, 
      t.studio.toolNames.scheduleRecurringEmail,
      t.studio.listUpcomingAppointments, 
      t.studio.toolNames.bookGoogleCalendar, 
      t.studio.toolNames.scheduleRecurringVoice,
      t.studio.deleteRecurringVoice, 
      t.studio.updateSessionInfo, 
      t.studio.manageInsuranceClaims
    ];

    const toggleAgentStatus = (agentId) => {
      setStudioAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
      ));
    };

    // Create session function
    const createSessionForPlayGround = async () => {
      if (agentType === 'voice') {
        const provider = getValues("provider");
        if (!provider || provider.trim() === '') {
          alert("Please select a voice provider");
          return;
        }
      }

      const formData = new FormData();
      const agentsList = [];
      for (const agentId of selectedTestAgents) {
        const agentData = agentListDB?.data.agents.find((a) => a.id.toString() == agentId);
        if (agentData) {
          agentsList.push({
            name: agentData?.name,
            id: agentData?.id,
            system_prompt: agentPrompts[agentId] || agentData?.configuration.systemInstructions,
            tools: agentData?.tools?.map((t: any) => t.toolId) ?? []
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
            setIsTestRunning(true);
          }
        }
      } catch (error) {
        console.log("error", error);
        alert("Error while creating session");
      } finally {
        setCreatingSession(false);
      }
    };

    const createSessionAndListen = (uuid: string) => {
      if (uuid) {
        sessionSocket.current = new WebSocket(`${socketMapping['NA2-ENV-1']}/${uuid}`);
        setIsTestRunning(true);
        sessionSocket.current.onopen = (_event) => {
          setIsTestRunning(true);
        };
        if (sessionSocket.current) {
          sessionSocket.current.onmessage = async (message: MessageEvent) => {
            try {
              const content = JSON.parse(message.data);
              switch (content.type) {
                case 'transcript':
                  setIsTyping(false);
                  const agentMessage = {
                    id: Date.now().toString(),
                    content: content.payload,
                    sender: 'agent' as const,
                    timestamp: new Date(),
                    type: 'text' as const
                  };
                  setTestMessages(prev => [...prev, agentMessage]);
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
                  setIsTyping(true);
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

    const sendTestMessage = async (inputData?: string, attachment?: Attachment[]) => {
      const messageText = inputData || testInput;
      if (!messageText.trim() && (!attachment || attachment.length === 0)) return;

      const userMessage = {
        id: (Date.now() + 1).toString(),
        content: messageText,
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
          payload: messageText
        };
        if (b64Files && b64Files.length) {
          payload['attachment'] = b64Files;
        }
        sessionSocket.current.send(JSON.stringify(payload));
      }
      
      setTestMessages(prev => [...prev, userMessage]);
      setTestInput('');
      setIsTyping(true);
    };

    const clearSession = () => {
      setIsTestRunning(false);
      setIsTyping(false);
      sessionSocket.current = null;
      setTestMessages([]);
      setSessionId(null);
      stop();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFiles([]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    };

    const filterConnections = useMemo(() => {
      let filtered = connectionsData?.data?.filter((conn: any) => {
        if (conn.connectionType !== 'llm') return false;
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

    const { data: voicesData, isLoading: isLoadingVoices } = useGetVoicesQuery(
      {
        aiEmployeeId: currentWorkspaceId!,
        provider: selectedProvider || undefined,
        q: voiceSearchQuery || undefined,
        limit: 20,
      },
      {
        skip: !currentWorkspaceId || !(agentType === 'voice' && selectedProvider && selectedProvider !== ''),
      }
    );

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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.light }}>
              {agent.modality === 'voice' ? (
                <Mic className="w-5 h-5" style={{ color: theme.primary }} />
              ) : (
                <MessageSquare className="w-5 h-5" style={{ color: theme.primary }} />
              )}
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
            <button onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }} className="p-1.5 rounded-lg hover:bg-gray-100" title={agent.status === 'active' ? t.studio.pause : t.studio.resume}>
              {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100" title="Settings"><Settings className="w-4 h-4" /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">{t.studio.performanceSnapshot}</div>
          <div className="text-sm font-medium text-gray-800">
            {agent.performance.label} — <span className={agent.performance.success >= 90 ? 'text-emerald-600' : agent.performance.success >= 70 ? 'text-amber-600' : 'text-red-600'}>{agent.performance.success}% success</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1.5">{t.studio.toolsUsed}</div>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.slice(0, 3).map((tool, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                <Zap className="w-3 h-3 text-gray-400" /> {tool}
              </span>
            ))}
            {agent.tools.length > 3 && <span className="px-2 py-1 text-xs text-gray-400">+{agent.tools.length - 3} more</span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{t.studio.lastActivity}: {agent.lastActivity}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setIsEditingAgent(true); }}>View / Edit</Button>
            <Button 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }}
              className={agent.status === 'active' ? '' : 'bg-emerald-500'}
            >
              {agent.status === 'active' ? (
                <><Pause className="w-4 h-4 mr-1.5" /> {t.studio.pause}</>
              ) : (
                <><Play className="w-4 h-4 mr-1.5" /> {t.studio.resume}</>
              )}
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
                <h3 className="text-lg font-semibold text-gray-900">{t.studio.settings}</h3>
              </div>
              <p className="text-sm text-gray-500">{t.studio.configureAgent} {selectedAgent.name}</p>
            </div>
            <Button onClick={() => toggleAgentStatus(selectedAgent.id)}>
              {selectedAgent.status === 'active' ? (
                <><Pause className="w-4 h-4" /> {t.studio.pause} {t.studio.agents}</>
              ) : (
                <><Play className="w-4 h-4" /> {t.studio.resume} {t.studio.agents}</>
              )}
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
              <h4 className="font-semibold text-gray-900 mb-4">{t.studio.basicConfiguration}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.studio.agentName}</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.studio.description}</label>
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
              <h4 className="font-semibold text-gray-900 mb-2">{t.studio.agentInstructions}</h4>
              <p className="text-sm text-gray-500 mb-3">Define how this agent should behave. Add rules, examples, or conditions.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.studio.instructions}</label>
                  <textarea 
                    value={selectedAgent.instructions}
                    disabled={selectedAgent.status === 'active'}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white disabled:bg-gray-50 disabled:text-gray-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.studio.followUpInstructions}</label>
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
                  <h4 className="font-semibold text-gray-900">{t.studio.agentTools}</h4>
                  <p className="text-sm text-gray-500">Manage the tools your AI agent can use to perform actions</p>
                </div>
                <Button variant="secondary" size="sm" disabled={selectedAgent.status === 'active'}>+ Add Tool</Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedAgent.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme.light }}>
                      {tool.includes('Email') ? (
                        <Mail className="w-5 h-5" style={{ color: theme.primary }} />
                      ) : tool.includes('Voice') || tool.includes('Call') ? (
                        <Phone className="w-5 h-5" style={{ color: theme.primary }} />
                      ) : tool.includes('Calendar') ? (
                        <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                      ) : (
                        <Zap className="w-5 h-5" style={{ color: theme.primary }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{tool}</div>
                      <div className="text-xs text-gray-500">
                        {tool.includes('Email') ? 'Mailing • Google' : tool.includes('Voice') || tool.includes('Call') ? 'Voice • Twilio' : 'System'}
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600"><Clipboard className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">{t.studio.configuration}</h4>
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
      <div className="space-y-6 min-h-0 h-full flex flex-col">
        <SectionHeader 
          title={t.studio.studioTitle} 
          subtitle={t.studio.studioSubtitle}
          action={
            <div className="flex gap-2">
              <Button variant="secondary">{t.studio.import}</Button>
              <Button>{t.studio.createAgent}</Button>
            </div>
          }
        />
        
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-shrink-0">
          {[
            { id: 'agents', label: t.studio.teamOfAgents, icon: Bot }, 
            { id: 'workflows', label: t.studio.workspaceWorkflow, icon: Zap }, 
            { id: 'test', label: t.studio.testYourAgent, icon: FlaskConical },
            { id: 'memory', label: t.studio.memory, icon: Brain }, 
            { id: 'guardrails', label: t.studio.guardrails, icon: Shield }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button 
                key={tab.id} 
                onClick={() => { setStudioTab(tab.id); setSelectedAgent(null); }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${studioTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                <IconComponent className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* AGENTS TAB */}
        {studioTab === 'agents' && (
          <div className="flex gap-6 flex-1 min-h-0">
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
              <h4 className="font-semibold text-gray-900 mb-4">{t.studio.startingPoints}</h4>
              <div className="flex flex-wrap gap-3">
                {startingPoints.map(sp => (
                  <div 
                    key={sp.id} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer hover:border-solid transition-all"
                    style={{ borderColor: sp.color + '40', background: sp.color + '10' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: sp.color + '20' }}>
                      {React.createElement(sp.icon, { className: "w-5 h-5", style: { color: sp.color } })}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{sp.name}</div>
                      <div className="text-xs text-gray-500">{sp.type}</div>
                    </div>
                  </div>
                ))}
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.studio.addTrigger}</span>
                </button>
              </div>
            </Card>

            {/* Workflow Steps */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{t.studio.testWorkflow}</h4>
                  <p className="text-sm text-gray-500">{t.studio.defineWorkflowSteps}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm"><Clipboard className="w-4 h-4" /> {t.studio.versions}</Button>
                  <Button size="sm">{t.studio.addStep}</Button>
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
                          <button className="p-1 text-gray-400 hover:text-gray-600"><Clipboard className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{t.studio.agentsLabel}:</span>
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
                <Button>{t.studio.saveWorkflow}</Button>
              </div>
            </Card>
          </div>
        )}

        {/* TEST TAB */}
        {studioTab === 'test' && (
          <div className="grid grid-cols-2 gap-6 min-h-0 flex-1" style={{ maxHeight: '100%' }}>
            {/* Test Configuration */}
            <div className="flex flex-col min-h-0 overflow-hidden" style={{ height: '100%', maxHeight: '85vh' }}>
              <Card className="p-5 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 420px)', maxHeight: 'calc(100vh - 420px)' }}>
                <div className="flex-shrink-0">
                  <h4 className="font-semibold text-gray-900 mb-1">{t.studio.testYourAgent}</h4>
                  <p className="text-sm text-gray-500 mb-4">{t.studio.testTabSubtitle}</p>
                  <div className="text-sm text-blue-600 mb-6 cursor-pointer hover:underline">{t.studio.needHelpTesting}</div>
                </div>
                
                {/* Scrollable Configuration Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pr-2" style={{ scrollbarWidth: 'thin' }}>

                {/* Modality Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalities</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium">Text</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentType === 'voice'}
                        disabled={sessionId != null || selectedTestAgents.length > 0}
                        onChange={(e) => setAgentType(e.target.checked ? 'voice' : 'text')}
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

                {/* Agent Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{selectedTestAgents.length > 0 ? `${selectedTestAgents.length} Agents selected` : t.studio.selectAgentsToTest}</label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 min-h-[48px]">
                  {selectedTestAgents.length > 0 ? (
                    selectedTestAgents.map(agentId => {
                      const agent = agentListDB?.data.agents.find(a => a.id === agentId) || studioAgents.find(a => a.id.toString() === agentId);
                      return agent ? (
                        <span key={agentId} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: theme.light, color: theme.primary }}>
                          <Zap className="w-4 h-4" /> {agent.name}
                          <button onClick={() => {
                            if (!sessionId) {
                              setSelectedTestAgents(prev => prev.filter(id => id !== agentId));
                              if (selectedTestAgents.length === 1) setSelectedTestAgent(null);
                            }
                          }} className="hover:text-red-500">×</button>
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">{t.studio.clickAgentToSelect}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(filteredAgents.length > 0 ? filteredAgents : (agentListDB?.data.agents || studioAgents)).slice(0, 6).map(agent => {
                    const agentId = agent.id.toString();
                    const isSelected = selectedTestAgents.includes(agentId);
                    return (
                      <button 
                        key={agent.id}
                        onClick={() => {
                          if (!sessionId) {
                            if (isSelected) {
                              setSelectedTestAgents(prev => prev.filter(id => id !== agentId));
                            } else {
                              setSelectedTestAgents(prev => [...prev, agentId]);
                              setSelectedTestAgent(agent);
                              setAgentPrompts(prev => ({
                                ...prev,
                                [agentId]: prev[agentId] || agent.instructions || agent.configuration?.systemInstructions || ''
                              }));
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        {agent.name}
                      </button>
                    );
                  })}
                </div>
                </div>

                {/* Test Configuration */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">{t.studio.testConfiguration}</h5>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.studio.testPrompt}</label>
                  <textarea 
                    rows={4}
                    placeholder="ROLE: You are a polite, human-like agent..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    value={selectedTestAgent ? (agentPrompts[selectedTestAgent.id.toString()] || selectedTestAgent.instructions || '') : ''}
                    onChange={(e) => {
                      if (selectedTestAgent) {
                        setAgentPrompts(prev => ({
                          ...prev,
                          [selectedTestAgent.id.toString()]: e.target.value
                        }));
                      }
                    }}
                    disabled={sessionId != null}
                  />
                </div>

                {/* Available Tools - matching reference */}
                {agentTools && agentTools.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.studio.availableTools || 'Available Tools'}:</label>
                    <div className="flex flex-wrap gap-2">
                      {agentTools.filter(t => !t.hide).map((t, i) => {
                        const selectTool = (toolName: string) => {
                          const mappedTool = agentTools.map((tool) => {
                            if (tool.toolName === toolName) {
                              tool.isSelected = !tool.isSelected;
                            }
                            return tool;
                          });
                          setAgentTools(mappedTool);
                        };
                        return (
                          <span 
                            key={i}
                            onClick={() => selectTool(t.toolName)}
                            className={`inline-flex cursor-pointer items-center px-2 py-1 rounded-full text-xs flex-shrink-0 transition-all ${
                              t.isSelected 
                                ? 'text-white' 
                                : 'bg-blue-50 text-blue-600'
                            }`}
                            style={t.isSelected ? { background: primaryGradient } : {}}
                          >
                            {t.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Voice Provider Selection */}
                {agentType === 'voice' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.studio.voiceProvider}</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { id: 'deepgram-cartesia', name: 'Deepgram', sub: 'Cartesia TTS', color: 'purple' },
                        { id: 'deepgram-elevenlabs', name: 'ElevenLabs', sub: 'TTS Modal', color: 'orange' },
                        { id: 'gemini', name: 'Gemini', sub: 'Native audio', color: 'blue' },
                        { id: 'openai', name: 'OpenAI', sub: 'Realtime model', color: 'emerald' }
                      ].map(provider => {
                        const isSelected = watch('provider') === provider.id;
                        const colorClasses = {
                          purple: { border: 'border-purple-500', bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', check: 'text-purple-600' },
                          orange: { border: 'border-orange-500', bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconText: 'text-orange-600', check: 'text-orange-600' },
                          blue: { border: 'border-[#1b44fe]', bg: 'bg-[#EBF1F8]', iconBg: 'bg-[#EBF1F8]', iconText: 'text-[#1b44fe]', check: 'text-[#1b44fe]' },
                          emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', check: 'text-emerald-600' }
                        };
                        const colors = colorClasses[provider.color as keyof typeof colorClasses];
                        return (
                          <div
                            key={provider.id}
                            onClick={() => {
                              if (sessionId == null) {
                                const currentValue = watch('provider');
                                if (currentValue === provider.id) {
                                  setValue('provider', '');
                                } else {
                                  setValue('provider', provider.id);
                                }
                                setValue('connectionId', '');
                              }
                            }}
                            className={`flex items-center justify-between px-2.5 py-2 border rounded-lg cursor-pointer transition-all ${
                              isSelected ? `${colors.border} ${colors.bg} shadow-sm` : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                            } ${sessionId != null ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-lg ${isSelected ? colors.iconBg : 'bg-gray-100'}`}>
                                <MicrophoneIcon className={`h-4 w-4 ${isSelected ? colors.iconText : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{provider.name}</p>
                                <p className="text-[10px] text-gray-500">{provider.sub}</p>
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckIcon className={`h-4 w-4 ${colors.check} flex-shrink-0`} />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded flex-shrink-0"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Voice Selection and LLM Model */}
                    {selectedProvider && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                              disabled={sessionId != null}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-left text-sm flex items-center justify-between"
                            >
                              <span>{selectedVoiceName || 'Select a voice...'}</span>
                              <ChevronRightIcon className={`h-4 w-4 text-gray-400 transition-transform ${isVoiceDropdownOpen ? 'rotate-90' : ''}`} />
                            </button>
                            {isVoiceDropdownOpen && voicesData?.data && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {voicesData.data.map((voice: any) => (
                                  <button
                                    key={voice.id}
                                    onClick={() => {
                                      setSelectedVoiceId(voice.id);
                                      setSelectedVoiceName(voice.name);
                                      setValue('voiceId', voice.id);
                                      setValue('voiceName', voice.name);
                                      setIsVoiceDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100"
                                  >
                                    {voice.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
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
                      </div>
                    )}
                  </div>
                )}

                {/* LLM Model for Text */}
                {agentType === 'text' && (
                  <div className="mb-4 mt-4">
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.studio.uploadFilesOptional}</label>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sessionId != null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" /> {t.studio.uploadFiles}
                  </button>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFiles.map((file, idx) => (
                        <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                </div>
                </div>
                
                {/* Fixed Button at Bottom */}
                <div className="flex-shrink-0 pt-4 border-t border-gray-100">
                  <Button 
                    className="w-full" 
                    disabled={!selectedTestAgents.length || creatingSession}
                    onClick={() => {
                      if (isTestRunning) {
                        clearSession();
                      } else {
                        createSessionForPlayGround();
                      }
                    }}
                  >
                    {creatingSession ? 'Creating...' : isTestRunning ? 'End Test' : t.studio.createTestEnvironment}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Conversation Preview and Execution Logs */}
            <div style={{height:'85vh'}} className="flex flex-col gap-6 ">
              {/* Conversation Preview - 50% of viewport */}
              {agentType === 'text' ? (
                <Card className="p-5 flex flex-col overflow-hidden flex-shrink-0 h-[70%]" >
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{t.studio.conversationPreview}</h4>
                      {sessionId ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{t.studio.realtimeConversation}</p>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
                    {testMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        {t.studio.startConversationToSeeMessages}
                      </div>
                    ) : (
                      testMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'text-white' : 'bg-gray-100 text-gray-800'}`} style={msg.sender === 'user' ? { background: primaryGradient } : {}}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="px-4 py-2.5 rounded-2xl text-sm bg-gray-100 text-gray-800 animate-pulse">
                          Typing...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 flex items-center gap-2 pt-3 border-t border-gray-100">
                    <input 
                      type="text" 
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendTestMessage()}
                      placeholder={t.studio.typeMessage}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200"
                      disabled={!sessionId}
                    />
                    <button 
                      onClick={() => sendTestMessage()}
                      disabled={!sessionId || !testInput.trim()}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                      style={{ background: primaryGradient }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ) : (
                <Card className="p-0 flex flex-col overflow-hidden flex-shrink-0" style={{ height: 'calc(50vh - 120px)' }}>
                  <div className="flex flex-col h-full min-h-0">
                    <ChatWithAttachments
                      duration={duration}
                      setDuration={setDuration}
                      startRecord={start}
                      endRecord={stop}
                      agentType={agentType}
                      isTyping={isTyping}
                      sendWebsocketMessage={sendTestMessage}
                      chatMessagesProps={testMessages}
                      sessionId={sessionId}
                      connected={connected}
                    />
                  </div>
                </Card>
              )}

              {/* Execution Logs - 50% of viewport */}
              <Card className="p-5 flex flex-col overflow-hidden flex-shrink-0" style={{ height: 'calc(50vh - 120px)' }}>
                <div className="flex-shrink-0 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{t.studio.executionLogs}</h4>
                  <p className="text-sm text-gray-500">{t.studio.stepByStepBreakdown}</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                  {executionLogs.length === 0 ? (
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-8">
                      <div className="text-center text-gray-400 flex flex-col items-center">
                        <FileText className="w-8 h-8 mb-2" />
                        <div className="text-sm">{t.studio.runSimulation}</div>
                      </div>
                    </div>
                  ) : (
                    executionLogs.map((log, idx) => {
                      // Determine icon based on log type or tool name
                      const getLogIcon = () => {
                        if (log.status === 'completed' || log.status === 'success') {
                          return Check;
                        }
                        if (log.status === 'error' || log.status === 'failed') {
                          return AlertCircle;
                        }
                        if (log.type === 'handoff') {
                          return ArrowRight;
                        }
                        if (log.tool_name?.toLowerCase().includes('calendar') || log.tool_name?.toLowerCase().includes('schedule')) {
                          return Calendar;
                        }
                        if (log.tool_name?.toLowerCase().includes('email') || log.tool_name?.toLowerCase().includes('mail')) {
                          return Mail;
                        }
                        if (log.tool_name?.toLowerCase().includes('voice') || log.tool_name?.toLowerCase().includes('call')) {
                          return Phone;
                        }
                        if (log.tool_name?.toLowerCase().includes('message') || log.tool_name?.toLowerCase().includes('chat')) {
                          return MessageSquare;
                        }
                        return Zap; // Default icon for tool calls
                      };
                      
                      const LogIcon = getLogIcon();
                      const iconColor = log.status === 'error' || log.status === 'failed' 
                        ? 'text-red-500' 
                        : log.status === 'completed' || log.status === 'success'
                        ? 'text-green-500'
                        : 'text-blue-500';
                      
                      return (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                              <LogIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{log.tool_name || 'Tool Call'}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                                </span>
                              </div>
                              {log.message && <p className="text-gray-600 text-sm">{log.message}</p>}
                              {log.description && <p className="text-gray-500 text-xs mt-1">{log.description}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                <Brain className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-900">{t.studio.memoryLayer}</div>
                  <div className="text-sm text-gray-500">{t.studio.learnedPatterns}</div>
                </div>
              </div>
            </div>
            {[
              { text: `${data.entityName}s ${t.studio.memoryTexts.respondBetter}`, confidence: 87 },
              { text: t.studio.memoryTexts.voiceCallsSuccess, confidence: 92 },
              { text: t.studio.memoryTexts.secondFollowUp, confidence: 79 },
              { text: t.studio.memoryTexts.callsAfter6PM, confidence: 84 }
            ].map((m, i) => (
              <div key={i} className="p-5 border-b border-gray-50 last:border-0">
                <div className="text-sm text-gray-800 mb-3">"{m.text}"</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.confidence}%`, background: primaryGradient }} />
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
              { icon: Hash, title: t.studio.contactLimits, desc: t.studio.maxAttemptsPerDay, value: '3' },
              { icon: Moon, title: t.studio.quietHours, desc: t.studio.noOutboundDuring, value: '10PM-7AM' },
              { icon: AlertTriangle, title: t.studio.escalationThreshold, desc: t.studio.whenConfidenceBelow, value: '60%' },
              { icon: Star, title: t.studio.vipOverride, desc: t.studio.alwaysEscalateVip, value: t.studio.enabled }
            ].map((g, i) => {
              const IconComponent = g.icon;
              return (
                <Card key={i} className="p-5">
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#2A2A2A]">{g.title}</div>
                      <div className="text-sm text-[#7C7C7C] mb-3 font-medium">{g.desc}</div>
                      <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: theme.light, color: theme.primary }}>
                        {g.value}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F8F8F8', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-[#E5E5EA] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { navigate('/dashboard'); goToLevel(1); setSelectedRecord(null); }}
            >
              <img 
                src="/nextaction_logo_1.png" 
                alt="Next Action Logo" 
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="logo-fallback w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold shadow-lg hidden" style={{ background: primaryGradient }}>
                NA2
              </div>
            </div>
            {/* <span className="text-xl font-bold text-[#2A2A2A] tracking-tight">Next Action</span> */}
          </div>

          
          <div className="flex items-center gap-2 p-1.5 bg-[#F5F5F5] rounded-2xl border border-[#E5E5EA]">
            {[
              { id: 'dashboard', label: t.nav.dashboard, path: '/dashboard' },
              { id: 'operations', label: t.nav.operations, path: '/operations' },
              { id: 'studio', label: t.nav.studio, path: '/studio' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => { 
                  navigate(view.path);
                  if (view.id === 'dashboard') goToLevel(1); 
                  if (view.id === 'operations') setSelectedRecord(null); 
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeView === view.id 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedIndustry} 
              onChange={(e) => { setSelectedIndustry(e.target.value as any); goToLevel(1); setSelectedRecord(null); }} 
              className="px-5 py-2.5 rounded-xl border border-[#D1D1D6] text-sm font-semibold text-[#383838] bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1b44fe] focus:ring-offset-2"
            >
              {Object.entries(colors).map(([key, val]) => (
                <option key={key} value={key}>{t.industries[key as keyof typeof t.industries].name}</option>
              ))}
            </select>
            
            {/* Language Selector */}
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)} 
              className="px-4 py-2 rounded-xl border border-[#D1D1D6] text-sm font-semibold text-[#383838] bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1b44fe] focus:ring-offset-2"
            >
              <option value="en">🇺🇸 English</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Layer Navigation (Dashboard only) */}
      {activeView === 'dashboard' && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#E5E5EA]">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-3">
            {[{ level: 1, label: t.dashboard.outcomes }, { level: 2, label: `${data.capacityUnit}` }, { level: 3, label: t.dashboard.channels }, { level: 4, label: t.dashboard.conversations }].map((layer, idx) => (
              <React.Fragment key={layer.level}>
                {idx > 0 && <span className="text-gray-300 text-lg font-light">›</span>}
                <button 
                  onClick={() => layer.level <= drillDownLevel && goToLevel(layer.level)} 
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    drillDownLevel === layer.level 
                      ? 'text-white shadow-md' 
                      : drillDownLevel > layer.level 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'text-gray-400 cursor-not-allowed'
                  }`} 
                  style={drillDownLevel === layer.level ? { background: primaryGradient } : {}} 
                  disabled={layer.level > drillDownLevel}
                >
                  {layer.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="max-w-7xl mx-auto px-8 py-10">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 w-full border-t border-[#E5E5EA] bg-white/80 backdrop-blur-sm py-6">
        <div className="text-center">
          <span className="text-sm font-medium text-[#5E5E5E]">
            <span className="font-bold" style={{ color: theme.primary }}>NA2</span> decides and executes — humans supervise
          </span>
        </div>
      </footer>
    </div>
  );
};

export default NA2Platform;
