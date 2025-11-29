"use client";
import { useEffect, useRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { useLocation } from "@/contexts/LocationContext";

export function LiveMap({ onLocationChange, onCenterChange, center }) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const watchIdRef = useRef(null);

  // marker groups & intervals
  const pollutionMarkers = useRef([]); // [{ marker, meta }]
  const ecoMarkers = useRef([]);
  const pollutionUpdaterRef = useRef(null);
  const searchResultMarker = useRef(null);

  // reseed & handlers
  const lastReseedCenter = useRef(null);
  const moveEndHandlerRef = useRef(null);

  // follow-user vs manual-search mode
  const isFollowingUserRef = useRef(true);

  // optional context setter (may throw if provider is missing; we'll swallow errors)
  let setSelectedLocation = null;
  try {
    const ctx = useLocation();
    setSelectedLocation = ctx?.setSelectedLocation ?? null;
  } catch (e) {
    // ignore: useLocation hook may not be provided by parent; we'll just skip context updates
    setSelectedLocation = null;
  }

  useEffect(() => {
    if (map.current) return;

    const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
    if (!API_KEY) {
      console.error("❌ Missing TomTom API Key in .env");
      return;
    }

    const FALLBACK_CENTER = [72.8777, 19.0760]; // Mumbai

    // create map (use provided center for initial load if present)
    map.current = tt.map({
      key: API_KEY,
      container: mapElement.current,
      center: center ? [center.lng, center.lat] : FALLBACK_CENTER,
      zoom: 11,
      style: { map: "basic_main" },
    });

    map.current.addControl(new tt.NavigationControl());

    // Add search & locate UI controls (HTML overlay)
    const controlWrapper = document.createElement("div");
    controlWrapper.style.position = "absolute";
    controlWrapper.style.top = "12px";
    controlWrapper.style.left = "12px";
    controlWrapper.style.zIndex = "999";
    controlWrapper.style.display = "flex";
    controlWrapper.style.gap = "8px";
    controlWrapper.style.alignItems = "center";
    controlWrapper.style.pointerEvents = "auto";
    controlWrapper.style.fontFamily = "Inter, system-ui, Arial";

    // search input
    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search location (city, locality...)";
    input.style.color = "#0b1220"; // main input text
    input.style.background = "rgba(255,255,255,0.95)"; // optional — makes input stand out
    input.style.caretColor = "#0b1220";
    input.style.padding = "8px 10px";
    input.style.borderRadius = "8px";
    input.style.border = "1px solid rgba(15,23,42,0.08)";
    input.style.width = "300px";
    input.style.boxShadow = "0 6px 18px rgba(2, 6, 23, 0)";
    input.style.outline = "none";

    // search button
    const btn = document.createElement("button");
    btn.textContent = "Search";
    btn.style.padding = "8px 10px";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.background = "#0ea5a4";
    btn.style.color = "white";
    btn.style.cursor = "pointer";

    // locate button
    const locateBtn = document.createElement("button");
    locateBtn.textContent = "Locate me";
    locateBtn.style.padding = "8px 10px";
    locateBtn.style.borderRadius = "8px";
    locateBtn.style.border = "none";
    locateBtn.style.background = "#10b981";
    locateBtn.style.color = "white";
    locateBtn.style.cursor = "pointer";

    controlWrapper.appendChild(input);
    controlWrapper.appendChild(btn);
    controlWrapper.appendChild(locateBtn);
    mapElement.current.appendChild(controlWrapper);

    // ---------- inline styles for popups & keyframes ----------
    if (!document.getElementById("livemap-popup-and-keyframes")) {
      const s = document.createElement("style");
      s.id = "livemap-popup-and-keyframes";
      s.innerHTML = `
        .lm-popup-card {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #0f172a;
          background: rgba(255,255,255,0.98);
          padding: 8px 10px;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(2,6,23,0.24);
          line-height: 1.1;
        }
        .lm-popup-title { font-weight: 700; font-size: 13px; color: #0b1220; }
        .lm-popup-aqi { font-weight: 800; font-size: 14px; color: #0b1220; display:inline-block; margin-left:6px; }
        @keyframes ecoPulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.25); opacity: 0.45; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }

    // ---------- small DOM util functions ----------
    function createPollutionElement(aqiValue, categoryLabel, color) {
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.alignItems = "center";
      wrapper.style.pointerEvents = "auto";

      const dot = document.createElement("div");
      dot.style.width = "18px";
      dot.style.height = "18px";
      dot.style.borderRadius = "50%";
      dot.style.background = color;
      dot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
      dot.style.border = "2px solid rgba(255,255,255,0.9)";
      wrapper.appendChild(dot);

      const label = document.createElement("div");
      label.style.fontSize = "11px";
      label.style.marginTop = "4px";
      label.style.padding = "2px 6px";
      label.style.background = "rgba(255,255,255,0.98)";
      label.style.borderRadius = "6px";
      label.style.boxShadow = "0 1px 2px rgba(0,0,0,0.08)";
      label.style.fontFamily = "Arial, sans-serif";
      label.style.color = "#0b1220";
      label.textContent = `${categoryLabel} ${aqiValue}`;
      wrapper.appendChild(label);

      return wrapper;
    }

    function createEcoElementSmall() {
      const wrapper = document.createElement("div");
      wrapper.style.width = "30px";
      wrapper.style.height = "30px";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.pointerEvents = "auto";

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "22");
      svg.setAttribute("height", "22");
      svg.innerHTML = `
        <circle cx="12" cy="12" r="11" fill="#E6FFFA" stroke="rgba(255,255,255,0.9)" stroke-width="1"/>
        <path d="M7.5 12.5c1.2-2.1 4.2-3 6-1.2 1.4 1.4 1.2 3.2 0 4.2-1.1 1-3 1.4-4.5.6-1.1-.6-2.1-1.6-1.5-3.6z" fill="#10b981"/>
      `;
      wrapper.appendChild(svg);
      return wrapper;
    }

    // ---------- AQI helpers ----------
    function getAQICategory(val) {
      if (val <= 50) return { label: "Good", color: "#10b981" };
      if (val <= 100) return { label: "Moderate", color: "#f59e0b" };
      if (val <= 200) return { label: "Unhealthy", color: "#ef4444" };
      return { label: "Hazardous", color: "#7f1d1d" };
    }

    function popupHTML(title, aqi) {
      if (aqi == null) return `<div class="lm-popup-card"><div class="lm-popup-title">${title}</div></div>`;
      return `<div class="lm-popup-card"><div style="display:flex;align-items:center;justify-content:space-between">
                <div class="lm-popup-title">${title}</div>
                <div class="lm-popup-aqi">AQI <strong style="margin-left:6px">${aqi}</strong></div>
              </div></div>`;
    }

    // ---------- user marker ----------
    function createEcoUserElement() {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = "44px";
      wrapper.style.height = "44px";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.pointerEvents = "auto";

      const pulse = document.createElement("div");
      pulse.style.position = "absolute";
      pulse.style.width = "44px";
      pulse.style.height = "44px";
      pulse.style.left = "0";
      pulse.style.top = "0";
      pulse.style.borderRadius = "50%";
      pulse.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.12) inset, 0 0 12px rgba(16,185,129,0.12)";
      pulse.style.animation = "ecoPulse 2.5s ease-out infinite";

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 64 64");
      svg.setAttribute("width", "30");
      svg.setAttribute("height", "30");
      svg.style.zIndex = "2";

      const bg = document.createElementNS(svgNS, "circle");
      bg.setAttribute("cx", "32");
      bg.setAttribute("cy", "32");
      bg.setAttribute("r", "28");
      bg.setAttribute("fill", "#E6FFFA");
      svg.appendChild(bg);

      const person = document.createElementNS(svgNS, "g");
      person.setAttribute("fill", "#064E3B");
      person.innerHTML = `
        <circle cx="32" cy="20" r="6"></circle>
        <path d="M20 46c0-6.6 5.4-12 12-12s12 5.4 12 12v4H20v-4z"></path>
      `;
      svg.appendChild(person);

      const leaf = document.createElementNS(svgNS, "path");
      leaf.setAttribute(
        "d",
        "M44.5 30.5c2.5-2.5 6.7-2.5 9.2 0 1.8 1.8 1.8 4.7 0 6.5-1.9 1.9-5.3 2.6-8.3 1.6-1.1-.36-2.1-1-2.9-1.9-1.7-1.8-2.1-4.4 0-6.2z"
      );
      leaf.setAttribute("fill", "#34D399");
      leaf.setAttribute("transform", "translate(-6,-6) rotate(-12 40 32)");
      svg.appendChild(leaf);

      const shine = document.createElementNS(svgNS, "path");
      shine.setAttribute("d", "M24 22c1.2-2.4 4.2-3.6 6.6-2.4 0 0-2.8 1.2-4 3.6-1.2 2.4-3 1.2-2.6-1.2z");
      shine.setAttribute("fill", "rgba(255,255,255,0.55)");
      svg.appendChild(shine);

      wrapper.appendChild(pulse);
      wrapper.appendChild(svg);
      return wrapper;
    }

    function updateUserMarker(lng, lat, accuracy) {
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      if (!userMarker.current) {
        const el = createEcoUserElement();
        userMarker.current = new tt.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .setPopup(new tt.Popup({ offset: 10 }).setHTML(popupHTML("You are here", Math.round(accuracy ?? 0))))
          .addTo(map.current);
      } else {
        userMarker.current.setLngLat([lng, lat]);
        const popup = userMarker.current.getPopup();
        if (popup) popup.setHTML(popupHTML("You are here", Math.round(accuracy ?? 0)));
      }

      // update context with current user location (name is optional)
      try {
        if (setSelectedLocation) {
          setSelectedLocation({ name: "Your location", latitude: lat, longitude: lng });
        }
      } catch (e) {}
    }

    // ---------- Pollution + Heatmap ----------
    function buildHeatLayerIfMissing() {
      try {
        if (!map.current.getSource("pollution-data")) {
          map.current.addSource("pollution-data", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          map.current.addLayer({
            id: "pollution-heat",
            type: "circle",
            source: "pollution-data",
            paint: {
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "aqi"],
                0, "#10b981",
                50, "#a3e635",
                100, "#f59e0b",
                150, "#f97316",
                200, "#ef4444",
                300, "#7f1d1d",
              ],
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "aqi"],
                0, 6,
                50, 8,
                100, 12,
                150, 18,
                200, 26,
                300, 36,
              ],
              "circle-opacity": 0.42,
              "circle-stroke-color": "rgba(255,255,255,0.6)",
              "circle-stroke-width": 1,
            },
          });
        }
      } catch (e) {
        // ignore
      }
    }

    function makePollutionFeature(lng, lat, aqi) {
      return {
        type: "Feature",
        properties: { aqi },
        geometry: { type: "Point", coordinates: [lng, lat] },
      };
    }

    function seedPollutionMarkers(centerLng, centerLat, count = 18) {
      pollutionMarkers.current.forEach((e) => e.marker.remove());
      pollutionMarkers.current = [];

      const features = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const radius = 0.002 + Math.random() * 0.028;
        const lng = centerLng + Math.cos(angle) * radius;
        const lat = centerLat + Math.sin(angle) * radius;

        const base = 70 + Math.sin(i + Date.now() / 17000) * 28;
        const noise = Math.round((Math.random() - 0.2) * 80);
        const aqi = Math.max(5, Math.min(350, Math.round(base + noise)));

        const cat = getAQICategory(aqi);
        const el = createPollutionElement(aqi, cat.label, cat.color);

        const marker = new tt.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .setPopup(new tt.Popup({ offset: 8 }).setHTML(popupHTML(cat.label, aqi)))
          .addTo(map.current);

        pollutionMarkers.current.push({ marker, meta: { lng, lat, aqi } });
        features.push(makePollutionFeature(lng, lat, aqi));
      }

      const src = map.current.getSource && map.current.getSource("pollution-data");
      if (src) {
        try {
          src.setData({ type: "FeatureCollection", features });
        } catch (e) {}
      }
    }

    function updatePollutionMarkersAndSource() {
      const features = [];
      pollutionMarkers.current.forEach((entry, idx) => {
        const { marker, meta } = entry;
        const timeFactor = Math.sin((Date.now() / 3000) + idx) * 18;
        const jitter = (Math.random() - 0.5) * 26;
        let newAQI = Math.round((meta.aqi || 70) + timeFactor + jitter);
        const regionalBias = 6 * Math.sin((meta.lng + meta.lat) * 12);
        newAQI = Math.round(Math.max(5, Math.min(350, newAQI + regionalBias)));
        meta.aqi = newAQI;
        const cat = getAQICategory(newAQI);

        try {
          const newEl = createPollutionElement(newAQI, cat.label, cat.color);
          marker.setElement(newEl);
          const popup = marker.getPopup();
          if (popup) popup.setHTML(popupHTML(cat.label, newAQI));
        } catch (e) {}

        features.push(makePollutionFeature(meta.lng, meta.lat, newAQI));
      });

      const src = map.current.getSource && map.current.getSource("pollution-data");
      if (src) {
        try {
          src.setData({ type: "FeatureCollection", features });
        } catch (e) {}
      }
    }

    // ---------- Eco markers ----------
    function seedEcoMarkers(centerLng, centerLat, count = 6) {
      ecoMarkers.current.forEach((m) => m.remove());
      ecoMarkers.current = [];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
        const radius = 0.003 + Math.random() * 0.02;
        const lng = centerLng + Math.cos(angle) * radius;
        const lat = centerLat + Math.sin(angle) * radius;

        const el = createEcoElementSmall();
        const marker = new tt.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .setPopup(new tt.Popup({ offset: 8 }).setHTML(popupHTML("Eco Spot", null)))
          .addTo(map.current);

        ecoMarkers.current.push(marker);
      }
    }

    function lightlyNudgeEcoMarkers() {
      ecoMarkers.current.forEach((m) => {
        try {
          const [lng, lat] = m.getLngLat().toArray();
          const newLng = lng + (Math.random() - 0.5) * 0.0008;
          const newLat = lat + (Math.random() - 0.5) * 0.0008;
          m.setLngLat([newLng, newLat]);
        } catch (e) {}
      });
    }

    // ---------- Combined updater ----------
    function startPollutionAndEcoUpdater(centerLng, centerLat) {
      if (!Number.isFinite(centerLng) || !Number.isFinite(centerLat)) return;

      buildHeatLayerIfMissing();

      seedPollutionMarkers(centerLng, centerLat, 18);
      seedEcoMarkers(centerLng, centerLat, 6);

      if (pollutionUpdaterRef.current) clearInterval(pollutionUpdaterRef.current);
      pollutionUpdaterRef.current = setInterval(() => {
        if (Math.random() < 0.14) {
          const jitterLng = centerLng + (Math.random() - 0.5) * 0.012;
          const jitterLat = centerLat + (Math.random() - 0.5) * 0.012;
          seedPollutionMarkers(jitterLng, jitterLat, 18);
        } else {
          updatePollutionMarkersAndSource();
        }

        if (Math.random() < 0.45) lightlyNudgeEcoMarkers();
      }, 4000);
    }

    // ---------- Map move handling: reseed when user navigates ----------
    function shouldReseed(oldCenter, newCenter, thresholdDeg = 0.004) {
      if (!oldCenter) return true;
      const dx = Math.abs(oldCenter[0] - newCenter[0]);
      const dy = Math.abs(oldCenter[1] - newCenter[1]);
      return dx > thresholdDeg || dy > thresholdDeg;
    }

    function onMapMoveEnd() {
      if (!map.current) return;
      const c = map.current.getCenter();
      const centerLng = c.lng;
      const centerLat = c.lat;
      const last = lastReseedCenter.current;
      if (shouldReseed(last, [centerLng, centerLat], 0.004)) {
        lastReseedCenter.current = [centerLng, centerLat];
        // reseed pollution and eco around new center
        startPollutionAndEcoUpdater(centerLng, centerLat);
        // when user pans manually, we stop following the user
        isFollowingUserRef.current = false;
        // notify parent of center change
        try {
          if (typeof onCenterChange === "function") onCenterChange({ lat: centerLat, lng: centerLng });
        } catch (e) {}
      }
    }

    moveEndHandlerRef.current = onMapMoveEnd;
    map.current.on("moveend", moveEndHandlerRef.current);

    // ---------- Geolocation wiring ----------
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords;
          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

          // center on first fix or if following user
          if (!map.current.__centeredOnUser || isFollowingUserRef.current) {
            map.current.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
            map.current.__centeredOnUser = true;
          }

          updateUserMarker(longitude, latitude, accuracy);

          lastReseedCenter.current = [longitude, latitude];
          if (isFollowingUserRef.current) {
            // if following user, update pollution/eco around user
            startPollutionAndEcoUpdater(longitude, latitude);
          }

          // notify parent about user location change
          try {
            if (typeof onLocationChange === "function")
              onLocationChange({ lat: latitude, lng: longitude });
          } catch (e) {}

          // update context as well
          try {
            if (setSelectedLocation) {
              setSelectedLocation({ name: "Your location", latitude, longitude });
            }
          } catch (e) {}
        },
        (error) => {
          console.error("⚠️ Geolocation error:", error.message);
          // seed around fallback if nothing exists yet
          if (!pollutionMarkers.current.length) {
            lastReseedCenter.current = FALLBACK_CENTER.slice();
            startPollutionAndEcoUpdater(FALLBACK_CENTER[0], FALLBACK_CENTER[1]);
          }
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 2000 }
      );
    } else {
      console.error("❌ Geolocation not supported by this browser.");
      lastReseedCenter.current = FALLBACK_CENTER.slice();
      startPollutionAndEcoUpdater(FALLBACK_CENTER[0], FALLBACK_CENTER[1]);
    }

    // ---------- Search handling (TomTom geocoding) ----------
    async function geocodeSearch(query) {
      if (!query || !query.trim()) return null;
      try {
        const encoded = encodeURIComponent(query);
        const url = `https://api.tomtom.com/search/2/geocode/${encoded}.json?key=${API_KEY}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Geocoding failed");
        const data = await res.json();
        if (!data || !data.results || !data.results.length) return null;
        // TomTom v2 geocode: results[0].position.lat / lon (if not present may have 'position' or 'lat/lon' fields)
        const r = data.results[0];
        const lat = r.position?.lat ?? (r.lat ?? null);
        const lon = r.position?.lon ?? (r.lon ?? r.position?.lon ?? null);
        const address = r.address?.freeform ?? r.poi?.name ?? query;
        if (!lat || !lon) return null;
        return { lat, lon, address };
      } catch (e) {
        console.error("Geocode error", e);
        return null;
      }
    }

    // create/replace search result marker
    function showSearchResultMarker(lng, lat, title) {
      try {
        if (searchResultMarker.current) {
          searchResultMarker.current.remove();
          searchResultMarker.current = null;
        }
        // simple blue pin
        const el = document.createElement("div");
        el.style.width = "26px";
        el.style.height = "34px";
        el.style.background = "linear-gradient(180deg,#0ea5a4,#028488)";
        el.style.borderRadius = "6px";
        el.style.boxShadow = "0 6px 16px rgba(2,6,23,0.28)";
        el.style.border = "2px solid rgba(255,255,255,0.95)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "white";
        el.style.fontWeight = "700";
        el.style.fontFamily = "Arial, sans-serif";
        el.textContent = "S";

        searchResultMarker.current = new tt.Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .setPopup(new tt.Popup({ offset: 12 }).setHTML(popupHTML(title, null)))
          .addTo(map.current);
      } catch (e) {
        console.error("Search marker failed", e);
      }
    }

    // wire search box events (store references so we can remove listeners on cleanup)
    async function runSearchOnce() {
      const q = input.value.trim();
      if (!q) return;
      const res = await geocodeSearch(q);
      if (!res) {
        alert("No results found for: " + q);
        return;
      }
      // stop following user: user initiated search
      isFollowingUserRef.current = false;
      // center map to search result
      map.current.flyTo({ center: [res.lon, res.lat], zoom: 13, essential: true });
      // show blue search marker
      showSearchResultMarker(res.lon, res.lat, res.address || q);
      lastReseedCenter.current = [res.lon, res.lat];
      // seed pollution + eco for that searched region
      startPollutionAndEcoUpdater(res.lon, res.lat);

      // notify parent about center change because of search
      try {
        if (typeof onCenterChange === "function") onCenterChange({ lat: res.lat, lng: res.lon });
      } catch (e) {}

      // update context as well
      try {
        if (setSelectedLocation) {
          setSelectedLocation({ name: res.address || q, latitude: res.lat, longitude: res.lon });
        }
      } catch (e) {}
    }

    function onInputKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearchOnce();
      }
    }

    function onBtnClick(e) {
      e.preventDefault();
      runSearchOnce();
    }

    btn.addEventListener("click", onBtnClick);
    input.addEventListener("keydown", onInputKeyDown);

    // locate button: resume following user and center on current user marker if present
    function onLocateClick() {
      isFollowingUserRef.current = true;
      if (userMarker.current) {
        const [lng, lat] = userMarker.current.getLngLat().toArray();
        map.current.flyTo({ center: [lng, lat], zoom: 13, essential: true });
        lastReseedCenter.current = [lng, lat];
        startPollutionAndEcoUpdater(lng, lat);

        // notify parent about location (user located)
        try {
          if (typeof onLocationChange === "function") onLocationChange({ lat, lng });
        } catch (e) {}
        // also notify center change
        try {
          if (typeof onCenterChange === "function") onCenterChange({ lat, lng });
        } catch (e) {}

        // update context as well
        try {
          if (setSelectedLocation) setSelectedLocation({ name: "Your location", latitude: lat, longitude: lng });
        } catch (e) {}
      } else {
        // if no user marker yet, try to use geolocation to fetch once
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            map.current.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
            lastReseedCenter.current = [longitude, latitude];
            startPollutionAndEcoUpdater(longitude, latitude);

            try {
              if (typeof onLocationChange === "function") onLocationChange({ lat: latitude, lng: longitude });
            } catch (e) {}
            try {
              if (typeof onCenterChange === "function") onCenterChange({ lat: latitude, lng: longitude });
            } catch (e) {}

            try {
              if (setSelectedLocation) setSelectedLocation({ name: "Your location", latitude, longitude });
            } catch (e) {}
          },
          (err) => console.error("Locate error", err),
          { enableHighAccuracy: true, timeout: 7000 }
        );
      }
    }

    locateBtn.addEventListener("click", onLocateClick);

    // Map click to select arbitrary location
    function onMapClick(e) {
      try {
        const lngLat = e.lngLat || (e.coordinates ? { lng: e.coordinates[0], lat: e.coordinates[1] } : null);
        if (!lngLat) return;
        const { lng, lat } = lngLat;
        isFollowingUserRef.current = false;
        lastReseedCenter.current = [lng, lat];
        startPollutionAndEcoUpdater(lng, lat);

        // update context + parent
        try {
          if (setSelectedLocation) setSelectedLocation({ name: `Selected: ${lng.toFixed(4)}, ${lat.toFixed(4)}`, latitude: lat, longitude: lng });
        } catch (e) {}
        try {
          if (typeof onLocationChange === "function") onLocationChange({ lat, lng });
        } catch (e) {}
        try {
          if (typeof onCenterChange === "function") onCenterChange({ lat, lng });
        } catch (e) {}

        map.current.flyTo({ center: [lng, lat], zoom: 13, essential: true });
      } catch (e) {}
    }
    map.current.on("click", onMapClick);

    // ---------- ensure heat layer exists on load ----------
    map.current.on("load", () => {
      buildHeatLayerIfMissing();
      console.log("✅ TomTom Map Loaded Successfully");
      // notify parent about initial center
      try {
        const c = map.current.getCenter();
        if (typeof onCenterChange === "function") onCenterChange({ lat: c.lat, lng: c.lng });
      } catch (e) {}
    });
    map.current.on("error", (e) => console.error("TomTom Map Error:", e));

    // ---------- cleanup ----------
    return () => {
      // remove UI controls
      try {
        btn.removeEventListener("click", onBtnClick);
        input.removeEventListener("keydown", onInputKeyDown);
        locateBtn.removeEventListener("click", onLocateClick);
        if (controlWrapper && controlWrapper.parentNode) controlWrapper.parentNode.removeChild(controlWrapper);
      } catch (e) {}

      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (pollutionUpdaterRef.current) {
        clearInterval(pollutionUpdaterRef.current);
      }
      if (moveEndHandlerRef.current && map.current) {
        try {
          map.current.off("moveend", moveEndHandlerRef.current);
        } catch (e) {}
        moveEndHandlerRef.current = null;
      }

      // remove markers
      try {
        if (userMarker.current) { userMarker.current.remove(); userMarker.current = null; }
        pollutionMarkers.current.forEach((e) => { try { e.marker.remove(); } catch (e) {} });
        pollutionMarkers.current = [];
        ecoMarkers.current.forEach((m) => { try { m.remove(); } catch (e) {} });
        ecoMarkers.current = [];
        if (searchResultMarker.current) { try { searchResultMarker.current.remove(); } catch (e) {} }
        searchResultMarker.current = null;
      } catch (e) {}

      // remove heat source & layer
      try {
        if (map.current) {
          try { map.current.off("click", onMapClick); } catch (e) {}
          if (map.current.getLayer && map.current.getLayer("pollution-heat")) map.current.removeLayer("pollution-heat");
          if (map.current.getSource && map.current.getSource("pollution-data")) map.current.removeSource("pollution-data");
          map.current.remove();
        }
      } catch (e) {}
      map.current = null;
    };
  }, []); // run once

  return (
    <div
      ref={mapElement}
      style={{
        height: "560px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}
