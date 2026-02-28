import { useToolsStore } from '@/stores'
import { type ScreenSpaceEventHandler, Entity } from '@cesium/engine'
import { Cesium3DTileFeature, Color, defined, ScreenSpaceEventType } from '@cesium/engine'
import type { Viewer } from '@cesium/widgets'
import { performAction } from '../actions'
import { customObjectClicked, objectClicked } from '../eventBus'
import type { ToolsKeys } from '../tools'
import { Cartographic } from '@cesium/engine'

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
                // Entities currently do not change appearance, nothing to revert
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

    public unPackProperties(pickedObject: unknown): Record<string, unknown> | null {
        if (pickedObject && typeof pickedObject === 'object' && 'id' in pickedObject) {
            const inner = (pickedObject as { id: unknown }).id
            if (inner instanceof Entity) {
                pickedObject = inner
            }
        }

        if (this.check(Cesium3DTileFeature, pickedObject)) {
            const properties: Record<string, unknown> = {}
            const propertyIds = pickedObject.getPropertyIds()

            propertyIds.forEach((id: string) => {
                properties[id] = pickedObject.getProperty(id)
            })

            return properties
        }

        if (pickedObject instanceof Entity) {
            const properties: Record<string, unknown> = {}
            const bag = pickedObject.properties
            if (bag) {
                const names = bag.propertyNames
                names.forEach((name: string) => {
                    try {
                        properties[name] = bag[name]?.getValue?.(this._viewer.clock.currentTime)
                    } catch {
                        properties[name] = bag[name]
                    }
                })
            }
            return properties
        }

        return null
    }

    private check<T>(type: new (...args: unknown[]) => T, object: unknown): object is T {
        if (!this._viewer) {
            throw new Error('Viewer is not initialized')
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        return object instanceof (type as Function)
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
            return
        }

        if (pickedObject instanceof Entity) {
            this._selectedObject.previousObject = this._selectedObject.object
            this._selectedObject.object = pickedObject
            return
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

            if (!properties || Object.keys(properties).length === 0) {
                return
            }

            const toolsStore = useToolsStore()

            let clickCartographic: Cartographic | undefined

            if (this.check(Cesium3DTileFeature, pickedObject)) {
                const clickCartesian = this._viewer.scene.pickPosition(e.position)
                if (clickCartesian) {
                    clickCartographic = Cartographic.fromCartesian(clickCartesian)
                }
            } else {
                const entity =
                    pickedObject instanceof Entity
                        ? pickedObject
                        : pickedObject &&
                            typeof pickedObject === 'object' &&
                            'id' in pickedObject &&
                            (pickedObject as { id: unknown }).id instanceof Entity
                          ? ((pickedObject as { id: unknown }).id as Entity)
                          : null

                if (entity?.position) {
                    const cartesian = entity.position.getValue(this._viewer.clock.currentTime)
                    if (cartesian) {
                        clickCartographic = Cartographic.fromCartesian(cartesian)
                    }
                }
                if (!clickCartographic) {
                    const clickCartesian = this._viewer.scene.pickPosition(e.position)
                    if (clickCartesian) {
                        clickCartographic = Cartographic.fromCartesian(clickCartesian)
                    }
                }
            }

            if (!clickCartographic) return

            if (this.check(Cesium3DTileFeature, pickedObject)) {
                if (pickedObject.tileset.customPopUpId) {
                    if (toolsStore.activeTools.has(pickedObject.tileset.customPopUpId)) {
                        if (
                            toolsStore.activeTools.get(pickedObject.tileset.customPopUpId)
                                ?.isMinimized
                        ) {
                            toolsStore.restoreTool(pickedObject.tileset.customPopUpId)
                            toolsStore.activeTools.get(pickedObject.tileset.customPopUpId)!.props =
                                { initialData: properties }
                            return
                        }

                        customObjectClicked.raiseEvent({
                            id: pickedObject.tileset.customPopUpId as ToolsKeys,
                            data: properties,
                        })
                    } else {
                        performAction({
                            actionId: 'toggleTool',
                            icon: 'mdi-information-box-outline',
                            toolId: pickedObject.tileset.customPopUpId as ToolsKeys,
                            props: {
                                initialData: properties,
                                coordinates: [
                                    clickCartographic.longitude,
                                    clickCartographic.latitude,
                                ],
                            },
                            width: 450,
                        })
                    }

                    return
                }
            }

            if (toolsStore.activeTools.has('objectInfo')) {
                objectClicked.raiseEvent({
                    initialData: properties,
                    coordinates: [clickCartographic.longitude, clickCartographic.latitude],
                })
            } else {
                performAction({
                    actionId: 'toggleTool',
                    icon: 'mdi-information-box-outline',
                    toolId: 'objectInfo',
                    props: {
                        initialData: properties,
                        coordinates: [clickCartographic.longitude, clickCartographic.latitude],
                    },
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
