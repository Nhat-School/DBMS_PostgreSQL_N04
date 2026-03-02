require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'nhaterik',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dbms_n04',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Helper function to fetch GeoJSON
// Note: We use ST_Transform(ST_SetSRID(geom, 32648), 4326) because the input data 
// is in UTM/VN2000 coordinates (in the millions) but was imported without a PRJ.
const fetchGeoJSON = async (tableName) => {
  const query = `
    SELECT jsonb_build_object(
      'type',     'FeatureCollection',
      'features', jsonb_agg(feature)
    )
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         gid,
        'geometry',   ST_AsGeoJSON(ST_Transform(ST_SetSRID(geom, 3405), 4326))::jsonb,
        'properties', to_jsonb(inputs) - 'geom'
      ) AS feature
      FROM (SELECT * FROM ${tableName}) inputs
    ) features;
  `;
  const { rows } = await pool.query(query);
  return rows[0].jsonb_build_object;
};

// Endpoints
app.get('/api/networks', async (req, res) => {
  try {
    const data = await fetchGeoJSON('networks');
    res.json(data);
  } catch (err) {
    console.error('Networks fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch networks' });
  }
});

app.get('/api/garbage', async (req, res) => {
  try {
    const data = await fetchGeoJSON('garbage');
    res.json(data);
  } catch (err) {
    console.error('Garbage fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch garbage' });
  }
});

app.get('/api/buildings', async (req, res) => {
  try {
    const data = await fetchGeoJSON('buildings');
    res.json(data);
  } catch (err) {
    console.error('Buildings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

app.get('/api/roads', async (req, res) => {
  try {
    const data = await fetchGeoJSON('roads');
    res.json(data);
  } catch (err) {
    console.error('Roads fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch roads' });
  }
});

app.get('/api/bounds', async (req, res) => {
  try {
    const data = await fetchGeoJSON('bounds');
    res.json(data);
  } catch (err) {
    console.error('Bounds fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bounds' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
