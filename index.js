require('dotenv').load()

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http);
var MyClient = require('idol-client')(process.env.idolOnDemandApiKey);

var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

// on /
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
   socket.on('talk', function(msg){
   //
      console.log("save file")
   //

   //
      console.log("get sentiment analysis")
      // MyClient.recognizeSpeech({
      //  method: 'POST',
      //  type: 'async',
      //  parameters: {
      //      file: 'myFileName',
      //  },
      //  files: {
      //      myFileName: __dirname+'./audio_files' // See IDOL supported files.
      //  }
      // }).then(
      //     function(res){
      //         console.log(res.code);    // => 200-299
      //         console.log(res.headers);    // => Response headers
      //         console.log(res.data);    // => Response data
      //     },
      //     function(error){ console.log('Ups, some error occured:', error); }
      // );
      //
   });
});

http.listen(port, function(){
  console.log('listening on *:5000');
});
