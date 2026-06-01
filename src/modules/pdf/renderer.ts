// Puppeteer-based PDF renderer
// Dev:  uses puppeteer's bundled Chromium (no extra setup)
// Prod: uses @sparticuz/chromium — a Lambda/Vercel-compatible Chromium binary

import puppeteerCore, { type Browser } from 'puppeteer-core';

async function getBrowser(): Promise<Browser> {
  if (process.env.NODE_ENV === 'production') {
    // @sparticuz/chromium provides a Chromium binary built for AWS Lambda / Vercel
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Local development: use the Chromium bundled with puppeteer
  const { default: puppeteer } = await import('puppeteer');
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  }) as unknown as Browser;
}

export async function renderInvoicePDF(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
  }
}
