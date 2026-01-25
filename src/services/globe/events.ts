import { useToolsStore } from '@/stores'
import type { ScreenSpaceEventHandler } from '@cesium/engine'
import { Cesium3DTileFeature, Color, defined, ScreenSpaceEventType } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { performAction } from '../actions'
import { customObjectClicked, objectClicked } from '../eventBus'
import type { ToolsKeys } from '../tools'

export class GlobeEvent {
    private selectColor = Color.fromCssColorString('#7a1f2f').withAlpha(0.7)
    private _selectedObject = {
        object: null as unknown,
        previousObject: null as unknown,
        lastColor: Color.WHITE,
        unSelect: () => {
            if (this._selectedObject.object) {
                if (this.check(Cesium3DTileFeature, this._selectedObject.object)) {
                    this._selectedObject.object.color = this._selectedObject.lastColor
                }
                this._selectedObject.previousObject = this._selectedObject.object
                this._selectedObject.object = null
            }
        },
    }

    constructor(private _viewer: Viewer) {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this.setDefaultEvents()
    }

    private unPackProperties(pickedObject: unknown): Record<string, unknown> | null {
        if (this.check(Cesium3DTileFeature, pickedObject)) {
            const properties: Record<string, unknown> = {}
            const propertyIds = pickedObject.getPropertyIds()

            propertyIds.forEach((id: string) => {
                properties[id] = pickedObject.getProperty(id)
            })

            return properties
        }

        if (this.check(Cesium3DTileFeature, pickedObject)) {
            const properties: Record<string, unknown> = {}
            const propertyIds = pickedObject.getPropertyIds()

            propertyIds.forEach((id: string) => {
                properties[id] = pickedObject.getProperty(id)
            })

            return properties
        }

        return null
    }

    private check<T>(type: new (...args: unknown[]) => T, object: unknown): object is T {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        if (object instanceof type) {
            return true
        }
        return false
    }

    private setSelectedObject(pickedObject: unknown) {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        if (this.check(Cesium3DTileFeature, pickedObject)) {
            this._selectedObject.previousObject = this._selectedObject.object
            this._selectedObject.lastColor = pickedObject.color
            pickedObject.color = this.selectColor
            this._selectedObject.object = pickedObject
        }
    }

    private defaultMouseMoveEvent(e: ScreenSpaceEventHandler.MotionEvent): void {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        const pickedObject = this._viewer.scene.pick(e.endPosition)

        if (defined(pickedObject)) {
            this._viewer.canvas.style.cursor = 'pointer'
        } else {
            this._viewer.canvas.style.cursor = 'default'
        }
    }

    private defaultLeftClickEvent(e: ScreenSpaceEventHandler.PositionedEvent): void {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        this._selectedObject.unSelect()

        const pickedObject = this._viewer.scene.pick(e.position)

        if (defined(pickedObject)) {
            this.setSelectedObject(pickedObject)

            const properties = this.unPackProperties(pickedObject)

            if (!properties) {
                return
            }

            const toolsStore = useToolsStore()

            if (this.check(Cesium3DTileFeature, pickedObject)) {
                if (pickedObject.tileset.customPopUpId) {
                    if (
                        toolsStore.activeTools.has(pickedObject.tileset.customPopUpId) ||
                        toolsStore.mobileActiveTool?.id === pickedObject.tileset.customPopUpId
                    ) {
                        customObjectClicked.raiseEvent({
                            id: pickedObject.tileset.customPopUpId as ToolsKeys,
                            data: properties,
                        })
                    } else {
                        performAction({
                            actionId: 'toggleTool',
                            icon: 'mdi-information-box-outline',
                            toolId: pickedObject.tileset.customPopUpId as ToolsKeys,
                            props: { initialData: properties },
                            width: 450,
                        })
                    }

                    return
                }
            }

            if (
                toolsStore.activeTools.has('objectInfo') ||
                toolsStore.mobileActiveTool?.id === 'objectInfo'
            ) {
                objectClicked.raiseEvent(properties)
            } else {
                performAction({
                    actionId: 'toggleTool',
                    icon: 'mdi-information-box-outline',
                    toolId: 'objectInfo',
                    props: { initialData: properties },
                    width: 450,
                })
            }
        }
    }

    public setDefaultEvents(): void {
        this._viewer.screenSpaceEventHandler.setInputAction(
            (e: ScreenSpaceEventHandler.PositionedEvent) => this.defaultLeftClickEvent(e),
            ScreenSpaceEventType.LEFT_CLICK,
        )

        this._viewer.screenSpaceEventHandler.setInputAction(
            (e: ScreenSpaceEventHandler.MotionEvent) => this.defaultMouseMoveEvent(e),
            ScreenSpaceEventType.MOUSE_MOVE,
        )
    }
}
