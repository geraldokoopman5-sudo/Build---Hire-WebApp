import type { CompanyJob } from '../types/job';

export const companyJobs: CompanyJob[] = [
  {
    id: 'warehouse-foundation',
    status: 'working',
    title: 'Modern Warehouse Foundation',
    description: 'Complete concrete pouring and framing for main structural foundation.',
    dateRange: 'Oct 1 - Dec 15',
    quoteAmount: 45000,
    amountPaid: 15000,
    paymentState: 'successful',
    paymentNote: 'Initial Deposit',
  },
  {
    id: 'riverside-framing',
    status: 'available',
    title: 'Riverside Residential Framing',
    description: 'Timber framing for 4-bedroom residential property. Needs crew of 8.',
    dateRange: 'Nov 10 - Jan 20',
    quoteAmount: 28500,
    amountPaid: 0,
    paymentState: 'pending',
    paymentNote: 'Awaiting Agreement',
  },
  {
    id: 'downtown-demolition',
    status: 'unavailable',
    title: 'Downtown Plaza Demolition',
    description: 'Controlled demolition of old commercial structure. Permits pending.',
    dateRange: 'TBD - TBD',
    quoteAmount: 120000,
    amountPaid: 0,
    paymentState: 'on-hold',
    paymentNote: 'On Hold',
  },
];