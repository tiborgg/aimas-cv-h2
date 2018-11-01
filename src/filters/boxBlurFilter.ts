import { Kernel } from './kernel';
import { ConvolutionFilter } from './convolutionFilter';

export class BoxBlurFilter
    extends ConvolutionFilter {


    applyToCanvas( canvas: HTMLCanvasElement ) {
        return this.baseApplyToCanvas( canvas, ( srcData, dstData, width, height ) => {
            this.convolveHV( this._getKernel(3), srcData, dstData, width, height );
        } );
    }

    private _getKernel( radius: number ) {

        radius = Math.ceil( radius );
        let size = radius * 2 + 1;

        let matrix = new Array( size * size );
        matrix.fill( 1 / ( size * size ) );

        return new Kernel( size, size, matrix );
    }
}
