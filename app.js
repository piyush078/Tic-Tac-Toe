var app  = require ('express')();
var http = require ('http').Server (app);
var io   = require ('socket.io') (http);

/**
 * An Object of rooms.
 *
 * @var Object
 */
var rooms = ['0'];

/** 
 * Express Routing.
 *
 * Callback function
 * @params Request, Response
 */
app.get ('/', function (req, res) {
  res.sendFile (__dirname + '/app.html');

}).get ('/window', function (req, res) {
  res.sendFile (__dirname + '/window.html');

}).get ('/index.js', function (req, res) {
  res.sendFile (__dirname + '/index.js');
});

/**
 * Socket Connections and Events
 *
 * Callback function
 * @params Socket
 */
io.on ('connection', function (socket) {
  
  /* Push the new player into default room and emit the message */
  var defaultRoom = '0';
  var currentRoom = '0';
  socket.join (defaultRoom);
  io.to (defaultRoom).emit ('join', 'New Player Joined');

  /* Action on move event */
  socket.on ('move', function (compo) {
    console.log (compo);
  });

  /* Action on create room event */
  socket.on ('create', function () {
    var newRoom = String (parseInt (rooms [rooms.length - 1]) + 1);  /* Create new room */
    rooms.push (newRoom);
    socket.leave (currentRoom);  /* Leave the old Room */
    socket.join (newRoom, function () {  /* Join the new Room */
      currentRoom = newRoom;
      io.to (newRoom).emit ('create', 'New Room Created = ' + newRoom);  /* Send the confirmation */
    });
  });

  /* Action on join room event */
  socket.on ('join', function () {
    var available = [];
    rooms.forEach (function (ele) {
      if (ele !== '0') {
        console.log ('Room No.' + ele + ' = ');
        console.log (io.sockets.adapter.rooms [ele]);
      }
    });
  });

});

/**
 * Creating Application at mentioned port.
 */
http.listen (8000, function () {
  console.log ("Server Listening");
});