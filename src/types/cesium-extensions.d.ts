import '@cesium/engine'

declare module '@cesium/engine' {
    interface Cesium3DTileset {
        appId?: string
        name?: string
        parent?: string
        customPopUpId?: string
    }

    interface ImageryLayer {
        appId?: string
        name?: string
        parent?: string
    }

    interface GeoJsonDataSource {
        appId?: string
        name?: string
        parent?: string
    }

    interface CesiumTerrainProvider {
        appId?: string
        name?: string
        parent?: string
    }

    interface CustomDataSource {
        appId?: string
        name?: string
        parent?: string
    }

    interface DataSource {
        appId?: string
        name?: string
        parent?: string
    }

    interface CzmlDataSource {
        appId?: string
        name?: string
        parent?: string
    }
}
