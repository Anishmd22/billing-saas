'use client';

import { use } from 'react';
import InvoiceViewScreen from '@/components/billing/InvoiceViewScreen';

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceViewScreen invoiceId={id} />;
}
