require('dotenv').load()

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http);
var fs = require('fs');
var needle = require('needle');
var iod = require('iod-node');
var Promise = require("bluebird");

Promise.promisifyAll(needle);
Promise.promisifyAll(fs);

client = new iod.IODClient('http://api.idolondemand.com', process.env.idolOnDemandApiKey)

var port = process.env.PORT || 5000
var hexValue;
var status;
var needleoptions = {
  'open_timeout': 0
}

app.use(express.static(__dirname + "/"))
// on /
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
});


getResultAsync= function(jobID){

  url =
  'https://api.idolondemand.com/1/job/status/' + jobID + '?apikey=' + process.env.idolOnDemandApiKey
  return needle.getAsync(url).then(
    function(resp){

      var body=resp[1]
      console.log(body.status)
      if (body.status=='finished'){
        return body;
      }
      else{
        return getResultAsync(jobID);
      }
    }
  )
}




processFile = function() {    
  var data_1 = {
    apikey: process.env.idolOnDemandApiKey,
    file: {
      'file': 'hpnext.mp4',
      'content_type': 'multipart/form-data'
    }
  }
  needle.postAsync(
    'http://api.idolondemand.com/1/api/async/recognizespeech/v1',
    data_1, {
      open_timeout: 0,
      multipart: true
    }).then(
    function(resp) {

      console.log("POST succesful");
      var body=resp[1];
      //console.log(body)
      var jobID=body.jobID;
      var asyncres= Promise.resolve(getResultAsync(jobID))
      asyncres.then(function(data){
        var text = data.actions[0].result.document[0]
        return needle.getAsync();
      })


/*
      return needle.get(
        'https://api.idolondemand.com/1/job/result/' + body
        .jobID + '?apikey=' + process.env.idolOnDemandApiKey,
        function(error, response) {
          console.log("GET");

          if (!error && response.statusCode == 200) {
            console.log("GET succesful");
            var outputText = response.body.actions[0].result
              .document[0].content;
            console.log(outputText);

            if (outputText === '') {
              console.log("No text was picked up")
            } else {
              var data_2 = {
                apikey: process.env.idolOnDemandApiKey,
                text: outputText
              }
              needle.post(
                'http://api.idolondemand.com/1/api/sync/analyzesentiment/v1',
                data_2, {
                  multipart: true,
                  'Content-Length': data_2.length
                }, function(err, resp, body) {
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

*/

    }

  );
}

io.on('connection', function(socket) {
  socket.on('sendAudio', function(msg) {
    console.log(msg)
    var path = 'test.wav'
    // console.log(msg)
    var fd
    fs.openAsync(path, 'w', 438).then(
      function(ffd) {
        console.log(ffd) 
        fd = ffd   
        return fs.writeAsync(fd, msg.audio, 0, msg.audio.length, null);
      }).then(function() {
      return fs.closeAsync(fd);
    }).then(processFile);
  });
});

processFile()

/*
http.listen(port, function() {
  console.log('listening on *:5000');
});
*/
