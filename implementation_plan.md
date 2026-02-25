# Implementation Plan: Spatial Data Visualization Web App

This plan outlines the steps to build a web application that visualizes spatial data stored in a PostgreSQL/PostGIS database, as required for the CE05B class assignment.

## Project Overview
The goal is to visualize map layers (Canal Networks and Garbage sites) on a web-based map interface.

## Tech Stack
- **Database**: PostgreSQL with PostGIS extension.
- **Backend API**: Node.js with Express and `pg` (node-postgres).
- **Frontend**: React (via Vite) with Leaflet.js for map rendering.
- **Styling**: Vanilla CSS with modern aesthetics.

## Phase 1: Database & Data Setup
1. **Initialize PostGIS**: Ensure the `postgis` extension is enabled in the PostgreSQL database.
2. **Data Import**:
   - Use `shp2pgsql` to convert `Networks.shp` and `Garbage` shapefiles into SQL.
   - Execute the SQL to populate tables in PostgreSQL.
3. **Verify Queries**: Test spatial queries to ensure data integrity.

## Phase 2: Backend Development (Node.js/Express)
1. **Setup Express Server**: Initialize a Node.js project.
2. **Database Connection**: Configure connection pool to PostgreSQL.
3. **API Endpoints**:
   - `GET /api/networks`: Fetch canal network data as GeoJSON using `ST_AsGeoJSON`.
   - `GET /api/garbage`: Fetch garbage landfill data as GeoJSON.
4. **CORS Configuration**: Enable access for the frontend.

## Phase 3: Frontend Development (React + Leaflet)
1. **Initialize Vite Project**: Create a new React application.
2. **Leaflet Integration**: Install `leaflet` and `react-leaflet`.
3. **Map Component**:
   - Initialize a base map (OpenStreetMap tiles).
   - Create functions to fetch GeoJSON from the backend.
   - Render the GeoJSON layers on the map.
4. **UI Refinement**:
   - Add a sidebar or toggle to turn layers on/off.
   - Implement tooltips/popups to show details (e.g., canal name, landfill info).

## Phase 4: Styling & UX
1. **Modern Design**: Apply a sleek, dark-themed or minimalist UI.
2. **Micro-interactions**: Add hover effects on map features.
3. **Responsive Layout**: Ensure the map works on various screen sizes.

## Phase 5: Deployment & Handover
1. **Github Repository**: Initialize a Git repo and push the code.
2. **README.md**: Document installation steps and how to run the project.
3. **Final Demo**: Prepare the project for the class presentation.

---

## Next Steps
1. Create the project structure.
2. Setup the backend server.
3. Import the provided data files once available.
