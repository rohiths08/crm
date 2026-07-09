export interface CSVRow {
  createdAt: string
  name: string
  email: string
  phone: string
  company: string
  city: string
  state: string
  country: string
  source: string
  leadOwner: string
}

export interface ImportedRecord extends CSVRow {
  leadName: string
  countryCode: string
  mobileNumber: string
  crmStatus: 'GOOD_LEAD_FOLLOW_UP' | 'SALE_DONE' | 'BAD_LEAD' | 'DID_NOT_CONNECT'
  crmNote: string
  dataSource: string
  possessionTime: string
  description: string
  aiConfidence: number
}

export interface SkippedRecord {
  originalRow: string[]
  reason: string
  preview: Record<string, string>
}

export const mockCSVData: CSVRow[] = [
  {
    createdAt: '2024-01-15',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-415-555-0132',
    company: 'TechCorp Inc',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    source: 'Facebook Leads',
    leadOwner: 'Alice Chen',
  },
  {
    createdAt: '2024-01-14',
    name: 'Michael Chen',
    email: 'michael.chen@innovateai.io',
    phone: '+1-650-555-0145',
    company: 'InnovateAI',
    city: 'Palo Alto',
    state: 'CA',
    country: 'USA',
    source: 'Google Ads',
    leadOwner: 'Bob Smith',
  },
  {
    createdAt: '2024-01-13',
    name: 'Emma Williams',
    email: 'emma.w@globalconsulting.com',
    phone: '+44-20-7946-0958',
    company: 'Global Consulting',
    city: 'London',
    state: 'England',
    country: 'UK',
    source: 'LinkedIn',
    leadOwner: 'Carol White',
  },
  {
    createdAt: '2024-01-12',
    name: 'James Rodriguez',
    email: 'james.rodriguez@marketingpro.com',
    phone: '+1-212-555-0156',
    company: 'Marketing Pro Solutions',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    source: 'Facebook Leads',
    leadOwner: 'Alice Chen',
  },
  {
    createdAt: '2024-01-11',
    name: 'Lisa Park',
    email: 'lisa.park@designstudio.co.kr',
    phone: '+82-2-6954-0012',
    company: 'Design Studio Seoul',
    city: 'Seoul',
    state: 'Seoul',
    country: 'South Korea',
    source: 'Direct Outreach',
    leadOwner: 'David Kim',
  },
  {
    createdAt: '2024-01-10',
    name: 'Roberto Martinez',
    email: 'roberto.m@latamtech.mx',
    phone: '+52-55-2623-1610',
    company: 'LatamTech Solutions',
    city: 'Mexico City',
    state: 'Mexico City',
    country: 'Mexico',
    source: 'Referral',
    leadOwner: 'Carlos López',
  },
  {
    createdAt: '2024-01-09',
    name: 'Sophia Mueller',
    email: 'sophia.mueller@europeinnovate.de',
    phone: '+49-30-2061-6400',
    company: 'Europe Innovate GmbH',
    city: 'Berlin',
    state: 'Berlin',
    country: 'Germany',
    source: 'Industry Event',
    leadOwner: 'Eva Schmidt',
  },
  {
    createdAt: '2024-01-08',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@tokyotech.jp',
    phone: '+81-3-6369-6300',
    company: 'Tokyo Tech Partners',
    city: 'Tokyo',
    state: 'Tokyo',
    country: 'Japan',
    source: 'Google Ads',
    leadOwner: 'Haruto Sato',
  },
  {
    createdAt: '2024-01-07',
    name: 'Anna Kowalski',
    email: 'anna.k@warsawbusiness.pl',
    phone: '+48-22-635-0301',
    company: 'Warsaw Business Group',
    city: 'Warsaw',
    state: 'Warsaw',
    country: 'Poland',
    source: 'LinkedIn',
    leadOwner: 'Marta Lewandowski',
  },
  {
    createdAt: '2024-01-06',
    name: 'Thomas Anderson',
    email: 'thomas.anderson@sydneyventures.com.au',
    phone: '+61-2-8022-0150',
    company: 'Sydney Ventures',
    city: 'Sydney',
    state: 'NSW',
    country: 'Australia',
    source: 'Facebook Leads',
    leadOwner: 'Jennifer Wilson',
  },
]

