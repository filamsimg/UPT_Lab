import logoDefault from '@/assets/LOGO DINAS KAB TEGAL.png';

const DEFAULT_HEADER = {
  title: 'UPT LABORATORIUM PERINDUSTRIAN\nKABUPATEN TEGAL',
  subtitle:
    'Dinas Perindustrian, Transmigrasi dan Tenaga Kerja Kabupaten Tegal',
  address:
    'Komplek LIK TAKARU,Jalan Raya Dampyak KM 4, Kec. Kramat, Kab. Tegal, Jawa Tengah 52181',
  contact: 'Telepon (0283) 357311 , Email uptlab@tegal.go.id',
};

export function buildPermintaanPrintHtml(row, type = 'request', options = {}) {
  const baseTitle =
    type === 'invoice'
      ? 'Invoice Pembayaran Permintaan'
      : 'Form Permintaan Pengujian';
  const docTitle =
    typeof options.title === 'string' && options.title.trim()
      ? options.title
      : baseTitle;
  const titleLines = Array.isArray(options.titleLines)
    ? options.titleLines.filter(Boolean)
    : String(docTitle)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
  const header = { ...DEFAULT_HEADER, ...(options.header || {}) };
  const logoSrc = options.logoSrc || logoDefault;
  const titleForHead = titleLines.join(' ') || 'Dokumen Permintaan';
  const titleMarkup = (titleLines.length ? titleLines : [titleForHead])
    .map((line) => `<span>${sanitize(line)}</span>`)
    .join('<br />');

  const styles = `
    <style>
      @page { margin: 6mm 12mm 16mm; }
      body { font-family: 'Times New Roman', 'Times', serif; font-size: 12px; margin: 0; color: #000000; }
      .page { padding: 6px 6px 0; }
      .letterhead { display: flex; gap: 16px; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #000000; margin-bottom: 16px; }
      .letterhead img { width: 72px; height: 72px; object-fit: contain; }
      .letterhead h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
      .letterhead p { margin: 2px 0; font-size: 12px; color: #000000; }
      h2 { margin-top: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.08em; color: #000000; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      .info-table td { padding: 4px 6px; vertical-align: top; }
      .info-table td:first-child { width: 32%; color: #000000; font-weight: 600; }
      .items-table th, .items-table td { border: 1px solid #000000; padding: 8px; text-align: left; }
      .items-table th { background: #ffffff; text-transform: uppercase; font-size: 11px; color: #000000; }
      .totals { margin-top: 12px; width: 50%; float: right; border: 1px solid #000000; border-collapse: collapse; }
      .totals td { padding: 8px; border: 1px solid #000000; }
      .totals td:first-child { background: #f9fafb; font-weight: 600; width: 60%; }
      .notes { clear: both; margin-top: 32px; font-size: 12px; }
      .signature { margin-top: 48px; display: flex; justify-content: flex-end; font-size: 12px; }
      .signature div { text-align: center; }
    </style>
  `;

  const letterheadTitle = toLineMarkup(header.title);
  const letterheadSubtitle = toLineMarkup(header.subtitle);
  const letterhead = `
    <header class="letterhead">
      <img src="${logoSrc}" alt="Logo Dinas Kabupaten Tegal" />
      <div>
        <h1>${letterheadTitle}</h1>
        <p>${letterheadSubtitle}</p>
        <p>${sanitize(header.address)}</p>
        <p>${sanitize(header.contact)}</p>
      </div>
    </header>
  `;

  const infoTable = buildInfoTable(row, type);
  const itemsTable = buildItemsTable(row);
  const totalsSection = type === 'invoice' ? buildTotalsSection(row) : '';
  const notesSection = buildNotes(type);
  const signature = `
    <div class="signature">
      <div>
        <p>Tegal, ${formatFullDate(row.entryDate)}</p>
        <p>Kepala UPT Lab</p>
        <br /><br /><br />
        <p><strong>___________________________</strong></p>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${sanitize(titleForHead)}</title>
        ${styles}
      </head>
      <body>
        <div class="page">
        ${letterhead}
        <h2>${titleMarkup}</h2>
        ${infoTable}
        ${itemsTable}
        ${totalsSection}
        ${notesSection}
        ${signature}
        </div>
      </body>
    </html>
  `;
}

