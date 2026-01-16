import { JulianDate } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'

export class TimeManager {
    private _defaultJulianDate: JulianDate = JulianDate.fromDate(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0, 0),
    )
    private _actualTimeMs: number = Date.now()

    constructor(private _viewer: Viewer) {
        this.setTime(JulianDate.toDate(this._defaultJulianDate).getTime())
    }

    public setTime(timeMs: number): void {
        this._actualTimeMs = timeMs
        const julianDate = JulianDate.fromDate(new Date(this._actualTimeMs))
        this._viewer.clock.currentTime = julianDate
    }

    public getTime(): number {
        return this._actualTimeMs
    }

    public resetToDefaultTime(): void {
        this.setTime(JulianDate.toDate(this._defaultJulianDate).getTime())
    }

    public setToActualTime(): void {
        this.setTime(Date.now())
    }
}
