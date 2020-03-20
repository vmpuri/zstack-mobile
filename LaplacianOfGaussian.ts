import ndarray = require("ndarray");
import convolution from "./convolution";

class LaplacianOfGaussian {
    input: ImageData;
    output: ImageData;

    LoGKernel: ndarray<number>;
    theta: number;
    kernelSize: number;

    constructor(k: number, t: number) {
        this.kernelSize = k;
        this.theta = t;

        this.generateKernel();
    }

    logElement(x: number, y: number): number {
        let g: number = 0;
        for (var ySubPixel = y - 0.5; ySubPixel < y + 0.55; ySubPixel += 0.1) {
            for (var xSubPixel = x - 0.5; xSubPixel < x + 0.55; xSubPixel += 0.1) {
                var s = -((xSubPixel ** 2) + (ySubPixel ** 2)) / (2 * (this.theta ** 2));
                g = g + (1 / (Math.PI * Math.pow(this.theta, 4))) *
                    (1 + s) * Math.pow(Math.E, s);
            }
        }
        g = -g / 121;

        return g;
    }

    generateKernel() {
        for (var i = 0; i < this.kernelSize; ++i) {
            for (var j = 0; j < this.kernelSize; ++j) {
                var x = (-this.kernelSize / 2) + j;
                var y = (-this.kernelSize / 2) + i;
                this.LoGKernel[j][i] = this.logElement(x, y);
            }
        }
    }

    kernelValid(t: number): boolean {
        let sum: number = 0;
        let max: number = this.LoGKernel[0][0];

        for (var j = 0; j < this.kernelSize; ++j) {
            for (var i = 0; i < this.kernelSize; ++i) {
                sum += this.LoGKernel[i][j];
            }
        }

        if (Math.abs(sum) > 0.1 || t <= 0.5 || (t / this.kernelSize) > 0.09) {
            return false;
        }

        else {
            let delta: number = sum / (this.kernelSize ** 2);
            for (var j = 0; j < this.kernelSize; ++j) {
                for (var i = 0; i < this.kernelSize; ++i) {
                    this.LoGKernel[i][j] -= delta;
                }
            }
            return true;
        }
    }

    logImage(input: ImageData, scale: number, offset: number) {
        convolution.convolve(input, this.LoGKernel, scale, offset);
    }
}

export default LaplacianOfGaussian;