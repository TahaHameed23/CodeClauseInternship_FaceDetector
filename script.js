const video = document.getElementById('video')
const popup = document.getElementById('popup');
const allowButton = document.getElementById('allowButton');
const loading = document.getElementById('loading');
const MODEL_URL = `./models`
loading.style.display = 'flex';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
]).then(() => {
  allowButton.addEventListener('click', () => {
    popup.style.display = 'none';
    startVideo();
  });
  popup.style.display = 'flex';
})
.catch(error => {
  console.error('Error loading models:', error);
});

function startVideo() {
  loading.style.display = 'none';
  navigator.mediaDevices.getUserMedia(
    { video: {} }
  )
  .then(stream => {
    video.srcObject = stream;
    video.style.transform = 'scaleX(-1)';
  })
  .catch(err => console.error(err));
}


video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})