# Spatial Data Visualization Project - CE05B

A full-stack web application designed to visualize spatial data (buildings, roads, garbage sites) from a PostgreSQL/PostGIS database onto an interactive Leaflet map.

## 🚀 Quick Start

Run both the backend and frontend simultaneously from the root directory:

```bash
npm run dev
```

## 📂 Project Structure & File Descriptions

### 🏠 Root Directory
- **`package.json`**: The master orchestration file. It uses `concurrently` to launch the backend and frontend at the same time with one command.
- **`README.md`**: This guide. Provides a complete overview of the project architecture.
- **`implementation_plan.md`**: The technical roadmap and design decisions documented during development.
- **`.gitignore`**: Defines which files Git should ignore (like `node_modules`, `.env`, and log files) to keep the repository clean.
- **`includes/`**: Stores the original source GIS data (Shapefiles, DBF, etc.) provided for the project.

---

### 🖥️ Backend (`/backend`)
- **`index.js`**: The heart of the backend. It sets up an Express server, connects to PostgreSQL, and provides API endpoints (`/api/garbage`, `/api/buildings`, etc.) that convert PostGIS data into GeoJSON for the map.
- **`.env`**: Stores sensitive database credentials (host, user, port, DB name). **Do not commit this file to public repositories.**
- **`package.json`**: Manages backend-specific dependencies like `express` (web server), `pg` (PostgreSQL driver), and `cors` (allowing cross-origin requests).

---

### 🎨 Frontend (`/frontend`)
- **`index.html`**: The primary entry point for the web application. It houses the root div where the React app is mounted.
- **`src/App.jsx`**: The main application component. It contains:
  - **Map Logic**: Initializes the Leaflet map and layer controls.
  - **Search Feature**: Integrates the Nominatim API to allow searching for locations (like "Ha Noi").
  - **Data Fetching**: Communicates with the backend API to retrieve spatial layers.
- **`src/App.css`**: Defines the "Premium Dark" aesthetic, including glassmorphism sidebars, custom fonts, and responsive map layout (60/40 split).
- **`src/main.jsx`**: The JavaScript entry point that renders the React `App` component into the DOM.
- **`vite.config.js`**: Configuration file for Vite, the build tool used for fast development and bundling.

## 🛠️ Tech Stack
- **Database**: PostgreSQL 17 + PostGIS
- **Backend**: Node.js + Express
- **Frontend**: React (Vite) + Leaflet.js
- **Styling**: Vanilla CSS (Premium Dark Theme)