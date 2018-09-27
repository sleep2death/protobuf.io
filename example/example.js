// create the new server with options,
// port is the listening port, default is 3000
// protocolPath is your proto file path, default is './proto/main.proto'
const protobuf = require('../index')
var server = new protobuf.Server({ port: 3000, protocolPath: './proto/main.proto' })

// server error handling
server.on('error', error => {
  console.error(error)
})

// when server start listening
server.on('listening', () => {
  console.log('Listening port:', server.port)
  // now create a transport to decode the message from server
  var transport = new protobuf.Transport()
  transport.loadProtocol('./proto/main.proto').then(transport => {
    // connect to the server
    var socket = require('net').createConnection(3000)
    socket.on('data', data => {
      // using transport to recieve and decode the message
      transport.recieve(socket, data, (socket, index, buffer) => {
        var msg = transport.decode(index, buffer)
        console.log('recieved a msg from server:', msg)
        var payload = transport.encode('ping', { index: 1 })
        transport.send(socket, payload)
        console.log('now send a ping with index:', 1)
      })
    })
  })
})

server.on('connection', client => {
  console.log('a client connected:', client.id)
  client.send('handshake', { session: 'thisisasession' })
  console.log('server send a handhsake message to client:', { session: 'this is a session' })
  client.on('message', msg => {
    console.log('recieved a message from client:', msg)
  })
})

// start the server
server.start()
