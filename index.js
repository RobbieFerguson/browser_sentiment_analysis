require('dotenv').load()

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http);
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

      client.call('recognizespeech', {'file' : msg} ,function(err,resp,body) {
         client.call('analyzesentiment', {'file' : body.content} ,function(err,resp,body) {
            // socket.emit('message', hexValue()) //send data analysis
            socket.emit('message', 1) //send data analysis
         })
      })
   });
});

http.listen(port, function(){
  console.log('listening on *:5000');
});

function hexValue() {

}
