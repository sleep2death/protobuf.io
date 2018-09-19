const net = require('net')
const Promise = require('bluebird')
const helper = require('./lib/socket-helper')
const indices = require('./proto/indices')
const pb = require('protobufjs')

function SocketServer () {
}

SocketServer._server = net.createServer(socket => {
  handleEvent(socket)
  SocketServer._clients.push(socket)
})

SocketServer.getConnections = () => {
  return new Promise((resolve, reject) => {
    SocketServer._server.getConnections((err, count) => {
      if (err) {
        reject(err)
      } else {
        resolve(count)
      }
    })
  })
}

SocketServer._clients = []

SocketServer.start = (port, proto) => {
  return new Promise((resolve, reject) => {
    try {
      pb.load(proto, (err, root) => {
        if (err) throw err
        // console.log(root.nested.main.nested)
        SocketServer._pb = root
        SocketServer._server.listen({ host: 'localhost', port }, () => {
          console.log('listening:', SocketServer._server.address())
          resolve(SocketServer)
        })
      })
    } catch (error) {
      throw error
    }
  })
}

SocketServer.stop = () => {
  return new Promise((resolve, reject) => {
    try {
      SocketServer._server.close(() => {
        console.log('server closed, now ready to kick all clients...')
        resolve(SocketServer)
      })
    } catch (error) {
      reject(error)
    }
  })
}

function handleEvent (socket) {
  socket.on('connect', hadError => {
    console.log('connected...')
  })

  socket.on('close', hadError => {
    console.log('client disconnected...')
  })

  socket.on('data', data => {
    helper.recieve(socket, data, msgHandler)
    // console.log('recv data:', data)
  })

  socket.on('end', data => {
    SocketServer._clients.splice(SocketServer._clients.indexOf(socket), 1)
    console.log('ended...')
  })

  socket.on('error', error => {
    console.error('got an error:', error.message)
  })

  socket.on('lookup', (error, address, family, host) => {
    if (error) return console.error('client had an error', error.message)
    console.log('lookup:', address, family, host)
  })

  socket.on('ready', () => {
    console.log('ready...')
  })

  socket.on('timeout', () => {
    console.log('timeout...')
  })
}

function msgHandler (socket, index, buffer) {
  var builder = SocketServer._pb.lookupType(indices.indexToType[index])
  var message = builder.decode(buffer)

  var res = handle(index, message)
  helper.send(socket, res.index, res.buffer)
}

function handle (index, message) {
  switch (index) {
    case indices.typeToIndex['main.Ping']:
      var builder = SocketServer._pb.lookupType('main.Pong')
      var msg = builder.create({ index: message.index })
      var buffer = builder.encode(msg).finish()
      return { index: indices.typeToIndex['main.Pong'], buffer }
  }
}

module.exports = SocketServer

/* pb.load('./proto/hello.proto', (err, root) => {
  if (err) throw err

  var HelloMsg = root.lookupType('greetings.HelloMsg')
  // var payload = { hello: 'Hello, World' }

  // var errMsg = hello.verify(payload)
  // if (errMsg) throw new Error(errMsg)
  //
  // var msg = hello.create(payload)
  // var buffer = hello.encode(msg).finish()

  app.get('/', (req, res) => {
    res.send('<h1>Hello world<h1>')
  })

  io.on('connection', socket => {
    console.log('a user connected...')

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })

    socket.on('pb', data => {
      console.log('pb >>', HelloMsg.decode(data))
    })
  })

  http.listen(3000, () => {
    console.log('listening on *:3000')
  })
}) */

// module.exports.loadProtocols = function (key, path) {
//   var pbjs = require('protobufjs/cli/pbjs')
//   pbjs.main(['--target', 'static-module', './proto/*.proto'], (err, output) => {
//     if (err) throw err
//     var pb = require(output)
//     console.log(pb)
//   })
//   console.log('path', path)
// }
