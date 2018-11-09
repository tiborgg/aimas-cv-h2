import { Kernel, convolveUint8ClampedRgba } from './convolution';

export function getBoxKernel( radius: number ) {

    radius = Math.ceil( radius );
    let size = radius * 2 + 1;

    let matrix = new Array( size * size );
    matrix.fill( 1 / ( size * size ) );
    
    return new Kernel( size, size, matrix );
}

export function BoxUint8ClampedRgba( radius: number ) {
    return (
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) => {

        applyBoxUint8ClampedRgba( srcData, dstData, width, height, radius );
    }
}

export function applyBoxUint8ClampedRgba(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number ) {

    convolveUint8ClampedRgba( getBoxKernel( radius ), srcData, dstData, width, height );
}