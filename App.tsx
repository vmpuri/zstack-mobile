import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import LaplacianOfGaussian from './LaplacianOfGaussian';
import Canvas, { Image as CanvasImage, Path2D, ImageData } from 'react-native-canvas';

interface AppState {
  hasCamera?: boolean;
  hasPermission?: boolean;
  cameraType: any;
  log: LaplacianOfGaussian;
  captureURI?: string;
}

// var BASE64_MARKER = ';base64,';

// function convertDataURIToBinary(dataURI) {
//   let base64 = dataURI.indexOf(BASE64_MARKER) > 0 ? dataURI.substring(dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length) : dataURI;
//   var raw = Base64.atob(base64);
//   var rawLength = raw.length;
//   var array = new Uint8Array(new ArrayBuffer(rawLength));

//   for (let i = 0; i < rawLength; i++) {
//     array[i] = raw.charCodeAt(i);
//   }
//   return array;
// }

// const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
// const Base64 = {
//   btoa: (input: string = '') => {
//     let str = input;
//     let output = '';

//     for (let block = 0, charCode, i = 0, map = chars;
//       str.charAt(i | 0) || (map = '=', i % 1);
//       output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

//       charCode = str.charCodeAt(i += 3 / 4);

//       if (charCode > 0xFF) {
//         throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
//       }

//       block = block << 8 | charCode;
//     }

//     return output;
//   },

//   atob: (input: string = '') => {
//     let str = input.replace(/=+$/, '');
//     let output = '';

//     if (str.length % 4 == 1) {
//       throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
//     }
//     for (let bc = 0, bs = 0, buffer, i = 0;
//       buffer = str.charAt(i++);

//       ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
//         bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
//     ) {
//       buffer = chars.indexOf(buffer);
//     }

//     return output;
//   }
// };

let camera: Camera = undefined;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'stretch'
  },
  item: {
    flex: 1,
    alignSelf: 'stretch'
  }
});

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    // useEffect(() => {
    //   (async () => {
    //     const hasCamera = await Camera.isAvailableAsync();
    //     const { status } = await Camera.requestPermissionsAsync();
    //     this.setState({ hasCamera: hasCamera, hasPermission: status === 'granted' });
    //   })();
    // }, []);
    this.state = {
      cameraType: Camera.Constants.Type.back,
      log: new LaplacianOfGaussian(7, 1.0)
    };
    this.processImage = this.processImage.bind(this);
  }

  render() {
    let elem;
    if (this.state.captureURI) {
      elem = <Canvas style={styles.item} ref={this.processImage} />;
    } else {
      elem = <Camera style={styles.item} type={this.state.cameraType} ref={ref => { camera = ref; }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => this.takePictureAsync()}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Capture </Text>
          </TouchableOpacity>
        </View>
      </Camera>;
    }
    return (
      <View style={styles.container}>
        {elem}
      </View>
    );
  }

  processImage(canvas?: Canvas) {
    if (this.state.captureURI && canvas) {
      const img = new CanvasImage(canvas);
      img.src = this.state.captureURI;
      img.addEventListener('load', () => {
        canvas.width = Dimensions.get('screen').width;
        canvas.height = Dimensions.get('screen').height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      });
    }
  }

  async takePictureAsync() {
    if (camera) {
      let inputJpegData = await camera.takePictureAsync({ base64: true });
      this.setState({ captureURI: `data:image/jpeg;base64,${inputJpegData.base64}` });
    }
    // setType(
    //   type === Camera.Constants.Type.back
    //     ? Camera.Constants.Type.front
    //     : Camera.Constants.Type.back
    // );
  }
}

export default App;
