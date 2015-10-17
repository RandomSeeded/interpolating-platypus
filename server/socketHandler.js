var app = require(__dirname + "/server.js");

var io = module.exports.io = require('socket.io').listen(app.server);

console.log("Socket.io server listening");

var userMap = {

};


io.on('connection', function(socket) {
  console.log('a user connected');
  // on connection, getCurrentUser, searchDatabase for currentUser, respondwithFriendsList
  socket.on('sendMessage', function(to, message) {

  });

});




/*
  module.exports.listen to server.js to set up io

  set up all handlers (socket.on()) inside listen function
    connection
      respond to user with their friends list

    sendMessage (handles receipt of new message from users)
      {
        to: ,
        message: 
      }
      verify users are friends before sending message to recipient
    
    addFriend
      {
        to: 
      }
      notify requested friend of friend request
    
    sendPGP
      {
        key: ,
        to: 
      }
      send pgp key to recipient 
        socket.emit('keyReceived') {key, from}
    
    requestKey
      {
        to
      }
      request PGP key from 'to'
        socket.emit('keyRequested' {from}) 
    disconnect
      notify all friends that this user has signed off

*/
