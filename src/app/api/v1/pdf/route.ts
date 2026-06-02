import { NextRequest } from 'next/server';

// PDF generation via Puppeteer can take up to 30s in cold-start conditions.
// Vercel Pro allows up to 300s; Hobby plan allows 60s.
export const maxDuration = 60;
import { getInvoiceById } from '@/modules/billing/repository';
import { buildInvoiceHTML, type CompanyInfo } from '@/modules/pdf/template';
import { renderInvoicePDF } from '@/modules/pdf/renderer';

function companyInfoFromRequest(params: URLSearchParams): CompanyInfo {
  // Query params take precedence (sent by client from Zustand settings), env vars are the fallback.
  const p = (key: string, env: string) => params.get(key) || process.env[env] || '';
  return {
    name: p('cName', 'COMPANY_NAME'),
    address: p('cAddr', 'COMPANY_ADDRESS'),
    gst: p('cGST', 'COMPANY_GST'),
    phone: p('cPhone', 'COMPANY_PHONE'),
    bankName: p('bName', 'COMPANY_BANK_NAME'),
    bankAccount: p('bAcc', 'COMPANY_BANK_ACCOUNT'),
    bankIFSC: p('bIFSC', 'COMPANY_BANK_IFSC'),
  };
}

export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('invoiceId');

  if (!invoiceId) {
    return Response.json({ success: false, error: { message: 'invoiceId is required' } }, { status: 400 });
  }

  let invoice;
  try {
    invoice = await getInvoiceById(invoiceId);
  } catch {
    return Response.json({ success: false, error: { message: 'Failed to fetch invoice' } }, { status: 500 });
  }

  if (!invoice) {
    return Response.json({ success: false, error: { message: 'Invoice not found' } }, { status: 404 });
  }

  // Serialize Prisma Decimal fields to plain numbers
  const invoiceForPDF = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    cgstAmount: Number(invoice.cgstAmount),
    sgstAmount: Number(invoice.sgstAmount),
    igstAmount: Number(invoice.igstAmount),
    totalAmount: Number(invoice.totalAmount),
    notes: invoice.notes,
    client: {
      companyName: invoice.client.companyName,
      gstNumber: invoice.client.gstNumber,
      address: invoice.client.address,
      phone: invoice.client.phone,
      email: invoice.client.email,
    },
    items: invoice.items.map((item) => ({
      productName: item.productName,
      hsnCode: item.hsnCode,
      quantity: Number(item.quantity),
      unit: item.unit,
      rate: Number(item.rate),
      gstPercentage: Number(item.gstPercentage),
      lineTotal: Number(item.lineTotal),
    })),
    payment: invoice.payment
      ? {
          dueDate: invoice.payment.dueDate?.toISOString() ?? null,
          paymentStatus: invoice.payment.paymentStatus,
          paidAmount: Number(invoice.payment.paidAmount),
          pendingAmount: Number(invoice.payment.pendingAmount),
        }
      : null,
  };

  let pdfBuffer: Buffer;
  try {
    const html = buildInvoiceHTML(invoiceForPDF, companyInfoFromRequest(req.nextUrl.searchParams));
    pdfBuffer = await renderInvoicePDF(html);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/v1/pdf]', reason);
    return Response.json(
      { success: false, error: { message: `PDF generation failed: ${reason}` } },
      { status: 500 }
    );
  }

  const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
