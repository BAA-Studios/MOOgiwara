import { createLogger, transports, format } from "winston";
import  DailyRotateFile from 'winston-daily-rotate-file';

const consoleTransport: transports.ConsoleTransportInstance = new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
});
/* const fileTransport: transports.FileTransportInstance = new transports.File({
    dirname: "logs",  // saves to ./logs in the server folder
    filename: "server.log",
    format: format.combine(format.json()),
}); */
const rotateTransport: DailyRotateFile = new DailyRotateFile({
    filename: '%DATE%.log',
    zippedArchive: true,
    dirname: "logs",
    maxSize: '20m',
    maxFiles: '14d'
});

const logger = createLogger({
    level: 'debug',  // set to error in production
    transports: [
        rotateTransport,
        consoleTransport,  // comment out to stop logging to console in production
    ],
    format: format.combine(format.align(), format.timestamp(), format.json()),
});
logger.exitOnError = false;

export default logger;
/* For reference:
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
}; */