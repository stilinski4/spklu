export default function InformasiPage() {
  return (
    // START: React Fragment to wrap all elements
    <> 
      {/* First main content block */}
      <div className="page container">
        <h1>Informasi SPKLU</h1>
        <p>Temukan informasi seputar SPKLU: jenis konektor, kategori daya, dan informasi lainnya.</p>
        <ul className="bullet">
          <li>Standard: ≤ 7.9 kW - pengisian lambat, cocok parkir lama</li>
          <li>Medium: 8-22 kW - pengisian menengah di area publik</li>
          <li>Fast: 23-50 kW - pengisian cepat untuk perjalanan</li>
          <li>Ultrafast: &gt; 50 kW - pengisian sangat cepat</li>
        </ul>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 10 }}>
          Satu SPKLU bisa memiliki beberapa tipe charger dan daya sekaligus (misal: AC 22 kW & DC 50 kW).
        </p>
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: 20
      }}>
        <div style={{
          flex: "1 1 320x",
          maxWidth: 400,
          textAlign: "center",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          background: "var(--card)",
          boxShadow: "var(--cardShadow)",
          padding: 24,
        }}>
          <img src="https://images.squarespace-cdn.com/content/v1/6151d38ea56f9d31cf76ec07/61189f51-55c5-4a76-a708-c73c3e1bcf88/What+does+EV+demand+currently+look+like%3F+-+The+Electric+Car+Scheme" alt="Kenapa harus mobil listrik" style={{ width: "100%", maxWidth: 280, margin: "0 auto", borderRadius: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0 6px" }}>Kenapa harus mobil listrik?</h2>
          <p style={{ color: "var(--text)", fontSize: 16, lineHeight: 1.6, textAlign: "justify" }}>
            Mobil listrik lebih hemat energi. Mobil listrik dapat mengubah 60%-80% energi dari baterai menjadi tenaga, beda dengan mesin pembakaran internal yang hanya mengubah 12%-30% dari energi bahan bakar menjadi tenaga penggerak. Selain itu, mobil listrik nol emisi, jadi kamu bisa ikut menjaga lingkungan demi keberlanjutan bumi.
          </p>
        </div>
        <div style={{
          flex: "1 1 320px",
          maxWidth: 400,
          height: 430,
          maxHeight: 500,
          textAlign: "center",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          background: "var(--card)",
          boxShadow: "var(--cardShadow)",
          padding: 24,
          marginBottom: 30,
        }}>
          <img src="https://evcentral.com.au/wp-content/uploads/2020/09/IMG_8352.jpg" alt="Keuntungan mobil listrik" style={{ width: "100%", maxWidth: 280, margin: "0 auto", borderRadius: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0 6px" }}>Apa sih untungnya pakai mobil listrik?</h2>
          <p style={{ color: "var(--text)", fontSize: 16, lineHeight: 1.6, textAlign: "justify" }}>
            Hemat biaya bahan bakar karena kamu bisa pakai listrik di rumahmu. Biaya perawatan mobil listrik juga lebih rendah dan yang pasti kamu bisa menikmati sederet insentif mulai dari potongan harga, pembebasan atau pengurangan pajak kendaraan bermotor, hingga subsidi untuk instalasi stasiun pengisian daya di rumah.
          </p>
        </div>
        <div style={{
          flex: "1 1 320px",
          maxWidth: 400,
          height: 430,
          maxHeight: 500,
          textAlign: "center",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          background: "var(--card)",
          boxShadow: "var(--cardShadow)",
          padding: 24,
        }}>
          <img src="https://mgmotor.scene7.com/is/image/mgmotor/evpedia-bn-0060?$mg-rgb-4k-image-responsive$" alt="Jenis charger SPKLU" style={{ width: "100%", maxWidth: 295, margin: "0 auto", borderRadius: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "18px 0 6px" }}>Apa saja tipe charger di SPKLU?</h2>
          <p style={{ color: "var(--text)", fontSize: 16, lineHeight: 1.6, textAlign: "justify" }}>
          Jenis konektor (colokan) yang digunakan sangat penting karena harus sesuai dengan port pengisian di mobil listrik Anda. Berikut <a href="https://pod--point-com.translate.goog/guides/driver/ev-connector-types-speed?_x_tr_sl=en&_x_tr_tl=id&_x_tr_hl=id&_x_tr_pto=tc" target="_blank" rel="noreferrer">panduannya.</a>
          </p>
        </div>
      </div>
      {/* Tombol Buka Peta dipindahkan ke sini */}
      <div style={{ textAlign: "center", marginBottom: 100 }}>
        <a
          className="btn btn-primary"
          href="#peta"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("peta")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Buka Peta
        </a>
      </div>
    </> 
  );
}