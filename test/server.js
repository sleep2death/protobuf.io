const net = require('net')
const assert = require('assert')
const Server = require('../server/server')
const Client = require('../server/client')
const transport = require('../server/transport')
const builder = require('../server/packet-builder')

describe('Server', function () {
  let server = null
  let client = null

  describe('#start()', function () {
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
      await server.start(30001)
      assert.strictEqual(server.tcpServer.listening, true)
    })

    it('connect one client', done => {
      client = net.createConnection(30001)
      // receive the 'open' data
      client.on('data', data => {
        transport.recieve(client, data, (conn, index, buffer) => {
          assert.strictEqual(index, 1000)
          var res = builder.decode(index, buffer)
          assert.strictEqual(res.name, 'open')

          done()
        })
      })
    })

    it('start the server again, will throw a reject', async () => {
      await assert.rejects(async () => {
        await server.start(30001)
      }, Error)
    })
  })

  describe('#stop()', function () {
    it('stop the server', async () => {
      await server.stop()
      assert.strictEqual(server.tcpServer.listening, false)
      assert.strictEqual(Client.getConnectionsCount(), 0)
    })

    it('stop the server again, will throw a reject', async () => {
      await assert.rejects(async () => {
        await server.stop()
      }, Error)
    })
  })
})
