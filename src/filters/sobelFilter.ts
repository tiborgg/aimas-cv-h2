import * as _ from 'lodash';

import { Kernel } from './kernel';
import { ConvolutionFilter } from './convolutionFilter';
import { rgbaToGray, grayToRgba } from './util';
import { GaussianBlurFilter } from './gaussianBlurFilter';

export function getSobelXKernel() {
    return new Kernel( 3, 3, [
        1, 0, -1,
        1, 0, -1,
        1, 0, -1
    ] );
}
export function getSobelYKernel() {
    return new Kernel( 3, 3, [
        1, 1, 1,
        0, 0, 0,
        -1, -1, -1
    ] );
}

export function applySobelFilter(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray,
    width: number,
    height: number ) {

    let filter = new SobelFilter();

    filter.filter( srcData, dstData, width, height ); ss
}

export class SobelFilter
    extends ConvolutionFilter {


    applyToCanvas( canvas: HTMLCanvasElement ) {

        return this.baseApplyToCanvas( canvas, ( srcData, dstData, width, height ) =>
            this.filter( srcData, dstData, width, height ) );
    }

    filter(
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let gaussian = new GaussianBlurFilter( { radius: 3 } );

        let blurData = new Uint8ClampedArray( width * height * 4 )
        gaussian.filter( srcData, blurData, width, height );

        let grayData = new Uint8ClampedArray( width * height );
        let tmpXData = new Uint8ClampedArray( width * height );
        let tmpYData = new Uint8ClampedArray( width * height );

        rgbaToGray( blurData, grayData );

        this.convolveHVGray( getSobelXKernel(), grayData, tmpXData, width, height );
        this.convolveHVGray( getSobelYKernel(), grayData, tmpYData, width, height );

        for ( let i = 0; i < tmpXData.length; i++ ) {
            grayData[ i ] = Math.sqrt(
                Math.pow( tmpXData[ i ], 2 ) +
                Math.pow( tmpYData[ i ], 2 ) );
        }

        grayToRgba( grayData, dstData );
    }
}