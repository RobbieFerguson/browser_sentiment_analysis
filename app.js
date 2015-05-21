var socket = io();
var navigator = window.navigator;
navigator.getUserMedia = (
 navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

var Context = window.AudioContext || window.webkitAudioContext;
var context = new Context();

var mediaStream;
var rec;

$( document ).ready(function() {

    // ask for permission and start recording
   navigator.getUserMedia({audio: true}, function(localMediaStream){
     mediaStream = localMediaStream;

     // create a stream source to pass to Recorder.js
     var mediaStreamSource = context.createMediaStreamSource(localMediaStream);

     // create new instance of Recorder.js using the mediaStreamSource
     rec = new Recorder(mediaStreamSource, {
      // pass the path to recorderWorker.js file here
      workerPath: '/bower_components/Recorderjs/recorderWorker.js'
     });

   }, function(err){
     console.log('Browser not supported');
   });

   function record(){
      console.log("Start Recording")
      rec.record();
   }
   function stopRecording(){
      console.log("Stop Recording")
      rec.stop();
      rec.exportWAV(function(e){
         socket.emit('sendAudio', e);
         console.log("emitting");
         rec.clear();
      })

   }

   //geolocation
   //The callback function executed when the location is fetched successfully.
   function onGeoSuccess(location) {
      console.log(location);
      socket.emit('sendLocation', location);
   }
   //The callback function executed when the location could not be fetched.
   function onGeoError(error) {
      console.log(error);
   }

   $('#talk').click(function(){
      //
      $("#talk").prop("disabled", true); //disable button for speaking
      $("#stop").prop("disabled", false); //enable button for stop speaking
      console.log("recording...");
      var html5Options = { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 };
      geolocator.locate(onGeoSuccess, onGeoError, true, html5Options, 'map-canvas');
      record();

   });
   $('#stop').click(function(){
      //
      $("#talk").prop("disabled", false); //enable button for speaking
      $("#stop").prop("disabled", true); //disable button for stop speaking
      console.log("stop recording...emit to server");
      stopRecording();

   });

   socket.on('message', function(msg){
      console.log(msg);
      console.log("updating background");
   });
});
