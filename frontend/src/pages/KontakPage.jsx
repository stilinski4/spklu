export default function KontakPage() {
  return (
    <> {/* Menggunakan React Fragment sebagai elemen induk tunggal */}
      <div className="page container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: "2px",
          color: "var(--btn-primary)",
          textShadow: "0 2px 12px rgba(44,208,111,0.12)",
          marginBottom: 8,
          marginTop: 8,
          userSelect: "none"
        }}>
          SPKLU.id
        </div>
        <p>Butuh bantuan atau ingin memberi masukan?</p>
        <ul className="list">
          <li>Email: <a href="mailto:spklu.id@gmail.com">spklu.id@gmail.com</a></li>
          <li>GitHub: <a href="https://github.com/stilinski4" target="_blank" rel="noreferrer">stilinski4</a></li>
          <li style={{ marginBottom: 24 }}>Whatsapp: +6285167122</li>
        </ul>
        <a
          className="btn btn-ghost"
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("beranda")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Kembali ke Beranda
        </a>
        
        <div
          style={{
            display: "flex",
            gap: "36px",
            justifyContent: "center",
            alignItems: "center",
            margin: "36px auto 0 auto",
            background: "transparent",
            width: "fit-content",
            marginBottom: 100,
          }}
        >
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Facebook"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <path d="M21.5 17.5l.667-4.333h-4.167V10.5c0-1.187.583-2.333 2.333-2.333h1.833V4.667S20.25 4.5 18.917 4.5c-3.25 0-5.083 1.917-5.083 5.417v3.25H9v4.333h4.833V28h4.167V17.5h3.5z" fill="var(--text)"/>
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Instagram"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <rect x="6" y="6" width="20" height="20" rx="6" stroke="var(--text)" strokeWidth="2"/>
              <circle cx="16" cy="16" r="5" stroke="var(--text)" strokeWidth="2"/>
              <circle cx="22" cy="10" r="1" fill="var(--text)"/>
            </svg>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="X"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <path d="M10 10l12 12M22 10L10 22" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="YouTube"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <rect x="6" y="10" width="20" height="12" rx="4" stroke="var(--text)" strokeWidth="2"/>
              <polygon points="15,14 21,16 15,18" fill="var(--text)"/>
            </svg>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.18s",
            }}
            onMouseOver={e => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="TikTok"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <path d="M24 13.5c-1.38 0-2.5-1.12-2.5-2.5V7h-3v12.5a2.5 2.5 0 1 1-2.5-2.5h.5v-3h-.5a5.5 5.5 0 1 0 5.5 5.5V16c.66.39 1.42.61 2.5.61V13.5z" fill="var(--text)"/>
            </svg>
          </a>
        </div>
      </div>
      <footer style={{
      background: "var(--primary)",
      color: "var(--text)",
      padding: "16px 40px", // Menyesuaikan padding untuk responsif
      marginTop: "40px",
      fontSize: "18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "2px solid var(--border)", // garis atas untuk pemisah
      // Menambahkan media query dasar untuk tata letak kolom pada layar kecil
      '@media (maxWidth: 768px)': {
        flexDirection: 'column',
        textAlign: 'center',
        padding: '16px 20px',
      }
    }}>
      <div style={{ 
        // marginLeft: "40px", // Dihilangkan karena padding sudah diatur di footer
        marginBottom: 0,
        // Menambahkan margin bawah jika tata letak menjadi kolom
        '@media (maxWidth: 768px)': {
          marginBottom: '10px',
        }
      }}>
        © 2025 - powered by <b>SPKLU.id</b>
      </div>
      <div style={{ 
        // marginRight: "40px", // Dihilangkan karena padding sudah diatur di footer
        // Menambahkan sedikit jarak antara link di layar kecil
        '@media (maxWidth: 768px)': {
          '& a': {
            margin: '0 10px',
          }
        }
      }}>
        <a href="/terms" style={{ color: "var(--text)", marginRight: "32px", textDecoration: "none" }}>Terms & Conditions</a>
        <a href="/privacy" style={{ color: "var(--text)", textDecoration: "none" }}>Privacy Policy</a>
      </div>
    </footer>
    </>
  );
}