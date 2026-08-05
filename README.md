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

---

## 📸 Preview

<!-- Replace these with actual screenshots of your project -->

<table>
  <tr>
    <td>
      <img src="./docs/screenshot-map.png" alt="Tirhal map view" width="100%" />
    </td>
    <td>
      <img src="./docs/screenshot-attractions.png" alt="Tirhal attractions view" width="100%" />
    </td>
  </tr>
</table>

---

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

---

## 🧩 How It Works

At a high level, the application works as follows:

1. **OpenLayers** renders an OpenStreetMap base layer
2. Governorate boundary data from OpenStreetMap is drawn as an overlay
3. The user interacts with the map by clicking on a governorate
4. The application displays attractions related to the selected governorate
5. Attraction details are shown to the user

This allows the project to provide a simple but effective map-driven browsing experience.

---

## 📍 Attractions Data

The attractions currently shown in the project were collected manually.

This includes information such as:

- attraction name
- geographic location
- description
- governorate association
- other relevant details

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

## 🛣️ Roadmap

Planned or possible future improvements include:

- [ ] Add a **search bar**
- [ ] Add **filtering** for attractions by type
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

you can take a look at [Tirhal](https://tirhal.ali6s.workers.dev/)

---

## 🤝 Contributing

Contributions are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

For major changes, it is recommended to open an issue first to discuss the change.

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