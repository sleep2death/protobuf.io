const shortid = require('shortid')
const util = require('util')
const EventEmitter = require('events').EventEmitter
const logger = require('../utils/logger')
const builder = require('./packet-builder')
const transport = require('./transport')

// client constructor
const Client = function () {
  this.server = null // the server ref
  this.conn = null // the socket client ref
  this.id = null // the uid

  this.state = 'closed' // client state

  this.checkIntervalTimer = null // interval of checking state
  this.pingTimeoutTimer = null // interval of the ping timeout
}

util.inherits(Client, EventEmitter)

// set up the client instance, and open the client
Client.prototype.setup = function (server, conn, id) {
  this.server = server
  this.conn = conn
  this.id = id

  this.state = 'opening'

  this.conn.on('data', this.ondata.bind(this))
  this.conn.on('error', this.onerror.bind(this))
  this.conn.on('close', this.onclose.bind(this))

  this.onOpen()
}

Client.prototype.onOpen = function () {
  var msg = builder.encode('open', { id: this.id, pingInterval: this.server.pingInterval, pingTimeout: this.server.pingTimeout })
  transport.send(this.conn, msg.index, msg.buffer, conn => {
    this.state = 'open'
  })
  // console.log(msg.index, msg.buffer)
}

Client.prototype.ondata = function (data) {
  logger.info(data)
}

Client.prototype.close = function () {
  try {
    this.state = 'closing'
    this.conn.destroy()
  } catch (error) {
    logger.error('client [%s] error %s:', this.id, error.message)
  }
}

Client.prototype.onerror = function (error) {
  logger.error('client [%s] error %s:', this.id, error.message)
}

Client.prototype.onclose = function () {
  logger.info('client closed %s', this.id)
  this.cleanup()
}

Client.prototype.cleanup = function () {
  this.conn.removeAllListeners()
  delete Client.connections[this.id]

  this.state = 'closed'

  this.conn = null
  this.server = null

  Client.pool.recycle(this)
}

Client.add = function (server, conn) {
  var id = shortid.generate()
  var client = Client.pool.use()
  client.setup(server, conn, id)
  Client.connections[id] = client

  return id
}

Client.disconnectAll = function () {
  for (var key in Client.connections) {
    Client.connections[key].close()
  }
}

Client.getConnectionsCount = function () {
  return Object.keys(Client.connections).length
}

Client.pool = require('deepool').create(() => {
  return new Client()
})

Client.connections = {}

module.exports = Client
