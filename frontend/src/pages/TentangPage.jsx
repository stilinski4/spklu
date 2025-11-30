export default function TentangPage() {
  return (
    <div className="page container">
      <h1>Tentang SPKLU.id</h1>
      <p style={{ fontSize: 18, color: "var(--text)" }}>
        <b>SPKLU.id</b> adalah platform digital yang membantu pengguna kendaraan listrik (EV) di Indonesia untuk menemukan stasiun pengisian kendaraan listrik umum (SPKLU) terdekat dengan mudah, cepat, dan akurat.
      </p>
      <h2 style={{ fontSize: 22, marginTop: 32 }}>Misi Kami</h2>
      <ul style={{ color: "var(--text)", fontWeight: 500, fontSize: 16, marginBottom: 24 }}>
        <li>Mendukung percepatan adopsi kendaraan listrik di Indonesia.</li>
        <li>Memudahkan akses informasi lokasi SPKLU secara real-time dan akurat.</li>
        <li>Meningkatkan kenyamanan dan kepercayaan pengguna EV saat bepergian.</li>
      </ul>
      <h2 style={{ fontSize: 22 }}>Fitur Utama</h2>
      <ul style={{ fontSize: 16, color: "var(--text)", marginBottom: 24 }}>
        <li>Pencarian SPKLU berdasarkan nama, kota, provinsi, dan tipe charger.</li>
        <li>Filter berdasarkan provinsi, kota/kabupaten, dan kategori daya (Standard, Medium, Fast, Ultrafast).</li>
        <li>Setiap SPKLU dapat memiliki beberapa tipe charger dan daya (multi-charger per lokasi).</li>
        <li>Pelacakan lokasi pengguna secara real-time untuk menemukan SPKLU terdekat.</li>
        <li>Cluster peta cerdas untuk tampilan peta yang rapi dan informatif.</li>
        <li>Integrasi langsung ke Google Maps untuk navigasi ke lokasi SPKLU.</li>
        <li>Deskripsi detail setiap SPKLU: alamat, semua tipe charger, dan kategori daya.</li>
        <li>Tampilan responsif dan dukungan mode gelap/terang.</li>
      </ul>
      <h2 style={{ fontSize: 22 }}>Teknologi</h2>
      <ul style={{ fontSize: 16, color: "var(--text)", marginBottom: 200 }}>
        <li><b>Frontend:</b> React.js, Leaflet.js untuk visualisasi peta interaktif.</li>
        <li><b>Backend/API:</b> Node.js/Express (API internal untuk data SPKLU).</li>
        <li><b>Database:</b> Data SPKLU diperbarui secara berkala dari sumber terpercaya.</li>
        <li><b>UI/UX:</b> Desain modern, ringan, dan mudah digunakan di berbagai perangkat.</li>
      </ul>
    </div>
  );
}
