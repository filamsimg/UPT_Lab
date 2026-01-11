// Template printer-friendly untuk cetak dokumen
import { buildKajiUlangHeader } from './print/header';
import {
  buildPrintLayout,
  prepareTitle,
  buildKajiUlangBody,
  buildKajiUlangStyles,
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
