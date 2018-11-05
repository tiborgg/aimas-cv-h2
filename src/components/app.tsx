import './app.less';

import * as assert from 'assert';
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import {
    BoxUint8ClampedRgba,
    GaussianUint8ClampedRgba,
    SobelUint8ClampedRgba,
    CannyUint8ClampedRgba
} from '../filters';

const images = [
    '/image.jpg'
];

@observer
export class App extends React.Component {

    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    @observable gaussianRadius: number = 3;

    @observable boxRadius: number = 3;

    @observable sobelGaussianRadius: number = 2;

    @observable cannyGaussianRadius: number = 2;
    @observable cannyHysteresisLowThreshold = 0.075;
    @observable cannyHysteresisHighThreshold = 0.175;

    constructor( props ) {
        super( props );
    }

    render() {


        const RangeOptionElement = ( label, propName, min, max, step ) => {

            return (
                <div className="range-option">
                    <div className="option-label">
                        <label htmlFor={propName}>{label}</label>
                        <div className="value">{this[ propName ]}</div>
                    </div>
                    <div className="range-slider">
                        <input id={propName}
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={this[ propName ]}
                            onChange={evt => this[ propName ] = parseFloat( evt.target.value )} />

                    </div>
                </div>
            );
        }

        return (
            <div id="app">
                <aside id="sidebar">
                    <div className="upload">

                        <div id="uploadButton">
                            Upload image
                            <input type="file" onChange={this.handleFileInputChange.bind( this )} accept="image/*" />
                        </div>
                    </div>

                    <div className="filter">
                        <div className="heading">
                            <h4>Box Blur</h4>
                            <button onClick={this.handleBoxButtonClick.bind( this )}>Apply</button>
                        </div>
                        {RangeOptionElement( 'Radius', 'boxRadius', 1, 10, 1 )}
                    </div>

                    <div className="filter">
                        <div className="heading">
                            <h4>Gaussian Blur</h4>
                            <button onClick={this.handleGaussianButtonClick.bind( this )}>Apply</button>
                        </div>
                        {RangeOptionElement( 'Radius', 'gaussianRadius', 1, 30, 1 )}
                    </div>

                    <div className="filter">
                        <div className="heading">
                            <h4>Sobel Detector</h4>
                            <button onClick={this.handleSobelButtonClick.bind( this )}>Apply</button>
                        </div>
                        {RangeOptionElement( 'Gaussian Kernel Radius', 'sobelGaussianRadius', 1, 10, 1 )}
                    </div>


                    <div className="filter">
                        <div className="heading">
                            <h4>Canny Edge Detector</h4>
                            <button onClick={this.handleCannyButtonClick.bind( this )}>Apply</button>
                        </div>
                        {RangeOptionElement( 'Gaussian Kernel Radius', 'cannyGaussianRadius', 1, 10, 1 )}
                        {RangeOptionElement( 'Hysteresis Low Threshold', 'cannyHysteresisLowThreshold', 0, 0.5, 0.005 )}
                        {RangeOptionElement( 'Hysteresis High Threshold', 'cannyHysteresisHighThreshold', 0, 0.5, 0.005 )}
                    </div>
                </aside>

                <main id="content">
                    <header id="header">
                        {images.map( url => <div key={url} className="thumb" style={{ backgroundImage: `url('${url}')` }} /> )}
                    </header>

                    <div id="image">
                        <div id="imageInner">
                            <canvas id="canvas" ref={ref => this.canvas = ref} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    componentDidMount() {
        this.canvasContext = this.canvas.getContext( '2d' );
        this.loadImageFromUrl( images[ 0 ] );
        //this.loadImageFromRandomNoise(10, 10);
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

    applyFilter( filter: Function ) {

        const canvas = this.canvas;
        const ctx = this.canvasContext;

        const {
            width,
            height
        } = canvas;

        let srcData = ctx.getImageData( 0, 0, width, height );
        let dstData = new Uint8ClampedArray( width * height * 4 );

        filter( srcData.data, dstData, width, height );

        let dstImgData = new ImageData( dstData, width, height );

        ctx.putImageData( dstImgData, 0, 0, 0, 0, width, height );
    }

    handleFileInputChange( evt ) {

        let file = evt.target.files[ 0 ] as File;
        this.loadImageFromUrl( URL.createObjectURL( file ) );
    }

    handleBoxButtonClick() {
        this.applyFilter(
            BoxUint8ClampedRgba( this.boxRadius ) );
    }

    handleGaussianButtonClick() {
        this.applyFilter(
            GaussianUint8ClampedRgba( this.gaussianRadius ) );
    }

    handleSobelButtonClick() {
        this.applyFilter(
            SobelUint8ClampedRgba( this.sobelGaussianRadius ) );
    }

    handleCannyButtonClick() {
        this.applyFilter(
            CannyUint8ClampedRgba() );
    }
}