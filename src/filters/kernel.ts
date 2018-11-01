export class Kernel {

    readonly matrix: Float32Array;
    readonly width: number;
    readonly height: number;

    constructor(
        width: number,
        height: number,
        matrix: number[] ) {

        this.width = width;
        this.height = height;
        this.matrix = new Float32Array( matrix );
    }
}