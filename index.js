/**
 * Actions on clicking the buttons.
 *
 * @params Socket
 * @return void
 */
function actions (socket) {
  /* Action on clicking Create Button */
  $ ('#create').on ('click', function () {
    socket.emit ('create');  /* Emit the create event */
  });

  /* Action on clicking Join button */
  $ ('#join').on ('click', function () {
    socket.emit ('join');  /* Emit the join event */
  });

  /* Action on clicking Quit button */
  $ ('#quit').on ('click', function () {
    socket.emit ('quit');
  });
}

$ (document).ready (function () {

  /* Circle and Cross urls, Counters */
  var circle  = 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-circle-outline-20.png';
  var cross   = 'https://cdn1.iconfinder.com/data/icons/epic-hand-drawns/64/cross-20.png';
  var socket  = io ();
  var connect = false;
  var turn;  /* Turn counter */
  var status;  /* Status counter for room creator or room joiner */
  var compo   = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];  /* Composition of the game */

  /* Action on clicking a Tic Tac Toe Box */
  $ ('td').on ('click', function () {

    /* If the user is connected and the turn is his/hers */
    if (connect && turn) {
      
      /* Get the Position of the Box */
      var col = $ ('td').index (this) % 3;
      var row = $ ('tr').index ($ (this).parent ());
      if (compo [row][col] === -1) {  /* If the box is not already ticked */
        compo [row][col] = status;
        socket.emit ('move', compo);
      }

    } else if (connect && ! turn) {
      $ ('#result').append ('Not your turn.');
    }
  });

  /* Socket init event */
  socket.on ('init', function (msg) {
    console.log (msg);

    /* Change the Buttons Accessibility */
    $ ('#create').removeAttr ('disabled');
    $ ('#join').removeAttr ('disabled');
    $ ('#quit').attr ('disabled', 'disabled');

    /* Empty the game and result container */
    var boxes = $ ('td');
    for (var ind = 0; ind < boxes.length; ++ind) {
      boxes.eq (ind).html ('');
    }
    $ ('#result').text ('');
  });

  /* Socket create event */
  socket.on ('create', function (msg) {

    console.log (msg);

    /* Change the Buttons Accessibility */
    $ ('#create').attr ('disabled', 'disabled');
    $ ('#join').attr ('disabled', 'disabled');
    $ ('#quit').removeAttr ('disabled');

    connect = true;  /* Change the connect to true */
    status = 1;  /* User is the room creator */
    turn = true;  /* First turn is of the room creator */
  });

  /* Socket join event */
  socket.on ('join', function (room) {
    if (! room) {  /* If there is no available room */
      $ ('#result').text ('No Rooms Available.');
    } else {

      console.log ('Room ' + room + ' joined.');
      
      /* Change the Buttons Accessibility */
      $ ('#create').attr ('disabled', 'disabled');
      $ ('#join').attr ('disabled', 'disabled');
      $ ('#quit').removeAttr ('disabled');

      connect = true;  /* Change the connect to true */
      status = 0;  /* User is the room joiner */
      turn = false;  /* First turn is of the room creator */
    }
  });

  /* Socket start play event */
  socket.on ('play', function () {
    $ ('#result').text ('Lets play.');
    if (turn) {
      $ ('#result').append ('Your turn dude.');
    } else {
      $ ('#result').append ('Not your turn dude.');
    }
  });

  /* Socket move event */
  socket.on ('move', function (change) {
    var boxes = $ ('td');
    
    /* Fill the Tic Tac Toe boxes */
    change.forEach (function (row, rowNo) {
      row.forEach (function (ele, colNo) {
        if (ele === 1) {
          boxes.eq (rowNo * 3 + colNo).html ('<img src="' + circle + '">');
        } else if (ele === 0) {
          boxes.eq (rowNo * 3 + colNo).html ('<img src="' + cross + '">');
        }
      });
    });

    /* Change the turn and value of new composition */
    turn = !turn;
    compo = change;

    /* Update the turn messages */
    if (turn) {
      $ ('#result').text ('Your turn dude.');
    } else {
      $ ('#result').text ('Not your turn dude.');
    }
  });

  /* Socket victory event */
  socket.on ('end', function (msg) {
    /* Show the feedback */
    if (connect) {
      $ ('#result').text (msg);
    }
    connect = false;
  });

  socket.on ('victory', function (winner) {
    if (status === winner) {
      $ ('#result').text ("You won.");
    } else {
      $ ('#result').text ("You lost.");
    }
    connect = false;
  });

  actions (socket);
});