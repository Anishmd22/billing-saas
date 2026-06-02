// Puppeteer-based PDF renderer
// Dev:  uses puppeteer with the cached Chromium binary
// Prod: uses @sparticuz/chromium — Lambda/Vercel-compatible binary

import puppeteerCore, { type Browser } from 'puppeteer-core';

async function getBrowser(): Promise<Browser> {
  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Development: use puppeteer's cached Chromium.
  // executablePath() is async in Puppeteer 25 — await it explicitly so we
  // pass a concrete path rather than a Promise object.
  const { default: puppeteer } = await import('puppeteer');
  const executablePath = await puppeteer.executablePath();

  return puppeteerCore.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
    ],
  });
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
