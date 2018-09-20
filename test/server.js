const net = require('net')
const assert = require('assert')
const Server = require('../server/server')
const easysocket = require('../server/easysocket')
const protobuf = require('protobufjs')

describe('Server', function () {
  describe('#start()', function () {
    let server = null
    let client = null

    it('create the server', () => {
      server = new Server()
      assert.ok('ok')
    })

    it('create with an invalid port, will throw an error', async () => {
      try {
        await server.start('not a number')
      } catch (error) {
        assert.strictEqual(error.message, 'invalid port input')
      }

      try {
        // port is between 0 and 65535
        await server.start(65536)
      } catch (error) {
        assert.strictEqual(error.message, 'invalid port input')
      }
    })

    it('start the server', async () => {
      await server.start(3000)
      assert.strictEqual(server.tcpServer.listening, true)
    })

    it('connect one client', done => {
      client = net.createConnection(3000)
      client.on('ready', () => {
        done()
      })
    })

    it('start the server again, will throw a reject', async () => {
      await assert.rejects(async () => {
        await server.start(3000)
      }, { name: 'Error [ERR_SERVER_ALREADY_LISTEN]' })
    })
  })
})

// const net = require('net')
// const Promise = require('bluebird')
// const assert = require('assert')
// const Server = require('../server.js')
// const helper = require('../lib/socket-helper')
// const pb = require('protobufjs')
//
// describe('SocketServer Testing...', function () {
//   it('#server.start()', async () => {
//     await Server.start(3000, './proto/main.proto')
//     assert.strictEqual(Server._server.listening, true)
//   })
//
//   it('#serve one client', async () => {
//     var socket = await connect()
//     var pong = await ping(socket, 1)
//     assert.strictEqual(pong.index, 1)
//   })
// })
//
// function connect () {
//   return new Promise((resolve, reject) => {
//     var socket = net.createConnection(3000, '127.0.0.1', () => {
//       resolve(socket)
//     })
//   })
// }
//
// function ping (socket, index) {
//   return new Promise((resolve, reject) => {
//     pb.load('./proto/main.proto', (err, root) => {
//       if (err) throw err
//       console.log(root)
//
//       var Ping = root.lookupType('main.Ping')
//       // var Pong = root.lookupType('main.Pong')
//       var payload = { index }
//
//       var errMsg = Ping.verify(payload)
//       if (errMsg) throw new Error(errMsg)
//
//       var msg = Ping.create(payload)
//       var buffer = Ping.encode(msg).finish()
//
//       helper.send(socket, 1001, buffer)
//
//       socket.on('data', data => {
//         helper.recieve(socket, data, (socket, index, buffer) => {
//           var Pong = root.lookupType('main.Pong')
//           msg = Pong.decode(buffer)
//           resolve(msg)
//         })
//       })
//     })
//   })
// }
