const net = require('net')
const logger = require('../utils/logger')
const EventEmitter = require('events').EventEmitter

class Server extends EventEmitter {
  constructor (opts) {
    super()

    opts = opts || {}

    this.port = opts.port || 3000
    this.pingInterval = opts.pingInterval || 25000
    this.pingTimeout = opts.pintTimeout || 5000

    this.init()
  }

  async init () {
    try {
      await PortAvailable(this.port)
      this._server = net.createServer()

      // bind listeners
      this._server.on('listening', this.onListening.bind(this))
      this._server.on('connection', this.onConnection.bind(this))
      this._server.on('error', this.onError.bind(this))
      this._server.on('close', this.onClose.bind(this))

      // clients dictionary
      this._clients = {}
      this._clientsCount = 0

      this._server.listen(this.port)
    } catch (error) {
      this.emit('error', error)
    }
  }

  onListening () {
    this.emit('listening')
  }

  onConnection (conn) {
  }

  onError (error) {
    logger.error('server error %o', error)
    this.emmit(error)
  }

  onClose () {
    this.emmit('close')
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
