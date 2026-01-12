import type { Viewer } from '@cesium/engine'

export class GlobeService {
    private _viewer: Viewer | null = null

    constructor(viewer: Viewer) {
        this._viewer = viewer
    }

    get viewer(): Viewer {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }
        return this._viewer
    }
}
