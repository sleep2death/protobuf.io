const net = require('net')
const Server = require('../index').Server
const assert = require('assert')
const logger = require('../utils/logger')

describe('Server', function () {
  var server = null

  describe('#init()', function () {
    it('new server with invalid port', done => {
      server = new Server({ port: 'invalid port' })
      server.start()
      // should throw an error event
      server.once('error', error => {
        logger.silly(error.message)
        done()
      })
    })

    it('new server, listen to port 3000', done => {
      server = new Server({ port: 3000 })
      server.start()
      server.once('listening', () => {
        done()
      })
    })
  })

  describe('#onConnection()', done => {
    it('get a client connected', done => {
      net.createConnection(3000)
      server.once('connection', connection => {
        assert.strictEqual(1, server.connectionCount)
        done()
      })
    })
    it('get another client connected', done => {
      net.createConnection(3000)
      server.once('connection', connection => {
        assert.strictEqual(2, server.connectionCount)
        done()
      })
    })
    it('send message to server', done => {
      var socket = net.createConnection(3000)

      server.once('connection', connection => {
        assert.strictEqual(3, server.connectionCount)

        var payload = server.transport.encode('handshake', { session: 'thisisasession' })

        server.transport.send(socket, payload)
        server.transport.send(socket, payload)
        server.transport.send(socket, payload)

        var callbackTimes = 0
        connection.on('message', msg => {
          assert.deepStrictEqual({ mType: 'handshake', session: 'thisisasession' }, msg)
          callbackTimes++
          if (callbackTimes === 3) done()
        })
      })
    })
    it('recieve message from server', done => {
      var socket = net.createConnection(3000)

      socket.on('data', data => {
        server.transport.recieve(socket, data, (socket, index, buffer) => {
          var msg = server.transport.decode(index, buffer)

          if (msg.errMsg) {
            assert.ok(false, msg.errMsg)
            return done()
          }
          assert.deepStrictEqual({ mType: 'ping', index: 0 }, msg)
          done()
        })
      })

      server.once('connection', connection => {
        assert.strictEqual(4, server.connectionCount)

        var payload = server.transport.encode('handshake', { session: 'thisisasession' })

        server.transport.send(socket, payload)
        connection.on('message', msg => {
          assert.deepStrictEqual({ mType: 'handshake', session: 'thisisasession' }, msg)
        })

        server.connections[connection.id].send('ping', { index: 0 })
      })
    })
  })

  describe('#close()', function () {
    it('close the server', done => {
      server.once('close', () => {
        assert.strictEqual(0, server.connectionCount)
        done()
      })
      server.close()
    })
  })
})
