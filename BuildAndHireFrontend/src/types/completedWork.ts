export interface CompletedWorkPost {
  id: string;
  title: string;
  description: string;
  location: string;
  completedOn: string;
  jobId: string | null;
  photoUrl: string;
}
export interface BusinessInformation {
  companyId: string;
  companyName: string;
  status: number;
  city: string;
  province: string;
  photoDataUrl: string | null;
  completedWork: CompletedWorkPost[];
}
