import ndarray from "ndarray";
import { RawImageData } from "jpeg-js";

function singlePixelConvolution(input: ndarray<number>, x: number, y: number, kernel: ndarray<number>) {
    let output = 0;
    for (let i = 0; i < kernel.shape[0]; ++i) {
        for (let j = 0; j < kernel.shape[1]; ++j) {
            output += Number(input.get(x + i, y + j)) * kernel.get(i, j);
        }
    }
    return output;
}

function singlePixelRoundedConvolution(input: ndarray<number>, x: number, y: number, kernel: ndarray<number>) {
    let output = 0;
    for (let i = 0; i < kernel.shape[0]; ++i) {
        for (let j = 0; j < kernel.shape[1]; ++j) {
            output += Math.round(input.get(x + i, y + j) * kernel.get(i, j));
        }
    }
    return output;
}

function convolution2D(input: ndarray<number>, kernel: ndarray<number>) {
    let smallWidth = input.shape[0] - kernel.shape[0] + 1;
    let smallHeight = input.shape[1] - kernel.shape[1] + 1;
    let output = ndarray(new Float32Array(input.size), input.shape);
    for (let i = 0; i < smallWidth; ++i) {
        for (let j = 0; j < smallHeight; ++j) {
            output.set(i,j, singlePixelConvolution(input, i, j, kernel));
            // if (i==32- kernel.shape[0] + 1 && j==100- kernel.shape[1] + 1)
            // System.out.println("Convolve2D: "+output[i][j]);
        }
    }
    return output;
}

function convolution2DPadded(input: ndarray<number>, kernel: ndarray<number>) {
    let smallWidth = input.shape[0] - kernel.shape[0] + 1;
    let smallHeight = input.shape[1] - kernel.shape[1] + 1;
    let top = Math.floor(kernel.shape[1] / 2);
    let left = Math.floor(kernel.shape[0] / 2);
    let small = convolution2D(input, kernel);
    let large = ndarray(new Float32Array(input.size), input.shape);
    for (let j = 0; j < smallHeight; ++j) {
        for (let i = 0; i < smallWidth; ++i) {
            // if (i+left==32 && j+top==100) System.out.println("Convolve2DP:
            // "+small[i][j]);
            large.set(i + left, j + top, small.get(i,j));
        }
    }
    return large;
}

function convolve(image: RawImageData<Uint8Array>, kernel: ndarray<number>, scale: number, offset: number): RawImageData<Uint8Array> {
    let input2DRGB = ndarray(image.data, [image.width, image.height, 3]);
    console.log(input2DRGB.shape);
    let input2D = ndarray(new Uint8ClampedArray(image.width * image.height), [image.width, image.height]);

    for (let i = 0; i < image.width; ++i) {
        for (let j = 0; j < image.height; j++) {
            input2D.set(i, j, input2DRGB.get(i, j, 0));
        }
    }
    let output: RawImageData<Uint8Array> = {
        width: image.width,
        height: image.height,
        data: new Uint8Array(image.width * image.height * 3)
    };
    let output2DRGB = ndarray(output.data, [image.width, image.height, 3]);
    let output2D = convolution2DPadded(input2D, kernel);

    for (let i = 0; i < image.width; ++i) {
        for (let j = 0; j < image.height; ++j) {
            for (let k = 0; k < 3; ++k) {
                // TODO: check if clamping to byte and rounding is needed here
                output2DRGB.set(i, j, k, output2D.get(i, j));
            }
        }
    }
    return output;
}

export default { convolve };
