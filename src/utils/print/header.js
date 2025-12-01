// Bagian header/kop surat untuk dokumen cetak
import logoDefault from '@/assets/LOGO DINAS KAB TEGAL.png';
import { sanitize, toLineMarkup } from './content';

export const DEFAULT_HEADER = {
  title: 'UPT LABORATORIUM PERINDUSTRIAN\nKABUPATEN TEGAL',
  address:
    'Komplek LIK TAKARU,Jalan Raya Dampyak KM 4, Kec. Kramat, Kab. Tegal, Jawa Tengah 52181',
  contact: 'Telepon (0283) 357311 , Email uptlab@tegal.go.id',
  meta: {
    docNumber: 'F/UPT-LAB/7.1-1',
    revision: '1/1',
    publishedAt: '21/01/2021',
    revisionDate: '-',
    volume: '02/7',
    page: '1/1',
  },
  tableBorder: '3px ridge #000',
  cellBorder: '2px groove #000',
};

export function buildLetterhead(header = {}, logoSrc = logoDefault, metaOverride = {}) {
  const resolved = { ...DEFAULT_HEADER, ...(header || {}) };
  const meta = { ...DEFAULT_HEADER.meta, ...(header.meta || {}), ...(metaOverride || {}) };
  const tableBorder = resolved.tableBorder || resolved.border || '';
  const cellBorder = resolved.cellBorder || '';
  const styleParts = [];
  if (tableBorder) styleParts.push(`--lh-border:${tableBorder}`);
  if (cellBorder) styleParts.push(`--lh-cell-border:${cellBorder}`);
  const inlineStyle = styleParts.length ? ` style="${styleParts.join(';')}"` : '';

  return `
    <table class="letterhead"${inlineStyle}>
      <tr>
        <td class="logo-cell" rowspan="2">
          <img src="${logoSrc || logoDefault}" alt="Logo Dinas Kabupaten Tegal" />
        </td>
        <td class="org-cell" rowspan="2">
          <div class="org-title">${toLineMarkup(resolved.title)}</div>
        </td>
        <td class="form-label" colspan="5">FORMULIR</td>
      </tr>
      <tr>
        <td class="doc-title" colspan="5">${sanitize(resolved.formTitle || '')}</td>
      </tr>
      <tr class="meta-row">
        <td class="meta-cell meta-span-2" colspan="2">No.Dok: ${sanitize(meta.docNumber)}</td>
        <td class="meta-cell">Terb/Rev:<br />${sanitize(meta.revision)}</td>
        <td class="meta-cell">Tgl.Terbit:<br />${sanitize(meta.publishedAt)}</td>
        <td class="meta-cell">Tgl. Rev:<br />${sanitize(meta.revisionDate)}</td>
        <td class="meta-cell">No. Vol./Bag.:<br />${sanitize(meta.volume)}</td>
        <td class="meta-cell">Hal:<br />${sanitize(meta.page)}</td>
      </tr>
    </table>
  `;
}
