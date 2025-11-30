import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from "react";
import "./index.css";
import Navbar from "./components/Navbar";

// Defer heavy pages to reduce initial bundle
const LandingPage = lazy(() => import("./pages/LandingPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const InformasiPage = lazy(() => import("./pages/InformasiPage"));
const TentangPage = lazy(() => import("./pages/TentangPage"));
const KontakPage = lazy(() => import("./pages/KontakPage"));

function App() {
  const getInitialMode = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialMode);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  // Theme tokens
  const lightTheme = {
    bg: "#f6f2ff",          // pale purple background
    text: "#111827",
    muted: "#7a7691",
    border: "#e7e0ff",      // light lavender border
    link: "#7c3aed",        // violet link
    card: "#faf7ff",        // tinted surface
    cardShadow: "0 1px 3px rgba(16, 24, 40, 0.06)",
    fontSans:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji",
  };
  const darkTheme = {
    bg: "#0f172a",
    text: "#e5e7eb",
    muted: "#9ca3af",
    border: "#1f2937",
    link: "#60a5fa",
    card: "#111827",
    cardShadow: "none",
    fontSans:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji",
  };

  const applyTheme = (tokens, mode) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;
    Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
    document.body.style.backgroundColor = tokens.bg;
    document.body.style.color = tokens.text;
    document.body.style.fontFamily = tokens.fontSans;
    // optional mobile status bar color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", tokens.bg);
  };

  useEffect(() => {
    const mode = isDarkMode ? "dark" : "light";
    const tokens = isDarkMode ? darkTheme : lightTheme;
    applyTheme(tokens, mode);
  }, [isDarkMode]);

  useEffect(() => {
    try {
      if (localStorage.getItem("theme")) return; // respect user-pinned preference
    } catch {}
    const mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (!mql) return;
    const handler = (e) => setIsDarkMode(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    const applyIcon = () => {
      const icon = isDarkMode ? "🌙" : "☀️";
      const label = isDarkMode ? "Tema Gelap" : "Tema Terang";
      const targets = document.querySelectorAll(
        ".btn-theme, button[aria-label*='theme' i], button[aria-label*='tema' i]"
      );
      targets.forEach((el) => {
        el.textContent = icon;
        el.setAttribute("aria-label", label);
        el.setAttribute("title", label);
      });
    };
    applyIcon();
  }, [isDarkMode]);

  // Measure navbar height and keep content offset correct
  const navRef = useRef(null);
  const [navH, setNavH] = useState(64);

  useLayoutEffect(() => {
    const measure = () => {
      if (!navRef.current) return;
      const h = navRef.current.getBoundingClientRect().height || 64;
      setNavH(h);
    };
    measure();

    const ro = window.ResizeObserver ? new ResizeObserver(measure) : null;
    if (ro && navRef.current) ro.observe(navRef.current);

    // Only attach window resize if ResizeObserver is not available
    if (!ro) window.addEventListener("resize", measure);
    return () => {
      if (!ro) window.removeEventListener("resize", measure);
      if (ro && navRef.current) ro.unobserve(navRef.current);
    };
  }, []);

  useEffect(() => {
    // optional: expose navbar height to CSS
    document.documentElement.style.setProperty("--navbar-h", `${navH}px`);
  }, [navH]);

  // Remove the right sidebar feature entirely (run once and a delayed re-check; no global observer)
  useEffect(() => {
    const removeRightSidebar = () => {
      document.getElementById("right-rail")?.remove();
      document.querySelectorAll(".sidebar-right").forEach((el) => el.remove());
    };
    removeRightSidebar();
    const t = setTimeout(removeRightSidebar, 1500);
    return () => clearTimeout(t);
  }, []);

  // Prefetch MapPage chunk when #peta is close to viewport to avoid blocking first paint
  useEffect(() => {
    const sec = document.getElementById("peta");
    if (!sec || !("IntersectionObserver" in window)) return;
    let loaded = false;
    const preload = () => {
      if (loaded) return;
      loaded = true;
      import("./pages/MapPage").catch(() => {});
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          preload();
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  // Prime geolocation on load and cache last known coords
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const saveCoords = (coords, source = "unknown") => {
      try {
        const data = { lat: coords.latitude, lng: coords.longitude, ts: Date.now(), source };
        localStorage.setItem("lastLocation", JSON.stringify(data));
        window.__lastCoords = data;
        window.dispatchEvent(new CustomEvent("spklu:user-location", { detail: data }));
      } catch {}
    };

    const getOnce = (opts) =>
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          (e) => reject(e),
          opts
        )
      );

    const watchOnce = (timeoutMs = 7000) =>
      new Promise((resolve, reject) => {
        let cleared = false;
        const wid = navigator.geolocation.watchPosition(
          (p) => {
            if (cleared) return;
            cleared = true;
            navigator.geolocation.clearWatch(wid);
            resolve(p);
          },
          () => {},
          { enableHighAccuracy: true }
        );
        const t = setTimeout(() => {
          if (cleared) return;
          cleared = true;
          navigator.geolocation.clearWatch(wid);
          reject(new Error("watchPosition timeout"));
        }, timeoutMs);
      });

    const prime = async () => {
      try {
        const p = await Promise.race([
          getOnce({ enableHighAccuracy: true, timeout: 5000, maximumAge: 15000 }),
          watchOnce(7000),
        ]);
        saveCoords(p.coords, "prime");
      } catch (err) {
        // Fallback to cached
        try {
          const cached = localStorage.getItem("lastLocation");
          if (cached) {
            const obj = JSON.parse(cached);
            if (obj && typeof obj.lat === "number" && typeof obj.lng === "number") {
              window.__lastCoords = obj;
              window.dispatchEvent(new CustomEvent("spklu:user-location", { detail: obj }));
            }
          }
        } catch {}
      }
    };

    // Hydrate cached first (non-blocking), then try to prime
    try {
      const cached = localStorage.getItem("lastLocation");
      if (cached) window.__lastCoords = JSON.parse(cached);
    } catch {}
    prime();
  }, []);

  // Wire "Lokasi Terdekat" button in left sidebar (observe only sidebar, not entire body)
  useEffect(() => {
    const findNearestItem = (sidebar, lat0, lng0) => {
      const toNum = (v) => (typeof v === "string" ? parseFloat(v) : v);
      const getLatLng = (el) => {
        const ds = el.dataset || {};
        const lat = toNum(ds.lat ?? ds.latitude);
        const lng = toNum(ds.lng ?? ds.long ?? ds.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        return null;
      };
      const toRad = (d) => (d * Math.PI) / 180;
      const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      let nearest = null;
      let bestD = Infinity;
      const candidates = Array.from(
        sidebar.querySelectorAll("[data-lat][data-lng], [data-latitude][data-longitude]")
      );
      for (const el of candidates) {
        const p = getLatLng(el);
        if (!p) continue;
        const d = haversine(lat0, lng0, p.lat, p.lng);
        if (d < bestD) {
          bestD = d;
          nearest = { el, ...p, d };
        }
      }
      return nearest;
    };

    const centerOnMap = (lat, lng) => {
      try {
        const w = window;
        if (w.leafletMap?.setView) return w.leafletMap.setView([lat, lng], 14);
        if (w.map?.setView) return w.map.setView([lat, lng], 14);
        if (w.map?.flyTo && Array.isArray(w.map.getCenter?.())) return w.map.flyTo([lat, lng], 14);
        if (w.map?.flyTo) return w.map.flyTo({ center: [lng, lat], zoom: 14 });
        if (w.mapbox?.flyTo) return w.mapbox.flyTo({ center: [lng, lat], zoom: 14 });
      } catch {}
      window.dispatchEvent(new CustomEvent("spklu:focus-nearest", { detail: { lat, lng } }));
    };

    const closeDetailPanelIfAny = () => {
      const candidates = Array.from(
        document.querySelectorAll(
          '.sidebar-right button, .sidebar-right .btn, .detail button, .detail-panel button'
        )
      );
      const closeBtn = candidates.find((b) =>
        (b.textContent || "").trim().toLowerCase().includes("tutup")
      );
      if (closeBtn) closeBtn.click();
    };

    const enterNearestMode = (coords) => {
      document.body.classList.remove("detail-mode");
      document.body.classList.add("nearest-mode");
      document.body.dataset.panelMode = "nearest";
      window.dispatchEvent(new CustomEvent("spklu:show-nearest", { detail: coords }));
      closeDetailPanelIfAny();
    };

    const getFastCoords = async () => {
      // Try fresh geolocation with timeout, else use cached coords
      const once = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p.coords),
            (e) => reject(e),
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
          )
        );
      try {
        const c = await once();
        return { lat: c.latitude, lng: c.longitude, fresh: true };
      } catch {
        const cached = window.__lastCoords || (() => {
          try {
            const raw = localStorage.getItem("lastLocation");
            return raw ? JSON.parse(raw) : null;
          } catch { return null; }
        })();
        if (cached && typeof cached.lat === "number" && typeof cached.lng === "number") {
          return { lat: cached.lat, lng: cached.lng, fresh: false };
        }
        throw new Error("No location available");
      }
    };

    const tryWire = () => {
      const sidebar = document.querySelector(".sidebar-left");
      if (!sidebar) return null;

      const findNearestBtn = () =>
        Array.from(sidebar.querySelectorAll('button, a, [role="button"]')).find((el) => {
          const t = (el.textContent || "").trim().toLowerCase();
          return t.includes("lokasi terdekat") || el.getAttribute("data-action") === "nearest";
        });

      const btn = findNearestBtn();
      if (!btn || btn.dataset.nearestWired) return () => {};

      btn.dataset.nearestWired = "1";
      const onClick = async (e) => {
        e.preventDefault();
        const setLoading = (v) => {
          if ("disabled" in btn) btn.disabled = v;
          btn.classList.toggle("is-loading", !!v);
        };
        setLoading(true);
        try {
          const { lat, lng } = await getFastCoords();

          // Clear active states and highlight nearest
          sidebar
            .querySelectorAll(".nearest-active, .is-active, .active, [aria-selected='true']")
            .forEach((n) => {
              n.classList.remove("nearest-active", "is-active", "active");
              if (n.getAttribute && n.getAttribute("aria-selected") === "true") {
                n.setAttribute("aria-selected", "false");
              }
            });

          const nearest = findNearestItem(sidebar, lat, lng);
          if (nearest?.el) {
            nearest.el.classList.add("nearest-active");
            nearest.el.scrollIntoView({ block: "center", behavior: "smooth" });
          }

          enterNearestMode({ lat, lng });
          centerOnMap(lat, lng);
        } catch (err) {
          console.warn("Lokasi Terdekat error:", err);
          alert("Tidak dapat mengambil lokasi Anda. Pastikan izin lokasi diaktifkan.");
        } finally {
          setLoading(false);
        }
      };

      btn.addEventListener("click", onClick);
      return () => btn.removeEventListener("click", onClick);
    };

    let detach = tryWire();
    if (!detach) {
      const mo = new MutationObserver(() => {
        detach = tryWire();
        if (detach) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => {
        if (detach) detach();
        mo.disconnect();
      };
    }
    return () => detach && detach();
  }, []);

  // Center map on clicked marker (no offset since right rail is removed)
  useEffect(() => {
    const railPad = () => 0;
    const focusZoom = 14;

    const attachLeaflet = () => {
      const m = window.leafletMap || (window.map && window.map.on ? window.map : null);
      if (!m || !m.on) return () => {};
      const onPopup = (e) => {
        const ll = e?.popup?.getLatLng?.();
        if (!ll) return;
        try {
          const z = Math.max(m.getZoom?.() || focusZoom, focusZoom);
          m.setView(ll, z, { animate: true });
          if (m.panBy) m.panBy([-railPad(), 0], { animate: true });
        } catch {}
      };
      m.on("popupopen", onPopup);
      return () => m.off("popupopen", onPopup);
    };

    const attachMapbox = () => {
      const mb = window.mapbox || (window.map && window.map.on && window.map.easeTo ? window.map : null);
      if (!mb || !mb.on) return () => {};
      const onClick = (e) => {
        const f = e?.features?.[0];
        const coords = f?.geometry?.type === "Point" ? f.geometry.coordinates : null;
        if (!coords) return;
        const [lng, lat] = coords;
        try {
          const z = Math.max(mb.getZoom?.() || focusZoom, focusZoom);
          mb.easeTo({ center: [lng, lat], zoom: z, offset: [railPad(), 0] });
        } catch {}
      };
      mb.on("click", onClick);
      return () => mb.off("click", onClick);
    };

    const detachLeaflet = attachLeaflet();
    const detachMapbox = attachMapbox();
    return () => {
      detachLeaflet && detachLeaflet();
      detachMapbox && detachMapbox();
    };
  }, []);

  // Toggle view states (nearest vs. detail) — do NOT open detail on marker click
  useEffect(() => {
    const enterDetail = () => document.body.classList.add("detail-mode");
    const exitNearest = () => {
      document.body.classList.remove("nearest-mode");
      try {
        delete document.body.dataset.panelMode;
      } catch {}
      window.dispatchEvent(new CustomEvent("spklu:exit-nearest"));
    };
    const exitDetail = () => document.body.classList.remove("detail-mode");

    const onClickCapture = (e) => {
      const t = e.target;
      if (!t) return;

      if (
        t.closest(".sidebar-left [data-lat][data-lng], .sidebar-left [data-latitude][data-longitude]") ||
        (t.closest(".sidebar-left") && t.closest("button, a, [role='button']"))
      ) {
        exitNearest();
        enterDetail();
      }

      if (t.closest(".sidebar-right")) {
        const txt = (t.textContent || "").trim().toLowerCase();
        if (txt.includes("tutup") || t.closest(".btn-close, .close")) {
          exitDetail();
        }
      }
    };

    const onDetailOpen = () => enterDetail();
    const onDetailClose = () => exitDetail();

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("spklu:detail-open", onDetailOpen);
    window.addEventListener("spklu:detail-close", onDetailClose);
    window.addEventListener("spklu:reset-filters", onDetailClose);

    const mo = new MutationObserver(() => {
      if (!document.querySelector(".sidebar-right")) document.body.classList.remove("detail-mode");
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("spklu:detail-open", onDetailOpen);
      window.removeEventListener("spklu:detail-close", onDetailClose);
      window.removeEventListener("spklu:reset-filters", onDetailClose);
      mo.disconnect();
    };
  }, []);

  // Auto-click and hide "Stop Lokasi" button AFTER first fix (or small delay)
  useEffect(() => {
    let clicked = false;

    const findStopLokasiBtn = () => {
      const candidates = Array.from(
        document.querySelectorAll("button, [role='button'], .btn, .btn-small")
      );
      return candidates.find((el) => {
        const txt = ((el.textContent || el.innerText || "").trim().toLowerCase());
        return txt === "stop lokasi" || txt.includes("stop lokasi");
      });
    };

    const clickStop = () => {
      if (clicked) return;
      const btn = findStopLokasiBtn();
      if (!btn) return;
      try { btn.click(); } catch {}
      btn.setAttribute("hidden", "true");
      btn.style.display = "none";
      clicked = true;
    };

    // Prefer waiting for first user-location event, fallback to a small timeout
    const onFirstFix = () => {
      // give a short moment for app to consume the fix, then stop
      setTimeout(clickStop, 500);
    };
    window.addEventListener("spklu:user-location", onFirstFix, { once: true });

    const t = setTimeout(clickStop, 5000); // fallback to avoid blocking if event never fires
    return () => {
      window.removeEventListener("spklu:user-location", onFirstFix);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div
        ref={navRef}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, width: "100%" }}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
      <main style={{ paddingTop: navH, overflowX: "hidden" }}>
        <section id="beranda" style={{ scrollMarginTop: navH }}>
          <Suspense fallback={<div style={{ minHeight: 240 }} />}>
            <LandingPage />
          </Suspense>
        </section>
        <section
          id="peta"
          style={{
            padding: 0,
            margin: 0,
            scrollMarginTop: navH,
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            overflowX: "hidden",
            minHeight: `calc(100vh - ${navH}px)`,
          }}
        >
          <Suspense fallback={<div style={{ minHeight: `calc(100vh - ${navH}px)` }}>Memuat peta...</div>}>
            <MapPage isDarkMode={isDarkMode} />
          </Suspense>
        </section>
        <section id="informasi" style={{ scrollMarginTop: navH }}>
          <Suspense fallback={<div style={{ minHeight: 200 }} />}>
            <InformasiPage />
          </Suspense>
        </section>
        <section id="tentang" style={{ scrollMarginTop: navH }}>
          <Suspense fallback={<div style={{ minHeight: 200 }} />}>
            <TentangPage />
          </Suspense>
        </section>
        <section id="kontak" style={{ scrollMarginTop: navH }}>
          <Suspense fallback={<div style={{ minHeight: 200 }} />}>
            <KontakPage />
          </Suspense>
        </section>
      </main>
    </>
  );
}

export default App;
