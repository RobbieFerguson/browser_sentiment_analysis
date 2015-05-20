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

app.use(express.static(__dirname + "/"))

// on /
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
   socket.on('talk', function(msg){
      var path = './test.wav'
      console.log(msg)
      fs.open(path, 'w', function(err, fd) {
          if (err) {
              throw 'error opening file: ' + err;
          }

          fs.write(fd, msg, 0, msg.length, null, function(err) {
              if (err) throw 'error writing file: ' + err;
              fs.close(fd, function() {
                  console.log('file written');
              })
          });
      });

      client.call('recognizespeech', {'file' : 'test.wav'} ,function(err,resp,body) {
         // console.log("hi")
         console.log(body.data.jobID)
         console.log('http://api.idolondemand.com/1/job/result/'+body.data.jobID+'?apikey='+process.env.idolOnDemandApiKey)
         // console.log(err)
         needle.get('http://api.idolondemand.com/1/job/result/'+body.data.jobID+'?apikey='+process.env.idolOnDemandApiKey, function(error, response, body) {
         console.log(body)
         if (!error && response.statusCode == 200){
             console.log(response.body);
          }
            else {
               console.log(error)
            }
         });

         // client.call('analyzesentiment', {'file' : body.content} ,function(err,resp,body) {
         //    // socket.emit('message', hexValue()) //send data analysis
         //    socket.emit('message', 1) //send data analysis
         // })
      }, true)
   });
});

http.listen(port, function(){
  console.log('listening on *:5000');
});

function hexValue() {

}
