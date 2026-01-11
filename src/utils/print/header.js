// Bagian header/kop surat untuk dokumen cetak
import logoDefault from '@/assets/LOGO DINAS KAB TEGAL.webp';

export function buildKajiUlangHeader(logoSrc = logoDefault) {
  const logo = logoSrc || logoDefault;
  return `
    <header class="form-header">
      <img src="${logo}" alt="Logo Dinas Kabupaten Tegal" />
      <div class="org-line org-strong">PEMERINTAH KABUPATEN TEGAL</div>
      <div class="org-line org-strong">DINAS PERINDUSTRIAN, TRANSMIGRASI DAN TENAGA KERJA</div>
      <div class="org-line org-unit">UPT LABORATORIUM PERINDUSTRIAN</div>
      <div class="org-line">Jalan Raya Dampyak KM. 4 Komplek lingkungan Kecil Kabupaten Tegal, Jawa Tengah</div>
      <div class="org-line">Kode Pos : 52181 Telepon (0283) 357437</div>
      <div class="org-line org-contact">Laman <span class="org-link">https://lab.disperinaker.tegalkab.go.id</span>, Pos-el <span class="org-link">labperintgl@gmail.com</span></div>
      <div class="header-bar">FORMULIR PERMOHONAN</div>
    </header>
  `;
}
