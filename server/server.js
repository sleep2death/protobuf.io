const net = require('net')
const logger = require('../utils/logger')
const Promise = require('bluebird')
const Client = require('./client')
const Transport = require('./transport')

const Server = function () {
  this.tcpServer = net.createServer()
  this.port = 30001
}

// start the server
Server.prototype.start = function (port = 30001, protoPath = './proto/main.proto') {
  return new Promise((resolve, reject) => {
    // validate and set the port
    PortAvailable(port).then(port => {
      logger.silly('port' + port + ' is available!')
      this.port = port

      // load the protocols
      Transport.loadProtocol(protoPath).then(transport => {
        try {
          this.tcpServer.listen(this.port, () => {
            logger.info('start listening on %d', this.port)

            this.tcpServer.on('connection', this.onconnection.bind(this))
            this.tcpServer.on('error', this.onerror.bind(this))
            this.tcpServer.on('close', this.onclose.bind(this))

            resolve(this)
          })
        } catch (error) {
          reject(error)
        }
      }).catch(error => {
        reject(error)
      })
    }).catch(error => {
      reject(error)
    })
  })
}

Server.prototype.stop = function () {
  return new Promise((resolve, reject) => {
    this.tcpServer.close(error => {
      if (error) {
        logger.error(error.message)
        return reject(error)
      }
      resolve(this)
    })

    Client.disconnectAll()
  })
}

Server.prototype.onerror = function (error) {
  logger.error('server error:', error)
}

Server.prototype.onconnection = function (socket) {
  var uid = Client.add(this, socket)
  logger.info('got a client connected %s', uid)
}

Server.prototype.onclose = function () {
  logger.info('server closed')
}

module.exports = Server

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
