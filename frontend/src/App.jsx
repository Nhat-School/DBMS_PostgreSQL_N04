import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [networks, setNetworks] = useState(null);
  const [garbage, setGarbage] = useState(null);
  const [buildings, setBuildings] = useState(null);
  const [roads, setRoads] = useState(null);

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
      <div className="map-wrapper">
        <MapContainer center={[10.762622, 106.660172]} zoom={13} scrollWheelZoom={true}>
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
    </div>
  );
}

export default App;
