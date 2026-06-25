# UP.route — Code Guide

![screenshot (9)](https://github.com/user-attachments/assets/de21188c-3b15-4941-81b2-2baff1a65c3b)

> A complete guide to the application's architecture, conventions, and extension patterns.

> [!IMPORTANT]
> **Copyright and Repository Purpose**
>
> This repository contains original source code created for the purpose of completing and defending a master's thesis. It has been made public solely to allow the thesis supervisor and reviewer to verify the system's functionality.
>
> * **Thesis title:** Development of a route-finding method between buildings on the UPWr campus
> * **Author:** Marek Dworecki (Student ID: 122968)
> * **University:** Wrocław University of Environmental and Life Sciences
> * **Faculty:** Faculty of Environmental Engineering and Geodesy
> * **Field of study:** Geodesy and Cartography
> * **Defence year:** 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Running the Project](#3-running-the-project)
4. [Application Architecture](#4-application-architecture)
   - 4.1 [Entry Point — Bootstrapping](#41-entry-point--bootstrapping)
   - 4.2 [Routing](#42-routing)
   - 4.3 [GlobeService — The Heart of the App](#43-globeservice--the-heart-of-the-app)
   - 4.4 [Layer System (Layers)](#44-layer-system-layers)
   - 4.5 [Tools System](#45-tools-system)
   - 4.6 [Actions System](#46-actions-system)
   - 4.7 [Stores (Pinia)](#47-stores-pinia)
   - 4.8 [Event Bus](#48-event-bus)
   - 4.9 [User Interface](#49-user-interface)
   - 4.10 [Internationalisation (i18n)](#410-internationalisation-i18n)
   - 4.11 [URL State Serialisation](#411-url-state-serialisation)
5. [Directory Structure](#5-directory-structure)
6. [Configuration Files (public/)](#6-configuration-files-public)
7. [Coding Conventions](#7-coding-conventions)
8. [How to Add New Things](#8-how-to-add-new-things)
   - 8.1 [New Map Layer](#81-new-map-layer)
   - 8.2 [New Tool](#82-new-tool)
   - 8.3 [New Custom Tool](#83-new-custom-tool)
   - 8.4 [New Action](#84-new-action)
   - 8.5 [New Toolbar Button](#85-new-toolbar-button)
   - 8.6 [New Pinia Store](#86-new-pinia-store)
   - 8.7 [New Globe Service](#87-new-globe-service)
   - 8.8 [New Translation (i18n)](#88-new-translation-i18n)
   - 8.9 [New Layer Filter](#89-new-layer-filter)
   - 8.10 [New Layer Type](#810-new-layer-type)
9. [Themes (Vuetify Theming)](#9-themes-vuetify-theming)
10. [PWA and Service Worker](#10-pwa-and-service-worker)

---

## 1. Project Overview

**Up.route** is a 3D web geoportal application created as a master's thesis. It displays an interactive 3D globe powered by CesiumJS, enables map layer management, measurements, route finding between buildings on the Wrocław University of Environmental and Life Sciences campus, and various other spatial analyses.

---

## 2. Technology Stack

| Technology | Role |
|---|---|
| **Vue 3** (Composition API + `<script setup>`) | UI framework |
| **TypeScript** | Static typing, `vue-tsc` for type-checking |
| **Vite 7** | Bundler and dev server |
| **CesiumJS** (`@cesium/engine` + `@cesium/widgets`) | 3D globe rendering |
| **Vuetify 3** | Material Design component library |
| **Pinia** | Global state management |
| **vue-i18n v11** | Internationalisation (PL / EN) |
| **Vue Router v4** | SPA routing |
| **Zod v4** | JSON schema validation (layers, UI, actions) |
| **vite-plugin-cesium** | Cesium integration with Vite |
| **vite-plugin-pwa** | Progressive Web App (Service Worker) |
| **lz-string** | Application state compression for URL |
| **vue-chartjs / chartjs** | Charts |
| **jsPDF** | PDF export |
| **lodash** | Utility helpers |
| **@mdi/font** | Material Design Icons |

---

## 3. Running the Project

```sh
# Required: Node >=20.19

npm install          # install dependencies
npm run dev          # dev with HMR: http://localhost:5173
npm run build        # type-check + production build → dist/
npm run type-check   # type checking only
npm run lint         # ESLint + auto-fix
npm run format       # Prettier
```

> **Cesium Ion key**: 3D Tiles / CZML / Terrain / GeoJSON layers require a Cesium Ion token.
> The token is read from the `VITE_CESIUM_API_KEY` environment variable in `src/services/globe/globe.ts` (`Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API_KEY`).
> Create a `.env` file in the project root with the entry: `VITE_CESIUM_API_KEY=YourToken`.

---

## 4. Application Architecture

### 4.1 Entry Point — Bootstrapping

```
index.html
  └─ src/main.ts          ← createApp + plugins (Pinia, Router, Vuetify, i18n)
       └─ App.vue          ← <v-app> + <LoadingOverlay> + <router-view>
```

`src/main.ts` registers all plugins and mounts the application. Order matters: Pinia must be registered before Router and Vuetify, because stores are used in the Vuetify configuration (reading the theme from localStorage).

### 4.2 Routing

The application has **one user view**: `/globe` → `GeoportalView.vue`.
The `/` path redirects to `/globe`.

```
src/router/index.ts
  / → redirect → /globe
  /globe → GeoportalView.vue   (lazy import)
```

`GeoportalView.vue`:
1. Mounts the `#cesiumContainer` container (full screen, `position: absolute`).
2. Calls `initGlobeInstance(container)` — creates a CesiumJS Viewer and `GlobeService`.
3. Listens for the `appLoaded` event (from the event bus). When it fires, renders `<UserInterface>` and applies URL parameters.

### 4.3 GlobeService — The Heart of the App

`src/services/globe/globe.ts` exports:
- `globeInstance` — global singleton instance of `GlobeService`
- `initGlobeInstance(container)` — creates the Viewer and initialises all sub-services

`GlobeService` is a **facade class**. It holds private references to all sub-services and exposes them as getters (throwing an error if not initialised):

```
GlobeService
  .viewer              → Cesium Viewer
  .layers              → LayersManager        (layer management)
  .time                → TimeManager          (clock, sun shadows)
  .events              → GlobeEvent           (globe click handling)
  .measurements        → MeasurementsService  (measurements)
  .draw                → DrawService          (sketch drawing)
  .floodSim            → FloodSim             (flood simulation)
  .profile             → ProfileManager       (terrain profile)
  .routeFinder         → RouteFinder          (A* route finding)
  .userPositionService → UserPositionService  (geolocation)
```

Sub-services are **dynamically imported** (`await import(...)`) in the `initServices()` method, which reduces Vite chunk sizes.

#### GlobeService Public Methods

| Method | Description |
|---|---|
| `flyHomeView()` | Animated camera flight to the default view |
| `changeZoom(direction: 1 \| -1)` | Zoom in/out with animation (0.3s) |
| `setCameraNorthUp()` | Rotates camera so north is up |
| `setView({ destination, orientation })` | Instantly sets the camera position |
| `getUserGlobeSettings()` | Reads and applies globe settings from localStorage |
| `setDefinedShaders(shader)` | Applies a post-processing effect |
| `enableEnvironment()` | Enables atmosphere, sun, moon, and skybox |
| `disableEnvironment()` | Disables environment elements |

The public field `definedShader: DefinedShader` holds the active shader (`'none'` by default).

#### Post-processing Shaders — `DefinedShader` Type

Union type exported from `src/services/globe/globe.ts`:

```ts
export type DefinedShader =
    | 'none'
    | 'blackAndWhite'
    | 'nightVision'
    | 'bloom'
    | 'depthOfField'
    | 'ambientOcclusion'
```

Usage example:
```ts
import { globeInstance } from '@/services/globe/globe'
globeInstance.setDefinedShaders('nightVision')
```

`depthOfField` automatically updates `focalDistance` after each rendered frame. Shader settings are persisted in localStorage as part of `userGlobeSettings`.

To use the globe in a component or service:
```ts
import { globeInstance } from '@/services/globe/globe'

// example: fly camera to a position
globeInstance.viewer.camera.flyTo({ ... })

// example: toggle layer visibility
globeInstance.layers.layers.get('osm')?.setVisibility(true)
```

### 4.4 Layer System (Layers)

#### Data Schema — `src/types/layers.ts`

All layer types are validated by **Zod** and form a `LayersUnionSchema` (discriminated union on the `type` field):

| `type` | Class | Description |
|---|---|---|
| `osm` | `OSMLayer` | OpenStreetMap imagery |
| `xyz` | `XYZLayer` | XYZ/TMS tiles (URL template) |
| `wms` | *(Zod schema defined, no implementation in `LayersFactory`)* | Web Map Service |
| `3dtiles` | `Cesium3DTilesLayer` | 3D models / Cesium Ion point clouds |
| `czml` | `CZMLLayer` | CZML data from Cesium Ion |
| `terrain` | `TerrainLayer` | DEM from Cesium Ion |
| `geojson` | `GeoJSONLayer` | GeoJSON from Cesium Ion (clampToGround) |

> **Note:** The `wmts` type is defined in the `LayerTypes` enum but has no Zod schema or class implementation — do not use it in `layers.json`.

> **Note:** `TerrainLayer` does **not inherit** from `LayerBase<T>` — it has its own `setVisibility()` and `isVisible()` implementations, and manages terrain visibility via `viewer.scene.setTerrain()`.

#### `tilesProps` Option for 3D Tiles Layers

Layers of type `3dtiles` support an optional `tilesProps` field for point clouds:

```json
{
    "type": "3dtiles",
    "id": "myCampusPointCloud",
    "name": { "pl": "Chmura punktów", "en": "Point Cloud" },
    "active": false,
    "ionId": 123456,
    "tilesProps": {
        "type": "pointCloud",
        "pointSize": 4,
        "pointCloudShading": {
            "attenuation": true,
            "eyeDomeLighting": true,
            "eyeDomeLightingStrength": 1.0
        }
    }
}
```

`tilesProps` parameters are applied during initialisation. Runtime point cloud style changes are enabled via `Cesium3DTilesLayer.setPointCloudLayerProperties(options)`.

#### Configuration File — `public/properties/layers.json`

An array of objects describing all application layers. Each layer **must** have a unique `id` field. The file is fetched by `LayersManager.initializeLayers()` at startup.

Example:
```json
{
    "type": "3dtiles",
    "active": false,
    "name": { "pl": "Budynki 3D (Google)", "en": "3D Buildings (Google)" },
    "id": "3dBuildingsGoogle",
    "parent": "3dLayers",
    "ionId": 2275207
}
```

The `parent` field groups layers in the UI layer tree. Available values:
`"demLayers"` | `"basemaps"` | `"3dLayers"` | `"campus3D"` | `"vectorLayers"`

GeoJSON layer from Cesium Ion example:
```json
{
    "type": "geojson",
    "active": false,
    "name": { "pl": "Moja warstwa", "en": "My Layer" },
    "id": "myGeoJSONLayer",
    "parent": "vectorLayers",
    "ionId": 987654
}
```

GeoJSON layers are loaded via `GeoJsonDataSource.load()` with the `clampToGround: true` option.

#### LayersManager — `src/services/globe/layersManager.ts`

`LayersManager` reads `layers.json`, calls `LayersFactory(config, viewer)` for each entry, and stores the ready instances in a `Map<string, LayersClassTypes>`. Each layer class inherits from the abstract class `LayerBase<T>` (`src/services/base/layers.ts`), which implements:
- `setVisibility(visible)` — shows/hides a layer and emits `visibilityChanged`
- `isVisible()` — reads visibility state
- `raiseToTop()` — raises an imagery layer to the top
- `setImageryAdjustment(options)` — brightness, contrast, saturation, etc. (for raster layers)

### 4.5 Tools System

Tools are **Vue components** embedded inside `<ToolsWrapper>` — cards with a title bar allowing close, minimise, and fullscreen modes.

#### Tool Registration — `src/services/tools.ts`

Full list of `TOOLS_KEYS` (excluding custom tools):

```ts
export const TOOLS_KEYS = [
    'cameraPosition',       // CameraPosition.vue
    'appSettings',          // AppSettings.vue
    'layersTree',           // ui/LayersTree.vue (special: mounted in mobile drawer)
    'shadowsSettings',      // ShadowsSettings.vue
    'objectInfo',           // ObjectInfo.vue
    'measurementTools',     // MeasurementsTool.vue
    'buildingFinder',       // BuildingFinder.vue
    'shareMap',             // ShareMap.vue
    'sketchTool',           // SketchTool.vue
    'profileTool',          // ProfileTool.vue
    'floodSim',             // FloodSimulator.vue
    'chartView',            // ChartView.vue
    'screenshotTool',       // ScreenshotTool.vue
    'viewsBookmarks',       // ViewsBookmarks.vue
    'rasterAdjustment',     // RasterAdjustment.vue (UUID — multiple instances)
    'pointCloudAdjustment', // PointCloudAdjustment.vue (UUID — multiple instances)
    'routeFinder',          // RouteFinder.vue
    'geoJSONObjectsList',   // GeoJSONObjectsList.vue
    ...CUSTOM_TOOLS_IDS,
] as const

export const Tools: Record<ToolsKeys, Component> = {
    cameraPosition: (await import('@/components/tools/CameraPosition.vue')).default,
    // ... (each key lazily mapped as above)
    ...CustomTools,
}
```

> The components `AppInfo.vue`, `BookmarkEditor.vue`, `BookmarkImporter.vue`, `CesiumGlobeSettings.vue`, `SettingsTool.vue` in the `components/tools/` directory are **sub-components** used inside other tools — they do not appear as standalone entries in `TOOLS_KEYS`.

Each tool is **dynamically imported** (lazy) — the component code loads only on first open.

#### Opening a Tool Programmatically

```ts
import { useToolsStore } from '@/stores'
import { getTool } from '@/services/tools'

const toolsStore = useToolsStore()
const tool = await getTool('routeFinder')
toolsStore.openTool({
    id: 'routeFinder',
    component: tool!,
    width: 350,
    icon: 'mdi-directions',
})
```

#### ToolsStore (`src/stores/tools.ts`)

Pinia store managing the list of open tools:
- `activeTools: Map<string, ToolsMap>` — map of id → tool data
- `activeToolsArray: ToolsMap[]` — same list as an array (for rendering)
- `currentTool: ToolsMap | null` — (computed) currently active tool on mobile (first in list), `null` on desktop
- `openTool(config)` — opens or closes (toggles) a tool
- `closeTool(id)` / `minimizeTool(id)` / `restoreTool(id)` / `toggleFullscreen(id)`
- `isMinimizedTool(id): boolean` — checks whether a tool is minimised

On **mobile devices** only one tool is active at a time (others are minimised). On **desktop** multiple tools can be open simultaneously.

> Exception: `rasterAdjustment` and `pointCloudAdjustment` can be opened multiple times — each instance gets a unique UUID-based id.

#### Tool Component Convention

A tool component **renders only the content** of `<v-card-text>`. The `<ToolsWrapper>` container is added automatically by `DesktopToolsContainer` / `MobileToolsContainer`.

```vue
<!-- src/components/tools/MyNewTool.vue -->
<template>
    <v-card-text class="pa-1 ma-0">
        <!-- tool content -->
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

### 4.6 Actions System

Actions are a **Zod discriminated union** on the `actionId` field. Defined in `src/types/actions.ts`:

| `actionId` | Description | Additional fields |
|---|---|---|
| `toggleTool` | Opens/closes a tool | `toolId`, `icon`, `width?`, `maxHeight?`, `customTitle?`, `props?` |
| `toggleLayersDrawer` | Opens/closes the layers drawer | — |
| `backToHomeView` | Restores the default view | — |
| `zoomIn` | Zoom in | — |
| `zoomOut` | Zoom out | — |

Action handlers are registered in the `ACTION_HANDLERS` object in `src/services/actions.ts`. Calling an action:

```ts
import { performAction } from '@/services/actions'

performAction({ actionId: 'toggleTool', toolId: 'cameraPosition', icon: 'mdi-camera-outline' })
```

After execution, each action emits an `actionPerformed` event on the event bus.

### 4.7 Stores (Pinia)

All stores are exported via the barrel `src/stores/index.ts`.

| Store | File | Responsibility |
|---|---|---|
| `useCommonStore` | `common.ts` | Loading overlay, layers drawer state, route state |
| `useToolsStore` | `tools.ts` | Open tools list and their state (min/max/fullscreen) |
| `useDialogStore` | `dialog.ts` | Global modal dialog (`<DialogWrapper>`) |
| `useNotifyStore` | `notify.ts` | Notification snackbar (`<NotifyComponent>`) |

#### Showing a Notification

```ts
import { useNotifyStore } from '@/stores'

const notifyStore = useNotifyStore()
notifyStore.showNotify({
    msg: 'Operation completed successfully',
    notifyType: 'success',    // 'success' | 'error' | 'info'
    notifyDuration: 3000,     // ms, optional
    notifyIcon: 'mdi-check',  // optional
})
```

#### Opening a Modal Dialog

```ts
import { useDialogStore } from '@/stores'
import MyDialogContent from '@/components/MyDialogContent.vue'

const dialogStore = useDialogStore()
dialogStore.openDialog({
    title: 'Dialog title',
    icon: 'mdi-information',
    component: MyDialogContent,
    props: { someData: 42 },
    width: 600,
})
```

### 4.8 Event Bus

`src/services/globalEvents.ts` defines the `UPEvent<T>` class — a lightweight, typed event emitter (without Vue):

```ts
class UPEvent<T> {
    addEventListener(listener: (event: T) => void): () => void  // returns a removal function
    removeEventListener(listener): boolean
    raiseEvent(event: T): void
    async awaitRaisedEvent(event: T): Promise<void>
}
```

Event instances exported from `src/services/eventBus.ts`:

| Event | Data type | When emitted |
|---|---|---|
| `appLoaded` | `boolean` | When GlobeService finishes initialisation |
| `appLoadingInfo` | `string` (i18n key) | Loading message update |
| `actionPerformed` | `Action` | After each action is performed |
| `objectClicked` | `Record<string, unknown> \| null` | Globe object click |
| `customObjectClicked` | `{ id: string, data: ... }` | Click on object with a custom popup |
| `floodAreaSelected` | `boolean` | Area selection in flood simulation |
| `profileCreated` | `boolean` | Terrain profile created |
| `visibilityChanged` | `{ id: string, visible: boolean }` | Layer visibility change |

#### Usage Example in a Vue Component

```ts
import { objectClicked } from '@/services/eventBus'
import { onMounted, onUnmounted } from 'vue'

let removeListener: () => void

onMounted(() => {
    removeListener = objectClicked.addEventListener((data) => {
        console.log('Clicked object:', data)
    })
})

onUnmounted(() => {
    removeListener?.()
})
```

### 4.9 User Interface

#### UI Component Hierarchy

```
App.vue
  └─ GeoportalView.vue         ← Cesium initialisation
       └─ UserInterface.vue
            ├─ DesktopContentContainer.vue   (desktop only)
            │    ├─ DesktopToolsContainer.vue  ← renders tools from ToolsStore
            │    └─ ...toolbars, menus, navigation
            ├─ MobileContentContainer.vue    (mobile only)
            │    └─ MobileToolsContainer.vue
            └─ DialogWrapper.vue             ← global dialog from DialogStore
```

Desktop/mobile switching: `const { mobile } = useDisplay()` from Vuetify.

#### Button Configuration — `public/properties/ui.json`

The JSON file defines UI buttons in six sections:

| Key | Where rendered |
|---|---|
| `toolbarActionButtons` | Left toolbar (desktop) |
| `toolbarEndActionButtons` | Right toolbar (desktop) |
| `mobileToolbarActionButtons` | Left toolbar (mobile) |
| `mobileToolbarEndActionButtons` | Right toolbar (mobile) |
| `toolsButtons` | "Tools" menu (hamburger icon) |
| `navigationButtons` | Globe navigation panel |

Each button has an `ActionButtonWithActionType` structure:
```json
{
    "tooltip": {
        "text": { "pl": "Polish name", "en": "English name" },
        "location": "bottom"
    },
    "icon": "mdi-ICON_NAME",
    "action": { }
}
```

Tooltip `text` can be a string (i18n key) or an object `{ pl, en }` with literal translations.

#### ToolsWrapper — `src/components/ui/ToolsWrapper.vue`

A wrapper component that every tool receives automatically. Renders:
- title bar with icon, name, and buttons: close / minimise / fullscreen
- `#card-text` slot for tool content
- `maxHeight` handling and `fullscreen` mode

#### Composable `useDynamicTranslation`

`src/composables/useDynamicTranslation.ts` — translates both a string (i18n key) and an object `{ pl, en }`:

```ts
const { translate } = useDynamicTranslation()
const text = translate(someStringOrObject) // computed ref<string>
```

### 4.10 Internationalisation (i18n)

- Configuration: `src/i18n/index.ts` — legacy: false, default locale: `pl`
- Translation files: `src/i18n/locales/pl.json` and `en.json`
- Preferred language saved in `localStorage` under the key `upRouteLanguage`
- In Vue templates: `{{ $t('key') }}`
- In `<script setup>`: `const { t } = useI18n(); t('key')`
- Fallback locale: `en`

### 4.11 URL State Serialisation

`src/services/url.ts` compresses application state into the `?data=...` URL parameter (LZ-string).

Serialised data (`UrlParams`):
- `camera` — camera position and orientation
- `tools` — list of open tools
- `lang` — active language
- `theme` — theme (light/dark)
- `shadows` — shadow configuration
- `layers` — list of visible layers
- `time` — current application time

The `applyUrlParams()` function is called after the globe loads and restores the saved state.

---

## 5. Directory Structure

```
src/
├── App.vue                     # Vue root, <v-app>
├── main.ts                     # application bootstrapping
├── main.css                    # global CSS styles
├── vuetify.ts                  # Vuetify configuration + UPWR brand colours
│
├── assets/                     # images imported by code
│
├── components/
│   ├── GeoportalView.vue       # Cesium Viewer initialisation
│   ├── UserInterface.vue       # desktop / mobile switcher
│   ├── DesktopContentContainer.vue
│   ├── MobileContentContainer.vue
│   ├── DesktopToolsContainer.vue
│   ├── MobileToolsContainer.vue
│   ├── DialogWrapper.vue       # global modal (DialogStore)
│   ├── LoadingOverlay.vue      # loading overlay
│   ├── customs/                # project-specific custom components
│   │   └── UpwrBuildingPopUp.vue
│   ├── tools/                  # tool components (CameraPosition, RouteFinder…)
│   └── ui/                     # general UI components (ActionButton, LayersTree…)
│
├── composables/
│   └── useDynamicTranslation.ts
│
├── i18n/
│   ├── index.ts                # vue-i18n configuration
│   └── locales/
│       ├── pl.json
│       └── en.json
│
├── router/
│   └── index.ts                # two routes: / and /globe
│
├── services/
│   ├── actions.ts              # action handlers + performAction()
│   ├── defaults.ts             # default Viewer settings and start view
│   ├── eventBus.ts             # UPEvent instance exports
│   ├── globalEvents.ts         # UPEvent<T> class
│   ├── tools.ts                # TOOLS_KEYS, Tools map, getTool()
│   ├── url.ts                  # URL serialisation / deserialisation
│   ├── utils.ts                # utility helpers
│   ├── viewsBookmarks.ts       # view bookmarks logic
│   ├── base/
│   │   └── layers.ts           # abstract LayerBase<T> class
│   ├── customs/                # project-specific logic
│   │   ├── customTools.ts      # CUSTOM_TOOLS_IDS + CustomTools map
│   │   └── layersFilters.ts    # custom 3D Tiles layer filters and styles
│   ├── globe/
│   │   ├── globe.ts            # GlobeService + globeInstance + initGlobeInstance()
│   │   ├── layersManager.ts    # LayersManager + layer classes (OSMLayer, etc.)
│   │   ├── events.ts           # GlobeEvent (globe clicks)
│   │   ├── measurements.ts     # MeasurementsService
│   │   ├── draw.ts             # DrawService (sketches)
│   │   ├── floodSim.ts         # FloodSim (flood simulation)
│   │   ├── profile.ts          # ProfileManager (terrain profile)
│   │   ├── time.ts             # TimeManager (clock, sun shadows)
│   │   └── userPositions.ts    # UserPositionService (GPS)
│   └── nearestRouteFinder/
│       ├── graphCreator.ts     # deserialisation of optimised route graph (pre-compute edge.key)
│       ├── routeFinder.ts      # A* algorithm + route management
│       └── types.ts            # graph types (GraphNode, GeoJsonFile)
│
├── stores/
│   ├── index.ts                # barrel export
│   ├── common.ts               # useCommonStore
│   ├── tools.ts                # useToolsStore
│   ├── dialog.ts               # useDialogStore
│   └── notify.ts               # useNotifyStore
│
└── types/
    ├── actions.ts              # Zod schemas + action types
    ├── customs.ts              # custom types (UPWr building metadata)
    ├── layers.ts               # Zod schemas + layer types
    ├── localDBs.ts             # IndexedDB / localStorage types
    ├── ui.ts                   # Zod schemas + UI types (ActionButton, UiSchema)
    ├── utils.ts                # utility types
    ├── viewsBookmarks.ts       # view bookmark types
    └── cesium-extensions.d.ts  # Cesium type extensions (e.g. customPopUpId)

public/
├── _headers                   # HTTP headers (Cloudflare Pages)
├── _redirects                 # redirects (Cloudflare Pages)
├── graphs/
│   ├── bike_graph.json        # cycling graph
│   ├── car_graph.json         # car graph
│   └── foot_graph.json        # pedestrian graph
└── properties/
    ├── beginningNodes.json    # route starting nodes (campus entry points)
    ├── layers.json            # ← map layer configuration
    ├── ui.json                # ← UI button configuration
    ├── customs/
    │   └── upwrBuildingsMetadata.json  # UPWr building metadata
    └── generatedRoutes/
        ├── bike_routes_results.json
        ├── car_routes_results.json
        └── foot_routes_results.json
```

---

## 6. Configuration Files (public/)

JSON files in `public/properties/` are fetched by the browser at runtime (**not** bundled). They can be edited without rebuilding the application.

### `public/properties/layers.json`

An array of `LayersUnionType` objects. Each object must include:
- `type` — layer type: `osm | xyz | wms | 3dtiles | czml | terrain | geojson`
  *(the `wmts` type is in the enum but is not supported by `LayersFactory`)*
- `id` — unique string (used in `LayersManager.layers.get(id)`)
- `name` — string or `{ pl: string, en: string }`
- `active` — `true` if the layer should be enabled by default
- `parent` — optional: `demLayers | basemaps | 3dLayers | campus3D | vectorLayers`
- Type-specific fields: `ionId` (3dtiles/czml/terrain), `url` (xyz/wms)

### `public/properties/ui.json`

UI button configuration — validated by `UiSchema` (Zod).
Each of the six sections is an array of `ActionButtonWithActionType[]`.

### `public/properties/beginningNodes.json`

Starting nodes for the A* algorithm — campus entry points.

### `public/graphs/*.json`

Route graphs for pedestrians, cyclists, and cars. Files are large and excluded from PWA precache — loaded on demand by RouteFinder.

---

## 7. Coding Conventions

1. **Vue Composition API** with `<script setup lang="ts">` in all new components.
2. **Zod** for validating all external JSON data. New data types should have a Zod schema in `src/types/`.
3. **Aliased imports**: `@/` points to `src/`. Always use `@/` instead of relative paths (`../..`).
4. **Dynamic imports** for tool components (`await import(...)`) — keeps chunk sizes small.
5. **`globeInstance`** is globally available from `@/services/globe/globe`. Do not pass the Viewer through props.
6. **Stores** always imported from `@/stores` (barrel), not directly from the store file.
7. **Translations** in components via `$t('key')`. Dynamic translations (from `{ pl, en }` objects) via `useDynamicTranslation()`.
8. **Icons**: only from `@mdi/font` (prefix `mdi-`). Icon list: https://pictogrammers.com/library/mdi/
9. **Vuetify themes**: use CSS tokens (`rgb(var(--v-theme-primary))`), do not hardcode colours.
10. **Naming conventions**:
    - Vue components: `PascalCase`
    - Service/composable files: `camelCase`
    - Constants: `SCREAMING_SNAKE_CASE`
    - Types/interfaces: `Type` suffix for Zod infer (`LayersUnionType`), `Schema` suffix for Zod object (`LayersUnionSchema`)

---

## 8. How to Add New Things

### 8.1 New Map Layer

Edit `public/properties/layers.json` and add a new object:

```json
{
    "type": "xyz",
    "active": false,
    "name": { "pl": "Moja warstwa", "en": "My Layer" },
    "id": "myNewLayer",
    "parent": "basemaps",
    "url": "https://tile.example.com/{z}/{x}/{y}.png"
}
```

**Requirements:**
- `id` must be unique across the entire file.
- For `3dtiles`, `czml`, and `terrain`, an `ionId` (Cesium Ion asset ID) is required.
- The layer is automatically loaded and added to the layer tree — no changes to TS/Vue code needed.

If you want to add a **new layer type** not supported by the existing classes, see section [8.10](#810-new-layer-type).

---

### 8.2 New Tool

**Step 1** — Create a component in `src/components/tools/`:

```vue
<!-- src/components/tools/MyNewTool.vue -->
<template>
    <v-card-text class="pa-1 ma-0">
        <p>{{ $t('myNewTool') }}</p>
        <!-- Tool content -->
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// tool logic...
</script>
```

**Step 2** — Add the ID to `TOOLS_KEYS` in `src/services/tools.ts`:

```ts
export const TOOLS_KEYS = [
    // ... existing keys
    'myNewTool',   // ← add here
    ...CUSTOM_TOOLS_IDS,
] as const
```

**Step 3** — Add a lazy import to the `Tools` object in the same file:

```ts
export const Tools: Record<ToolsKeys, Tool> = {
    // ... existing
    myNewTool: (await import('@/components/tools/MyNewTool.vue')).default,  // ← here
    ...CustomTools,
}
```

**Step 4** — Add translations (see section [8.8](#88-new-translation-i18n)).

**Step 5** — Optionally add a button in `public/properties/ui.json` (section [8.5](#85-new-toolbar-button)).

---

### 8.3 New Custom Tool

Custom tools are project-specific tools (e.g. a popup with UPWr building information).

**Step 1** — Create a component in `src/components/customs/`.

**Step 2** — Register it in `src/services/customs/customTools.ts`:

```ts
export const CUSTOM_TOOLS_IDS = [
    'upwrBuildingInfoPopUp',
    'myCustomPopUp',   // ← add ID
] as const

export const CustomTools: Record<ToolsKeys, Component> = {
    upwrBuildingInfoPopUp: (await import('@/components/customs/UpwrBuildingPopUp.vue')).default,
    myCustomPopUp: (await import('@/components/customs/MyCustomPopUp.vue')).default,  // ← and component
}
```

The ID is automatically added to `TOOLS_KEYS` via the `...CUSTOM_TOOLS_IDS` spread in `tools.ts`.

---

### 8.4 New Action

**Step 1** — Add a Zod schema in `src/types/actions.ts`:

```ts
export const MyNewActionSchema = z.object({
    actionId: z.literal('myNewAction'),
    someParam: z.string(),
})

// Add to the discriminated union:
export const ActionSchema = z.discriminatedUnion('actionId', [
    ToggleToolActionSchema,
    // ... existing
    MyNewActionSchema,   // ← here
])
```

**Step 2** — Add a handler in `src/services/actions.ts`:

```ts
const myNewAction = (config: Action) => {
    if (config.actionId !== 'myNewAction') return
    // action logic...
    actionPerformed.raiseEvent(config)
}

const ACTION_HANDLERS: { [key in ActionsIds]: (config: Action) => void } = {
    // ... existing
    myNewAction,   // ← here
}
```

---

### 8.5 New Toolbar Button

Edit `public/properties/ui.json` and add an object to the appropriate section:

```json
{
    "tooltip": {
        "text": { "pl": "Moje narzędzie", "en": "My Tool" },
        "location": "bottom"
    },
    "icon": "mdi-star-outline",
    "action": {
        "actionId": "toggleTool",
        "toolId": "myNewTool",
        "icon": "mdi-star-outline",
        "width": 400
    }
}
```

Section selection:
- **`toolsButtons`** — "Tools" menu (hamburger) — recommended for most tools
- **`toolbarActionButtons`** / **`toolbarEndActionButtons`** — main toolbar (desktop)
- **`mobileToolbarActionButtons`** / **`mobileToolbarEndActionButtons`** — main toolbar (mobile)

---

### 8.6 New Pinia Store

Create a file in `src/stores/` following the Setup Store API:

```ts
// src/stores/myFeature.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyFeatureStore = defineStore('myFeature', () => {
    const someState = ref<string>('')

    const computedValue = computed(() => someState.value.toUpperCase())

    const doSomething = (value: string) => {
        someState.value = value
    }

    return { someState, computedValue, doSomething }
})
```

Add an export to `src/stores/index.ts`:

```ts
export * from './myFeature'
```

---

### 8.7 New Globe Service

**Step 1** — Create a class in `src/services/globe/`:

```ts
// src/services/globe/myService.ts
import type { Viewer } from '@cesium/widgets'

export class MyService {
    constructor(private _viewer: Viewer) {}

    doSomethingOnGlobe() {
        // CesiumJS logic...
    }
}
```

**Step 2** — Integrate with `GlobeService` in `src/services/globe/globe.ts`:

```ts
// Private field:
private _myService: MyService | null = null

// Getter:
get myService(): MyService {
    if (!this._myService) throw new Error('MyService is not initialized')
    return this._myService
}

// Initialisation in initServices():
const { MyService } = await import('./myService')
this._myService = new MyService(this._viewer)
```

**Step 3** — Use it anywhere:

```ts
import { globeInstance } from '@/services/globe/globe'
globeInstance.myService.doSomethingOnGlobe()
```

---

### 8.8 New Translation (i18n)

Add the key to both JSON files:

```json
// src/i18n/locales/pl.json
{ "myNewTool": "Moje nowe narzędzie" }

// src/i18n/locales/en.json
{ "myNewTool": "My New Tool" }
```

Usage in a template:
```html
<span>{{ $t('myNewTool') }}</span>
```

Usage in `<script setup>`:
```ts
const { t } = useI18n()
console.log(t('myNewTool'))
```

---

### 8.9 New Layer Filter

Layer filters allow dynamically styling 3D Tiles layers after they are loaded.

In `src/services/customs/layersFilters.ts`:

```ts
// Add the ID to the type:
export type FilterIds = 'upwrLOD1Buildings' | 'myNewLayerId'

// Create a filter function:
const myNewLayerFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== '3dTiles' || !layer._layer) return

    layer._layer.style = new Cesium3DTileStyle({
        color: "color('red')",
    })
}

// Add the call to applyLayerFilter:
export const applyLayerFilter = (id: string) => {
    if (id === 'upwrLOD1Buildings') upwrLoD1Filter(id as FilterIds)
    if (id === 'myNewLayerId') myNewLayerFilter(id as FilterIds)  // ← here
}
```

`applyLayerFilter(id)` is called automatically by `LayersManager` after each layer is loaded.

---

### 8.10 New Layer Type

If the existing types (`osm`, `xyz`, `wms`, `3dtiles`, `czml`, `terrain`, `geojson`) are insufficient:

**Step 1** — Add a Zod schema in `src/types/layers.ts`:

```ts
export const MyNewLayerSchema = LayerBaseSchema.extend({
    type: z.literal('myNewType'),
    mySpecialField: z.string(),
})

export type MyNewLayerType = z.infer<typeof MyNewLayerSchema>

export const LayersUnionSchema = z.discriminatedUnion('type', [
    // ... existing
    MyNewLayerSchema,  // ← here
])
```

**Step 2** — Create a class in `src/services/globe/layersManager.ts`, inheriting from `LayerBase<T>`:

```ts
export class MyNewLayer extends LayerBase<MyCesiumType> {
    public readonly classType = 'MyNewLayer'
    private _viewer: Viewer
    private _config: MyNewLayerType
    public _layer: MyCesiumType | null = null

    constructor(viewer: Viewer, config: MyNewLayerType) {
        super()
        this._viewer = viewer
        this._config = config
    }

    async initialize(): Promise<MyCesiumType> {
        // Cesium initialisation logic...
        return this._layer!
    }

    addToGlobe(): void { /* add to Cesium scene */ }
    destroy(): void { /* remove from scene */ }
    getName(): string { return this._config.id! }
    getType(): string { return 'myNewType' }
}
```

> **Note:** If the new layer type requires custom visibility logic (e.g. like `TerrainLayer`), you can implement the class **without inheriting** from `LayerBase<T>` and define your own `setVisibility()` and `isVisible()` methods. Remember to update the `LayersClassTypes` type in the same file.

**Step 3** — Add a case to `LayersFactory` in the same file:

```ts
const LayersFactory = (config: LayersUnionType, viewer: Viewer) => {
    switch (config.type) {
        // ... existing
        case 'myNewType': return new MyNewLayer(viewer, config)
    }
}
```

---

## 9. Themes (Vuetify Theming)

Themes are configured in `src/vuetify.ts`. UPWR brand colours:

```ts
export const upwrBrandColors = {
    burgundy: '#c7364e',         // → primary
    burgundyDark: '#7a1f2f',     // → used for globe selection highlighting
    amberAccent: '#FFC107',      // → accent
    slateGrey: '#455A64',        // → secondary
}
```

The active theme is saved in `localStorage` under the key `upRouteTheme`.
Theme switching is handled by `AppSettings.vue` (`vuetify.theme.global.name.value = 'dark'`).

In CSS and components — use Vuetify tokens:
```css
color: rgb(var(--v-theme-primary));
background: rgb(var(--v-theme-surface));
```

---

## 10. PWA and Service Worker

The application is configured as a PWA in `vite.config.ts` via `vite-plugin-pwa`:

- **Auto-update**: The SW updates automatically. After a new version is installed, the page reloads.
- **Precache**: Styles, scripts, HTML, images, JSON files (except route graphs).
- **Excluded from precache**: `public/graphs/*.json` — large graph files (~MB), loaded on demand by `RouteFinder`.
- **Max file size in cache**: 20 MB.

After each `npm run build`, `dist/sw.js` and `dist/manifest.webmanifest` are generated.
