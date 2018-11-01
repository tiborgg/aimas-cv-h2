import { Kernel } from './kernel';
import { ImageFilter } from './imageFilter';

function clampChannel( val: number ) {
    return Math.min( 255, Math.max( 0, val ) );
}

export abstract class ConvolutionFilter
    extends ImageFilter {

    constructor( kernel?: Kernel ) {
        super();
    }

    abstract applyToCanvas( canvas: HTMLCanvasElement ): this;

    convolveH(
        kernel: Kernel,
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let index = 0;
        const { matrix } = kernel;
        const cols = kernel.width;
        const cols2 = Math.floor( cols / 2 );

        for ( let y = 0; y < height; y++ ) {

            let ioffset = y * width;
            for ( let x = 0; x < width; x++ ) {

                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;

                let moffset = cols2;
                for ( let col = -cols2; col <= cols2; col++ ) {

                    let f = matrix[ moffset + col ];
                    if ( f === 0 )
                        continue;

                    let ix = x + col;

                    // prevent the sampling position going out of the bounds of the image
                    // just clamp to the borders of the image if needed
                    if ( ix < 0 )
                        ix = 0;
                    else if ( ix >= width )
                        ix = width - 1;

                    let offset = ( ioffset + ix ) * 4;

                    r += f * srcData[ offset + 0 ];
                    g += f * srcData[ offset + 1 ];
                    b += f * srcData[ offset + 2 ];
                    a += f * srcData[ offset + 3 ];
                }

                dstData[ index++ ] = clampChannel( Math.floor( r + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( g + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( b + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( a + 0.5 ) );
            }
        }
    }

    convolveV(
        kernel: Kernel,
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let index = 0;
        const { matrix } = kernel;
        const rows = kernel.height;
        const rows2 = Math.floor( rows / 2 );

        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {

                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;

                for ( let row = -rows2; row <= rows2; row++ ) {

                    let f = matrix[ row + rows2 ];
                    if ( f === 0 )
                        continue;

                    let iy = y + row;
                    let ioffset;
                    if ( iy < 0 )
                        ioffset = 0;
                    else if ( iy >= height )
                        ioffset = ( height - 1 ) * width;
                    else
                        ioffset = iy * width;


                    let offset = ( ioffset + x ) * 4;

                    r += f * srcData[ offset + 0 ];
                    g += f * srcData[ offset + 1 ];
                    b += f * srcData[ offset + 2 ];
                    a += f * srcData[ offset + 3 ];
                }

                dstData[ index++ ] = clampChannel( Math.floor( r + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( g + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( b + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( a + 0.5 ) );
            }
        }
    }

    convolveHV(
        kernel: Kernel,
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let index = 0;
        let { matrix } = kernel;
        let rows = kernel.height;
        let cols = kernel.width;
        let rows2 = Math.floor( rows / 2 );
        let cols2 = Math.floor( cols / 2 );

        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {

                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;

                for ( let row = -rows2; row <= rows2; row++ ) {
                    let iy = y + row;
                    let ioffset;
                    if ( 0 <= iy && iy < height )
                        ioffset = iy * width;
                    else
                        ioffset = y * width; // clamp

                    let moffset = cols * ( row + rows2 ) + cols2;
                    for ( let col = -cols2; col <= cols2; col++ ) {
                        let f = matrix[ moffset + col ];

                        let ix = x + col;
                        if ( !( 0 <= ix && ix < width ) )
                            ix = x; // clamp
                            
                        let offset = ( ioffset + ix ) * 4;

                        r += f * srcData[ offset + 0 ];
                        g += f * srcData[ offset + 1 ];
                        b += f * srcData[ offset + 2 ];
                        a += f * srcData[ offset + 3 ];
                    }
                }

                dstData[ index++ ] = clampChannel( Math.floor( r + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( g + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( b + 0.5 ) );
                dstData[ index++ ] = clampChannel( Math.floor( a + 0.5 ) );
            }
        }
    }

    
    convolveHVGray(
        kernel: Kernel,
        srcData: Uint8ClampedArray,
        dstData: Uint8ClampedArray,
        width: number,
        height: number ) {

        let index = 0;
        let { matrix } = kernel;
        let rows = kernel.height;
        let cols = kernel.width;
        let rows2 = Math.floor( rows / 2 );
        let cols2 = Math.floor( cols / 2 );

        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {

                let v = 0;

                for ( let row = -rows2; row <= rows2; row++ ) {
                    let iy = y + row;
                    let ioffset;
                    if ( 0 <= iy && iy < height )
                        ioffset = iy * width;
                    else
                        ioffset = y * width; // clamp

                    let moffset = cols * ( row + rows2 ) + cols2;
                    for ( let col = -cols2; col <= cols2; col++ ) {
                        let f = matrix[ moffset + col ];

                        let ix = x + col;
                        if ( !( 0 <= ix && ix < width ) )
                            ix = x; // clamp
                            
                        v += f * srcData[ ioffset + ix  ];
                    }
                }

                dstData[ index++ ] = clampChannel( Math.floor( v + 0.5 ) );
            }
        }
    }
}
