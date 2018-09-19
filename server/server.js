const net = require('net')
const logger = require('../utils/logger')
const Promise = require('bluebird')
const isPortAvailable = require('is-port-available')

const Server = function () {
  if (!(this instanceof Server)) {
    return new Server()
  }

  this.tcpServer = net.createServer()
}

Server.prototype.start = function (port) {
  return new Promise((resolve, reject) => {
    // validate the port
    const portReg = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/g
    if (!portReg.test(String(port))) {
      reject(new Error('invalid port input'))
      return
    }

    // set the port
    isPortAvailable(port).then(status => {
      if (status) {
        logger.silly('Port ' + port + ' IS available!')
        this.port = port

        try {
          var self = this

          this.tcpServer.listen(this.port, '127.0.0.1', function () {
            logger.info('start listening on %d', self.port)

            self.tcpServer.on('connection', self.onconnection.bind(self))
            self.tcpServer.on('error', self.onerror.bind(self))

            self.tcpServer.on('close', self.onclose.bind(self))

            resolve(self)
          })
        } catch (error) {
          reject(error)
        }
      } else {
        logger.error('Port ' + port + ' IS NOT available!')
        logger.error('Reason : ' + isPortAvailable.lastError)
        reject(isPortAvailable.lastError)
      }
    })
  })
}

Server.prototype.onerror = function (error) {
  logger.error('server error:', error)
}

Server.prototype.onconnection = function (socket) {
  logger.info('got a client connected %o', socket.address())
}

Server.prototype.onclose = function () {
  logger.error('server closed')
}

module.exports = Server
