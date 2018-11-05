export type ImageDataFormat =

    /** 3-channel image matrix */
    'rgb' |

    /** 4-channel image matrix */
    'rgba' |

    /** Single-channel image matrix */
    'gray';

export type ImageDataType =

    /** Will use a Uint8ClampedArray with all values clamped in [0, 255] */
    'uint8Clamped' |

    /** Will use a Int32Array without any clamping */
    'int32' |
    /** Will use a Int32Array with all values clamped in [0, 255]*/
    'int32Clamped' |

    /** Will use a Float32Array without any clamping */
    'float32' |
    /** Will use a Float32Array with all values clamped in [0, 255]*/
    'float32Clamped';


export type TypedArray =
    Uint8ClampedArray |
    Int32Array |
    Float32Array;

export type ImageDataArrayType<TDataType> =
    TDataType extends 'uint8Clamped' ? Uint8ClampedArray :
    TDataType extends 'int32' ? Int32Array :
    TDataType extends 'int32Clamped' ? Int32Array :
    TDataType extends 'float32' ? Float32Array :
    TDataType extends 'float32Clamped' ? Float32Array :
    never;

export function clamp( val: number ) {
    return Math.min( 255, Math.max( 0, val ) );
}

export function rgbaToGray(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray ) {

    for ( let i = 0; i < srcData.length; i += 4 ) {
        dstData[ i / 4 ] = clamp(
            0.2989 * srcData[ i + 0 ] +
            0.5870 * srcData[ i + 1 ] +
            0.1140 * srcData[ i + 2 ] ); // for now just discard alpha
    }
}

export function grayToRgba(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray ) {

    for ( let i = 0; i < srcData.length; i++ ) {

        let j = i * 4;
        let v = srcData[ i ];
        dstData[ j + 0 ] = v;
        dstData[ j + 1 ] = v;
        dstData[ j + 2 ] = v;
        dstData[ j + 3 ] = 255;
    }
}

export class Image<TDataType extends ImageDataType> {

    data: ImageDataArrayType<TDataType>;
    dataFormat: ImageDataFormat;
    dataType: ImageDataType;

    width: number;
    height: number;

    constructor() {

    }

    toEmptyRgba() {

    }
}