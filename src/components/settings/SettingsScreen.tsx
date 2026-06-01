'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/core/store/useAppStore';
import { INDIAN_STATES } from '@/core/constants';
import PageHeader from '@/components/shared/PageHeader';

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';
const SECTION = 'bg-white rounded-xl border border-[var(--color-border)] p-6 mb-4';
const SECTION_TITLE = 'text-sm font-semibold text-[var(--color-text)] mb-4 pb-3 border-b border-[var(--color-border)]';

export default function SettingsScreen() {
  const { settings, setSettings } = useAppStore();

  // Local form state mirrors the store so we can edit without live-updating
  const [form, setForm] = useState({ ...settings });

  function handleChange(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSettings(form);
    toast.success('Settings saved');
  }

  function handleReset() {
    setForm({ ...settings });
    toast('Changes discarded');
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your business information, invoice defaults, and bank details"
      />

      {/* Business Information */}
      <div className={SECTION}>
        <h2 className={SECTION_TITLE}>Business Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Company Name</label>
            <input
              className={INPUT}
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Acme Manufacturing Pvt Ltd"
            />
          </div>
          <div>
            <label className={LABEL}>GSTIN</label>
            <input
              className={`${INPUT} font-mono uppercase`}
              value={form.companyGST}
              onChange={(e) => handleChange('companyGST', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>
          <div>
            <label className={LABEL}>Phone</label>
            <input
              className={INPUT}
              value={form.companyPhone}
              onChange={(e) => handleChange('companyPhone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input
              type="email"
              className={INPUT}
              value={form.companyEmail}
              onChange={(e) => handleChange('companyEmail', e.target.value)}
              placeholder="billing@company.com"
            />
          </div>
          <div>
            <label className={LABEL}>State (for GST)</label>
            <select
              className={INPUT}
              value={form.supplierState}
              onChange={(e) => handleChange('supplierState', e.target.value)}
            >
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={LABEL}>Address</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors resize-none"
              rows={3}
              value={form.companyAddress}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              placeholder="123 Industrial Area, Chennai - 600001, Tamil Nadu"
            />
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className={SECTION}>
        <h2 className={SECTION_TITLE}>Invoice Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Invoice Number Prefix</label>
            <input
              className={`${INPUT} font-mono`}
              value={form.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              placeholder="INV-"
            />
            <p className="text-xs text-[var(--color-muted-light)] mt-1">e.g. INV-, BILL-, 2025-</p>
          </div>
          <div>
            <label className={LABEL}>Payment Due Days</label>
            <input
              type="number"
              min="0"
              max="365"
              className={`${INPUT} font-mono`}
              value={form.dueDays}
              onChange={(e) => handleChange('dueDays', parseInt(e.target.value, 10) || 30)}
            />
            <p className="text-xs text-[var(--color-muted-light)] mt-1">Days after invoice date</p>
          </div>
          <div className="col-span-2">
            <label className={LABEL}>Terms & Conditions</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors resize-none"
              rows={4}
              value={form.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              placeholder="1. Goods once sold will not be taken back.&#10;2. Interest @ 18% p.a. will be charged on overdue payments."
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className={SECTION}>
        <h2 className={SECTION_TITLE}>Bank Details</h2>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          These appear at the bottom of your generated PDF invoices.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Bank Name</label>
            <input
              className={INPUT}
              value={form.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <label className={LABEL}>Account Number</label>
            <input
              className={`${INPUT} font-mono`}
              value={form.bankAccount}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className={LABEL}>IFSC Code</label>
            <input
              className={`${INPUT} font-mono uppercase`}
              value={form.bankIFSC}
              onChange={(e) => handleChange('bankIFSC', e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
              maxLength={11}
            />
          </div>
        </div>
      </div>

      {/* Save / Discard */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isDirty && (
          <button
            onClick={handleReset}
            className="h-9 px-4 text-sm font-medium border border-[var(--color-border)] rounded-lg bg-white hover:bg-[var(--color-surface-secondary)] transition-colors"
          >
            Discard
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="h-9 px-6 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-40"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
