import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function ZoomWatcher({ onZoom }) {
  useMapEvent("zoomend", (e) => {
    onZoom(e.target.getZoom());
  });
  return null;
}

export default function MapPage({ isDarkMode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [spkluData, setSpkluData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSPKLU, setSelectedSPKLU] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [nearestList, setNearestList] = useState([]);
  const [nearestRange, setNearestRange] = useState(5); // default 5 km
  const [mapZoom, setMapZoom] = useState(5);
  const [showNearestPopup, setShowNearestPopup] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [expandedCluster, setExpandedCluster] = useState(null); // NEW: cluster yang diexpand

  const CLUSTER_STOP_ZOOM = 9;
  const [isClustering, setIsClustering] = useState(true);

  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKota, setSelectedKota] = useState("");

  const watcherRef = useRef(null);
  const mapRef = useRef(null);

  const centerPosition = [-2.5489, 118.0149];
  const lightTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  useEffect(() => {
    fetch("http://localhost:4000/api/spklu/all")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Adaptasi: Normalisasi data charger menjadi array chargers[]
        const normalized = data.map((item) => {
          const chargers = [];
          for (let i = 1; i <= 7; i++) {
            const tipe = item[`tipe_charger_${i}`];
            const power = item[`power_${i}_kw`];
            if (tipe && power) {
              chargers.push({
                tipe,
                power_kw: Number(power),
              });
            }
          }
          // Ambil power terbesar untuk kategori utama
          const maxPower = chargers.length
            ? Math.max(...chargers.map((c) => c.power_kw))
            : 0;
          return {
            ...item,
            chargers,
            power_kw: maxPower,
            tipe_charger: chargers.length ? chargers[0].tipe : "",
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
          };
        });
        setSpkluData(normalized);
        setFilteredData(normalized);
      })
      .catch((err) => {
        console.error("Fetch SPKLU error:", err);
        alert("Gagal memuat data SPKLU. Pastikan database sudah terkoneksi.");
      });
  }, []);

  const getChargerCategory = (power) => {
    if (power > 50) return "Ultrafast";
    if (power >= 23) return "Fast";
    if (power >= 8) return "Medium";
    return "Standard";
  };
  const getCategoryLabel = (power) => {
    if (power > 50) return "ultrafast";
    if (power >= 23) return "fast";
    if (power >= 8) return "medium";
    return "standard";
  };

  const provinsiOptions = useMemo(() => {
    const s = new Set(spkluData.map((d) => d.provinsi).filter(Boolean));
    return Array.from(s).sort();
  }, [spkluData]);

  const kotaOptions = useMemo(() => {
    const base = selectedProvinsi
      ? spkluData.filter((d) => d.provinsi === selectedProvinsi)
      : spkluData;
    const s = new Set(base.map((d) => d.kota).filter(Boolean));
    return Array.from(s).sort();
  }, [spkluData, selectedProvinsi]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = spkluData.filter((item) => {
      const matchesQuery =
        item.nama?.toLowerCase().includes(q) ||
        item.kota?.toLowerCase().includes(q) ||
        item.provinsi?.toLowerCase().includes(q) ||
        item.chargers.some(
          (c) =>
            c.tipe?.toLowerCase().includes(q) ||
            String(c.power_kw).includes(q)
        );
      const matchesProv = selectedProvinsi ? item.provinsi === selectedProvinsi : true;
      const matchesKota = selectedKota ? item.kota === selectedKota : true;
      const matchesTipe = filterTipe
        ? item.chargers.some((c) => getCategoryLabel(c.power_kw) === filterTipe)
        : true;
      return matchesQuery && matchesProv && matchesKota && matchesTipe;
    });
    setFilteredData(filtered);
  }, [searchQuery, filterTipe, spkluData, selectedProvinsi, selectedKota]);

  const customIcon = new L.Icon({
    iconUrl: "https://res.cloudinary.com/dhobt7mjy/image/upload/v1764004277/point.png",
    iconSize: [50, 50],
    iconAnchor: [19, 38],
  });
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
    iconSize: [50, 50],
    iconAnchor: [20, 40],
  });

  const getAnimatedIcon = (isActive) =>
    new L.DivIcon({
      className: isActive ? "marker-animated" : "marker-default",
      html: `<div class="marker-inner"></div>`,
      iconSize: [50, 50],
      iconAnchor: [25, 45],
    });

  const handleLocationTracking = () => {
    if (isTracking) {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
        watcherRef.current = null;
      }
      setIsTracking(false);
      setUserLocation(null);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation tidak didukung di browser Anda.");
        return;
      }
      setIsTracking(true);
      watcherRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Gunakan koordinat dengan presisi tinggi
          const lat = Number(pos.coords.latitude.toFixed(7));
          const lng = Number(pos.coords.longitude.toFixed(7));
          const newLoc = [lat, lng];
          setUserLocation(newLoc);
          // Fokus ke lokasi user hanya saat pertama kali tracking diaktifkan
          if (mapRef.current) {
            mapRef.current.setView(newLoc, Math.max(mapRef.current.getZoom(), 13), { animate: true });
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert(`Akses lokasi gagal: ${err.message}`);
          setIsTracking(false);
          setUserLocation(null);
          if (watcherRef.current !== null) {
            navigator.geolocation.clearWatch(watcherRef.current);
            watcherRef.current = null;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    }
  };

  useEffect(() => {
    if (isTracking && userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, Math.max(mapRef.current.getZoom(), 13), { animate: true });
    }
  }, [userLocation, isTracking]);

  const getDistance = (loc1, loc2) => {
    const R = 6371;
    const dLat = ((loc2[0] - loc1[0]) * Math.PI) / 180;
    const dLon = ((loc2[1] - loc1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((loc1[0] * Math.PI) / 180) *
        Math.cos((loc2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestSPKLU = () => {
    if (!userLocation) {
      alert("❌ Silakan aktifkan 'Lokasi Saya' terlebih dahulu untuk mencari SPKLU terdekat.");
      return;
    }
    if (spkluData.length === 0) {
      alert("⚠️ Data SPKLU belum dimuat. Coba refresh halaman.");
      return;
    }
    try {
      const nearest = spkluData
        .map((s) => ({
          ...s,
          distance: getDistance(userLocation, [s.latitude, s.longitude]),
        }))
        .sort((a, b) => a.distance - b.distance);

      if (!nearest.length) {
        alert("❌ Tidak ada SPKLU ditemukan di database.");
        setNearestList([]);
        return;
      }

      setNearestList(nearest);
      setSelectedSPKLU(nearest[0]);
      if (mapRef.current) {
        mapRef.current.setView([nearest[0].latitude, nearest[0].longitude], 13);
      }
    } catch (err) {
      console.error("Error saat mencari nearest:", err);
      alert("❌ Terjadi kesalahan saat mencari SPKLU terdekat.");
    }
  };

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView(centerPosition, 5, { animate: true });
    }
    setSelectedProvinsi("");
    setSelectedKota("");
    setFilterTipe("");
    setSearchQuery("");
    setSelectedSPKLU(null);
    setNearestList([]);
  };

  const makeClusterIcon = (count) => {
    return new L.DivIcon({
      html: `<div class="cluster-icon"><span>${count}</span></div>`,
      className: "cluster-wrapper",
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  };

  // Handler klik cluster: zoom ke bounds dan tampilkan marker-marker di cluster
  const handleClusterClick = (cluster) => {
    if (!mapRef.current || !cluster?.items?.length) return;
    const bounds = L.latLngBounds(cluster.items.map((i) => [i.latitude, i.longitude]));
    const map = mapRef.current;
    setExpandedCluster(cluster); // Set cluster yang diexpand
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: CLUSTER_STOP_ZOOM + 2 });
    // Setelah zoom, pastikan expandedCluster tetap aktif
  };

  // Collapse expandedCluster jika user zoom out
  useEffect(() => {
    if (expandedCluster && mapZoom < CLUSTER_STOP_ZOOM) {
      setExpandedCluster(null);
    }
  }, [mapZoom, expandedCluster]);

  const getSoftSplitLimit = (z) => (z >= 8 ? 20 : z >= 7 ? 12 : z >= 6 ? 6 : z >= 5 ? 3 : -1);

  const zoomToCluster = (items) => {
    if (!mapRef.current || !items?.length) return;
    const bounds = L.latLngBounds(items.map((i) => [i.latitude, i.longitude]));
    const map = mapRef.current;
    map.flyToBounds(bounds, { padding: [40, 40], maxZoom: CLUSTER_STOP_ZOOM });
    map.once("moveend", () => {
      const z = map.getZoom();
      if (z < CLUSTER_STOP_ZOOM) {
        map.setView(bounds.getCenter(), CLUSTER_STOP_ZOOM);
      }
    });
  };

  const clusterize = (items, zoom) => {
    const z = zoom ?? 3;
    if (!isClustering) {
      return items.map((i) => ({ kind: "single", item: i }));
    }
    // Cluster semua titik jika zoom < CLUSTER_STOP_ZOOM
    const bucket =
      z < 3 ? 10 : z < 4 ? 6 : z < 5 ? 4 : z < 6 ? 2 : z < 7 ? 1.5 : z < CLUSTER_STOP_ZOOM ? 1 : 0;
    if (bucket === 0) return items.map((i) => ({ kind: "single", item: i }));

    const map = new Map();
    const keyOf = (lat, lng) =>
      `${Math.round(lat / bucket) * bucket}|${Math.round(lng / bucket) * bucket}`;
    for (const it of items) {
      const k = keyOf(it.latitude, it.longitude);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(it);
    }
    const out = [];
    // Selalu cluster semua group pada zoom < CLUSTER_STOP_ZOOM, termasuk group dengan 1 titik
    map.forEach((group) => {
      if (z >= CLUSTER_STOP_ZOOM && group.length === 1) {
        out.push({ kind: "single", item: group[0] });
      } else {
        const lat = group.reduce((s, g) => s + g.latitude, 0) / group.length;
        const lng = group.reduce((s, g) => s + g.longitude, 0) / group.length;
        out.push({ kind: "cluster", lat, lng, items: group, count: group.length });
      }
    });
    return out;
  };

  const clusters = useMemo(
    () => clusterize(filteredData, mapZoom),
    [filteredData, mapZoom, isClustering]
  );

  const indonesiaBounds = L.latLngBounds(L.latLng(-12, 93), L.latLng(7, 142));

  const fitToProvince = (prov) => {
    if (!prov || !mapRef.current) return;
    const items = spkluData.filter((d) => d.provinsi === prov);
    if (!items.length) return;
    const bounds = L.latLngBounds(items.map((i) => [i.latitude, i.longitude]));
    const map = mapRef.current;
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: CLUSTER_STOP_ZOOM });
    map.once("moveend", () => {
      const z = map.getZoom();
      if (z < CLUSTER_STOP_ZOOM) map.setView(bounds.getCenter(), CLUSTER_STOP_ZOOM);
    });
  };

  const handleProvinceClick = (prov) => {
    setSelectedProvinsi(prov);
    setSelectedKota("");
    fitToProvince(prov);
  };

  const onMarkerClick = (item) => {
    setSelectedSPKLU(item);
    setActiveMarkerId(item.id);
    setSelectedProvinsi(item.provinsi || "");
    setSelectedKota("");
    if (item.provinsi) fitToProvince(item.provinsi);
    setTimeout(() => setActiveMarkerId(null), 400); // Reset after animation
  };

  // Handler untuk Sidebar komponen (jika tetap ingin dipakai)
  const handleSidebarFindNearest = (nearestList) => {
    if (!nearestList || nearestList.length === 0) return;
    setSelectedSPKLU(nearestList[0]);
    setNearestList(nearestList.slice(1));
    if (mapRef.current) {
      mapRef.current.setView([nearestList[0].latitude, nearestList[0].longitude], 13);
    }
  };

  // Ganti handler tombol "Terdekat" agar menampilkan popup
  const handleShowNearestPopup = () => {
    setShowNearestPopup(true);
  };

  // Handler konfirmasi popup
  const handleConfirmNearest = () => {
    setShowNearestPopup(false);
    findNearestSPKLU();
  };

  // Handler batal popup
  const handleCancelNearest = () => {
    setShowNearestPopup(false);
  };

  // Filter nearestList sesuai range slider, tampilkan semua hasil dalam jarak (tanpa slice 5)
  const filteredNearestList = nearestList
    .filter((n) => n.distance <= nearestRange);

  return (
    <div className="map-layout">
      <aside className="sidebar-left">
        <h3 className="section-title">Filter SPKLU</h3>
        <input
          className="input"
          type="text"
          placeholder="Cari SPKLU atau kota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="select"
          value={selectedKota}
          onChange={(e) => setSelectedKota(e.target.value)}
        >
          <option value="">Semua Kabupaten/Kota</option>
          {kotaOptions.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          className="select"
          value={filterTipe}
          onChange={(e) => setFilterTipe(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option value="standard">Standard</option>
          <option value="medium">Medium</option>
          <option value="fast">Fast</option>
          <option value="ultrafast">Ultrafast</option>
        </select>
        <div className="provinsi-grid">
          {provinsiOptions.map((p) => (
            <button
              key={p}
              type="button"
              className={`provinsi-chip ${selectedProvinsi === p ? "active" : ""}`}
              onClick={() => handleProvinceClick(p)}
              title={`Zoom ke ${p}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="btn-small" onClick={handleLocationTracking}>
            {isTracking ? "Stop" : "Lokasi"}
          </button>
          <button className="btn-small" onClick={handleShowNearestPopup}>
            Terdekat
          </button>
          <button className="btn-small" onClick={resetMapView}>
            Reset
          </button>
          <button className="btn-small" onClick={() => setIsClustering((v) => !v)}>
            {isClustering ? "Cluster On" : "Cluster Off"}
          </button>
        </div>
        <div className="meta">Menampilkan {filteredData.length} SPKLU</div>
        <div className="list">
          {filteredData.map((item) => (
            <button
              key={`list-${item.id}`}
              onClick={() => {
                setSelectedSPKLU(item);
                setSelectedProvinsi(item.provinsi || "");
                setSelectedKota("");
                if (item.provinsi) fitToProvince(item.provinsi);
                if (mapRef.current)
                  mapRef.current.setView(
                    [item.latitude, item.longitude],
                    Math.max(mapRef.current.getZoom(), 13)
                  );
              }}
              className="list-item"
            >
              <div className="list-title">{item.nama}</div>
              <div className="list-sub">{item.alamat}</div>
              {/* Tampilkan semua charger */}
              <div>
                {item.chargers.map((c, idx) => (
                  <div key={idx} className="list-info-row">
                    <span className="list-badge">{c.tipe}</span>
                    <span className="list-power">{c.power_kw} kW</span>
                    <span className="list-badge">{getCategoryLabel(c.power_kw)}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </aside>
      <div className="map-right">
        {/* POPUP PENCARIAN SPKLU TERDEKAT */}
        {showNearestPopup && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleCancelNearest}
          >
            <div
              style={{
                background: "var(--card,#fff)",
                color: "var(--text,#222)",
                borderRadius: 12,
                padding: 28,
                minWidth: 320,
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                position: "relative",
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Cari SPKLU Terdekat?</h3>
              <p style={{ marginBottom: 20, fontSize: 15 }}>
                Fitur ini akan mencari dan menampilkan hingga 5 SPKLU terdekat dari lokasi Anda saat ini.<br />
                Pastikan fitur lokasi sudah aktif.<br />
                <b>Pilih jarak maksimal:</b>
              </p>
              {/* Slider jarak */}
              <div style={{ marginBottom: 18 }}>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.1}
                  value={Math.max(0, Math.min(nearestRange, 15))}
                  onChange={e => setNearestRange(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 2 }}>
                  <span>0 km</span>
                  <span style={{
                    minWidth: 48,
                    textAlign: "center",
                    display: "inline-block"
                  }}>
                    {nearestRange} km
                  </span>
                  <span>15 km</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  className="btn"
                  style={{ background: "#eee", color: "#333" }}
                  onClick={handleCancelNearest}
                >
                  Batal
                </button>
                <button
                  className="btn"
                  style={{ background: "var(--btn-primary)", color: "var(--btn-primary-contrast)", fontWeight: 600 }}
                  onClick={handleConfirmNearest}
                >
                  Cari Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
        {/* POPUP NEAREST LIST BOX DI ATAS MAP */}
        {nearestList.length > 0 && !showNearestPopup && (
          <div className="nearest-list-popup">
            <div className="nearest-list-box" style={{ position: "relative" }}>
              {/* Tombol X di pojok kanan atas */}
              <button
                aria-label="Tutup"
                title="Tutup"
                onClick={() => setNearestList([])}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#888",
                  cursor: "pointer",
                  padding: 2,
                  zIndex: 2,
                  lineHeight: 1
                }}
              >
                ×
              </button>
              <div className="nearest-title">
                <span role="img" aria-label="star"></span> SPKLU Terdekat
              </div>
              {/* Slider filter jarak */}
              <div style={{ marginBottom: 12 }}>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.1}
                  value={Math.max(0, Math.min(nearestRange, 15))}
                  onChange={e => setNearestRange(Number(e.target.value))}
                  onMouseUp={e => setNearestRange(Number(e.target.value))}
                  onTouchEnd={e => setNearestRange(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 2 }}>
                  <span>0 km</span>
                  <span
                    style={{
                      minWidth: 60,
                      textAlign: "center",
                      display: "inline-block"
                    }}
                  >
                    {nearestRange.toFixed(1)} km
                  </span>
                  <span>15 km</span>
                </div>
              </div>
              {/* Tampilkan hasil terfilter, semua hasil dalam jarak, box hanya 3 item terlihat, scrollable, scrollbar hidden */}
              <div
                style={{
                  maxHeight: 3 * 54 + 8,
                  overflowY: "auto",
                  marginBottom: 4,
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none" // IE/Edge
                }}
                // Hide scrollbar for Chrome/Safari
                className="nearest-list-scroll"
              >
                {filteredNearestList.length === 0 && (
                  <div style={{ color: "#888", fontSize: 14, margin: "10px 0" }}>
                    Tidak ada SPKLU dalam jarak {nearestRange} km.
                  </div>
                )}
                {filteredNearestList.map((n, i) => (
                  <button
                    key={`nearest-popup-${i}`}
                    className="nearest-btn"
                    onClick={() => {
                      setSelectedSPKLU(n);
                      if (mapRef.current)
                        mapRef.current.setView([n.latitude, n.longitude], 13);
                    }}
                    style={{ pointerEvents: "auto" }}
                  >
                    <strong>{n.nama}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: "#2cd06f" }}>
                      📏 {n.distance.toFixed(2)} km
                    </span>
                  </button>
                ))}
              </div>
              <style>{`
                .nearest-list-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
        )}
        <div className="map-wrapper">
          <MapContainer
            whenCreated={(m) => (mapRef.current = m)}
            center={centerPosition}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="leaflet-map"
            maxBounds={indonesiaBounds}
            maxBoundsViscosity={1.0}
            zoomControl={true}
          >
            <ZoomWatcher onZoom={(z) => setMapZoom(z)} />
            <TileLayer url={lightTile} />

            {/* Render cluster dan marker */}
            {!expandedCluster && clusters.map((c, idx) =>
              c.kind === "cluster" ? (
                <Marker
                  key={`cluster-${idx}`}
                  position={[c.lat, c.lng]}
                  icon={makeClusterIcon(c.count)}
                  interactive={true}
                  riseOnHover={true}
                  zIndexOffset={1000}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleClusterClick(c);
                    },
                  }}
                />
              ) : (
                <Marker
                  key={c.item.id}
                  position={[c.item.latitude, c.item.longitude]}
                  icon={getAnimatedIcon(activeMarkerId === c.item.id)}
                  eventHandlers={{ click: () => onMarkerClick(c.item) }}
                />
              )
            )}

            {/* Jika sedang expanded cluster, render marker-marker individual di cluster */}
            {expandedCluster && expandedCluster.items.map((item) => (
              <Marker
                key={`expanded-${item.id}`}
                position={[item.latitude, item.longitude]}
                icon={getAnimatedIcon(activeMarkerId === item.id)}
                eventHandlers={{ click: () => onMarkerClick(item) }}
              />
            ))}

            {/* Tombol keluar dari expanded cluster */}
            {expandedCluster && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 2000,
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  padding: "6px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>
                  Menampilkan {expandedCluster.count} SPKLU di area ini
                </span>
                <button
                  style={{
                    background: "#eee",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 10px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => setExpandedCluster(null)}
                  title="Kembali ke mode cluster"
                >
                  Tutup
                </button>
              </div>
            )}

            {userLocation && <Marker position={userLocation} icon={userIcon} />}
          </MapContainer>
        </div>

        <div className={`sidebar ${selectedSPKLU ? "active" : ""}`}>
          {selectedSPKLU ? (
            <>
              <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>{selectedSPKLU.nama}</h2>
                {/* Tombol close */}
                <button
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#888",
                    cursor: "pointer",
                    marginLeft: 8,
                    padding: 2,
                    lineHeight: 1
                  }}
                  aria-label="Tutup"
                  onClick={() => setSelectedSPKLU(null)}
                  title="Tutup"
                >
                  ×
                </button>
              </div>
              <p><b>{selectedSPKLU.alamat}</b></p>
              {/* Tampilkan semua charger */}
              <div>
                {selectedSPKLU.chargers.map((c, idx) => (
                  <div key={idx} style={{ fontSize: 15, marginBottom: 4 }}>
                    ⚡ <b>{c.tipe}</b> — {c.power_kw} kW ({getChargerCategory(c.power_kw)})
                  </div>
                ))}
              </div>
              {userLocation && (
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  📍 Jarak dari lokasi Anda:{" "}
                  {getDistance(userLocation, [
                    selectedSPKLU.latitude,
                    selectedSPKLU.longitude,
                  ]).toFixed(2)}{" "}
                  km
                </p>
              )}

              <a
                href={`https://www.google.com/maps?q=${selectedSPKLU.latitude},${selectedSPKLU.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: 12,
                  padding: 10,
                  background: "var(--btn-primary)",
                  color: "var(--btn-primary-contrast)",
                  textAlign: "center",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                🗺️ Buka di Google Maps
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
