import React, { useState } from 'react';
import '../styles/index.css';

export default function Sidebar({ onFindNearest, userLocation }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFindNearest = async () => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      setError('Lokasi Anda tidak terdeteksi. Silakan aktifkan GPS.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:4000/api/spklu/nearest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          limit: 5
        })
      });

      if (!response.ok) throw new Error('Gagal mengambil data');
      
      const data = await response.json();
      setResult(data);
      onFindNearest(data); // Pass to parent to update map
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-left">
      <h3>🔍 Cari SPKLU</h3>
      
      <button 
        className="btn-nearest"
        onClick={handleFindNearest}
        disabled={loading}
      >
        {loading ? '⏳ Mencari...' : '⭐ Lokasi Terdekat'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="results">
          <h4>SPKLU Terdekat:</h4>
          <div className="results-list">
            {result.map((spklu, idx) => (
              <div key={idx} className="result-item">
                <div className="result-header">
                  <h5>{idx + 1}. {spklu.nama}</h5>
                  <span className="distance">{spklu.distance.toFixed(2)} km</span>
                </div>
                <p><strong>Kota:</strong> {spklu.kota}</p>
                <p><strong>Alamat:</strong> {spklu.alamat}</p>
                <p><strong>Power:</strong> {spklu.power_kw} kW</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