// Generate a larger dataset by duplicating and modifying
export const generateMockCSVData = (count: number = 1000): CSVRow[] => {
  const data: CSVRow[] = []
  for (let i = 0; i < count; i++) {
    const base = mockCSVData[i % mockCSVData.length]
    data.push({
      ...base,
      name: `${base.name} ${i + 1}`,
      email: `${base.email.split('@')[0]}.${i + 1}@${base.email.split('@')[1]}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    })
  }
  return data
}

export const mockImportedRecords: ImportedRecord[] = [
  {
    ...mockCSVData[0],
    leadName: 'Sarah Johnson',
    countryCode: '+1',
    mobileNumber: '4155550132',
    crmStatus: 'GOOD_LEAD_FOLLOW_UP',
    crmNote: 'High-value prospect, interested in enterprise solution',
    dataSource: 'Facebook Leads',
    possessionTime: '2 hours',
    description: 'SaaS company decision maker',
    aiConfidence: 0.98,
  },
  {
    ...mockCSVData[1],
    leadName: 'Michael Chen',
    countryCode: '+1',
    mobileNumber: '6505550145',
    crmStatus: 'SALE_DONE',
    crmNote: 'Closed deal for annual contract',
    dataSource: 'Google Ads',
    possessionTime: '1 hour',
    description: 'AI startup founder',
    aiConfidence: 0.96,
  },
  {
    ...mockCSVData[2],
    leadName: 'Emma Williams',
    countryCode: '+44',
    mobileNumber: '2079460958',
    crmStatus: 'GOOD_LEAD_FOLLOW_UP',
    crmNote: 'Scheduled demo for next week',
    dataSource: 'LinkedIn',
    possessionTime: '30 minutes',
    description: 'Enterprise consulting company',
    aiConfidence: 0.94,
  },
  {
    ...mockCSVData[3],
    leadName: 'James Rodriguez',
    countryCode: '+1',
    mobileNumber: '2125550156',
    crmStatus: 'DID_NOT_CONNECT',
    crmNote: 'No response to multiple attempts',
    dataSource: 'Facebook Leads',
    possessionTime: '45 minutes',
    description: 'Marketing agency VP',
    aiConfidence: 0.78,
  },
  {
    ...mockCSVData[4],
    leadName: 'Lisa Park',
    countryCode: '+82',
    mobileNumber: '269540012',
    crmStatus: 'BAD_LEAD',
    crmNote: 'Not a target market, early stage',
    dataSource: 'Direct Outreach',
    possessionTime: '20 minutes',
    description: 'Small design studio',
    aiConfidence: 0.65,
  },
]

export const mockSkippedRecords: SkippedRecord[] = [
  {
    originalRow: ['2024-01-05', '', 'john@example.com', '', 'Startup XYZ', 'Boston', 'MA'],
    reason: 'Missing email and phone',
    preview: {
      date: '2024-01-05',
      company: 'Startup XYZ',
      city: 'Boston',
    },
  },
  {
    originalRow: ['2024-01-04', 'Jane Doe', 'invalid-email', '+1-555-0167', 'Company Z'],
    reason: 'Invalid record',
    preview: {
      name: 'Jane Doe',
      email: 'invalid-email',
      phone: '+1-555-0167',
    },
  },
  {
    originalRow: ['2024-01-03', 'Bob Smith', '', '', 'Unknown Corp'],
    reason: 'Unable to map required fields',
    preview: {
      name: 'Bob Smith',
      company: 'Unknown Corp',
    },
  },
]

export const mockSummaryStats = {
  totalRows: 1000,
  successfullyImported: 832,
  skippedRecords: 168,
  successRate: 83.2,
  processingTime: '2m 34s',
  averageAiConfidence: 0.89,
}
