import type { DataSource } from '@cesium/engine'
import { HeightReference } from '@cesium/engine'
import { Cartesian3 } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { Color, CustomDataSource } from '@cesium/engine'
import { upwrBrandColors } from '@/vuetify'
import { LabelStyle } from '@cesium/engine'
import { Cartesian2 } from '@cesium/engine'

export class UserPositionService {
    private _userPositionLayer: DataSource | null = null
    private _watchId: number | null = null

    constructor(private _viewer: Viewer) {
        this.registerUserPositionLayer()
    }

    private registerUserPositionLayer() {
        if (!this._userPositionLayer) {
            this._userPositionLayer = new CustomDataSource('userPositionLayer')
            this._viewer.dataSources.add(this._userPositionLayer)
        }
    }

    enableUserPositionTracking() {
        if (!this._userPositionLayer) {
            console.error('UserPositionService layer is not initialized')
            return
        }

        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser')
            return
        }

        this._watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords

                const accuracyMeters = Math.max(1, Math.round(accuracy))

                let accuracyColor = Color.fromCssColorString('#2E7D32')
                if (accuracyMeters > 50) accuracyColor = Color.fromCssColorString('#FFB300')
                if (accuracyMeters > 150) accuracyColor = Color.fromCssColorString('#D32F2F')

                this._userPositionLayer!.entities.removeAll()

                this._userPositionLayer!.entities.add({
                    position: Cartesian3.fromDegrees(longitude, latitude),
                    point: {
                        pixelSize: accuracyMeters > 50 ? 10 : 14,
                        color: Color.fromCssColorString(upwrBrandColors.burgundyDark),
                        outlineColor: Color.WHITE,
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        heightReference: HeightReference.CLAMP_TO_GROUND,
                    },
                })

                this._userPositionLayer!.entities.add({
                    position: Cartesian3.fromDegrees(longitude, latitude),
                    ellipse: {
                        semiMajorAxis: accuracyMeters,
                        semiMinorAxis: accuracyMeters,
                        material: accuracyColor.withAlpha(0.18),
                        outline: true,
                        outlineColor: accuracyColor.withAlpha(0.6),
                        heightReference: HeightReference.CLAMP_TO_GROUND,
                    },
                })

                this._userPositionLayer!.entities.add({
                    position: Cartesian3.fromDegrees(longitude, latitude),
                    label: {
                        text: `${accuracyMeters} m`,
                        font: '14px Roboto, Arial',
                        fillColor: Color.WHITE,
                        style: LabelStyle.FILL_AND_OUTLINE,
                        outlineColor: Color.BLACK,
                        outlineWidth: 2,
                        eyeOffset: new Cartesian3(0, 0, -50),
                        pixelOffset: new Cartesian2(0, -30),
                    },
                })
            },
            (error) => {
                console.error('Error watching position:', error)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
            },
        )

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords
            this._viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(longitude, latitude, 1000),
                duration: 1.5,
            })
        })
    }

    disableUserPositionTracking() {
        if (!this._userPositionLayer) {
            console.error('UserPositionService layer is not initialized')
            return
        }

        this._userPositionLayer.entities.removeAll()

        if (navigator.geolocation && this._watchId !== null) {
            navigator.geolocation.clearWatch(this._watchId)
            this._watchId = null
        }
    }
}
