declare module 'gifencoder' {
    import { ReadStream, WriteStream } from "fs";
    class GIFEncoder {
        constructor(width: number, height: number)
        createReadStream(rs?: ReadStream): ReadStream
        createWriteStream(options?: CreateWriteStreamOptions): WriteStream
        start(): void
        emit(): void
        setRepeat(arg: number): void
        setDelay(arg: number): void
        setQuality(arg: number): void
        setFrameRate(fps: number): void
        setDispose(disposeCode: number): void
        setTransparent(colour: string): void
        addFrame(frame: CanvasRenderingContext2D | Uint8ClampedArray): void
        finish(): void
    }

    interface CreateWriteStreamOptions {
        transparent?: string
        repeat?: number
        delay?: number
        quality?: number
        frameRate?: number
        dispose?: number
    }

    export = GIFEncoder
}