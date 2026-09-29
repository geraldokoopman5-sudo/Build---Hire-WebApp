import type { JobQuote } from '../types/quote';

export const quotes: JobQuote[] = [
  {
    id: 'q-8492-acd',
    reference: '#Q-8492-ACD',
    jobTitle: 'Kitchen Renovation',
    companyName: 'Apex Construction & Design',
    companyInitials: 'SUMMIT',
    companyTagline: 'Licensed, Bonded, and Insured',
    description:
      "Complete renovation of the primary kitchen space, including demolition of existing fixtures, installation of new custom cabinetry, quartz countertops, and updated plumbing/electrical routing for new appliances.",
    scopeItems: [
      'Demolition and removal of old cabinets, countertops, and flooring.',
      "Supply and installation of 'Oak Ridge' custom solid wood cabinets.",
      "Fabrication and installation of 'Calacatta Gold' quartz countertops (approx. 45 sq ft).",
      'Plumbing updates for new sink location and dishwasher hookup.',
      'Electrical work including 6 new recessed LED lights and 2 pendant rough-ins.',
      'Installation of customer-supplied appliances.',
      'Site cleanup and debris disposal.',
    ],
    estimatedStart: 'October 15, 2023',
    estimatedCompletion: 'November 10, 2023',
    summary: {
      labor: 8500,
      materials: 14250,
      permitsAndFees: 450,
      taxRate: 0.085,
    },
  },
];