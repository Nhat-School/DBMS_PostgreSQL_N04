import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';

const API_BASE_URL = '/api';

// Helper component to fit map to GeoJSON data bounds
function FitBounds({ data }) {
  const map = useMap();
  useEffect(() => {
    if (data) {
      try {
        const geoJsonLayer = L.geoJSON(data);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], animate: true });
        }
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [data, map]);
  return null;
}

// Helper component to update map view (for search)
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
  const [bounds, setBounds] = useState(null);
  const [networks, setNetworks] = useState(null);
  const [garbage, setGarbage] = useState(null);
  const [buildings, setBuildings] = useState(null);
  const [roads, setRoads] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapView, setMapView] = useState(null);
  const [fitData, setFitData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bndRes, netRes, garRes, bldRes, rdRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/bounds`),
          axios.get(`${API_BASE_URL}/networks`),
          axios.get(`${API_BASE_URL}/garbage`),
          axios.get(`${API_BASE_URL}/buildings`),
          axios.get(`${API_BASE_URL}/roads`),
        ]);
        setBounds(bndRes.data);
        setNetworks(netRes.data);
        setGarbage(garRes.data);
        setBuildings(bldRes.data);
        setRoads(rdRes.data);

        // Auto-fit to bounds layer (or any available data)
        const dataToFit = bndRes.data || netRes.data || garRes.data || bldRes.data || rdRes.data;
        if (dataToFit && dataToFit.features && dataToFit.features.length > 0) {
          setFitData(dataToFit);
        }
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
        .filter(([key]) => key !== 'gid')
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br/>');
      if (popupContent) layer.bindPopup(popupContent);
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
          <MapContainer center={[18.2, 108.72]} zoom={14} scrollWheelZoom={true}>
            {fitData && <FitBounds data={fitData} />}
            {mapView && <MapUpdater center={mapView.center} zoom={mapView.zoom} />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LayersControl position="topright">
              <LayersControl.Overlay checked name="Bounds">
                <LayerGroup>
                  {bounds && <GeoJSON key="bnd" data={bounds} style={{ color: '#9c27b0', weight: 2, fillOpacity: 0.05, dashArray: '5,5' }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Canal Networks">
                <LayerGroup>
                  {networks && <GeoJSON key="net" data={networks} style={{ color: '#2196f3', weight: 2 }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Garbage Sites">
                <LayerGroup>
                  {garbage && <GeoJSON key="gar" data={garbage} pointToLayer={(feature, latlng) => {
                    return L.circleMarker(latlng, { radius: 8, fillColor: '#f44336', color: '#000', weight: 1, opacity: 1, fillOpacity: 0.8 });
                  }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Buildings">
                <LayerGroup>
                  {buildings && <GeoJSON key="bld" data={buildings} style={{ color: '#4caf50', weight: 1, fillOpacity: 0.3 }} onEachFeature={onEachFeature} />}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Roads">
                <LayerGroup>
                  {roads && <GeoJSON key="rds" data={roads} style={{ color: '#ff9800', weight: 2 }} onEachFeature={onEachFeature} />}
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
