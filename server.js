const pb = require('protobufjs')
const app = require('express')()
const http = require('http').Server(app, { pingTimeout: 5000, pingInterval: 1000 })
const io = require('socket.io')(http)

pb.load('./proto/hello.proto', (err, root) => {
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
})
