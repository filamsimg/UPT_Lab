// Bagian footer/signature untuk dokumen cetak
import { sanitize, formatFullDate } from './content';

export function buildPermintaanSignature(entryDate) {
  return `
    <div class="signature">
      <div>
        <p>Tegal, ${sanitize(formatFullDate(entryDate))}</p>
        <p>Kepala UPT Lab</p>
        <br /><br /><br />
        <p><strong>___________________________</strong></p>
      </div>
    </div>
  `;
}

export function buildKajiUlangSignature(order) {
  const admin = order?.kajiUlangSignatures?.admin || 'Admin UPT Lab';
  const customer =
    order?.kajiUlangSignatures?.customer || order?.customerName || '-';
  const decisionDate = formatFullDate(order?.kajiUlangValidatedAt || order?.date);
  return `
    <section class="signature">
      <div>
        <p>Tegal, ${sanitize(decisionDate)}</p>
        <p>Mengetahui</p>
        <br /><br /><br />
        <p><strong>${sanitize(admin)}</strong></p>
      </div>
      <div>
        <p>Tegal, ${sanitize(decisionDate)}</p>
        <p>Pemohon</p>
        <br /><br /><br />
        <p><strong>${sanitize(customer)}</strong></p>
      </div>
    </section>
  `;
}

export function buildValidasiSignature(order = {}) {
  return `
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
}
