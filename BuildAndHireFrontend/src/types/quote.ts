export type PaymentMethod = 'eft' | 'card' | 'paypal';

export interface QuoteSummary {
  labor: number;
  materials: number;
  permitsAndFees: number;
  taxRate: number;
}

export interface JobQuote {
  id: string;
  reference: string;
  jobTitle: string;
  companyName: string;
  companyInitials: string;
  companyTagline: string;
  description: string;
  scopeItems: string[];
  estimatedStart: string;
  estimatedCompletion: string;
  summary: QuoteSummary;
}