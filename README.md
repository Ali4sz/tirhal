<div align="center">

# 🧭 Tirhal — ترحال

**An interactive tourism map for discovering attractions across Syria**

![Vue.js](https://img.shields.io/badge/Vue.js-Frontend-42b883?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-3178c6?logo=typescript&logoColor=white)
![OpenLayers](https://img.shields.io/badge/OpenLayers-Mapping-003164?logo=openlayers&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Map_Data-7ebc6f?logo=openstreetmap&logoColor=white)
![Status](https://img.shields.io/badge/Status-Proof_of_Concept-yellow)

</div>

---

> [!NOTE]
> **Tirhal** is currently a **proof of concept** built to demonstrate an interactive way of exploring tourism-related locations in Syria.

## 🌍 Overview

**Tirhal** is an interactive tourism map built with **Vue.js** and **TypeScript**. The project renders an **OpenStreetMap** base layer using **OpenLayers**, overlays **governorate boundaries** sourced from OpenStreetMap, and allows users to explore tourist attractions by interacting directly with the map.

Instead of searching for places manually, users can visually explore Syria by clicking on a governorate and discovering available attractions in that area.

The main goal of the project is to **simplify tourism**, encourage people to explore different places, and provide useful information in a single interactive interface.

you can take a look at [Tirhal](https://tirhal.ali6s.workers.dev/)

---

## ✨ Features

- 🗺️ **Interactive map** powered by OpenLayers
- 🌐 **OpenStreetMap base layer**
- 📍 **Governorate boundaries** rendered above the base map
- 🖱️ **Click-based exploration**
  - Click on a governorate to view attractions within it
- 🏛️ **Attraction details**
  - Names
  - Locations
  - Descriptions
  - Additional related information
- 🧠 **Visual discovery**
  - Users can discover places through map interaction instead of manual search
- 🇸🇾 Focused on tourism in **Syria**

---

## 🎯 Project Goal

Tirhal aims to make tourism exploration simpler and more intuitive by combining geographic information with an interactive user interface.

The project is built around a few core ideas:

- Provide tourism-related information in **one place**
- Reduce the need for users to search across multiple sources
- Allow users to **visually explore** locations on a map
- Make discovering attractions more natural through direct map interaction

The novelty of the project lies in its **map-first experience**, where the user can see the location of a place directly without needing to search for it manually.

---

## 🧠 Concept

Tirhal is designed as a visual tourism explorer.

Users can:

1. Open the map
2. Browse different governorates
3. Click on a governorate
4. View attractions associated with that area
5. Explore attraction details such as name, description, and location

This approach makes the experience more exploratory and intuitive, especially for users who may not know exactly what they are looking for but want to discover interesting places.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Vue.js |
| Language | TypeScript |
| Mapping Library | OpenLayers |
| Base Map | OpenStreetMap |
| Boundary Data | OpenStreetMap |
| Attractions Data | Manually collected dataset |

---

## 🗺️ Map and Data Sources

Tirhal uses OpenStreetMap for its mapping layer.

The project uses:

- **OpenStreetMap tiles** as the base map layer
- **OpenStreetMap geographic data** to obtain governorate boundaries
- **Manually extracted attraction data**, including:
  - attraction names
  - descriptions
  - locations
  - related metadata

The attractions dataset is currently prepared manually as part of the proof of concept.

## 🚀 Getting Started

This section explains how to run the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/tirhal.git
```

Move into the project directory:

```bash
cd tirhal
```

Install dependencies:

```bash
npm install
```

### Development Server

Run the project locally:

```bash
npm run dev
```

The app should now be available at a local URL such as:

```text
http://localhost:5173
```

> The exact URL may vary depending on your project setup.

### Production Build

Build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🧩 How It Works

Tirhal follows a **map-first** approach: the map is the main interface, while the side panel reflects the user’s current selection.

The experience is built around a simple loop:

```text
Load data → Render map → User interacts → State updates → UI reacts
```

---

### 🔄 Discovery Flow

1. **Load**  
   The app loads Syria’s governorate boundaries and the attraction catalog.

2. **Render**  
   OpenLayers renders the OpenStreetMap base layer, then adds:
  - governorate borders,
  - governorate labels,
  - attraction markers.

3. **Interact**  
   The user can:
  - click a governorate,
  - click an attraction marker,
  - or choose a governorate from the side panel.

4. **Update state**  
   The selection is stored in a shared discovery store, which acts as the single source of truth.

5. **React**  
   The map zooms or pans to the selected area, and the side panel switches to the relevant view.

---

### 🗃️ Data

- **Base map:** OpenStreetMap tiles rendered with OpenLayers.
- **Governorate boundaries:** geographic data sourced from OpenStreetMap.
- **Attractions:** a manually curated bilingual dataset containing names, descriptions, locations, and additional visitor information.
- **Coverage:** not all governorates have curated content yet. Governorates without attractions still appear on the map, but show a clear **“coming soon”** state.

---

### 🧠 State Management

A single discovery store tracks the current state of the experience, including:

- the selected governorate,
- the selected attraction,
- the hovered governorate,
- and the active panel view.

The map and the side panel do not communicate directly. Instead, both react to the same shared state. This keeps the interface predictable and makes future features easier to add.

---

### 🗺️ Map Interaction

- Clicking a **governorate** selects it and shows its available attractions.
- Clicking an **attraction marker** opens the attraction details.
- Hovering over a governorate gives visual feedback.
- Selecting a location updates both the map camera and the side panel.

---

### 📋 Side Panel

The side panel complements the map and changes based on the current selection.

It can show:

- a general overview of Syria,
- a list of governorates,
- the attractions inside a selected governorate,
- a “coming soon” view for governorates without content yet,
- or detailed information about a selected attraction.

On desktop, the panel is open by default.  
On mobile, it stays collapsed to give the map more space and expands when the user makes a selection.

---

## 📍 Attractions Data

The attractions currently shown in the project were collected manually.

This includes information such as:

- attraction name
- geographic location
- description
- governorate association
- other relevant details

the used photos are sourced from wikimedia.

The dataset is intentionally limited for now, since the project is still a demonstration prototype.

Future versions may include a larger and more complete set of attractions.

---

## 🚧 Current Limitations

Since Tirhal is still a proof of concept, it currently has a few limitations:

- The attractions dataset is limited
- Attraction data is manually collected
- There is no search functionality yet
- There are no advanced filters yet
- The project is intended primarily as a demonstration
- Governorate boundaries are derived from OpenStreetMap and may not always be perfect

---

## 🛣️ may-add features

Planned or possible future improvements include:

- [ ] A **search bar**
- [ ] **Filtering** for attractions by type
- [ ] Expand the attractions dataset
- [ ] Improve attraction detail pages
- [ ] Improve mobile responsiveness
- [ ] Enhance map interactions and visual feedback
- [ ] Add multilingual support
- [ ] Explore additional tourism-related features

---

## ⚠️ Disclaimer

Tirhal is currently a proof of concept and is provided for demonstration purposes only.

The attractions dataset has been collected manually and may not be complete or fully up to date.

Governorate boundaries and geographic data are sourced from OpenStreetMap and may not represent official administrative boundaries.

---

## 🙏 Acknowledgements

This project was made possible thanks to the following open-source technologies and communities:

- [OpenLayers](https://openlayers.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Vue.js](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)

Special thanks to the OpenStreetMap community for providing valuable open geographic data.

---

## ©️ Attribution

This project uses map data from **OpenStreetMap**.

- Base map data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Governorate boundary data: © OpenStreetMap contributors
- OpenStreetMap data is available under the [Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)