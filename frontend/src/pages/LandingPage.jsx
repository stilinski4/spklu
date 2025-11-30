export default function LandingPage() {
  return (
    <div className="relative">
      <div className="hero">
        <div className="hero-box">
          <div className="hero-deco" />
          <img
            alt="EV charging illustration"
            src="https://res.cloudinary.com/dhobt7mjy/image/upload/v1762040582/hero.png"
            className="hero-image"
          />
          <h1 className="hero-title">Temukan Stasiun Pengisian Kendaraan Listrik Terdekat</h1>
          <p className="hero-sub">
            Jelajahi peta SPKLU di seluruh Indonesia dengan filter canggih dan tampilan premium.
          </p>
          <div className="btn-row" style={{ marginBottom: 24 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                document.getElementById("peta")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Lihat Peta
            </button>
            <a
              className="btn btn-ghost"
              href="https://www.youtube.com/watch?v=DSWe89CDkn8"
              target="_blank"
              rel="noreferrer"
            >
              ▶ A Guide to EV Charging Plugs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
