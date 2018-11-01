import * as assert from 'assert';
import * as React from 'react';
import * as _ from 'lodash';
import { BoxBlurFilter, GaussianBlurFilter, SobelFilter } from '../filters';

export class App extends React.Component {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor( props ) {
        super( props );
    }

    render() {

        let style = {
            //transform: 'scale(5)',
            margin: '200px',
            imageRendering: 'pixelated'
        };

        return (
            <div className="app">
                <div>
                    <canvas id="canvas" ref={ref => this.canvas = ref} style={style} />
                </div>

                <div><input type="file" onChange={this.handleFileInputChange.bind( this )} /></div>
                <div><button onClick={this.handleGaussianBlurButtonClick.bind( this )}>Gaussian Blur</button></div>
                <div><button onClick={this.handleBoxBlurButtonClick.bind( this )}>Box Blur</button></div>
                <div><button onClick={this.handleSobelFilterButtonClick.bind( this )}>Sobel Filter</button></div>
            </div>
        );
    }

    componentDidMount() {
        let ctx = this.ctx = this.canvas.getContext( '2d' );

        let w = 100;
        let h = 100;

        this.canvas.width = w;
        this.canvas.height = h;

        let data = new Uint8ClampedArray( w * h * 4 );
        for ( let x = 0; x < w; x++ ) {
            for ( let y = 0; y < h; y++ ) {
                let r = Math.random() * 255;
                let g = Math.random() * 255;
                let b = Math.random() * 255;
                let a = 255;

                let offset = ( x * w + y ) * 4;

                data[ offset + 0 ] = r;
                data[ offset + 1 ] = g;
                data[ offset + 2 ] = b;
                data[ offset + 3 ] = a;
            }
        }

        ctx.putImageData( new ImageData( data, w, h ), 0, 0, 0, 0, w, h );

        //this.handleGaussianBlurButtonClick({} as any);
    }

    handleFileInputChange( evt ) {

        let file = evt.target.files[ 0 ] as File;
        let img = new Image();
        img.onload = () => {

            this.canvas.width = img.width;
            this.canvas.height = img.height;

            this.ctx.drawImage( img, 0, 0 );
        }

        img.src = URL.createObjectURL( file );
    }

    handleGaussianBlurButtonClick() {

        let filter = new GaussianBlurFilter( {
            radius: 3
        } );
        filter.applyToCanvas( this.canvas );

    }

    handleBoxBlurButtonClick() {

        let filter = new BoxBlurFilter();
        filter.applyToCanvas( this.canvas );
    }

    handleSobelFilterButtonClick() {

        let filter = new SobelFilter();
        filter.applyToCanvas( this.canvas );
    }
}