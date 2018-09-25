const logger = require('./logger')
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
  }

  setup () {
    this.socket.on('error', this.onError.bind(this))
    this.socket.on('close', this.onClose.bind(this))
    this.socket.on('data', this.onData.bind(this))
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
    this.server.protocol.recieve(this.socket, data, (socket, index, buffer) => {
      var msg = this.server.protocol.decode(index, buffer)
      if (msg.errMsg) this.onError(msg.errMsg)
      this.emit('message', msg)
    })
  }

  close (reason) {
    reason = reason || 'force close'
    // TODO if write buffer is not empty, send it first
    this.state = 'closing'
    this.onError(reason)
  }
}

module.exports = Client
