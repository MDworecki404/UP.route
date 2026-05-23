/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.dat' {
    const src: string
    export default src
}
