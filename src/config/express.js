import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import errors from 'errors';
import httpStatus from 'http-status';
import winstonInstance from './winston';
import routes from '../server/routes/index.route';
import config from './env';
import APIError from '../server/helpers/APIError';

const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}

// mount all routes on / path
app.use('/', routes);

// if error is not an instanceOf errors.AtlasAPIError, convert it.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    const error = new errors.ValidationError(unifiedErrorMessage);
    return res.jerror(error);
  }
  return res.jerror(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => { // eslint-disable-line no-unused-vars
  const err = new APIError('Unknown API route.', httpStatus.NOT_FOUND);
  return res.jerror(err);
});


// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance
  }));
}

export default app;
