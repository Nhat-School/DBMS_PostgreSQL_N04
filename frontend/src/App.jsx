import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5001/api';

// Helper component to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function App() {
  const [networks, setNetworks] = useState(null);
  const [garbage, setGarbage] = useState(null);
  const [buildings, setBuildings] = useState(null);
  const [roads, setRoads] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapView, setMapView] = useState({ center: [10.762622, 106.660172], zoom: 13 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [netRes, garRes, bldRes, rdRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/networks`),
          axios.get(`${API_BASE_URL}/garbage`),
          axios.get(`${API_BASE_URL}/buildings`),
          axios.get(`${API_BASE_URL}/roads`),
        ]);
        setNetworks(netRes.data);
        setGarbage(garRes.data);
        setBuildings(bldRes.data);
        setRoads(rdRes.data);
      } catch (err) {
        console.error('Error fetching spatial data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.slice(0, 5));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapView({ center: [lat, lon], zoom: 14 });
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br/>');
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Spatial Data Visualization - CE05B</h1>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <section className="search-section">
            <h2 style={{ fontSize: '1rem', marginBottom: '15px' }}>Location Search</h2>
            <div className="search-input-group">
              <input
                type="text"
                className="search-input"
                placeholder="Search for a city (e.g. Ha Noi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>Search</button>
            </div>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((result) => (
                  <li
                    key={result.place_id}
                    className="search-result-item"
                    onClick={() => selectResult(result)}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="info-section">
            <h2 style={{ fontSize: '1rem', marginBottom: '15px' }}>Project Information</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.6' }}>
              This application visualizes spatial data related to canal networks, garbage sites, and urban features. Use the layer control on the map to toggle datasets.
            </p>
          </section>
        </aside>

        <div className="map-wrapper">
          <MapContainer center={mapView.center} zoom={mapView.zoom} scrollWheelZoom={true}>
            <MapUpdater center={mapView.center} zoom={mapView.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LayersControl position="topright">
              <LayersControl.Overlay checked name="Canal Networks">
                <LayerGroup>
                  {networks && <GeoJSON data={networks} style={{ color: '#2196f3' }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Garbage Sites">
                <LayerGroup>
                  {garbage && <GeoJSON data={garbage} pointToLayer={(feature, latlng) => {
                    return L.circleMarker(latlng, { radius: 8, fillColor: '#f44336', color: '#000', weight: 1, opacity: 1, fillOpacity: 0.8 });
                  }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay name="Buildings">
                <LayerGroup>
                  {buildings && <GeoJSON data={buildings} style={{ color: '#4caf50', weight: 1 }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay name="Roads">
                <LayerGroup>
                  {roads && <GeoJSON data={roads} style={{ color: '#ff9800', weight: 2 }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>
        </div>
      </main>
    </div>
  );
}

export default App;
