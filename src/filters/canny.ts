import * as _ from 'lodash';
import { ConvolutionFilter } from './convolutionFilter';
import { applyGaussianGrayBlurFilter } from './gaussianBlurFilter';
import { getSobelXKernel, getSobelYKernel } from './sobelFilter';
import { rgbaToGray, grayToRgba } from './util';

const PI = Math.PI;
const PI_2 = Math.PI * 2;

// range for hysteresis thresholding
const HT_LOW = 0.075;
const HT_HIGH = 0.175;



export class CannyEdgeFilter
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

        const index = ( y, x ) => y * width + x;

        const logMatrix = ( name, arr ) => {

            console.log( name );

            let rows = [];
            for ( let y = 0; y < height; y++ ) {
                let row = Array( width );
                for ( let x = 0; x < width; x++ ) {
                    row[ x ] = arr[ index( y, x ) ];
                }
                rows[ y ] = row;
            }

            console.log( rows );
        }

        let grayData = new Uint8ClampedArray( width * height );
        let blurData = new Uint8ClampedArray( width * height );

        // convert the image to grayscale
        rgbaToGray( srcData, grayData );

        // apply gaussian filter
        applyGaussianGrayBlurFilter( blurData, blurData, width, height, 2 );

        // apply the sobel kernel and calculate the angle of the edge

        let tmpXData = new Float32Array( width * height );
        let tmpYData = new Float32Array( width * height );

        //logMatrix( 'tmpXData', grayData );

        this.baseConvolveSingleChannel( getSobelXKernel(), blurData, tmpXData, width, height );
        this.baseConvolveSingleChannel( getSobelYKernel(), blurData, tmpYData, width, height );

        //logMatrix( 'tmpXData', tmpXData );
        
        let angles = new Float32Array( width * height );
        let magnitudes = new Float32Array( width * height );

        for ( let i = 0; i < grayData.length; i++ ) {

            let a = Math.atan2(
                tmpYData[ i ],
                tmpXData[ i ] );

            a = ( a + PI_2 ) % PI_2; // normalize to [0, 2 * PI]
            a = a * 180 / PI; // convert to degrees for easier comparison

            angles[ i ] = a;

            magnitudes[ i ] = Math.sqrt(
                Math.pow( tmpXData[ i ], 2 ) +
                Math.pow( tmpYData[ i ], 2 ) );
        }

        //logMatrix( 'angles', angles );
        //logMatrix( 'magnitudes', magnitudes );


        // create a matrix which contains nearest angles in 45 degree increments
        let directions = new Float32Array( width * height );

        for ( let y = 0; y < height; y++ ) {

            for ( let x = 0; x < width; x++ ) {

                let i = index( y, x );
                let a = angles[ i ];

                if (
                    ( a >= 0 ) && ( a < 22.5 ) ||
                    ( a >= 157.5 ) && ( a < 202.5 ) ||
                    ( a >= 337.5 ) && ( a <= 360 ) )
                    directions[ i ] = 0;

                else if (
                    ( a >= 22.5 ) && ( a < 67.5 ) ||
                    ( a >= 202.5 ) && ( a < 247.5 ) )
                    directions[ i ] = 45;

                else if (
                    ( a >= 67.5 && a < 112.5 ) ||
                    ( a >= 247.5 && a < 292.5 ) )
                    directions[ i ] = 90;

                else if (
                    ( a >= 112.5 && a < 157.5 ) ||
                    ( a >= 292.5 && a < 337.5 ) )
                    directions[ i ] = 135;
            }
        }

        // apply non-maximum suppression
        let nonmax = new Uint8ClampedArray( width * height );
        nonmax.fill( 0 );

        const magnitude = ( y, x ) => magnitudes[ index( y, x ) ];

        for ( let y = 1; y < height - 1; y++ ) {
            for ( let x = 1; x < width - 1; x++ ) {

                let i = index( y, x );
                let d = directions[ i ];
                let m = magnitudes[ i ];

                if ( d === 0 ) {
                    nonmax[ i ] = +( m === Math.max( m,
                        magnitude( y, x + 1 ),
                        magnitude( y, x - 1 ) ) );
                }

                else if ( d === 45 ) {
                    nonmax[ i ] = +( m === Math.max( m,
                        magnitude( y + 1, x - 1 ),
                        magnitude( y - 1, x + 1 ) ) );
                }

                else if ( d === 90 ) {
                    nonmax[ i ] = +( m === Math.max( m,
                        magnitude( y + 1, x ),
                        magnitude( y - 1, x ) ) );
                }

                else if ( d === 135 ) {
                    nonmax[ i ] = +( m === Math.max( m,
                        magnitude( y + 1, x + 1 ),
                        magnitude( y - 1, x - 1 ) ) );
                }

                nonmax[ i ] *= m;
            }
        }

        // apply hysteresis thresholding
        // get the maximum intensity in the non-maximum suppression output
        let max = _.max( nonmax );

        // normalize the range of the thresholding
        let htLow = HT_LOW * max;
        let htHigh = HT_HIGH * max;

        let hystData = new Uint8ClampedArray( width * height );
        hystData.fill( 0 );

        for ( let y = 1; y < height - 1; y++ ) {
            for ( let x = 1; x < width - 1; x++ ) {

                let i = y * width + x;
                let yoffset = y * width;

                if ( nonmax[ i ] < htLow )
                    hystData[ i ] = 0;
                else if ( nonmax[ i ] > htHigh )
                    hystData[ i ] = 255;

                // using 8 - connected components
                else if (
                    nonmax[ yoffset + width + x ] > htHigh ||
                    nonmax[ yoffset - width + x ] > htHigh ||
                    nonmax[ yoffset + x + 1 ] > htHigh ||
                    nonmax[ yoffset + x - 1 ] > htHigh ||
                    nonmax[ yoffset - width + x - 1 ] > htHigh ||
                    nonmax[ yoffset - width + x + 1 ] > htHigh ||
                    nonmax[ yoffset + width + x + 1 ] > htHigh ||
                    nonmax[ yoffset + width + x - 1 ] > htHigh ) {
                    hystData[ i ] = 255;
                }
            }
        }

        grayToRgba( hystData, dstData );
    }
}
