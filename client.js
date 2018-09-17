const pb = require('protobufjs')
const io = require('socket.io-client')

async function init () {
  const root = await pb.load('./proto/hello.proto')
  const HelloMsg = root.lookup('greetings.HelloMsg')

  const socket = io.connect('http://127.0.0.1:3000')

  socket.on('connect', () => {
    var payload = { hello: 'Hello, Protobuf' }
    var errMsg = HelloMsg.verify(payload)
    if (errMsg) throw Error(errMsg)

    var msg = HelloMsg.create(payload)
    var buffer = HelloMsg.encode(msg).finish()

    socket.emit('pb', buffer)
  })
}

init()
