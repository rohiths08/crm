import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UploadCard } from '../components/upload-card'
import { CSVPreviewTable } from '../components/csv-preview-table'
import { CRMResultsTable } from '../components/crm-results-table'

// 1. Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}))

// 2. Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn().mockImplementation(({ count }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * 45,
        size: 45,
        end: (i + 1) * 45,
      })),
    getTotalSize: () => count * 45,
    measureElement: () => {},
  })),
}))

// 3. Mock Recharts components for testing in jsdom environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="cartesiangrid" />,
}))

// 4. Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
  X: () => <span data-testid="icon-x" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  Search: () => <span data-testid="icon-search" />,
  Hexagon: () => <span data-testid="icon-hexagon" />,
  Sun: () => <span data-testid="icon-sun" />,
  Moon: () => <span data-testid="icon-moon" />,
  User: () => <span data-testid="icon-user" />,
  LogOut: () => <span data-testid="icon-logout" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  UploadCloud: () => <span data-testid="icon-upload-cloud" />,
  FileType: () => <span data-testid="icon-file-type" />,
  BrainCircuit: () => <span data-testid="icon-brain-circuit" />,
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  Database: () => <span data-testid="icon-database" />,
}))

describe('UploadCard', () => {
  it('renders the initial drag and drop card', () => {
    render(<UploadCard onFileSelect={() => {}} />)
    expect(screen.getByText('Drag & Drop CSV')).toBeInTheDocument()
    expect(screen.getByText('Choose file')).toBeInTheDocument()
  })

  it('triggers onFileSelect when a file is selected', async () => {
    const handleFileSelect = vi.fn()
    const { container } = render(<UploadCard onFileSelect={handleFileSelect} />)

    const file = new File(['hello,world'], 'test.csv', { type: 'text/csv' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    expect(input).toBeInTheDocument()

    // Simulate input file selection
    fireEvent.change(input, { target: { files: [file] } })

    // Check that our mock callback was triggered
    await waitFor(() => {
      expect(handleFileSelect).toHaveBeenCalledWith(file)
    })
  })
})

describe('CSVPreviewTable', () => {
  const headers = ['Name', 'Email', 'Company']
  const rows = [
    { Name: 'John Doe', Email: 'john@example.com', Company: 'Acme Corp' },
    { Name: 'Jane Smith', Email: 'jane@example.com', Company: 'Initech' },
  ]

  it('renders nothing when not visible', () => {
    const { container } = render(<CSVPreviewTable isVisible={false} headers={headers} rows={rows} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders headers and row contents when visible', () => {
    render(<CSVPreviewTable isVisible={true} headers={headers} rows={rows} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('2 rows')).toBeInTheDocument()
  })

  it('filters rows based on search input', () => {
    render(<CSVPreviewTable isVisible={true} headers={headers} rows={rows} />)
    
    const searchInput = screen.getByPlaceholderText('Search leads...')
    fireEvent.change(searchInput, { target: { value: 'Jane' } })

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('1 rows')).toBeInTheDocument()
  })
})

describe('CRMResultsTable', () => {
  const records = [
    {
      created_at: '2026-07-09',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      company: 'GrowEasy',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
      data_source: 'Google Ads',
    },
    {
      created_at: '2026-07-09',
      name: 'Bob Miller',
      email: 'bob@example.com',
      company: 'TechCorp',
      crm_status: 'SALE_DONE',
      data_source: 'Facebook Leads',
    },
  ]

  it('renders nothing when not visible', () => {
    const { container } = render(<CRMResultsTable isVisible={false} records={records} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders visual analytics charts and records table when visible', () => {
    render(<CRMResultsTable isVisible={true} records={records} />)

    // Analytics section titles
    expect(screen.getByText('CRM Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Top Lead Sources')).toBeInTheDocument()

    // Table elements
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Miller')).toBeInTheDocument()
    expect(screen.getByText('Showing 2 of 2 records')).toBeInTheDocument()
  })
})
