import type { CompanyJob } from '../types/job';
import { PaymentEnum } from '../types/enums';
export function companyPaymentLabel(job: CompanyJob) { return job.paymentStatus === PaymentEnum.Successful ? 'Successful' : job.paymentStatus === PaymentEnum.Pending ? 'Pending review' : job.paymentStatus === PaymentEnum.Failed ? 'Failed' : job.paymentStatus === PaymentEnum.Refunded ? 'Refunded' : 'Not submitted'; }
export function jobTone(job: CompanyJob) { return ['in-progress', 'completed'].includes(job.status) ? 'green' : ['rejected', 'cancelled'].includes(job.status) ? 'gray' : ''; }
