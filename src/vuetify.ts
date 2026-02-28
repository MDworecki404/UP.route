import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles/main.css'
import './main.css'
import { getItemFromLocalStorage } from './services/utils'

export const upwrBrandColors = {
    burgundy: '#c7364e',
    burgundyDark: '#7a1f2f',
    amberAccent: '#FFC107',
    slateGrey: '#455A64',
}

export const forestColors = {
    forestGreen: '#2E7D32',
    forestGreenDark: '#1B5E20',
    mossAccent: '#8BC34A',
    earth: '#5D4037',
}

export const oceanColors = {
    ocean: '#0277BD',
    oceanDark: '#01579B',
    tealAccent: '#00BCD4',
    deepSlate: '#37474F',
}

export type ColorPalette = 'upwr' | 'forest' | 'ocean'

export const colorPaletteKey = 'upRouteColorPalette'

export function buildThemeName(palette: ColorPalette, dark: boolean): string {
    return dark ? `dark_${palette}` : `light_${palette}`
}

export function parseThemeName(themeName: string): { palette: ColorPalette; dark: boolean } {
    if (themeName.startsWith('dark_')) {
        return { palette: (themeName.replace('dark_', '') as ColorPalette) || 'upwr', dark: true }
    }
    if (themeName.startsWith('light_')) {
        return { palette: (themeName.replace('light_', '') as ColorPalette) || 'upwr', dark: false }
    }
    return { palette: 'upwr', dark: themeName === 'dark' }
}

// ── UPWR (burgundy) ──────────────────────────────────────────────────────────

const light = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: upwrBrandColors.burgundy,
        'on-primary': '#FFFFFF',
        secondary: upwrBrandColors.slateGrey,
        accent: upwrBrandColors.amberAccent,
        error: '#D32F2F',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
    },
}

const dark = {
    dark: true,
    colors: {
        background: '#121212',
        surface: '#111111',
        primary: upwrBrandColors.burgundy,
        'on-primary': '#FFFFFF',
        secondary: '#B0BEC5',
        accent: upwrBrandColors.amberAccent,
        error: '#EF5350',
        info: '#42A5F5',
        success: '#66BB6A',
        warning: '#FFA726',
    },
}

// ── Forest (green) ───────────────────────────────────────────────────────────

const lightForest = {
    dark: false,
    colors: {
        background: '#F9FBF7',
        surface: '#FFFFFF',
        primary: forestColors.forestGreen,
        'on-primary': '#FFFFFF',
        secondary: forestColors.earth,
        accent: forestColors.mossAccent,
        error: '#D32F2F',
        info: '#0288D1',
        success: '#388E3C',
        warning: '#F57F17',
    },
}

const darkForest = {
    dark: true,
    colors: {
        background: '#0D1F0E',
        surface: '#112413',
        primary: '#4CAF50',
        'on-primary': '#FFFFFF',
        secondary: '#A5D6A7',
        accent: forestColors.mossAccent,
        error: '#EF5350',
        info: '#42A5F5',
        success: '#66BB6A',
        warning: '#FFA726',
    },
}

// ── Ocean (blue/teal) ────────────────────────────────────────────────────────

const lightOcean = {
    dark: false,
    colors: {
        background: '#F3F8FC',
        surface: '#FFFFFF',
        primary: oceanColors.ocean,
        'on-primary': '#FFFFFF',
        secondary: oceanColors.deepSlate,
        accent: oceanColors.tealAccent,
        error: '#D32F2F',
        info: '#0288D1',
        success: '#4CAF50',
        warning: '#FB8C00',
    },
}

const darkOcean = {
    dark: true,
    colors: {
        background: '#07151F',
        surface: '#0D1E2A',
        primary: '#29B6F6',
        'on-primary': '#000000',
        secondary: '#80DEEA',
        accent: oceanColors.tealAccent,
        error: '#EF5350',
        info: '#42A5F5',
        success: '#66BB6A',
        warning: '#FFA726',
    },
}

const storedThemeName = getItemFromLocalStorage<string>('upRouteTheme') || 'light_upwr'

const resolvedDefaultTheme = ['light', 'dark'].includes(storedThemeName)
    ? buildThemeName('upwr', storedThemeName === 'dark')
    : storedThemeName

export const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: resolvedDefaultTheme,
        themes: {
            light_upwr: light,
            dark_upwr: dark,
            light_forest: lightForest,
            dark_forest: darkForest,
            light_ocean: lightOcean,
            dark_ocean: darkOcean,
        },
    },
})
