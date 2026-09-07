import { AccountStatus } from '../types/enums';

export type BadgeTone = 'success' | 'pending' | 'danger' | 'neutral';

export function getPlatformStatusLabel(status: AccountStatus, isFlagged: boolean): string {
  if (isFlagged) return 'Flagged';

  switch (status) {
    case AccountStatus.Active:
      return 'Verified';
    case AccountStatus.Pending:
      return 'Pending';
    case AccountStatus.InActive:
      return 'Suspended';
    case AccountStatus.Deleted:
      return 'Deleted';
    default:
      return 'Unknown';
  }
}

export function getPlatformStatusTone(status: AccountStatus, isFlagged: boolean): BadgeTone {
  if (isFlagged) return 'danger';

  switch (status) {
    case AccountStatus.Active:
      return 'success';
    case AccountStatus.Pending:
      return 'pending';
    case AccountStatus.InActive:
    case AccountStatus.Deleted:
      return 'neutral';
    default:
      return 'neutral';
  }
}