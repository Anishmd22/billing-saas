// PDF Invoice HTML Template
// Returns a self-contained HTML document with inline styles for Puppeteer rendering.

import { formatCurrency, numberToWords } from '@/core/utils/currency';
import { format } from 'date-fns';

export interface InvoiceForPDF {
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  notes: string | null;
  client: {
    companyName: string;
    gstNumber: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  items: {
    productName: string;
    hsnCode: string | null;
    quantity: number;
    unit: string;
    rate: number;
    gstPercentage: number;
    lineTotal: number;
  }[];
  payment: {
    dueDate: string | null;
    paymentStatus: string;
    paidAmount: number;
    pendingAmount: number;
  } | null;
}

export interface CompanyInfo {
  name: string;
  address: string;
  gst: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankIFSC: string;
}

function esc(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildInvoiceHTML(invoice: InvoiceForPDF, company: CompanyInfo): string {
  const isIntrastate = invoice.cgstAmount > 0 || invoice.sgstAmount > 0;
  const dueDate = invoice.payment?.dueDate
    ? format(new Date(invoice.payment.dueDate), 'dd MMM yyyy')
    : null;

  const itemRows = invoice.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b">${idx + 1}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-weight:500">${esc(item.productName)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:11px;color:#64748b">${esc(item.hsnCode) || '—'}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace">${item.quantity}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;color:#64748b">${esc(item.unit)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace">${formatCurrency(item.rate)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:center">${item.gstPercentage}%</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-weight:600">${formatCurrency(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const taxRows = isIntrastate
    ? `
      <tr>
        <td style="padding:4px 0;text-align:right;color:#6366f1;width:120px">CGST</td>
        <td style="padding:4px 0 4px 16px;text-align:right;font-family:monospace;color:#6366f1">${formatCurrency(invoice.cgstAmount)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;text-align:right;color:#8b5cf6">SGST</td>
        <td style="padding:4px 0 4px 16px;text-align:right;font-family:monospace;color:#8b5cf6">${formatCurrency(invoice.sgstAmount)}</td>
      </tr>`
    : `
      <tr>
        <td style="padding:4px 0;text-align:right;color:#ec4899;width:120px">IGST</td>
        <td style="padding:4px 0 4px 16px;text-align:right;font-family:monospace;color:#ec4899">${formatCurrency(invoice.igstAmount)}</td>
      </tr>`;

  const bankSection = (company.bankName || company.bankAccount || company.bankIFSC)
    ? `
      <td style="width:50%;padding-right:16px;vertical-align:top">
        <p style="margin:0 0 6px;font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Bank Details</p>
        ${company.bankName ? `<p style="margin:0 0 3px;font-size:12px"><strong>Bank:</strong> ${esc(company.bankName)}</p>` : ''}
        ${company.bankAccount ? `<p style="margin:0 0 3px;font-size:12px"><strong>A/C No:</strong> <span style="font-family:monospace">${esc(company.bankAccount)}</span></p>` : ''}
        ${company.bankIFSC ? `<p style="margin:0;font-size:12px"><strong>IFSC:</strong> <span style="font-family:monospace">${esc(company.bankIFSC)}</span></p>` : ''}
      </td>`
    : `<td style="width:50%"></td>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${esc(invoice.invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #0f172a;
      line-height: 1.5;
      background: #fff;
    }
    .page {
      max-width: 794px;
      margin: 0 auto;
      padding: 32px;
    }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    h2 { font-size: 14px; font-weight: 600; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header: Company + Invoice Info -->
  <table style="margin-bottom:24px">
    <tr>
      <td style="vertical-align:top;width:60%">
        <h1 style="color:#0f172a;margin-bottom:4px">${esc(company.name) || 'Your Company'}</h1>
        ${company.address ? `<p style="color:#64748b;font-size:12px;margin-bottom:2px">${esc(company.address)}</p>` : ''}
        ${company.gst ? `<p style="color:#64748b;font-size:12px;font-family:monospace">GSTIN: ${esc(company.gst)}</p>` : ''}
        ${company.phone ? `<p style="color:#64748b;font-size:12px">Ph: ${esc(company.phone)}</p>` : ''}
      </td>
      <td style="vertical-align:top;text-align:right;width:40%">
        <p style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Tax Invoice</p>
        <p style="font-family:monospace;font-size:16px;font-weight:700;color:#0f172a">${esc(invoice.invoiceNumber)}</p>
        <p style="color:#64748b;font-size:12px;margin-top:4px">Date: ${format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</p>
        ${dueDate ? `<p style="color:#64748b;font-size:12px">Due: ${dueDate}</p>` : ''}
        ${invoice.status === 'CANCELLED' ? `<p style="margin-top:6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em">CANCELLED</p>` : ''}
      </td>
    </tr>
  </table>

  <hr style="border:none;border-top:2px solid #0f172a;margin-bottom:20px">

  <!-- Bill To -->
  <div style="margin-bottom:20px">
    <p style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Bill To</p>
    <h2 style="font-size:15px;margin-bottom:3px">${esc(invoice.client.companyName)}</h2>
    ${invoice.client.gstNumber ? `<p style="font-family:monospace;font-size:11px;color:#64748b">GSTIN: ${esc(invoice.client.gstNumber)}</p>` : ''}
    ${invoice.client.address ? `<p style="color:#64748b;font-size:12px;margin-top:2px">${esc(invoice.client.address)}</p>` : ''}
    ${invoice.client.phone ? `<p style="color:#64748b;font-size:12px">Ph: ${esc(invoice.client.phone)}</p>` : ''}
  </div>

  <!-- Line Items -->
  <table style="margin-bottom:20px">
    <thead>
      <tr style="background:#f8fafc;border-bottom:2px solid #0f172a">
        <th style="padding:8px 6px;text-align:center;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:32px">#</th>
        <th style="padding:8px 6px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Description</th>
        <th style="padding:8px 6px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:70px">HSN</th>
        <th style="padding:8px 6px;text-align:right;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:50px">Qty</th>
        <th style="padding:8px 6px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:40px">Unit</th>
        <th style="padding:8px 6px;text-align:right;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:90px">Rate</th>
        <th style="padding:8px 6px;text-align:center;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:50px">GST%</th>
        <th style="padding:8px 6px;text-align:right;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:100px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <table style="margin-bottom:16px">
    <tr>
      <td style="width:100%"></td>
      <td style="width:260px;vertical-align:top">
        <table style="width:100%">
          <tr>
            <td style="padding:4px 0;text-align:right;color:#64748b;width:120px">Subtotal</td>
            <td style="padding:4px 0 4px 16px;text-align:right;font-family:monospace">${formatCurrency(invoice.subtotal)}</td>
          </tr>
          ${taxRows}
          <tr>
            <td colspan="2" style="padding:0"><hr style="border:none;border-top:2px solid #0f172a;margin:8px 0"></td>
          </tr>
          <tr>
            <td style="padding:4px 0;text-align:right;font-weight:700;font-size:15px">Grand Total</td>
            <td style="padding:4px 0 4px 16px;text-align:right;font-family:monospace;font-weight:700;font-size:17px">${formatCurrency(invoice.totalAmount)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Amount in Words -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;margin-bottom:20px">
    <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em">Amount in Words: </span>
    <span style="font-size:12px;font-style:italic">${esc(numberToWords(invoice.totalAmount))}</span>
  </div>

  ${invoice.notes ? `
  <!-- Notes -->
  <div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;margin-bottom:20px">
    <p style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px">Notes</p>
    <p style="font-size:12px">${esc(invoice.notes)}</p>
  </div>` : ''}

  <!-- Footer: Bank Details + Signature -->
  <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:16px">
  <table>
    <tr>
      ${bankSection}
      <td style="width:50%;padding-left:16px;vertical-align:top;text-align:right">
        <p style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:32px">For ${esc(company.name) || 'Company'}</p>
        <p style="font-size:11px;color:#64748b;border-top:1px solid #0f172a;display:inline-block;padding-top:6px">Authorised Signatory</p>
      </td>
    </tr>
  </table>

</div>
</body>
</html>`;
}
