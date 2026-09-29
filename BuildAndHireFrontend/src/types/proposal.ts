export interface ProposalFormValues {
  fullName: string;
  company: string;
  projectType: string;
  projectDescription: string;
}

export interface ProposalFormErrors {
  fullName?: string;
  company?: string;
  projectDescription?: string;
}   