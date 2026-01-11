// Bagian footer/signature untuk dokumen cetak
import { sanitize, formatFullDate } from './content';

export function buildKajiUlangSignature(order = {}) {
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
