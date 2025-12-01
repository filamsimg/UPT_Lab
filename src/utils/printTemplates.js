import { buildLetterhead } from './print/header';
import {
  buildPrintLayout,
  prepareTitle,
  buildPermintaanBody,
  buildPermintaanStyles,
  buildKajiUlangBody,
  buildKajiUlangStyles,
  buildValidasiBody,
  buildValidasiStyles,
  formatCurrency,
  formatFullDate,
  translateStatus,
} from './print/content';
import {
  buildPermintaanSignature,
  buildKajiUlangSignature,
  buildValidasiSignature,
} from './print/footer';

export { formatCurrency, formatFullDate, translateStatus };

export function buildPermintaanPrintHtml(row, type = 'request', options = {}) {
  const baseTitle =
    type === 'invoice' ? 'Invoice Pembayaran' : 'Permintaan Pengujian';
  const { titleMarkup, titleForHead } = prepareTitle(options, baseTitle);
  const headerConfig = {
    ...(options.header || {}),
    formTitle: options.header?.formTitle || titleForHead,
  };
  const meta = options.headerMeta || options.header?.meta;
  const headerContent = buildLetterhead(headerConfig, options.logoSrc, meta);
  const bodyContent = buildPermintaanBody(row, type, titleMarkup);
  const footerContent = buildPermintaanSignature(row.entryDate);

  return buildPrintLayout({
    title: titleForHead,
    styles: buildPermintaanStyles(),
    headerContent,
    bodyContent,
    footerContent,
    pageClass: 'page',
  });
}

export function buildKajiUlangPrintHtml(order = {}, options = {}) {
  const baseTitle = 'Berita Acara Kaji Ulang Permintaan Pengujian';
  const { titleForHead } = prepareTitle(options, baseTitle);
  const headerConfig = {
    ...(options.header || {}),
    formTitle: options.header?.formTitle || titleForHead,
  };
  const meta = options.headerMeta || options.header?.meta;
  const headerContent = buildLetterhead(headerConfig, options.logoSrc, meta);
  const bodyContent = buildKajiUlangBody(order, titleForHead);
  const footerContent = buildKajiUlangSignature(order);

  return buildPrintLayout({
    title: titleForHead,
    styles: buildKajiUlangStyles(),
    headerContent,
    bodyContent,
    footerContent,
    pageClass: 'page',
  });
}

export function buildValidasiPrintHtml(order = {}, options = {}) {
  const baseTitle = 'Validasi Pengujian';
  const { titleForHead } = prepareTitle(options, baseTitle);
  const headerConfig = {
    ...(options.header || {}),
    formTitle: options.header?.formTitle || titleForHead,
  };
  const meta = options.headerMeta || options.header?.meta;
  const headerContent = buildLetterhead(headerConfig, options.logoSrc, meta);
  const bodyContent = buildValidasiBody(order, titleForHead);
  const footerContent = buildValidasiSignature(order);

  return buildPrintLayout({
    title: titleForHead,
    styles: buildValidasiStyles(),
    headerContent,
    bodyContent,
    footerContent,
    pageClass: 'page',
  });
}
