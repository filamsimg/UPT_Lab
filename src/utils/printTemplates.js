// Template printer-friendly untuk cetak dokumen
import { buildKajiUlangHeader, buildFormulirHeader } from './print/header';
import {
  buildPrintLayout,
  prepareTitle,
  buildKajiUlangBody,
  buildKajiUlangStyles,
  buildFormulirPengujianBody,
  buildFormulirPengujianStyles,
  buildPermintaanPengujianBody,
  buildPermintaanPengujianStyles,
  buildOrderPrintStyles,
  sanitize,
} from './print/content';

export function buildKajiUlangPrintHtml(order = {}, options = {}) {
  const baseTitle = 'Formulir Permohonan';
  const { titleForHead } = prepareTitle(options, baseTitle);
  const headerContent = buildKajiUlangHeader(options.logoSrc || options.logo);
  const bodyContent = buildKajiUlangBody(order, options);

  return buildPrintLayout({
    title: titleForHead,
    styles: buildKajiUlangStyles(),
    headerContent,
    bodyContent,
    footerContent: '',
    pageClass: 'kaji-ulang-page',
  });
}

export function buildFormulirPengujianPrintHtml(order = {}, options = {}) {
  const baseTitle = 'Formulir Pengujian';
  const { titleForHead } = prepareTitle(options, baseTitle);
  const headerContent = buildFormulirHeader(options.logoSrc || options.logo);
  const bodyContent = buildFormulirPengujianBody(order, options);

  return buildPrintLayout({
    title: titleForHead,
    styles: buildFormulirPengujianStyles(),
    headerContent,
    bodyContent,
    footerContent: '',
    pageClass: 'formulir-page',
  });
}

function toSafeFileSegment(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildOrderPrintTitle(order = {}) {
  const orderId = toSafeFileSegment(
    order.orderNo || order.id || order.orderId || order.order_code || ''
  );
  const customerName = toSafeFileSegment(order.customerName || '');
  const parts = ['cetak', orderId, customerName].filter(Boolean);
  return parts.length ? parts.join('_') : 'Cetak Order';
}

export function buildOrderPrintHtml(order = {}, options = {}) {
  const baseTitle = 'Cetak Order';
  const defaultTitle = buildOrderPrintTitle(order);
  const resolvedOptions = options.title
    ? options
    : { ...options, title: defaultTitle };
  const { titleForHead } = prepareTitle(resolvedOptions, baseTitle);
  const safeTitle = sanitize(titleForHead || defaultTitle || baseTitle);
  const kajiHeader = buildKajiUlangHeader(options.logoSrc || options.logo);
  const kajiBody = buildKajiUlangBody(order, options);
  const formulirHeader = buildFormulirHeader(options.logoSrc || options.logo);
  const formulirBody = buildFormulirPengujianBody(order, options);
  const permintaanHeader = buildFormulirHeader(options.logoSrc || options.logo);
  const permintaanBody = buildPermintaanPengujianBody(order, options);
  const styles = [
    buildOrderPrintStyles(),
    buildKajiUlangStyles(),
    buildFormulirPengujianStyles(),
    buildPermintaanPengujianStyles(),
  ].join('\n');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${safeTitle}</title>
        ${styles}
      </head>
      <body>
        <div class="print-page kaji-ulang-page">
          ${kajiHeader}
          <div class="content-frame">
            ${kajiBody}
          </div>
        </div>
        <div class="print-page formulir-page">
          ${formulirHeader}
          <div class="content-frame">
            ${formulirBody}
          </div>
        </div>
        <div class="print-page permintaan-page">
          ${permintaanHeader}
          <div class="content-frame">
            ${permintaanBody}
          </div>
        </div>
      </body>
    </html>
  `;
}
