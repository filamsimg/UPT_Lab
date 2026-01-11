// Bagian isi & utilitas untuk dokumen cetak (body/content)
import logoTuk from '@/assets/logo TUK.webp';

export function sanitize(value) {
  if (value === null || value === undefined) return '-';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatFullDate(value) {
  if (!value) return '-';
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  if (match) return match[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().slice(0, 10);
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export function formatCurrency(value) {
  return `Rp ${formatNumber(value)}`;
}

function toText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

export function buildPrintLayout({
  title,
  styles,
  headerContent = '',
  bodyContent = '',
  footerContent = '',
  pageClass = 'page',
  contentBorder,
  contentPadding,
}) {
  const frameStyleParts = [];
  if (contentBorder) frameStyleParts.push(`--content-border:${contentBorder}`);
  if (contentPadding)
    frameStyleParts.push(`--content-padding:${contentPadding}`);
  const frameStyle = frameStyleParts.length
    ? ` style="${frameStyleParts.join(';')}"`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${sanitize(title || 'Dokumen')}</title>
        ${styles || ''}
      </head>
      <body>
        <div class="${pageClass}">
          ${headerContent}
          <div class="content-frame"${frameStyle}>
            ${bodyContent}
            ${footerContent}
          </div>
        </div>
      </body>
    </html>
  `;
}

export function prepareTitle(options = {}, fallbackTitle = 'Dokumen') {
  const docTitle =
    typeof options.title === 'string' && options.title.trim()
      ? options.title
      : fallbackTitle;
  const titleLines = Array.isArray(options.titleLines)
    ? options.titleLines.filter(Boolean)
    : String(docTitle)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
  const titleForHead = titleLines.join(' ') || fallbackTitle;
  const titleMarkup = (titleLines.length ? titleLines : [titleForHead])
    .map((line) => `<span>${sanitize(line)}</span>`)
    .join('<br />');
  return { docTitle, titleLines, titleForHead, titleMarkup };
}

// === KAJI ULANG ===
const KAJI_ULANG_STYLES = `
  <style>
    @page { size: 210mm 330mm; margin: 6mm 8mm 8mm; }
    body { font-family: 'Times New Roman', 'Times', serif; font-size: 11px; margin: 0; color: #000000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .kaji-ulang-page { padding: 0; box-sizing: border-box; }
    .content-frame { border: none; padding: 0; position: relative; }
    .content-frame::before { content: ''; position: absolute; inset: 0; background: url('${logoTuk}') center/90% no-repeat; opacity: 0.08; pointer-events: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content-frame > * { position: relative; z-index: 1; }
    .form-header { position: relative; padding: 0 70px 4px; text-align: center; }
    .form-header img { position: absolute; left: 0; top: 0; width: 56px; height: 56px; object-fit: contain; }
    .form-header .org-line { font-size: 10px; line-height: 1.25; }
    .form-header .org-strong { font-weight: 700; }
    .form-header .org-unit { font-size: 11px; font-weight: 700; }
    .form-header .org-contact { font-size: 9px; }
    .form-header .org-link { color: #0b68b1; text-decoration: underline; }
    .form-header .header-bar { margin: 6px -70px 0; width: calc(100% + 140px); background: #0b68b1; color: #ffffff; font-weight: 700; letter-spacing: 0.4px; padding: 3px 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { border: 1px solid #000000; margin-top: 6px; }
    .section-bar { background: #0b68b1; color: #ffffff; font-weight: 700; padding: 3px 6px; font-size: 10.5px; display: flex; justify-content: space-between; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-bar span { color: #ffffff; }
    .section-bar .section-note { color: #ffffff; font-weight: 400; font-style: italic; font-size: 9px; }
    .section-bar .section-doc { color: #ffffff; font-weight: 600; font-size: 9px; }
    .line-table { width: 100%; border-collapse: collapse; }
    .line-table td { padding: 2px 6px; vertical-align: top; }
    .line-label { width: 150px; }
    .line-colon { width: 10px; text-align: center; }
    .line-value { border-bottom: 1px dotted #000000; min-height: 14px; }
    .line-value span { display: inline-block; padding-bottom: 1px; }
    .subsection-title { font-weight: 700; padding: 4px 6px 2px; }
    .review-grid { width: 100%; border-collapse: collapse; }
    .review-grid > tbody > tr > td { border: none; vertical-align: top; padding: 0; }
    .review-grid > tbody > tr > td + td { border-left: 1px solid #000000; }
    .checkbox-table { width: 100%; border-collapse: collapse; }
    .checkbox-table th, .checkbox-table td { border: 1px solid #000000; padding: 3px 4px; }
    .checkbox-table th { text-align: center; font-weight: 700; }
    .checkbox-table tr:first-child th,
    .checkbox-table tr:first-child td { border-top: none; }
    .checkbox-table tr:last-child td { border-bottom: none; }
    .checkbox-table tr td:first-child,
    .checkbox-table tr th:first-child { border-left: none; }
    .checkbox-table tr td:last-child,
    .checkbox-table tr th:last-child { border-right: none; }
    .checkbox-cell { text-align: center; width: 26px; }
    .checkbox { display: inline-flex; width: 12px; height: 12px; border: 1px solid #000000; align-items: center; justify-content: center; font-size: 10px; line-height: 1; }
    .note-box { padding: 4px; min-height: 36px; }
    .note-label { font-style: italic; }
    .review-info .line-label { width: 110px; }
    .review-info .line-value { min-height: 12px; }
    .note-small { font-size: 9px; padding: 2px 6px 4px; }
    .terms { border: 1px solid #000000; border-top: none; padding: 6px 8px 4px; font-size: 9.5px; line-height: 1.25; }
    .terms ol { margin: 0 0 4px 18px; padding: 0; }
    .terms li { margin-bottom: 3px; }
    .terms-consent { margin: 4px 0 2px; }
    .terms-info { margin: 0; font-style: italic; }
    .sample-table { width: 100%; border-collapse: collapse; border: 1px solid #000000; margin-top: 4px; font-size: 10px; }
    .sample-table th, .sample-table td { border: 1px solid #000000; padding: 3px 4px; }
    .sample-table th { text-align: center; font-weight: 700; }
    .text-center { text-align: center; }
    .signature-cell { width: 80px; vertical-align: bottom; }
    .signature-line { border-top: 1px solid #000000; margin: 0 6px 8px; height: 1px; }
    .cut-line { position: relative; margin: 8px 0 6px; border-top: 1px dashed #000000; min-height: 14px; }
    .cut-icon { position: absolute; left: 0; top: -7px; display: inline-flex; align-items: center; background: #ffffff; padding-right: 6px; }
    .cut-icon svg { width: 14px; height: 14px; stroke: #000000; fill: none; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
    .receipt { border: 1px solid #000000; padding: 6px; margin-top: 6px; }
    .receipt-title { text-align: center; font-weight: 700; text-decoration: underline; margin-bottom: 4px; }
    .receipt-note { font-size: 9px; font-style: italic; margin-top: 4px; }
    .receipt, .sample-table { break-inside: avoid; page-break-inside: avoid; }
  </style>
`;

const KAJI_ULANG_DOC_NUMBER = 'F/UPT-LAB/7.1-1';
const KAJI_ULANG_SAMPLE_ROWS = 6;

function formatOrderNumber(row) {
  if (!row) return '-';
  const explicit =
    row.orderDisplay ||
    row.orderCode ||
    row.order_code ||
    row.number ||
    row.orderNumber;

  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }
  if (explicit === null || explicit === undefined || explicit === '')
    return '-';

  const numeric = Number(explicit);
  if (Number.isFinite(numeric)) return String(numeric).padStart(3, '0');

  return String(explicit);
}

function lineValue(value) {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text ? sanitize(text) : '';
}

function buildLineRow(label, value) {
  return `
    <tr>
      <td class="line-label">${sanitize(label)}</td>
      <td class="line-colon">:</td>
      <td class="line-value"><span>${lineValue(value)}</span></td>
    </tr>
  `;
}

function resolveTestName(item = {}) {
  return (
    item.testName ||
    item.test_name ||
    item.name ||
    item.service?.test_name ||
    item.service?.testName ||
    item.service?.name ||
    ''
  );
}

function resolveMethodName(item = {}) {
  const candidates = [
    item.methodName,
    item.method_name,
    item.method?.name,
    item.method?.method_name,
    item.method?.MethodName,
    item.method?.title,
    item.method?.label,
    item.method?.code,
    item.method,
    item.service?.method_name,
    item.service?.methodName,
    item.service?.method?.name,
    item.service?.method?.method_name,
    item.service?.method?.MethodName,
    item.service?.method?.title,
    item.service?.method?.label,
    item.service?.method?.code,
    item.service?.method,
  ];
  for (const candidate of candidates) {
    const text = toText(candidate);
    if (text) return text;
  }
  return '';
}

function resolveMethodFromTest(test = {}) {
  const candidates = [
    test.methodName,
    test.method_name,
    test.test_method,
    test.method?.name,
    test.method?.method_name,
    test.method?.MethodName,
    test.method?.title,
    test.method?.label,
    test.method?.code,
    test.method,
  ];
  for (const candidate of candidates) {
    const text = toText(candidate);
    if (text) return text;
  }
  return '';
}

function buildTestNameSummary(items = []) {
  const names = items
    .map((item) => resolveTestName(item))
    .map((name) => String(name || '').trim())
    .filter(Boolean);
  return names.join(', ');
}

function resolveObjectUji(order = {}) {
  const items = Array.isArray(order.testItems) ? order.testItems : [];
  return (
    order.objectName ||
    order.commodity ||
    order.testType ||
    items[0]?.objectName ||
    ''
  );
}

function resolveServiceType(order = {}) {
  return (
    order.workCategoryName ||
    order.jobCategory ||
    order.workPackageName ||
    order.workPackage ||
    ''
  );
}

function sumQuantities(items = []) {
  return items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    return sum + quantity;
  }, 0);
}

function sumCosts(items = []) {
  return items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);
    return sum + quantity * price;
  }, 0);
}

function resolveSampleCodes(order, items = []) {
  const codes = items
    .map((item, idx) => formatSampleCode(order, item, idx))
    .filter(Boolean);
  if (codes.length) return codes.join(', ');
  return order.sampleNo || '';
}

function buildMethodList(items = [], tests = []) {
  const methods = items
    .map((item) => {
      const direct = resolveMethodName(item);
      if (direct) return direct;
      const testId =
        item.serviceId ||
        item.service_id ||
        item.testId ||
        item.test_id ||
        item.orderedServiceId ||
        item.ordered_service_id ||
        item.id ||
        '';
      if (!testId || !Array.isArray(tests)) return '';
      const match = tests.find((entry) => entry.id === testId);
      return match ? resolveMethodFromTest(match) : '';
    })
    .filter(Boolean);
  return Array.from(new Set(methods)).join(', ');
}

function aggregateEvaluation(items = [], field) {
  const values = items
    .map((item) => item?.evaluation?.[field])
    .filter((value) => value === true || value === false);
  if (!values.length) return null;
  const hasTrue = values.includes(true);
  const hasFalse = values.includes(false);
  if (hasTrue && hasFalse) return 'mixed';
  return hasTrue;
}

function resolveCheckState(items, field) {
  const result = aggregateEvaluation(items, field);
  if (result === true) return { yes: true, no: false };
  if (result === false) return { yes: false, no: true };
  if (result === 'mixed') return { yes: true, no: true };
  return { yes: false, no: false };
}

function resolveConditionLabel(items) {
  const result = aggregateEvaluation(items, 'is_test_ready');
  if (result === true) return 'Siap Uji';
  if (result === false) return 'Prepare Sampel';
  if (result === 'mixed') return 'Siap Uji / Prepare Sampel';
  return '';
}

function renderCheckbox(checked) {
  return `<span class="checkbox">${checked ? '&#10003;' : ''}</span>`;
}

function buildCheckboxRow(label, state) {
  return `
    <tr>
      <td>${sanitize(label)}</td>
      <td class="checkbox-cell">${renderCheckbox(state.yes)}</td>
      <td class="checkbox-cell">${renderCheckbox(state.no)}</td>
    </tr>
  `;
}

function buildSampleTable(items = [], rowCount = KAJI_ULANG_SAMPLE_ROWS) {
  const rows = [];
  for (let i = 0; i < rowCount; i += 1) {
    const item = items[i] || {};
    const quantity =
      item.quantity !== undefined
        ? Math.max(1, Number(item.quantity) || 1)
        : '';
    const quantityText = quantity ? formatNumber(quantity) : '';
    const description =
      item.objectName ||
      item.sampleName ||
      item.sample_name ||
      item.testName ||
      '';
    rows.push(`
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${sanitize(quantityText)}</td>
        <td>${sanitize(description)}</td>
        <td class="text-center"></td>
        <td class="text-center"></td>
        ${
          i === 0
            ? `<td class="signature-cell" rowspan="${rowCount}"><div class="signature-line"></div></td>`
            : ''
        }
        ${
          i === 0
            ? `<td class="signature-cell" rowspan="${rowCount}"><div class="signature-line"></div></td>`
            : ''
        }
      </tr>
    `);
  }
  return `
    <table class="sample-table">
      <thead>
        <tr>
          <th rowspan="2" style="width:5%;">No</th>
          <th rowspan="2" style="width:10%;">Jumlah</th>
          <th rowspan="2">Keterangan Sampel</th>
          <th colspan="2" style="width:14%;">Verifikasi Sampel</th>
          <th rowspan="2" style="width:12%;">Penerima</th>
          <th rowspan="2" style="width:12%;">Pelanggan</th>
        </tr>
        <tr>
          <th style="width:7%;">Sesuai</th>
          <th style="width:7%;">Tidak</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
  `;
}

export function buildKajiUlangBody(order = {}, options = {}) {
  const items = Array.isArray(order.testItems) ? order.testItems : [];
  const tests = Array.isArray(options.tests) ? options.tests : [];
  const customerName = order.customerName || '';
  const companyName = order.companyName || '';
  const address =
    order.address || order.customerAddress || order.addressFull || '';
  const phone = order.customerPhone || order.phoneNumber || '';
  const email = order.customerEmail || order.email || '';
  const certificateName = order.certificateName || customerName;
  const certificateAddress = order.certificateAddress || address;
  const objectUji = resolveObjectUji(order);
  const serviceType = resolveServiceType(order);
  const totalQuantity = sumQuantities(items);
  const totalCost = Number(order.paymentInfo?.total) || sumCosts(items);
  const orderNumber = formatOrderNumber(order);
  const orderNo =
    orderNumber && orderNumber !== '-' ? orderNumber : order.orderNo || '';
  const sampleCodes = resolveSampleCodes(order, items);
  const methodList = buildMethodList(items, tests);
  const conditionLabel = resolveConditionLabel(items);
  const noteText = order.kajiUlangNote || order.note || '';
  const peralatanState = resolveCheckState(items, 'is_equipment_available');
  const personelState = resolveCheckState(items, 'is_personnel_available');
  const waktuState = resolveCheckState(items, 'is_time_available');
  const labState = resolveCheckState(items, 'is_subcontract_lab_available');
  const pengambilanState = { yes: false, no: false };
  const kondisiText = conditionLabel || 'Siap Uji / Prepare Sampel';

  return `
    <section class="section">
      <div class="section-bar">
        <span>DATA PELANGGAN <span class="section-note">(diisi lengkap dengan sebenar-benarnya)</span></span>
      </div>
      <table class="line-table">
        ${buildLineRow('Nama Pemohon', customerName)}
        ${buildLineRow('Nama Perusahaan', companyName)}
        ${buildLineRow('Alamat Lengkap', address)}
        ${buildLineRow('No. Hp Aktif', phone)}
        ${buildLineRow('Email', email)}
      </table>
      <div class="subsection-title">SERTIFIKAT ATAS NAMA</div>
      <table class="line-table">
        ${buildLineRow('Nama', certificateName)}
        ${buildLineRow('Alamat', certificateAddress)}
      </table>
      <table class="line-table">
        ${buildLineRow('Objek Uji', objectUji)}
        ${buildLineRow('Jenis Pelayanan', serviceType)}
        ${buildLineRow(
          'Jumlah Benda Uji',
          totalQuantity ? formatNumber(totalQuantity) : ''
        )}
      </table>
    </section>

    <section class="section">
      <div class="section-bar">
        <span>KAJI ULANG PERMINTAAN <span class="section-note">(Diisi Petugas)</span></span>
        <span class="section-doc">No.Dok: ${KAJI_ULANG_DOC_NUMBER}</span>
      </div>
      <table class="review-grid">
        <tr>
          <td style="width:55%;">
            <table class="checkbox-table">
              <thead>
                <tr>
                  <th> </th>
                  <th>Ya</th>
                  <th>Tidak</th>
                </tr>
              </thead>
              <tbody>
                ${buildCheckboxRow('Peralatan', peralatanState)}
                ${buildCheckboxRow('Personel', personelState)}
                ${buildCheckboxRow('Waktu', waktuState)}
                ${buildCheckboxRow('Laboratorium Subkontrak', labState)}
                ${buildCheckboxRow(
                  'Pengambilan sisa sampel uji',
                  pengambilanState
                )}
                <tr>
                  <td colspan="3" class="note-box">
                    <span class="note-label">Catatan :</span>
                    <div>${lineValue(noteText)}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td style="width:45%;">
            <table class="line-table review-info">
              ${buildLineRow('No. Order', orderNo)}
              ${buildLineRow('No. Sampel', sampleCodes)}
              ${buildLineRow(
                'Biaya',
                totalCost ? formatCurrency(totalCost) : ''
              )}
              ${buildLineRow(
                'Jumlah Benda Uji',
                totalQuantity ? formatNumber(totalQuantity) : ''
              )}
              ${buildLineRow('Metode Uji', methodList)}
              <tr>
                <td class="line-label">Kondisi</td>
                <td class="line-colon">:</td>
                <td>${sanitize(kondisiText)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </section>

    <div class="terms">
      <ol>
        <li>Proses pengujian/permesinan akan dilaksanakan setelah dilakukan pembayaran dan pelanggan menyampaikan bukti pembayaran kepada pihak Laboratorium.</li>
        <li>Penyimpanan alat atau sampel di ruang UPT Laboratorium selama proses penyelesaian administrasi dibatasi maksimal 5 (lima) hari kalender, termasuk penandatanganan formulir permohonan layanan. Apabila dalam jangka waktu tersebut proses administrasi belum selesai, maka pihak Laboratorium tidak bertanggung jawab atas segala risiko yang terjadi pada alat atau sampel milik pelanggan.</li>
        <li>Pengambilan sisa contoh sampel uji dilakukan paling lambat 3 (tiga) bulan sejak laporan hasil uji diterbitkan. Apabila sampai batas waktu tersebut sampel tidak diambil, maka sampel dapat dimusnahkan oleh pihak Laboratorium.</li>
        <li>Apabila terjadi keadaan di luar kendali (force majeure) yang mengakibatkan kerusakan alat atau sampel serta terhambatnya atau tidak terpenuhinya proses layanan, maka pihak Laboratorium tidak bertanggung jawab atas kerusakan yang terjadi. Proses layanan akan disesuaikan kembali sebagaimana mestinya dengan pemberitahuan tertulis paling lambat 14 (empat belas) hari sejak terjadinya keadaan tersebut.</li>
      </ol>
      <p class="terms-consent">Dengan ini, pelanggan menyatakan menyetujui ketentuan tersebut.</p>
      <p class="terms-info">*Untuk informasi lebih lanjut mengenai proses pelayanan, dapat menghubungi UPT Laboratorium melalui email labperintgl@gmail.com atau melalui Telp/Faks: (0283) 357437.</p>
    </div>

    ${buildSampleTable(items, KAJI_ULANG_SAMPLE_ROWS)}

    <div class="cut-line">
      <span class="cut-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <circle cx="6.5" cy="6.5" r="2.5"></circle>
          <circle cx="6.5" cy="17.5" r="2.5"></circle>
          <path d="M8.3 8.3l12.7 12.7"></path>
          <path d="M8.3 15.7l12.7-12.7"></path>
        </svg>
      </span>
    </div>

    <section class="receipt">
      <div class="receipt-title">SURAT TANDA TERIMA BARANG</div>
      <table class="line-table">
        ${buildLineRow(
          'Tanggal',
          formatFullDate(order.entryDate || order.date || order.createdAt)
        )}
        ${buildLineRow('Nomor Order', orderNo)}
        ${buildLineRow('Nama Pelanggan', customerName)}
        ${buildLineRow('Jenis Pengujian &', buildTestNameSummary(items))}
        ${buildLineRow(
          'Jumlah Pengujian',
          totalQuantity ? formatNumber(totalQuantity) : ''
        )}
      </table>
      ${buildSampleTable(items, KAJI_ULANG_SAMPLE_ROWS)}
      <p class="receipt-note">* Surat tanda terima ini wajib dibawa ketika pengambilan sertifikat</p>
    </section>
  `;
}

export function buildKajiUlangStyles() {
  return KAJI_ULANG_STYLES;
}

function formatSampleCode(order, item, index) {
  const backendSample =
    (item.sampleCode && String(item.sampleCode).trim()) ||
    (item.sample_number && String(item.sample_number).trim()) ||
    (item.sampleNumber && String(item.sampleNumber).trim()) ||
    (item.sample_code && String(item.sample_code).trim()) ||
    '';
  if (backendSample && !/^\d{1,3}$/.test(backendSample)) {
    return backendSample;
  }

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
