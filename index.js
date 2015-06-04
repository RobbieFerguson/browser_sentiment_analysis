require('dotenv').load()

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http);
var fs = require('fs');
var needle = require('needle');
var iod = require('iod-node')
client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

var port = process.env.PORT || 5000

var hexValue;
var status;


var needleoptions={
  'open_timeout':0
}
app.use(express.static(__dirname + "/"))

// on /
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
   socket.on('sendAudio', function(msg){
      var path = './test.wav'
      // console.log(msg)
      fs.open(path, 'w', function(err, fd) {
          if (err) {
              throw 'error opening file: ' + err;
          }

          fs.write(fd, msg.audio, 0, msg.audio.length, null, function(err) {
              if (err) throw 'error writing file: ' + err;
              fs.close(fd, function() {
                  console.log('file written');

                  var data_1 = {
                     apikey:  process.env.idolOnDemandApiKey,
                     file: {'file':'test.wav', 'content_type':'multipart/form-data'}
                  }

                  setTimeout(function(){
                     needle.post('http://api.idolondemand.com/1/api/async/recognizespeech/v1', data_1, { open_timeout:0,
                       multipart: true}, function(err, resp, body) {
                     if (err) {
                        console.log(err);
                        console.log(body);

                     } else {
                        console.log("POST succesful");
                        console.log(body)
                        console.log('https://api.idolondemand.com/1/job/result/' + body.jobID + '?apikey='+ process.env.idolOnDemandApiKey)
                        needle.get('https://api.idolondemand.com/1/job/result/' + body.jobID + '?apikey='+ process.env.idolOnDemandApiKey, function(error, response) {
                           console.log("GET");

                           if (!error && response.statusCode == 200) {
                              console.log("GET succesful");
                              var outputText = response.body.actions[0].result.document[0].content;
                              console.log(outputText);

                              if (outputText === '' ){
                                 console.log("No text was picked up")
                              }
                              else {
                                 var data_2 = {
                                    apikey:  process.env.idolOnDemandApiKey,
                                    text: outputText
                                 }
                                 needle.post('http://api.idolondemand.com/1/api/sync/analyzesentiment/v1', data_2, { multipart: true, 'Content-Length': data_2.length }, function(err, resp, body) {
                                    if (err) {
                                       console.log(err);
                                    } else {
                                       console.log(body);
                                       // console.log(parseFloat(body.aggregate.score));
                                       //    // socket.emit('message', hexValue()) //send data analysis
                                       //    socket.emit('message', 1) //send data analysis
                                    }
                                 })
                              }
                           }
                        });
                     }
                  });
               }, 10000);
              })
          });
      });
   });
   socket.on('sendLocation', function(msg){
      console.log(msg);
   });


});

http.listen(port, function(){
  console.log('listening on *:5000');
});

function hexValue() {

}
