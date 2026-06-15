# UP.route — Code Guide

![screenshot (9)](https://github.com/user-attachments/assets/de21188c-3b15-4941-81b2-2baff1a65c3b)

> Kompletny przewodnik po architekturze, konwencjach i sposobach rozszerzania aplikacji.

> [!IMPORTANT]
> **Informacja o prawach autorskich i przeznaczeniu repozytorium**
> 
> Niniejsze repozytorium zawiera autorski kod źródłowy stworzony na potrzeby realizacji i obrony pracy magisterskiej. Zostało ono upublicznione wyłącznie w celu umożliwienia weryfikacji działania systemu przez promotora oraz recenzenta.
>
> * **Tytuł pracy:** Opracowanie metody wyznaczania tras pomiędzy budynkami kampusu UPWr
> * **Autor:** Marek Dworecki (Nr indeksu: 122968)
> * **Uczelnia:** Uniwersytet Przyrodniczy we Wrocławiu
> * **Wydział:** Wydział Inżynierii Kształtowania Środowiska i Geodezji
> * **Kierunek:** Geodezja i Kartografia
> * **Rok obrony:** 2026

---

## Spis treści

1. [Przegląd projektu](#1-przegląd-projektu)
2. [Stack technologiczny](#2-stack-technologiczny)
3. [Uruchamianie projektu](#3-uruchamianie-projektu)
4. [Architektura aplikacji](#4-architektura-aplikacji)
   - 4.1 [Punkt wejścia — bootstrapping](#41-punkt-wejścia--bootstrapping)
   - 4.2 [Routing](#42-routing)
   - 4.3 [GlobeService — serce aplikacji](#43-globeservice--serce-aplikacji)
   - 4.4 [System warstw (Layers)](#44-system-warstw-layers)
   - 4.5 [System narzędzi (Tools)](#45-system-narzędzi-tools)
   - 4.6 [System akcji (Actions)](#46-system-akcji-actions)
   - 4.7 [Stores (Pinia)](#47-stores-pinia)
   - 4.8 [Event Bus](#48-event-bus)
   - 4.9 [Interfejs użytkownika](#49-interfejs-użytkownika)
   - 4.10 [Internacjonalizacja (i18n)](#410-internacjonalizacja-i18n)
   - 4.11 [Serializacja stanu URL](#411-serializacja-stanu-url)
5. [Struktura katalogów](#5-struktura-katalogów)
6. [Pliki konfiguracyjne (public/)](#6-pliki-konfiguracyjne-public)
7. [Konwencje kodowania](#7-konwencje-kodowania)
8. [Jak dodawać nowe rzeczy](#8-jak-dodawać-nowe-rzeczy)
   - 8.1 [Nowa warstwa mapy](#81-nowa-warstwa-mapy)
   - 8.2 [Nowe narzędzie (Tool)](#82-nowe-narzędzie-tool)
   - 8.3 [Nowe narzędzie własne (Custom Tool)](#83-nowe-narzędzie-własne-custom-tool)
   - 8.4 [Nowa akcja (Action)](#84-nowa-akcja-action)
   - 8.5 [Nowy przycisk na pasku narzędzi](#85-nowy-przycisk-na-pasku-narzędzi)
   - 8.6 [Nowy sklep (Pinia Store)](#86-nowy-sklep-pinia-store)
   - 8.7 [Nowa usługa globu (Globe Service)](#87-nowa-usługa-globu-globe-service)
   - 8.8 [Nowe tłumaczenie (i18n)](#88-nowe-tłumaczenie-i18n)
   - 8.9 [Nowy filtr warstwy](#89-nowy-filtr-warstwy)
   - 8.10 [Nowy typ warstwy](#810-nowy-typ-warstwy)
9. [Motywy (Vuetify Theming)](#9-motywy-vuetify-theming)
10. [PWA i Service Worker](#10-pwa-i-service-worker)

---

## 1. Przegląd projektu

**Up.route** to webowa aplikacja geoportalowa 3D stworzona jako praca magisterska. Wyświetla interaktywny glob 3D oparty na CesiumJS, umożliwia zarządzanie warstwami mapy, wykonywanie pomiarów, znajdowanie tras pomiędzy budynkami kampusu Uniwersytetu Przyrodniczego we Wrocławiu oraz wiele innych analiz przestrzennych.

---

## 2. Stack technologiczny

| Technologia | Rola |
|---|---|
| **Vue 3** (Composition API + `<script setup>`) | Framework UI |
| **TypeScript** | Statyczne typowanie, `vue-tsc` do type-check |
| **Vite 7** | Bundler i dev-server |
| **CesiumJS** (`@cesium/engine` + `@cesium/widgets`) | Renderowanie globu 3D |
| **Vuetify 3** | Biblioteka komponentów Material Design |
| **Pinia** | Zarządzanie stanem globalnym |
| **vue-i18n v11** | Internacjonalizacja (PL / EN) |
| **Vue Router v4** | Routing SPA |
| **Zod v4** | Walidacja schematów JSON (warstwy, UI, akcje) |
| **vite-plugin-cesium** | Integracja Cesium z Vite |
| **vite-plugin-pwa** | Progressive Web App (Service Worker) |
| **lz-string** | Kompresja stanu aplikacji do URL |
| **vue-chartjs / chartjs** | Wykresy |
| **jsPDF** | Eksport do PDF |
| **lodash** | Narzędzia pomocnicze |
| **@mdi/font** | Ikony Material Design Icons |

---

## 3. Uruchamianie projektu

```sh
# Wymagane: Node >=20.19

npm install          # instalacja zależności
npm run dev          # dev z HMR: http://localhost:5173
npm run build        # type-check + build produkcyjny → dist/
npm run type-check   # tylko sprawdzenie typów
npm run lint         # ESLint + auto-fix
npm run format       # Prettier
```

> **Cesium Ion key**: Warstwy 3D Tiles / CZML / Terrain / GeoJSON wymagają tokenu Cesium Ion.
> Token odczytywany jest ze zmiennej środowiskowej `VITE_CESIUM_API_KEY` w `src/services/globe/globe.ts` (`Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API_KEY`).
> Utwórz plik `.env` w katalogu głównym projektu z wpisem: `VITE_CESIUM_API_KEY=TwójToken`.

---

## 4. Architektura aplikacji

### 4.1 Punkt wejścia — bootstrapping

```
index.html
  └─ src/main.ts          ← createApp + pluginy (Pinia, Router, Vuetify, i18n)
       └─ App.vue          ← <v-app> + <LoadingOverlay> + <router-view>
```

`src/main.ts` rejestruje wszystkie pluginy i montuje aplikację. Kolejność jest istotna: Pinia musi być zarejestrowana przed Router i Vuetify, ponieważ stores są używane w konfiguracji Vuetify (odczyt motywu z localStorage).

### 4.2 Routing

Aplikacja ma **jeden widok użytkownika**: `/globe` → `GeoportalView.vue`.
Ścieżka `/` przekierowuje na `/globe`.

```
src/router/index.ts
  / → redirect → /globe
  /globe → GeoportalView.vue   (lazy import)
```

`GeoportalView.vue`:
1. Montuje kontener `#cesiumContainer` (pełny ekran, `position: absolute`).
2. Wywołuje `initGlobeInstance(container)` — tworzy Viewer CesiumJS i `GlobeService`.
3. Nasłuchuje zdarzenia `appLoaded` (z event bus). Gdy wystąpi, renderuje `<UserInterface>` i aplikuje parametry URL.

### 4.3 GlobeService — serce aplikacji

`src/services/globe/globe.ts` eksportuje:
- `globeInstance` — globalny singleton instancji `GlobeService`
- `initGlobeInstance(container)` — tworzy Viewer i inicjalizuje wszystkie sub-usługi

`GlobeService` jest **klasą fasadową**. Przechowuje prywatne referencje do wszystkich sub-usług i udostępnia je jako gettery (rzucające błąd jeśli niezainicjalizowane):

```
GlobeService
  .viewer              → Cesium Viewer
  .layers              → LayersManager        (zarządzanie warstwami)
  .time                → TimeManager          (zegar, cienie słońca)
  .events              → GlobeEvent           (obsługa kliknięć na glob)
  .measurements        → MeasurementsService  (pomiary)
  .draw                → DrawService          (rysowanie szkieców)
  .floodSim            → FloodSim             (symulacja powodzi)
  .profile             → ProfileManager       (profil terenu)
  .routeFinder         → RouteFinder          (wyznaczanie tras A*)
  .userPositionService → UserPositionService  (geolokalizacja)
```

Sub-usługi są importowane **dynamicznie** (`await import(...)`) w metodzie `initServices()`, co zmniejsza rozmiar chunks Vite.

#### Publiczne metody GlobeService

| Metoda | Opis |
|---|---|
| `flyHomeView()` | Animowany lot kamery do domyślnego widoku |
| `changeZoom(direction: 1 \| -1)` | Przybliżenie/oddalenie z animacją (0.3s) |
| `setCameraNorthUp()` | Obrót kamery tak, aby północ była u góry |
| `setView({ destination, orientation })` | Natychmiastowe ustawienie pozycji kamery |
| `getUserGlobeSettings()` | Wczytanie i zastosowanie ustawień globu z localStorage |
| `setDefinedShaders(shader)` | Zastosowanie efektu post-processingu |
| `enableEnvironment()` | Włączenie atmosfery, słońca, księżyca i skyboxa |
| `disableEnvironment()` | Wyłączenie elementów środowiska |

Pole publiczne `definedShader: DefinedShader` przechowuje aktywny shader (`'none'` domyślnie).

#### Shadery post-processingu — typ `DefinedShader`

Eksportowany z `src/services/globe/globe.ts` typ unii:

```ts
export type DefinedShader =
    | 'none'
    | 'blackAndWhite'
    | 'nightVision'
    | 'bloom'
    | 'depthOfField'
    | 'ambientOcclusion'
```

Przykład zastosowania:
```ts
import { globeInstance } from '@/services/globe/globe'
globeInstance.setDefinedShaders('nightVision')
```

`depthOfField` automatycznie aktualizuje `focalDistance` po każdym renderowanym kadrze. Ustawienia shaderów są persystowane w localStorage jako część `userGlobeSettings`.

Aby używać globu w komponencie lub usłudze:
```ts
import { globeInstance } from '@/services/globe/globe'

// przykład: lot kamery do pozycji
globeInstance.viewer.camera.flyTo({ ... })

// przykład: przełączenie widoczności warstwy
globeInstance.layers.layers.get('osm')?.setVisibility(true)
```

### 4.4 System warstw (Layers)

#### Schemat danych — `src/types/layers.ts`

Wszystkie typy warstw są walidowane przez **Zod** i tworzą `LayersUnionSchema` (discriminated union po polu `type`):

| `type` | Klasa | Opis |
|---|---|---|
| `osm` | `OSMLayer` | OpenStreetMap imagery |
| `xyz` | `XYZLayer` | Kafelki XYZ/TMS (URL template) |
| `wms` | *(schemat Zod zdefiniowany, brak implementacji w `LayersFactory`)* | Web Map Service |
| `3dtiles` | `Cesium3DTilesLayer` | Modele 3D / chmury punktów Cesium Ion |
| `czml` | `CZMLLayer` | Dane CZML z Cesium Ion |
| `terrain` | `TerrainLayer` | DEM z Cesium Ion |
| `geojson` | `GeoJSONLayer` | GeoJSON z Cesium Ion (clampToGround) |

> **Uwaga:** typ `wmts` jest zdefiniowany w enum `LayerTypes`, ale nie posiada schematu Zod ani implementacji klasy — nie należy go używać w `layers.json`.

> **Uwaga:** `TerrainLayer` **nie dziedziczy** z `LayerBase<T>` — posiada własną implementację `setVisibility()` i `isVisible()`, a `show` terenu zarządza przez `viewer.scene.setTerrain()`.

#### Opcja `tilesProps` dla warstw 3D Tiles

Warstwy typu `3dtiles` obsługują opcjonalne pole `tilesProps` dla chmur punktów:

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

Parametry `tilesProps` są stosowane przy inicjalizacji. Runtime-ową zmianę stylu chmury punktów umożliwia metoda `Cesium3DTilesLayer.setPointCloudLayerProperties(options)`.

#### Plik konfiguracyjny — `public/properties/layers.json`

Tablica obiektów opisujących wszystkie warstwy aplikacji. Każda warstwa **musi** mieć unikalne pole `id`. Plik jest pobierany przez `LayersManager.initializeLayers()` przy starcie.

Przykład:
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

Pole `parent` grupuje warstwy w drzewie warstw UI. Dostępne wartości:
`"demLayers"` | `"basemaps"` | `"3dLayers"` | `"campus3D"` | `"vectorLayers"`

Przykład warstwy GeoJSON z Cesium Ion:
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

Warstwy GeoJSON są ładowane przez `GeoJsonDataSource.load()` z opcją `clampToGround: true`.

#### LayersManager — `src/services/globe/layersManager.ts`

`LayersManager` czyta `layers.json`, wywołuje `LayersFactory(config, viewer)` dla każdego wpisu i przechowuje gotowe instancje w `Map<string, LayersClassTypes>`. Każda klasa warstwy dziedziczy z abstrakcyjnej klasy `LayerBase<T>` (`src/services/base/layers.ts`), która implementuje:
- `setVisibility(visible)` — włącza/wyłącza warstwę i emituje `visibilityChanged`
- `isVisible()` — odczyt widoczności
- `raiseToTop()` — podniesienie warstwy imagery na wierzch
- `setImageryAdjustment(options)` — jasność, kontrast, nasycenie itp. (dla warstw rastrowych)

### 4.5 System narzędzi (Tools)

Narzędzia to **komponenty Vue** osadzone wewnątrz `<ToolsWrapper>` — karty z paskiem tytułu umożliwiającym zamknięcie, minimalizację i tryb pełnoekranowy.

#### Rejestracja narzędzi — `src/services/tools.ts`

Pełna lista kluczy `TOOLS_KEYS` (bez custom tools):

```ts
export const TOOLS_KEYS = [
    'cameraPosition',       // CameraPosition.vue
    'appSettings',          // AppSettings.vue
    'layersTree',           // ui/LayersTree.vue (specjalny: montowany w szufladzie mobilnej)
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
    'rasterAdjustment',     // RasterAdjustment.vue (UUID — wielokrotne instancje)
    'pointCloudAdjustment', // PointCloudAdjustment.vue (UUID — wielokrotne instancje)
    'routeFinder',          // RouteFinder.vue
    'geoJSONObjectsList',   // GeoJSONObjectsList.vue
    ...CUSTOM_TOOLS_IDS,
] as const

export const Tools: Record<ToolsKeys, Component> = {
    cameraPosition: (await import('@/components/tools/CameraPosition.vue')).default,
    // ... (każdy klucz zmapowany lazily jak powyżej)
    ...CustomTools,
}
```

> Komponenty `AppInfo.vue`, `BookmarkEditor.vue`, `BookmarkImporter.vue`, `CesiumGlobeSettings.vue`, `SettingsTool.vue` w katalogu `components/tools/` są **pod-komponentami** używanymi wewnątrz innych narzędzi — nie figurują jako samodzielne wpisy w `TOOLS_KEYS`.

Każde narzędzie jest **dynamicznie importowane** (lazy) — kod komponentu ładuje się dopiero przy pierwszym otwarciu.

#### Otwieranie narzędzia programatycznie

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

Pinia store zarządzający listą otwartych narzędzi:
- `activeTools: Map<string, ToolsMap>` — mapa id → dane narzędzia
- `activeToolsArray: ToolsMap[]` — ta sama lista jako tablica (do renderowania)
- `currentTool: ToolsMap | null` — (computed) aktualnie aktywne narzędzie na mobile (pierwsze z listy), `null` na desktopie
- `openTool(config)` — otwiera lub zamyka (toggle) narzędzie
- `closeTool(id)` / `minimizeTool(id)` / `restoreTool(id)` / `toggleFullscreen(id)`
- `isMinimizedTool(id): boolean` — sprawdza czy narzędzie jest zminimalizowane

Na **urządzeniach mobilnych** jednocześnie aktywne jest tylko jedno narzędzie (pozostałe są minimalizowane). Na **desktopie** wiele narzędzi może być otwartych równocześnie.

> Wyjątek: `rasterAdjustment` i `pointCloudAdjustment` mogą być otwarte wielokrotnie — każda instancja dostaje unikalne id z UUID.

#### Konwencja komponentu narzędzia

Komponent narzędzia **renderuje wyłącznie zawartość** `<v-card-text>`. Kontener `<ToolsWrapper>` jest dodawany automatycznie przez `DesktopToolsContainer` / `MobileToolsContainer`.

```vue
<!-- src/components/tools/MyNewTool.vue -->
<template>
    <v-card-text class="pa-1 ma-0">
        <!-- treść narzędzia -->
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

### 4.6 System akcji (Actions)

Akcje to **typ zdyskryminowany (Zod discriminated union)** po polu `actionId`. Zdefiniowane w `src/types/actions.ts`:

| `actionId` | Opis | Dodatkowe pola |
|---|---|---|
| `toggleTool` | Otwiera/zamyka narzędzie | `toolId`, `icon`, `width?`, `maxHeight?`, `customTitle?`, `props?` |
| `toggleLayersDrawer` | Otwiera/zamyka szufladę warstw | — |
| `backToHomeView` | Przywraca domyślny widok | — |
| `zoomIn` | Przybliżenie | — |
| `zoomOut` | Oddalenie | — |

Handlery akcji są zarejestrowane w obiekcie `ACTION_HANDLERS` w `src/services/actions.ts`. Wywołanie:

```ts
import { performAction } from '@/services/actions'

performAction({ actionId: 'toggleTool', toolId: 'cameraPosition', icon: 'mdi-camera-outline' })
```

Po wykonaniu każda akcja emituje zdarzenie `actionPerformed` na event bus.

### 4.7 Stores (Pinia)

Wszystkie stores eksportowane są przez barrel `src/stores/index.ts`.

| Store | Plik | Odpowiedzialność |
|---|---|---|
| `useCommonStore` | `common.ts` | Nakładka ładowania, stan szuflady warstw, stan trasy |
| `useToolsStore` | `tools.ts` | Lista otwartych narzędzi i ich stan (min/max/fullscreen) |
| `useDialogStore` | `dialog.ts` | Globalny dialog modalny (`<DialogWrapper>`) |
| `useNotifyStore` | `notify.ts` | Snackbar powiadomień (`<NotifyComponent>`) |

#### Wyświetlanie powiadomienia

```ts
import { useNotifyStore } from '@/stores'

const notifyStore = useNotifyStore()
notifyStore.showNotify({
    msg: 'Operacja zakończona sukcesem',
    notifyType: 'success',    // 'success' | 'error' | 'info'
    notifyDuration: 3000,     // ms, opcjonalne
    notifyIcon: 'mdi-check',  // opcjonalne
})
```

#### Otwieranie dialogu modalnego

```ts
import { useDialogStore } from '@/stores'
import MyDialogContent from '@/components/MyDialogContent.vue'

const dialogStore = useDialogStore()
dialogStore.openDialog({
    title: 'Tytuł dialogu',
    icon: 'mdi-information',
    component: MyDialogContent,
    props: { someData: 42 },
    width: 600,
})
```

### 4.8 Event Bus

`src/services/globalEvents.ts` definiuje klasę `UPEvent<T>` — lekki, typowany emitter zdarzeń (bez Vue):

```ts
class UPEvent<T> {
    addEventListener(listener: (event: T) => void): () => void  // zwraca funkcję usuwającą
    removeEventListener(listener): boolean
    raiseEvent(event: T): void
    async awaitRaisedEvent(event: T): Promise<void>
}
```

Instancje zdarzeń eksportowane z `src/services/eventBus.ts`:

| Zdarzenie | Typ danych | Kiedy emitowane |
|---|---|---|
| `appLoaded` | `boolean` | Gdy GlobeService zakończy inicjalizację |
| `appLoadingInfo` | `string` (klucz i18n) | Aktualizacja komunikatu ładowania |
| `actionPerformed` | `Action` | Po każdej wykonanej akcji |
| `objectClicked` | `Record<string, unknown> \| null` | Kliknięcie obiektu na globie |
| `customObjectClicked` | `{ id: string, data: ... }` | Kliknięcie obiektu z własnym popupem |
| `floodAreaSelected` | `boolean` | Wybór obszaru w symulacji powodzi |
| `profileCreated` | `boolean` | Utworzenie profilu terenu |
| `visibilityChanged` | `{ id: string, visible: boolean }` | Zmiana widoczności warstwy |

#### Przykład użycia w komponencie Vue

```ts
import { objectClicked } from '@/services/eventBus'
import { onMounted, onUnmounted } from 'vue'

let removeListener: () => void

onMounted(() => {
    removeListener = objectClicked.addEventListener((data) => {
        console.log('Kliknięty obiekt:', data)
    })
})

onUnmounted(() => {
    removeListener?.()
})
```

### 4.9 Interfejs użytkownika

#### Hierarchia komponentów UI

```
App.vue
  └─ GeoportalView.vue         ← inicjalizacja Cesium
       └─ UserInterface.vue
            ├─ DesktopContentContainer.vue   (tylko desktop)
            │    ├─ DesktopToolsContainer.vue  ← renderuje narzędzia z ToolsStore
            │    └─ ...paski, menu, nawigacja
            ├─ MobileContentContainer.vue    (tylko mobile)
            │    └─ MobileToolsContainer.vue
            └─ DialogWrapper.vue             ← globalny dialog z DialogStore
```

Przełączanie desktop/mobile: `const { mobile } = useDisplay()` z Vuetify.

#### Konfiguracja przycisków — `public/properties/ui.json`

Plik JSON definiuje przyciski UI w sześciu sekcjach:

| Klucz | Gdzie renderowany |
|---|---|
| `toolbarActionButtons` | Pasek narzędzi lewy (desktop) |
| `toolbarEndActionButtons` | Pasek narzędzi prawy (desktop) |
| `mobileToolbarActionButtons` | Pasek narzędzi lewy (mobile) |
| `mobileToolbarEndActionButtons` | Pasek narzędzi prawy (mobile) |
| `toolsButtons` | Menu "Narzędzia" (ikona hamburgera) |
| `navigationButtons` | Panel nawigacyjny globu |

Każdy przycisk ma strukturę `ActionButtonWithActionType`:
```json
{
    "tooltip": {
        "text": { "pl": "Polska nazwa", "en": "English name" },
        "location": "bottom"
    },
    "icon": "mdi-NAZWA_IKONY",
    "action": { }
}
```

Tooltip `text` może być stringiem (klucz i18n) lub obiektem `{ pl, en }` z dosłownymi tłumaczeniami.

#### ToolsWrapper — `src/components/ui/ToolsWrapper.vue`

Komponent owijający, który każde narzędzie dostaje automatycznie. Renderuje:
- pasek tytułu z ikoną, nazwą, przyciskami: zamknij / minimalizuj / pełny ekran
- slot `#card-text` na zawartość narzędzia
- obsługę `maxHeight` i trybu `fullscreen`

#### Composable `useDynamicTranslation`

`src/composables/useDynamicTranslation.ts` — tłumaczy zarówno string (klucz i18n) jak i obiekt `{ pl, en }`:

```ts
const { translate } = useDynamicTranslation()
const text = translate(someStringOrObject) // computed ref<string>
```

### 4.10 Internacjonalizacja (i18n)

- Konfiguracja: `src/i18n/index.ts` — legacy: false, domyślny locale: `pl`
- Pliki tłumaczeń: `src/i18n/locales/pl.json` i `en.json`
- Preferowany język zapisywany w `localStorage` jako klucz `upRouteLanguage`
- W szablonach Vue: `{{ $t('klucz') }}`
- W `<script setup>`: `const { t } = useI18n(); t('klucz')`
- Fallback locale: `en`

### 4.11 Serializacja stanu URL

`src/services/url.ts` kompresuje stan aplikacji do parametru `?data=...` (LZ-string) w URL.

Serializowane dane (`UrlParams`):
- `camera` — pozycja i orientacja kamery
- `tools` — lista otwartych narzędzi
- `lang` — aktywny język
- `theme` — motyw (light/dark)
- `shadows` — konfiguracja cieni
- `layers` — lista widocznych warstw
- `time` — aktualny czas w aplikacji

Funkcja `applyUrlParams()` jest wywoływana po załadowaniu globu i przywraca zapisany stan.

---

## 5. Struktura katalogów

```
src/
├── App.vue                     # korzeń Vue, <v-app>
├── main.ts                     # bootstrapping aplikacji
├── main.css                    # globalne style CSS
├── vuetify.ts                  # konfiguracja Vuetify + kolory marki UPWR
│
├── assets/                     # obrazki importowane przez kod
│
├── components/
│   ├── GeoportalView.vue       # inicjalizacja Cesium Viewer
│   ├── UserInterface.vue       # przełącznik desktop / mobile
│   ├── DesktopContentContainer.vue
│   ├── MobileContentContainer.vue
│   ├── DesktopToolsContainer.vue
│   ├── MobileToolsContainer.vue
│   ├── DialogWrapper.vue       # globalny modal (DialogStore)
│   ├── LoadingOverlay.vue      # nakładka ładowania
│   ├── customs/                # własne, projektowe komponenty
│   │   └── UpwrBuildingPopUp.vue
│   ├── tools/                  # komponenty narzędzi (CameraPosition, RouteFinder…)
│   └── ui/                     # ogólne komponenty UI (ActionButton, LayersTree…)
│
├── composables/
│   └── useDynamicTranslation.ts
│
├── i18n/
│   ├── index.ts                # konfiguracja vue-i18n
│   └── locales/
│       ├── pl.json
│       └── en.json
│
├── router/
│   └── index.ts                # dwie trasy: / i /globe
│
├── services/
│   ├── actions.ts              # handlery akcji + performAction()
│   ├── defaults.ts             # domyślne ustawienia Viewer i widok startowy
│   ├── eventBus.ts             # eksport instancji UPEvent
│   ├── globalEvents.ts         # klasa UPEvent<T>
│   ├── tools.ts                # TOOLS_KEYS, Tools map, getTool()
│   ├── url.ts                  # serializacja / deserializacja URL
│   ├── utils.ts                # narzędzia pomocnicze
│   ├── viewsBookmarks.ts       # logika zakładek widoków
│   ├── base/
│   │   └── layers.ts           # abstrakcyjna klasa LayerBase<T>
│   ├── customs/                # logika własna / projektowa
│   │   ├── customTools.ts      # CUSTOM_TOOLS_IDS + CustomTools map
│   │   └── layersFilters.ts    # własne filtry i style warstw 3D Tiles
│   ├── globe/
│   │   ├── globe.ts            # GlobeService + globeInstance + initGlobeInstance()
│   │   ├── layersManager.ts    # LayersManager + klasy warstw (OSMLayer, etc.)
│   │   ├── events.ts           # GlobeEvent (kliknięcia na glob)
│   │   ├── measurements.ts     # MeasurementsService
│   │   ├── draw.ts             # DrawService (szkice)
│   │   ├── floodSim.ts         # FloodSim (symulacja powodzi)
│   │   ├── profile.ts          # ProfileManager (profil terenu)
│   │   ├── time.ts             # TimeManager (zegar, cienie słońca)
│   │   └── userPositions.ts    # UserPositionService (GPS)
│   └── nearestRouteFinder/
│       ├── graphCreator.ts     # deserializacja zoptymalizowanego grafu tras (pre-compute edge.key)
│       ├── routeFinder.ts      # algorytm A* + zarządzanie trasami
│       └── types.ts            # typy grafu (GraphNode, GeoJsonFile)
│
├── stores/
│   ├── index.ts                # barrel export
│   ├── common.ts               # useCommonStore
│   ├── tools.ts                # useToolsStore
│   ├── dialog.ts               # useDialogStore
│   └── notify.ts               # useNotifyStore
│
└── types/
    ├── actions.ts              # schematy Zod + typy akcji
    ├── customs.ts              # typy własne (metadane budynków UPWR)
    ├── layers.ts               # schematy Zod + typy warstw
    ├── localDBs.ts             # typy IndexedDB / localStorage
    ├── ui.ts                   # schematy Zod + typy UI (ActionButton, UiSchema)
    ├── utils.ts                # typy pomocnicze
    ├── viewsBookmarks.ts       # typy zakładek widoków
    └── cesium-extensions.d.ts  # rozszerzenia typów Cesium (np. customPopUpId)

public/
├── _headers                   # nagłówki HTTP (Cloudflare Pages)
├── _redirects                 # przekierowania (Cloudflare Pages)
├── graphs/
│   ├── bike_graph.json        # graf rowerowy
│   ├── car_graph.json         # graf samochodowy
│   └── foot_graph.json        # graf pieszy
└── properties/
    ├── beginningNodes.json    # węzły startowe tras (wejścia do kampusu)
    ├── layers.json            # ← konfiguracja warstw mapy
    ├── ui.json                # ← konfiguracja przycisków UI
    ├── customs/
    │   └── upwrBuildingsMetadata.json  # metadane budynków UPWR
    └── generatedRoutes/
        ├── bike_routes_results.json
        ├── car_routes_results.json
        └── foot_routes_results.json
```

---

## 6. Pliki konfiguracyjne (public/)

Pliki JSON w `public/properties/` są pobierane przez przeglądarkę w czasie działania aplikacji (**nie** są wbudowane w bundle). Można je edytować bez ponownego budowania aplikacji.

### `public/properties/layers.json`

Tablica obiektów `LayersUnionType`. Każdy obiekt musi zawierać:
- `type` — typ warstwy: `osm | xyz | wms | 3dtiles | czml | terrain | geojson`
  *(typ `wmts` jest w enum, ale nie jest obsługiwany przez `LayersFactory`)*
- `id` — unikalny string (używany w `LayersManager.layers.get(id)`)
- `name` — string lub `{ pl: string, en: string }`
- `active` — `true` jeśli warstwa ma być domyślnie włączona
- `parent` — opcjonalny: `demLayers | basemaps | 3dLayers | campus3D | vectorLayers`
- Pola specyficzne dla typu: `ionId` (3dtiles/czml/terrain), `url` (xyz/wms)

### `public/properties/ui.json`

Konfiguracja przycisków interfejsu — walidowana przez `UiSchema` (Zod).
Każda z sześciu sekcji to tablica `ActionButtonWithActionType[]`.

### `public/properties/beginningNodes.json`

Węzły startowe algorytmu A* — punkty wejść na kampus.

### `public/graphs/*.json`

Grafy tras dla pieszych, rowerzystów i samochodów. Pliki są duże i wyłączone z precache PWA — ładowane na żądanie przez RouteFinder.

---

## 7. Konwencje kodowania

1. **Vue Composition API** z `<script setup lang="ts">` we wszystkich nowych komponentach.
2. **Zod** do walidacji wszystkich zewnętrznych danych JSON. Nowe typy danych powinny mieć schemat Zod w `src/types/`.
3. **Importy aliasowane**: `@/` wskazuje na `src/`. Używaj zawsze `@/` zamiast relatywnych ścieżek (`../..`).
4. **Dynamiczne importy** dla komponentów narzędzi (`await import(...)`) — utrzymuje małe chunki.
5. **`globeInstance`** jest dostępny globalnie z `@/services/globe/globe`. Nie przekazuj Viewera przez props.
6. **Stores** importowane zawsze z `@/stores` (barrel), nie bezpośrednio z pliku store.
7. **Tłumaczenia** w komponentach przez `$t('klucz')`. Dynamiczne (z obiektu `{ pl, en }`) przez `useDynamicTranslation()`.
8. **Ikony**: wyłącznie z `@mdi/font` (prefiks `mdi-`). Lista: https://pictogrammers.com/library/mdi/
9. **Motywy Vuetify**: używaj tokenów CSS (`rgb(var(--v-theme-primary))`), nie hardkoduj kolorów.
10. **Konwencja nazw**:
    - Komponenty Vue: `PascalCase`
    - Pliki usług/composables: `camelCase`
    - Stałe: `SCREAMING_SNAKE_CASE`
    - Typy/interfejsy: sufiks `Type` dla Zod infer (`LayersUnionType`), sufiks `Schema` dla obiektu Zod (`LayersUnionSchema`)

---

## 8. Jak dodawać nowe rzeczy

### 8.1 Nowa warstwa mapy

Edytuj `public/properties/layers.json` i dodaj nowy obiekt:

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

**Warunki:**
- `id` musi być unikalne w całym pliku.
- Dla `3dtiles`, `czml` i `terrain` wymagany jest `ionId` (ID assetu w Cesium Ion).
- Warstwa jest automatycznie ładowana i dodawana do drzewa warstw — bez zmian w kodzie TS/Vue.

Jeśli chcesz dodać **nowy typ warstwy** nieobsługiwany przez istniejące klasy, patrz sekcja [8.10](#810-nowy-typ-warstwy).

---

### 8.2 Nowe narzędzie (Tool)

**Krok 1** — Utwórz komponent w `src/components/tools/`:

```vue
<!-- src/components/tools/MyNewTool.vue -->
<template>
    <v-card-text class="pa-1 ma-0">
        <p>{{ $t('myNewTool') }}</p>
        <!-- Treść narzędzia -->
    </v-card-text>
</template>

<script lang="ts" setup>
import { globeInstance } from '@/services/globe/globe'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// logika narzędzia...
</script>
```

**Krok 2** — Dodaj ID do `TOOLS_KEYS` w `src/services/tools.ts`:

```ts
export const TOOLS_KEYS = [
    // ... istniejące klucze
    'myNewTool',   // ← dodaj tutaj
    ...CUSTOM_TOOLS_IDS,
] as const
```

**Krok 3** — Dodaj lazy import do obiektu `Tools` w tym samym pliku:

```ts
export const Tools: Record<ToolsKeys, Tool> = {
    // ... istniejące
    myNewTool: (await import('@/components/tools/MyNewTool.vue')).default,  // ← tutaj
    ...CustomTools,
}
```

**Krok 4** — Dodaj tłumaczenia (patrz sekcja [8.8](#88-nowe-tłumaczenie-i18n)).

**Krok 5** — Opcjonalnie dodaj przycisk w `public/properties/ui.json` (sekcja [8.5](#85-nowy-przycisk-na-pasku-narzędzi)).

---

### 8.3 Nowe narzędzie własne (Custom Tool)

Custom tools to narzędzia specyficzne dla projektu (np. popup z informacjami o budynkach UPWR).

**Krok 1** — Utwórz komponent w `src/components/customs/`.

**Krok 2** — Zarejestruj w `src/services/customs/customTools.ts`:

```ts
export const CUSTOM_TOOLS_IDS = [
    'upwrBuildingInfoPopUp',
    'myCustomPopUp',   // ← dodaj ID
] as const

export const CustomTools: Record<ToolsKeys, Component> = {
    upwrBuildingInfoPopUp: (await import('@/components/customs/UpwrBuildingPopUp.vue')).default,
    myCustomPopUp: (await import('@/components/customs/MyCustomPopUp.vue')).default,  // ← i komponent
}
```

ID jest automatycznie dodawane do `TOOLS_KEYS` przez spread `...CUSTOM_TOOLS_IDS` w `tools.ts`.

---

### 8.4 Nowa akcja (Action)

**Krok 1** — Dodaj schemat Zod w `src/types/actions.ts`:

```ts
export const MyNewActionSchema = z.object({
    actionId: z.literal('myNewAction'),
    someParam: z.string(),
})

// Dodaj do discriminated union:
export const ActionSchema = z.discriminatedUnion('actionId', [
    ToggleToolActionSchema,
    // ... istniejące
    MyNewActionSchema,   // ← tutaj
])
```

**Krok 2** — Dodaj handler w `src/services/actions.ts`:

```ts
const myNewAction = (config: Action) => {
    if (config.actionId !== 'myNewAction') return
    // logika akcji...
    actionPerformed.raiseEvent(config)
}

const ACTION_HANDLERS: { [key in ActionsIds]: (config: Action) => void } = {
    // ... istniejące
    myNewAction,   // ← tutaj
}
```

---

### 8.5 Nowy przycisk na pasku narzędzi

Edytuj `public/properties/ui.json` i dodaj obiekt do odpowiedniej sekcji:

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

Wybór sekcji:
- **`toolsButtons`** — menu "Narzędzia" (hamburgera) — zalecane dla większości narzędzi
- **`toolbarActionButtons`** / **`toolbarEndActionButtons`** — główny pasek (desktop)
- **`mobileToolbarActionButtons`** / **`mobileToolbarEndActionButtons`** — główny pasek (mobile)

---

### 8.6 Nowy sklep (Pinia Store)

Utwórz plik w `src/stores/` zgodnie z Setup Store API:

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

Dodaj eksport do `src/stores/index.ts`:

```ts
export * from './myFeature'
```

---

### 8.7 Nowa usługa globu (Globe Service)

**Krok 1** — Utwórz klasę w `src/services/globe/`:

```ts
// src/services/globe/myService.ts
import type { Viewer } from '@cesium/widgets'

export class MyService {
    constructor(private _viewer: Viewer) {}

    doSomethingOnGlobe() {
        // logika CesiumJS...
    }
}
```

**Krok 2** — Zintegruj z `GlobeService` w `src/services/globe/globe.ts`:

```ts
// Prywatne pole:
private _myService: MyService | null = null

// Getter:
get myService(): MyService {
    if (!this._myService) throw new Error('MyService is not initialized')
    return this._myService
}

// Inicjalizacja w initServices():
const { MyService } = await import('./myService')
this._myService = new MyService(this._viewer)
```

**Krok 3** — Użycie w dowolnym miejscu:

```ts
import { globeInstance } from '@/services/globe/globe'
globeInstance.myService.doSomethingOnGlobe()
```

---

### 8.8 Nowe tłumaczenie (i18n)

Dodaj klucz do obu plików JSON:

```json
// src/i18n/locales/pl.json
{ "myNewTool": "Moje nowe narzędzie" }

// src/i18n/locales/en.json
{ "myNewTool": "My New Tool" }
```

Użycie w szablonie:
```html
<span>{{ $t('myNewTool') }}</span>
```

Użycie w `<script setup>`:
```ts
const { t } = useI18n()
console.log(t('myNewTool'))
```

---

### 8.9 Nowy filtr warstwy

Filtry warstw pozwalają dynamicznie stylizować warstwy 3D Tiles po ich załadowaniu.

W `src/services/customs/layersFilters.ts`:

```ts
// Dodaj ID do typu:
export type FilterIds = 'upwrLOD1Buildings' | 'myNewLayerId'

// Utwórz funkcję filtrującą:
const myNewLayerFilter = async (id: FilterIds) => {
    const layer = globeInstance.layers.layers.get(id)
    if (layer?.classType !== '3dTiles' || !layer._layer) return

    layer._layer.style = new Cesium3DTileStyle({
        color: "color('red')",
    })
}

// Dodaj wywołanie do applyLayerFilter:
export const applyLayerFilter = (id: string) => {
    if (id === 'upwrLOD1Buildings') upwrLoD1Filter(id as FilterIds)
    if (id === 'myNewLayerId') myNewLayerFilter(id as FilterIds)  // ← tutaj
}
```

`applyLayerFilter(id)` jest wywoływane automatycznie przez `LayersManager` po załadowaniu każdej warstwy.

---

### 8.10 Nowy typ warstwy

Jeśli istniejące typy (`osm`, `xyz`, `wms`, `3dtiles`, `czml`, `terrain`, `geojson`) nie są wystarczające:

**Krok 1** — Dodaj schemat Zod w `src/types/layers.ts`:

```ts
export const MyNewLayerSchema = LayerBaseSchema.extend({
    type: z.literal('myNewType'),
    mySpecialField: z.string(),
})

export type MyNewLayerType = z.infer<typeof MyNewLayerSchema>

export const LayersUnionSchema = z.discriminatedUnion('type', [
    // ... istniejące
    MyNewLayerSchema,  // ← tutaj
])
```

**Krok 2** — Utwórz klasę w `src/services/globe/layersManager.ts`, dziedzicząc po `LayerBase<T>`:

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
        // logika inicjalizacji Cesium...
        return this._layer!
    }

    addToGlobe(): void { /* dodaj do sceny Cesium */ }
    destroy(): void { /* usuń z sceny */ }
    getName(): string { return this._config.id! }
    getType(): string { return 'myNewType' }
}
```

> **Uwaga:** Jeśli nowy typ warstwy wymaga niestandardowej logiki widoczności (np. jak `TerrainLayer`), możesz zaimplementować klasę **bez dziedziczenia** z `LayerBase<T>` i zdefiniować własne metody `setVisibility()` i `isVisible()`. Pamiętaj wtedy o aktualizacji typu `LayersClassTypes` w tym samym pliku.

**Krok 3** — Dodaj przypadek do `LayersFactory` w tym samym pliku:

```ts
const LayersFactory = (config: LayersUnionType, viewer: Viewer) => {
    switch (config.type) {
        // ... istniejące
        case 'myNewType': return new MyNewLayer(viewer, config)
    }
}
```

---

## 9. Motywy (Vuetify Theming)

Motywy skonfigurowane w `src/vuetify.ts`. Kolory marki UPWR:

```ts
export const upwrBrandColors = {
    burgundy: '#c7364e',         // → primary
    burgundyDark: '#7a1f2f',     // → używany do zaznaczenia na globie
    amberAccent: '#FFC107',      // → accent
    slateGrey: '#455A64',        // → secondary
}
```

Aktywny motyw zapisywany jest w `localStorage` pod kluczem `upRouteTheme`.
Przełączanie motywu przez `AppSettings.vue` (`vuetify.theme.global.name.value = 'dark'`).

W CSS i komponentach — używaj tokenów Vuetify:
```css
color: rgb(var(--v-theme-primary));
background: rgb(var(--v-theme-surface));
```

---

## 10. PWA i Service Worker

Aplikacja jest skonfigurowana jako PWA w `vite.config.ts` przez `vite-plugin-pwa`:

- **Auto-update**: SW aktualizuje się automatycznie. Po instalacji nowej wersji strona jest przeładowywana.
- **Precache**: Style, skrypty, HTML, obrazy, pliki JSON (poza grafami tras).
- **Wyłączone z precache**: `public/graphs/*.json` — duże pliki grafów (~MB), ładowane na żądanie przez `RouteFinder`.
- **Max rozmiar pliku w cache**: 20 MB.

Po każdym `npm run build` generowane są `dist/sw.js` i `dist/manifest.webmanifest`.
