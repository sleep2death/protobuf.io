class Test {
  constructor (a, b) {
    this.a = a
    this.b = b
  }

  static add (test) {
    return test.a + test.b
  }
}

var test = new Test(1, 2)
console.log(test.a, test.b, Test.add(test))

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
