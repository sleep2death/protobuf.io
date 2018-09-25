const logger = require('../utils/logger')
const _ = require('lodash')
const EventEmitter = require('events').EventEmitter

class Client extends EventEmitter {
  constructor (id, server, socket) {
    super()

    this.id = id
    this.server = server
    this.socket = socket

    this.state = 'open'

    this.setup()
    this.handshake()
  }

  setup () {
    this.socket.on('error', this.onError.bind(this))
    this.socket.on('close', this.onClose.bind(this))
    this.socket.on('data', this.onData.bind(this))
  }

  handshake () {
  }

  onError (error) {
    var reason = ''
    if (_.isString(error)) {
      reason = error
    } else {
      reason = error.message
    }

    logger.silly('client error: %s', reason)
    this.onClose(reason)
  }

  onClose (reason) {
    this.emit('close', reason)
    this.state = 'closed'
    this.socket.destroy()
    // clean up after the close event fired
    this.socket.removeAllListeners()
  }

  onData (data) {
  }

  close (reason) {
    reason = reason || 'force close'
    // TODO if write buffer is not empty, send it first
    this.state = 'closing'
    this.onError(reason)
  }
}

module.exports = Client
