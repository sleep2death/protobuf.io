const net = require('net')
const Server = require('../server').Server
const assert = require('assert')
const logger = require('../server/logger')

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

    it('new server', done => {
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
      server.once('connection', client => {
        assert.strictEqual(1, server.clientsCount)
        done()
      })
    })
    it('get another client connected', done => {
      net.createConnection(3000)
      server.once('connection', client => {
        assert.strictEqual(2, server.clientsCount)
        done()
      })
    })
  })

  describe('#close()', function () {
    it('close the server', done => {
      server.once('close', () => {
        assert.strictEqual(0, server.clientsCount)
        done()
      })
      server.close()
    })
  })
})
