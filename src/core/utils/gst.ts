// GST Calculation Utilities
// Supports intra-state (CGST + SGST) and inter-state (IGST) tax logic

export type GSTType = 'INTRASTATE' | 'INTERSTATE';

export interface GSTBreakdown {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface LineItem {
  quantity: number;
  rate: number;
  gstPercentage: number;
}

/**
 * Determines if the transaction is inter-state (IGST) or intra-state (CGST+SGST).
 * Based on whether the supplier state matches the customer state.
 */
export function getGSTType(supplierState: string, customerState: string): GSTType {
  if (!supplierState || !customerState) return 'INTRASTATE';
  return supplierState.trim().toUpperCase() === customerState.trim().toUpperCase()
    ? 'INTRASTATE'
    : 'INTERSTATE';
}

/**
 * Calculates line total for a single product row (before tax).
 */
export function calcLineSubtotal(quantity: number, rate: number): number {
  return round2(quantity * rate);
}

/**
 * Calculates GST amounts for a single line item.
 */
export function calcLineGST(
  subtotal: number,
  gstPercentage: number,
  gstType: GSTType
): { cgst: number; sgst: number; igst: number; lineTotal: number } {
  const gstDecimal = gstPercentage / 100;
  const totalGST = round2(subtotal * gstDecimal);

  if (gstType === 'INTERSTATE') {
    return { cgst: 0, sgst: 0, igst: totalGST, lineTotal: round2(subtotal + totalGST) };
  }

  const halfGST = round2(totalGST / 2);
  return { cgst: halfGST, sgst: halfGST, igst: 0, lineTotal: round2(subtotal + totalGST) };
}

/**
 * Calculates full invoice GST breakdown across all line items.
 */
export function calcInvoiceGST(items: LineItem[], gstType: GSTType): GSTBreakdown {
  let subtotal = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  for (const item of items) {
    const lineSubtotal = calcLineSubtotal(item.quantity, item.rate);
    const lineGST = calcLineGST(lineSubtotal, item.gstPercentage, gstType);
    subtotal += lineSubtotal;
    cgstAmount += lineGST.cgst;
    sgstAmount += lineGST.sgst;
    igstAmount += lineGST.igst;
  }

  return {
    subtotal: round2(subtotal),
    cgstAmount: round2(cgstAmount),
    sgstAmount: round2(sgstAmount),
    igstAmount: round2(igstAmount),
    totalAmount: round2(subtotal + cgstAmount + sgstAmount + igstAmount),
  };
}

/** Rounds a number to 2 decimal places */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
