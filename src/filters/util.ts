export function clamp( val: number ) {
    return Math.min( 255, Math.max( 0, val ) );
}

export function rgbaToGray(
    srcData: Uint8ClampedArray,
    dstData: Uint8ClampedArray ) {

    for ( let i = 0; i < srcData.length; i += 4 ) {
        dstData[ i / 4 ] = clamp(
            0.30 * srcData[ i + 0 ] +
            0.59 * srcData[ i + 1 ] +
            0.11 * srcData[ i + 3 ] ); // for now just discard alpha
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
