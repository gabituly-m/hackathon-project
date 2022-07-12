import './App.css';
import * as faceapi from 'face-api.js';
import React from 'react';
import ReactLoading from "react-loading";





function App() {
  

  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);

  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  function handleVideoOnPlay () {
    setInterval(async function ()  {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvas(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        resizedDetections.forEach(result => {
          const {expressions} = result
          let happiness = expressions.happy;
          let angriness = expressions.angry;
          let neutral =  expressions.neutral;
          let sadness = expressions.sad;
          let surprised = expressions.surprised;
          let mood;
          if(happiness > 0.90){
            window.mood = "happy"
          }
          if(angriness > 0.90){
            window.mood = "mad"
          }
          if(neutral > 0.90){
            window.mood = "calm"
          }
          if(sadness > 0.90){
            window.mood = "sad"
          }
          if(surprised > 0.90){
            window.mood = "surprised"
          }
        }
        )
        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  const findMusic = () => {
    window.open('https://www.last.fm/search?q='+window.mood+' music')
    closeWebcam()
  }

  return (
    <div className="app">
      <div className="text">Show your Mood, listen to Music</div>
      <div style={{ textAlign: 'center', padding: '10px'}}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: '#06283D', color: '#DFF6FF', padding: '15px', fontSize: '25px', fontFamily: 'Impact, fantasy', border: 'none', borderRadius: '10px' }}>
              Close Cam
            </button>
            :
            <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: '#06283D', color: '#DFF6FF', padding: '15px', fontSize: '25px', fontFamily: 'Impact, fantasy', border: 'none', borderRadius: '10px' }}>
              Open Cam
            </button>
        }
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', border: 'solid', borderWidth: '5px' }}>
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
              </div>
            </div>
            :
            <div><ReactLoading type="balls" color="#06283D" 
            height={100} width={50} /></div>
          :
          <>
          </>
      }
      <div style={{ textAlign: 'center', padding: '10px' }}>
      <button onClick={findMusic} style={{ cursor: 'pointer', backgroundColor: '#DFF6FF', color: '#06283D', padding: '15px', fontSize: '25px',fontFamily: 'Impact, fantasy', border: 'none', borderRadius: '10px' }}>
        Find music
      </button>

      </div>
    </div>
  );
}

export default App;