export function buildKajiUlangPrintHtml(order = {}, options = {}) {
  const title =
    typeof options.title === 'string' && options.title.trim()
      ? options.title
      : 'Berita Acara Kaji Ulang Permintaan Pengujian';
  const header = { ...DEFAULT_HEADER, ...(options.header || {}) };
  const logoSrc = options.logoSrc || logoDefault;
  const styles = `
    <style>
      @page { margin: 6mm 12mm 16mm; }
      body { font-family: 'Times New Roman', 'Times', serif; font-size: 12px; margin: 0; color: #000000; }
      .page { padding: 6px 6px 18px; }
      .letterhead { display: flex; gap: 16px; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #000000; margin-bottom: 16px; }
      .letterhead img { width: 72px; height: 72px; object-fit: contain; }
      .letterhead h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
      .letterhead p { margin: 2px 0; font-size: 12px; color: #000000; }
      h2 { margin-top: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.08em; color: #000000; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      .info-table td { padding: 4px 6px; vertical-align: top; }
      .info-table td:first-child { width: 32%; color: #000000; font-weight: 600; }
      .items-table th, .items-table td { border: 1px solid #000000; padding: 8px; text-align: left; }
      .items-table th { background: #ffffff; text-transform: uppercase; font-size: 11px; color: #000000; }
      .decision { margin-top: 20px; border: 1px solid #000000; border-radius: 0; padding: 12px; background: #ffffff; font-size: 12px; }
      .decision strong { color: #000000; }
      .notes { margin-top: 16px; font-size: 12px; }
      .evaluation-table th, .evaluation-table td { border: 1px solid #000000; padding: 6px; text-align: left; }
      .evaluation-table th { background: #ffffff; text-transform: uppercase; font-size: 11px; color: #000000; }
      .signature { margin: 16px auto 0; display: flex; justify-content: space-between; gap: 24px; font-size: 12px; }
      .signature div { flex: 1; text-align: center; }
    </style>
  `;

  const letterhead = `
    <header class="letterhead">
      <img src="${logoSrc}" alt="Logo Dinas Kabupaten Tegal" />
      <div>
        <h1>${toLineMarkup(header.title)}</h1>
        <p>${toLineMarkup(header.subtitle)}</p>
        <p>${sanitize(header.address)}</p>
        <p>${sanitize(header.contact)}</p>
      </div>
    </header>
  `;

  const infoTable = buildKajiUlangInfoTable(order);
  const itemsTable = buildKajiUlangItemsTable(order);
  const evaluationTable = buildKajiUlangEvaluationTable(order);
  const decisionSection = buildKajiUlangDecisionSection(order);
  const signature = buildKajiUlangSignature(order);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${sanitize(title)}</title>
        ${styles}
      </head>
      <body>
        <div class="page">
          ${letterhead}
          <h2>${sanitize(title)}</h2>
          ${infoTable}
          ${itemsTable}
          ${evaluationTable}
          ${decisionSection}
        ${signature}
        </div>
      </body>
    </html>
  `;
}

export function buildValidasiPrintHtml(order = {}, options = {}) {
  const header = { ...DEFAULT_HEADER, ...(options.header || {}) };
  const logoSrc = options.logoSrc || logoDefault;
  const title =
    typeof options.title === 'string' && options.title.trim()
      ? options.title
      : 'Form Validasi Pengujian';

  const styles = `
    <style>
      @page { margin: 6mm 12mm 16mm; }
      html, body { height: 100%; margin: 0; padding: 0; }
      body { font-family: 'Times New Roman', 'Times', serif; font-size: 12px; margin: 0; color: #000000; }
      .page { min-height: 100vh; padding: 6px 6px 14px; display: flex; flex-direction: column; box-sizing: border-box; }
      .letterhead { display: flex; gap: 16px; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px; }
      .letterhead img { width: 72px; height: 72px; object-fit: contain; }
      .letterhead h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
      .letterhead p { margin: 2px 0; font-size: 12px; color: #000000; }
      h2 { margin: 0 0 12px; font-size: 18px; text-transform: uppercase; letter-spacing: 0.08em; color: #000000; }
      .info-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
      .info-table td { padding: 6px 8px; vertical-align: top; }
      .info-table td:first-child { width: 32%; font-weight: 600; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
      .items-table th, .items-table td { border: 1px solid #000000; padding: 8px; text-align: left; }
      .items-table th { background: #ffffff; text-transform: uppercase; font-size: 11px; }
      .content { flex: 1 1 auto; display: flex; flex-direction: column; }
      .signature { margin-top: auto; padding-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; text-align: center; font-size: 12px; column-gap: 20px; }
      .signature-column { width: 45%; }
      .signature-column p { margin: 4px 0; }
      .signature-line { margin: 36px auto 8px; width: 160px; border-bottom: 1px solid #000000; height: 1px; }
    </style>
  `;

  const letterhead = `
    <header class="letterhead">
      <img src="${logoSrc}" alt="Logo Dinas Kabupaten Tegal" />
      <div>
        <h1>${toLineMarkup(header.title)}</h1>
        <p>${toLineMarkup(header.subtitle)}</p>
        <p>${sanitize(header.address)}</p>
        <p>${sanitize(header.contact)}</p>
      </div>
    </header>
  `;

  const infoTable = `
    <table class="info-table">
      ${buildInfoRow('ID Order', order.id || order.requestId || '-')}
      ${buildInfoRow('No Order', order.orderNo || '-')}
      ${buildInfoRow('Tanggal', formatFullDate(order.date || order.entryDate))}
      ${buildInfoRow('Komoditi / Benda Uji', resolveCommodity(order))}
    </table>
  `;

  const items = Array.isArray(order.testItems) ? order.testItems : [];
  const itemsTable = `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:8%;">No</th>
          <th style="width:26%;">Jenis Pengujian</th>
          <th style="width:14%;">Jumlah Sampel</th>
          <th style="width:20%;">Kode Sampel</th>
          <th style="width:18%;">Metode Uji</th>
          <th style="width:14%;">Waktu Pengambilan</th>
        </tr>
      </thead>
      <tbody>
        ${
          items.length
            ? items
                .map(
                  (item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${sanitize(item.testName || item.name || '-')}</td>
                    <td>${sanitize(item.quantity || 0)}</td>
                    <td>${sanitize(formatSampleCode(order, item, idx))}</td>
                    <td>${sanitize(item.method || item.methodName || item.testMethod || '-')}</td>
                    <td>${sanitize(item.collectionTime || item.collectionDate || '-')}</td>
                  </tr>
                `
                )
                .join('')
            : `<tr><td colspan="6" style="text-align:center;">Tidak ada data pengujian</td></tr>`
        }
      </tbody>
    </table>
  `;

   const signature = `
    <div class="signature">
      <div class="signature-column">
        <p>Manajer Teknis</p>
        <br /><br /><br />
        <p><strong>${sanitize(order.kajiUlangValidatedBy || '________________')}</strong></p>
      </div>
      <div class="signature-column">
        <p>Penerima Sampel Uji</p>
        <br /><br /><br />
        <p><strong>${sanitize(order.sampleReceiver || '________________')}</strong></p>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${sanitize(title)}</title>
        ${styles}
      </head>
      <body>
        <div class="page">
          ${letterhead}
          <div class="content">
            <h2>${sanitize(title)}</h2>
            ${infoTable}
            ${itemsTable}
          </div>
          ${signature}
        </div>
      </body>
    </html>
  `;
}

function buildInfoTable(row, type) {
  const info = [
    ['ID Order', row.idOrder || '-'],
    ['Nomor Order', formatOrderNumber(row)],
    ['Tanggal Masuk', formatFullDate(row.entryDate)],
    ['Nama Customer', row.customerName || '-'],
    ['Kontak', row.phoneNumber || '-'],
    ['Alamat', row.address || '-'],
  ];
  if (type === 'invoice') {
    info.push(['Status Pembayaran', translateStatus(row.status)]);
  }
  return `
    <table class="info-table">
      ${info
        .map(
          ([label, value]) => `
            <tr>
              <td>${label}</td>
              <td>${sanitize(value)}</td>
            </tr>
          `
        )
        .join('')}
    </table>
  `;
}

function buildItemsTable(row) {
  const items = row.testItems || [];
  if (!items.length) {
    return `<p>Tidak ada data pengujian.</p>`;
  }
  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Jenis Pengujian</th>
          <th>Objek Uji</th>
          <th>Qty</th>
          <th>Tarif (Rp)</th>
          <th>Subtotal (Rp)</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item, idx) => {
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.price) || 0);
            const subtotal = quantity * price;
            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${sanitize(item.testName || '-')}</td>
                <td>${sanitize(item.objectName || '-')}</td>
                <td>${quantity}</td>
                <td>${formatNumber(price)}</td>
                <td>${formatNumber(subtotal)}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function buildTotalsSection(row) {
  const items = row.testItems || [];
  const total = items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);
    return sum + quantity * price;
  }, 0);
  const paid = Number(row.paymentInfo?.amountPaid || 0);
  const outstanding = Math.max(0, total - paid);

  return `
    <table class="totals">
      <tr>
        <td>Total Tagihan</td>
        <td>${formatNumber(total)}</td>
      </tr>
      <tr>
        <td>Pembayaran Diterima</td>
        <td>${formatNumber(paid)}</td>
      </tr>
      <tr>
        <td>Sisa Pembayaran</td>
        <td>${formatNumber(outstanding)}</td>
      </tr>
    </table>
  `;
}

function buildNotes(type) {
  if (type === 'invoice') {
    return `
      <section class="notes">
        <strong>Catatan:</strong>
        <p>Setelah pembayaran diterima, mohon kirimkan bukti pembayaran kepada admin. Sample uji harap dikirim ke Laboratorium UPT Lab di Jalan Raya Dampyak KM 4, Kec. Kramat, Kabupaten Tegal 52181 untuk proses kaji ulang.</p>
      </section>
    `;
  }
  return `
    <section class="notes">
      <strong>Catatan:</strong>
      <p>Form permintaan ini menjadi dasar pelaksanaan pengujian. Pastikan data pengujian dan objek uji telah sesuai dengan kebutuhan lapangan.</p>
    </section>
  `;
}

function formatOrderNumber(row) {
  if (!row || !row.orderNumber) return '-';
  const number =
    typeof row.orderNumber === 'number'
      ? String(row.orderNumber).padStart(3, '0')
      : String(row.orderNumber).padStart(3, '0');
  return number;
}

export function formatCurrency(value) {
  return `Rp ${formatNumber(value)}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function buildInfoRow(label, value) {
  return `
    <tr>
      <td>${sanitize(label)}</td>
      <td>${sanitize(value || '-')}</td>
    </tr>
  `;
}

function resolveCommodity(order = {}) {
  return (
    order.commodity ||
    order.objectName ||
    order.testItems?.[0]?.objectName ||
    order.testType ||
    '-'
  );
}

export function formatFullDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function translateStatus(status) {
  switch (status) {
    case 'pending_payment':
      return 'Menunggu Pembayaran';
    case 'payment_pending_review':
      return 'Menunggu Review Pembayaran';
    case 'payment_verified':
      return 'Pembayaran Terverifikasi';
    case 'payment_review_rejected':
      return 'Bukti Pembayaran Ditolak';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return 'Draft';
  }
}

function sanitize(value) {
  if (value === null || value === undefined) return '-';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toLineMarkup(value) {
  const lines = String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return sanitize(value);
  }
  return lines.map((line) => `<span>${sanitize(line)}</span>`).join('<br />');
}

function buildKajiUlangInfoTable(order) {
  const info = [
    ['ID Order', order.orderNo || order.requestId || '-'],
    ['Nomor Order', formatOrderNumber(order)],
    ['Tanggal Permintaan', formatFullDate(order.date || order.entryDate)],
    ['Nama Customer', order.customerName || '-'],
    ['Kontak', order.customerPhone || '-'],
    ['Alamat', order.customerAddress || '-'],
    ['Status Kaji Ulang', translateKajiUlangStatus(order.status)],
  ];
  return `
    <table class="info-table">
      ${info
        .map(
          ([label, value]) => `
            <tr>
              <td>${label}</td>
              <td>${sanitize(value)}</td>
            </tr>
          `
        )
        .join('')}
    </table>
  `;
}

function buildKajiUlangItemsTable(order) {
  const items = Array.isArray(order.testItems) ? order.testItems : [];
  if (!items.length) {
    return `
      <section class="notes">
        <strong>Ringkasan Pengujian:</strong>
        <p>Data pengujian belum tersedia.</p>
      </section>
    `;
  }
  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Pengujian</th>
          <th>Objek Uji</th>
          <th>Jumlah</th>
          <th>Tarif (Rp)</th>
          <th>Kode Sampel</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item, idx) => {
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.price) || 0);
            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${sanitize(item.testName || item.name || '-')}</td>
                <td>${sanitize(item.objectName || '-')}</td>
                <td>${quantity}</td>
                <td>${formatNumber(price)}</td>
                <td>${sanitize(formatSampleCode(order, item, idx))}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function buildKajiUlangEvaluationTable(order) {
  const rows =
    (Array.isArray(order.kajiUlangRows) && order.kajiUlangRows.length
      ? order.kajiUlangRows
      : [
          { topic: 'Peralatan', result: order.evaluation?.equipment || '' },
          { topic: 'Personel', result: order.evaluation?.personnel || '' },
          { topic: 'Waktu', result: order.evaluation?.time || '' },
          { topic: 'Kondisi', result: order.evaluation?.condition || '' },
          {
            topic: 'Laboratorium Subkontrak',
            result: order.evaluation?.subcontract || '',
          },
          { topic: 'Metode Uji', result: order.evaluation?.method || '' },
        ]) || [];
  if (!rows.length) return '';
  return `
    <table class="evaluation-table">
      <thead>
        <tr>
          <th style="width:12%;">No</th>
          <th>Perihal</th>
          <th>Hasil</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${sanitize(row.topic || '-')}</td>
              <td>${sanitize(row.result || '-')}</td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function buildKajiUlangDecisionSection(order) {
  const note = order.kajiUlangNote || order.note || '-';
  const reviewer =
    order.kajiUlangValidatedBy || order.paymentInfo?.reviewedBy || '-';
  const reviewedAt = formatFullDate(
    order.kajiUlangValidatedAt || order.paymentInfo?.reviewedAt
  );
  const isRejected =
    order.status === 'rejected' || order.status === 'cancelled';
  const decisionLabel = isRejected ? 'DITOLAK' : 'DITERIMA';
  return `
    <section class="decision">
      <p><strong>Keputusan:</strong> ${decisionLabel}</p>
      <p><strong>Status:</strong> ${translateKajiUlangStatus(order.status)}</p>
      <p><strong>Catatan:</strong> ${sanitize(note)}</p>
      <p><strong>Ditinjau Oleh:</strong> ${sanitize(reviewer)}</p>
      <p><strong>Tanggal Review:</strong> ${sanitize(reviewedAt)}</p>
    </section>
  `;
}

function buildKajiUlangSignature(order) {
  const admin = order.kajiUlangSignatures?.admin || 'Admin UPT Lab';
  const customer =
    order.kajiUlangSignatures?.customer || order.customerName || '-';
  const decisionDate = formatFullDate(order.kajiUlangValidatedAt || order.date);
  return `
    <section class="signature">
      <div>
        <p>Tegal, ${decisionDate}</p>
        <p>Mengetahui</p>
        <br /><br /><br />
        <p><strong>${sanitize(admin)}</strong></p>
      </div>
      <div>
        <p>Tegal, ${decisionDate}</p>
        <p>Pemohon</p>
        <br /><br /><br />
        <p><strong>${sanitize(customer)}</strong></p>
      </div>
    </section>
  `;
}

function translateKajiUlangStatus(status) {
  switch (status) {
    case 'ready_for_kaji_ulang':
      return 'Siap Kaji Ulang';
    case 'pending_validation':
      return 'Menunggu Validasi';
    case 'in_testing':
      return 'Sedang Pengujian';
    case 'completed':
      return 'Selesai';
    case 'rejected':
      return 'Ditolak';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return translateStatus(status);
  }
}

function formatSampleCode(order, item, index) {
  const date = order.date || order.entryDate || new Date().toISOString();
  const monthYear = formatMonthYear(date);
  const orderSegment = order.orderNumber
    ? String(order.orderNumber).padStart(3, '0')
    : '--';
  const testCode = getTestCode(item, index);
  const sampleSegment =
    (item.sampleNo && String(item.sampleNo).trim()) ||
    (item.sampleCode && String(item.sampleCode).trim()) ||
    '--';
  return `${monthYear}.${orderSegment}/${testCode}/${sampleSegment}`;
}

function getTestCode(item = {}, index = 0) {
  if (item.testCode) {
    const [code] = String(item.testCode).split('-');
    return code || `ITEM-${index + 1}`;
  }
  if (item.code) {
    const [code] = String(item.code).split('-');
    return code || `ITEM-${index + 1}`;
  }
  if (item.testId) {
    const [code] = String(item.testId).split('-');
    return code || `ITEM-${index + 1}`;
  }
  return `ITEM-${index + 1}`;
}

function formatMonthYear(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${now.getFullYear()}`;
  }
  return `${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${date.getFullYear()}`;
}
