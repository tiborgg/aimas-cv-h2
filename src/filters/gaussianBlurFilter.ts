import { Kernel } from './kernel';
import { ConvolutionFilter } from './convolutionFilter';

function getKernelVector( radius: number ) {

    let r = Math.ceil( radius );
    let rows = r * 2 + 1;
    let matrix: number[] = [];
    let sigma = radius / 3;
    let sigma22 = 2 * sigma * sigma;
    let sigmaPi2 = 2 * Math.PI * sigma;
    let sqrtSigmaPi2 = Math.sqrt( sigmaPi2 );
    let radius2 = radius * radius;
    let total = 0;
    let index = 0;
    for ( let row = -r; row <= r; row++ ) {
        let distance = row * row;
        if ( distance > radius2 )
            matrix[ index ] = 0;
        else
            matrix[ index ] = Math.exp( -( distance ) / sigma22 ) / sqrtSigmaPi2;
        total += matrix[ index ];
        index++;
    }
    for ( let i = 0; i < rows; i++ )
        matrix[ i ] /= total;

    return matrix;
}

function getHKernel( radius: number ) {
    let matrix = getKernelVector( radius );
    return new Kernel( matrix.length, 1, matrix );
}
function getVKernel( radius: number ) {
    let matrix = getKernelVector( radius );
    return new Kernel( 1, matrix.length, matrix );
}

export function applyGaussianBlurFilter(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number ) {

    let filter = new GaussianBlurFilter( { radius } );
    filter.filter( srcData, dstData, width, height );
}

export function applyGaussianGrayBlurFilter(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number ) {

    let filter = new GaussianBlurFilter( { radius } );
    filter.filterGray( srcData, dstData, width, height );
}

export interface GaussianBlurFilterOptions {
    radius: number
}

export class GaussianBlurFilter
    extends ConvolutionFilter {

    readonly radius = 5;

    constructor(
        options: Partial<GaussianBlurFilterOptions> ) {
        super();
        this.setOptions( options );
    }

    setOptions( options: Partial<GaussianBlurFilterOptions> ) {
        Object.assign( this, options );
    }

    applyToCanvas( canvas: HTMLCanvasElement ) {

        return this.baseApplyToCanvas( canvas, this.filter.bind( this ) );
    }

    filter(
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let tmpData = new Uint8ClampedArray( width * height * 4 );

        let hKernel = getHKernel( this.radius );
        let vKernel = getVKernel( this.radius );

        this.convolveH( hKernel, srcData, tmpData, width, height );
        this.convolveV( vKernel, tmpData, dstData, width, height );
    }

    filterGray(
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let tmpData = new Uint8ClampedArray( width * height );

        let hKernel = getHKernel( this.radius );
        let vKernel = getVKernel( this.radius );
        
        this.convolveHGray( hKernel, srcData, tmpData, width, height );
        this.convolveVGray( vKernel, tmpData, dstData, width, height );
    }

}