const net = require('net')
const logger = require('../utils/logger')
const EventEmitter = require('events').EventEmitter
const shortid = require('shortid')
const Connection = require('./connection')
const Transport = require('../utils/transport')

class Server extends EventEmitter {
  constructor (opts) {
    super()

    opts = opts || {}

    this.port = opts.port || 3000
    this.pingInterval = opts.pingInterval || 25000
    this.pingTimeout = opts.pintTimeout || 5000
    this.protocolPath = opts.protocolPath || './proto/main.proto'

    // connections dictionary
    this.connections = {}
    this.connectionCount = 0

    this.transport = new Transport()
  }

  async start () {
    try {
      await PortAvailable(this.port)
      await this.transport.loadProtocol(this.protocolPath)
      this._server = net.createServer()

      // bind listeners
      this._server.on('listening', this.onListening.bind(this))
      this._server.on('connection', this.onConnection.bind(this))
      this._server.on('error', this.onError.bind(this))
      this._server.on('close', this.onClose.bind(this))

      this._server.listen(this.port)
    } catch (error) {
      this.emit('error', error)
    }
  }

  close () {
    // closing all connections
    for (var i in this.connections) {
      if (this.connections.hasOwnProperty(i)) {
        this.connections[i].close()
      }
    }
    // then close the server
    // 'close' even will not fire until all connection destoyed
    this._server.close()
  }

  onListening () {
    this.emit('listening', this)
  }

  onConnection (socket) {
    var id = shortid.generate()

    var conn = new Connection(id, this, socket)
    this.connections[id] = conn

    conn.once('close', () => {
      delete this.connections[id]
      this.connectionCount--
    })

    this.connectionCount++
    this.emit('connection', conn)
  }

  onError (error) {
    logger.error('server error %o', error)
    this.emit('error', error)
  }

  onClose () {
    this.emit('close')
    // clean up after the close event fired
    this._server.removeAllListeners()
  }
}

// check if the port is available or not
function PortAvailable (port) {
  return new Promise((resolve, reject) => {
    const portReg = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/g
    if (!portReg.test(String(port))) {
      reject(new Error('invalid port input'))
      return
    }

    const tester = net.createServer()
      .once('error', error => { reject(error) })
      .once('listening', () => tester.once('close', () => resolve(port)).close())
      .listen(port)
  })
}

module.exports = Server
