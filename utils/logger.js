const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: './log/error.log', level: 'error' }),
    new winston.transports.File({ filename: './log/combined.log' })
  ]
})

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.align(),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: alignedWithColorsAndTime
  }))
}

module.exports = logger
