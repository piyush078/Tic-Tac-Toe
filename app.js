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
 * Express Routing, Create a new Room.
 *
 * Callback function
 * @params Request, Response
 */
app.get ('/create', function (req, res) {
  var newRoom = String (parseInt (rooms [rooms.length - 1]) + 1);
  rooms.push (newRoom);
  res.send (newRoom);
});

/**
 * Socket Connections and Events
 *
 * Callback function
 * @params Socket
 */
io.on ('connection', function (socket) {
  console.log ('Connected');

  /* Push the new player into default room and emit the message */
  var room = '0';
  socket.join (room);
  io.to (room).emit ('create', 'New Player Joined');

  /* Action on move event */
  socket.on ('move', function (compo) {
    console.log (compo);
  });
});

/**
 * Creating Application at mentioned port.
 */
http.listen (8000, function () {
  console.log ("Server Listening");
});