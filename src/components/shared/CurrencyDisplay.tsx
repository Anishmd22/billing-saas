import { formatCurrency } from '@/core/utils/currency';
import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  sm:      'font-mono text-sm font-medium',
  default: 'text-currency',
  lg:      'text-grand-total',
} as const;

interface CurrencyDisplayProps {
  amount: number | string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export default function CurrencyDisplay({
  amount,
  size = 'default',
  className,
}: CurrencyDisplayProps) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (
    <span className={cn(SIZE_CLASS[size], className)}>
      {formatCurrency(isNaN(value) ? 0 : value)}
    </span>
  );
}
