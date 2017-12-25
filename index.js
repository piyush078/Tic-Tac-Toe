$ (document).ready (function () {

  /* Circle and Cross urls, Counters */
	var circle  = 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-circle-outline-20.png';
	var cross   = 'https://cdn1.iconfinder.com/data/icons/epic-hand-drawns/64/cross-20.png';
  var socket  = io ();
  var icon;
  var connect = false;
  var turn;
  var compo   = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];

  /* Action on click event of Create Button */
  $ ('#create').on ('click', function () {
    $.ajax ({
      url: '/create', 
      success: function (result) {

        /* Change the Buttons Accessibility */
        $ ('#create').attr ('disabled', 'disabled');
        $ ('#join').attr ('disabled', 'disabled');
        $ ('#quit').removeAttr ('disabled');

        connect = !connect;
        icon = circle;
        turn = true;
      }
    });
  });

  /* Action on clicking a Tic Tac Toe Box */
  $ ('td').on ('click', function () {

    /* If the user is connected and the turn is his/hers */
    if (connect && turn) {
      $ (this).html ('<img src="' + icon + '" />');

      /* Get the Position of the Box */
      var col = $ ('td').index (this) % 3;
      var row = $ ('tr').index ($ (this).parent ());
      compo [row][col] = 1;
      socket.emit ('move', compo);

      /* Change the turn */
      turn = !turn;
    }
  });

  /* Socket Events */
  socket.on ('create', function (message) {
    console.log (message);
  });

});