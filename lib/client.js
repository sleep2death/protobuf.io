const logger = require('../utils/logger')
const EventEmitter = require('events').EventEmitter

class Client extends EventEmitter {
  constructor (id, server, socket) {
    super()

    this.id = id
    this.server = server
    this.socket = socket

    this.state = 'opening'
    this.setup()
  }

  setup () {
    this.socket.on('error', this.onError.bind(this))
    this.socket.once('close', this.onClose.bind(this))
    this.socket.on('data', this.onData.bind(this))
  }

  onError (error) {
    logger.error('client error: %s', error.message)
    this.close(error.message)
  }

  onClose (reason) {
    this.cleanup()
    this.emit('close', reason)
  }

  onData (data) {
  }

  close (reason) {
    reason = reason || 'force close'
    if (this.state !== 'open') return
    // TODO if write buffer is not empty, send it first
    this.state = 'closing'
    this.socket.destroy()
    this.onClose(reason)
  }

  cleanup () {
    this.state = 'closed'
    this.socket.removeAllListeners()
  }
}

module.exports = Client
