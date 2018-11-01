export type ImageFilterCallback = (
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number ) => void;

export abstract class ImageFilter {

    protected baseApplyToImageData(
        imgData: ImageData,
        filter: ImageFilterCallback ) {

        let { width, height } = imgData;
        let dstData = new Uint8ClampedArray( width * height * 4 );

        filter( imgData.data, dstData, width, height );

        return new ImageData( dstData, width, height );
    }

    protected baseApplyToCanvasContext(
        ctx: CanvasRenderingContext2D,
        filter: ImageFilterCallback ) {

        let canvas = ctx.canvas;
        let { width, height } = canvas;

        let dstImgData = this.baseApplyToImageData(
            ctx.getImageData( 0, 0, width, height ),
            filter );

        ctx.putImageData( dstImgData, 0, 0, 0, 0, width, height );
        return this;
    }

    protected baseApplyToCanvas(
        canvas: HTMLCanvasElement,
        filter: ImageFilterCallback ) {

        this.baseApplyToCanvasContext( canvas.getContext( '2d' ), filter );
        return this;
    }
}