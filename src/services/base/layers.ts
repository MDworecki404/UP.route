export abstract class LayerBase<T> {
    public abstract readonly classType: string
    public _layer: T | null = null

    abstract initialize(): Promise<T>

    abstract setVisibility(visible: boolean): void
    abstract isVisible(): boolean
    abstract destroy(): void
    abstract getName(): string
    abstract getType(): string

    abstract addToGlobe(): void
}
