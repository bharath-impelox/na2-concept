# NA2 - Next Action Platform

An AI-powered platform that presents business data in outcome-first, decision-centric language rather than raw system data.

## Key Features

- **Business-Language Cards**: Primary view showing actionable insights in natural language
- **Natural-Language Lists**: Detailed recommendations when drilling into cards
- **System View**: Optional power-user view for raw system data (hidden by default)
- **Industry-Specific Vocabulary**: Adapts language for Clinics, Hotels, Trading, Insurance, and Sales
- **Outcome-First Design**: Shows "what needs attention" rather than data tables

## Design Principles

1. **Outcome first → Decision second → Data last**
2. Never show system language by default
3. Industry-native vocabulary
4. Decision-centric, not data-centric

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── BusinessLanguageCard.tsx    # Primary view cards
│   ├── NaturalLanguageList.tsx     # Second level detail view
│   ├── SystemView.tsx              # Optional system data view
│   └── Dashboard.tsx               # Main dashboard component
├── config/             # Configuration files
│   └── industryVocabulary.ts       # Industry vocabulary mapping
├── data/               # Mock data
│   └── mockData.ts                 # Sample data for all industries
├── types/              # TypeScript types
│   └── index.ts                    # Type definitions
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## Supported Industries

- **Clinics**: Appointments, Patients, Slots
- **Hotels**: Bookings, Guests, Rooms
- **Trading**: Quotes, Customers, Meetings
- **Insurance**: Policies, Clients, Meetings
- **Sales**: Quotes, Customers, Invoices

## Usage

1. Select your industry from the dropdown in the header
2. View business-language cards showing what needs attention
3. Click any card to see detailed natural-language recommendations
4. Optionally view system data (power user view) from the detail view

## Technology Stack

- React 18
- TypeScript
- Vite
- CSS (no external UI libraries - custom design)
