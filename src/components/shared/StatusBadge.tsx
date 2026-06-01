import { cn } from '@/lib/utils';

export type InvoiceStatus = 'DRAFT' | 'GENERATED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type BadgeStatus = InvoiceStatus | PaymentStatus | StockStatus;

const CLASS_MAP: Record<BadgeStatus, string> = {
  DRAFT:        'badge badge-cancelled',
  GENERATED:    'badge badge-partial',
  PENDING:      'badge badge-pending',
  PARTIAL:      'badge badge-partial',
  PAID:         'badge badge-paid',
  CANCELLED:    'badge badge-cancelled',
  IN_STOCK:     'badge badge-in-stock',
  LOW_STOCK:    'badge badge-low-stock',
  OUT_OF_STOCK: 'badge badge-no-stock',
};

const LABEL_MAP: Record<BadgeStatus, string> = {
  DRAFT:        'Draft',
  GENERATED:    'Generated',
  PENDING:      'Pending',
  PARTIAL:      'Partial',
  PAID:         'Paid',
  CANCELLED:    'Cancelled',
  IN_STOCK:     'In Stock',
  LOW_STOCK:    'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(CLASS_MAP[status], className)}>
      {LABEL_MAP[status]}
    </span>
  );
}
