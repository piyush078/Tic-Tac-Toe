var app  = require ('express')();
var http = require ('http').Server (app);
var io   = require ('socket.io') (http);

/**
 * An Object of rooms.
 *
 * @var Array
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
 * Return the first available room.
 *
 * @params Io
 * @return string
 */
function returnAvailableRoom (io) {
  var available;
  for (var key = 0; key < rooms.length; ++key) {
    ele = rooms [key];
    if (ele !== '0' && io.sockets.adapter.rooms && io.sockets.adapter.rooms [ele] && io.sockets.adapter.rooms [ele].length === 1) {  /* First room which is available */
      available = ele;
      break;
    }
  }
  return available;
}

/**
 * Check for the winner.
 *
 * @params array
 * @return number
 */
function isWinner (compo) {

  /* Find the winner */
  if      (compo [0][0] === compo [0][1] && compo [0][1] === compo [0][2]) return compo [0][0];
  else if (compo [1][0] === compo [1][1] && compo [1][1] === compo [1][2]) return compo [1][0];
  else if (compo [2][0] === compo [2][1] && compo [2][1] === compo [2][2]) return compo [2][0];
  else if (compo [0][0] === compo [1][0] && compo [1][0] === compo [2][0]) return compo [0][0];
  else if (compo [0][1] === compo [1][1] && compo [1][1] === compo [2][1]) return compo [0][1];
  else if (compo [0][2] === compo [1][2] && compo [1][2] === compo [2][2]) return compo [0][2];
  else if (compo [0][0] === compo [1][1] && compo [1][1] === compo [2][2]) return compo [0][0];
  else if (compo [0][2] === compo [1][1] && compo [1][1] === compo [2][0]) return compo [0][2];
  else return -1;
}

/**
 * Check if the game is complete.
 *
 * @params array
 * @return boolean
 */
function isComplete (compo) {
  var blankPresent = false;  /* Counter for presence of a blank box */
  compo.forEach (function (row) {
    row.forEach (function (ele) {
      if (ele === -1) {  /* -1 value for a element indicates blank box */
        blankPresent = true;
      }
    });
  });
  return !blankPresent;
}

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
  io.to (defaultRoom).emit ('init', 'New Player Joined');

  /* Action on move event */
  socket.on ('move', function (compo) {
    io.to (currentRoom).emit ('move', compo);  /* Send the composition of the game */

    var winner = isWinner (compo);
    /* If the game is complete or if there is a winner */
    if (winner !== -1) {
      console.log (winner);
      io.to (currentRoom).emit ('victory', winner);  /* The game has a winner */
    } else if (isComplete (compo)) {
      io.to (currentRoom).emit ('end', 'The game is a draw.');  /* The game is a draw. */
    }
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
    var available = returnAvailableRoom (io);  /* First available room */

    /* If there is a room available then join it */
    if (available) {
      socket.leave (currentRoom);  /* Leave the Default room */
      socket.join (available, function () {
        currentRoom = available;
        socket.emit ('join', available);  /* Emit the message to the room joiner */
        io.to (currentRoom).emit ('play');  /* Confirmation to start the play */
      });
    } else {
      socket.emit ('join');
    }
  });

  /* Action on quit room event */
  socket.on ('quit', function () {
    socket.leave (currentRoom);  /* Leave the current room */
    io.to (currentRoom).emit ('end', 'You win because the other dude left.');  /* Emit the victory message to other player because the opponent left */
    socket.join (defaultRoom, function () {  /* Join the default room */
      currentRoom = defaultRoom;
      socket.emit ('init', 'Back to the default room.');
    });
  });

});

/**
 * Creating Application at mentioned port.
 */
http.listen (8000, function () {
  console.log ("Server Listening");
});