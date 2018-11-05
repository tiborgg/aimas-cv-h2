import './app.less';

import * as assert from 'assert';
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { BoxBlurFilter, GaussianBlurFilter, SobelFilter, CannyEdgeFilter } from '../filters';

const images = [
    '/image.jpg'
];

@observer
export class App extends React.Component {

    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    @observable
    gaussianRadius: number = 3;

    constructor( props ) {
        super( props );
    }

    render() {

        return (
            <div className="app">

                <header id="header">
                    {images.map( url => <div key={url} className="thumb" style={{ backgroundImage: `url('${url}')` }} /> )}
                </header>

                <div id="toolbar">

                </div>

                <div id="image">
                    <canvas id="canvas" ref={ref => this.canvas = ref} />
                </div>

                <div><input type="file" onChange={this.handleFileInputChange.bind( this )} accept="image/*" /></div>

                <div>
                    <label>Radius</label>
                    <input
                        id="gaussianRadius"
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={this.gaussianRadius}
                        onChange={evt => this.gaussianRadius = parseInt( evt.target.value )} />
                    <div id="gaussianRadiusValue">{this.gaussianRadius}</div>
                    <button id="gaussianButton" onClick={this.handleGaussianBlurButtonClick.bind( this )}>Gaussian Blur</button>
                </div>

                <div><button onClick={this.handleBoxBlurButtonClick.bind( this )}>Box Blur</button></div>
                <div><button onClick={this.handleSobelFilterButtonClick.bind( this )}>Sobel Filter</button></div>
                <div><button onClick={this.handleCannyFilterButtonClick.bind( this )}>Canny Filter</button></div>
            </div>
        );
    }

    componentDidMount() {
        this.canvasContext = this.canvas.getContext( '2d' );
        this.loadImageFromUrl( images[ 0 ] );
    }

    loadImageFromRandomNoise( width, height ) {

        let ctx = this.canvasContext;

        this.canvas.width = width;
        this.canvas.height = height;

        let data = new Uint8ClampedArray( width * height * 4 );
        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {
                let r = Math.random() * 255;
                let g = Math.random() * 255;
                let b = Math.random() * 255;
                let a = 255;

                let offset = ( y * width + x ) * 4;

                data[ offset + 0 ] = r;
                data[ offset + 1 ] = g;
                data[ offset + 2 ] = b;
                data[ offset + 3 ] = a;
            }
        }

        ctx.putImageData( new ImageData( data, width, height ), 0, 0, 0, 0, width, height );
    }

    loadImageFromUrl( url ) {

        let ctx = this.canvasContext;

        let img = new Image();
        img.onload = () => {

            this.canvas.width = img.width;
            this.canvas.height = img.height;

            ctx.drawImage( img, 0, 0 );
        }

        img.src = url;
    }

    handleFileInputChange( evt ) {

        let file = evt.target.files[ 0 ] as File;
        this.loadImageFromUrl( URL.createObjectURL( file ) );
    }

    handleGaussianBlurButtonClick() {

        let filter = new GaussianBlurFilter( {
            radius: this.gaussianRadius
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

    handleCannyFilterButtonClick() {

        let filter = new CannyEdgeFilter();
        filter.applyToCanvas( this.canvas );
    }
}