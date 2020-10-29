import assert from 'assert';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import {AppError} from 'cs544-ss';

/** Storage web service for spreadsheets.  Will report DB errors but
 *  will not make any attempt to report spreadsheet errors like bad
 *  formula syntax or circular references (it is assumed that a higher
 *  layer takes care of checking for this and the inputs to this
 *  service have already been validated).
 */

//some common HTTP status codes; not all codes may be necessary
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

export default function serve(port, ssStore) {
  const app = express();
  app.locals.port = port;
  app.locals.ssStore = ssStore;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

const CORS_OPTIONS = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: 'Location',
};

const BASE = 'api';
const STORE = 'store';


function setupRoutes(app) {
  app.use(cors(CORS_OPTIONS));  //needed for future projects
  //@TODO add routes to handlers
<<<<<<< HEAD
    app.use(bodyParser.json());
    
    //must be last
    app.use(do404(app));
    app.use(doErrors(app));
=======
>>>>>>> e5ae8440faeb2f991d60e3a5d22c6af804568e65
}

/****************************** Handlers *******************************/

//@TODO
<<<<<<< HEAD
function doGet(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.ssStore.readFormulas({ id: id });
      if (results.length === 0) {
    throw {
      isDomain: true,
      errorCode: 'NOT_FOUND',
      message: `user ${id} not found`,
    };
      }
      else {
          res.status(OK);
    res.json(results);
      }
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doDelete(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.ssStore.clear({ id: id });
      res.sendStatus(NO_CONTENT);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doUpdate(app) {
  return (async function(req, res) {
    try {
      const patch = Object.assign({}, req.body);
      patch.id = req.params.id;
      const results = app.locals.model.updateCell(patch);
      res.sendStatus(OK);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doReplace(app) {
  return (async function(req, res) {
    try {
      const replacement = Object.assign({}, req.body);
      replacement.id = req.params.id;
      const results = await app.locals.model.replace(replacement);
      res.sendStatus(OK);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
=======
>>>>>>> e5ae8440faeb2f991d60e3a5d22c6af804568e65

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: NOT_FOUND,
      error: { code: 'NOT_FOUND', message, },
    };
    res.status(404).
	json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const result = {
      status: SERVER_ERROR,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
    res.status(SERVER_ERROR).json(result);
    console.error(err);
  };
}


/*************************** Mapping Errors ****************************/

const ERROR_MAP = {
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code and an error property containing an object with with code and
 *  message properties.
 */
function mapError(err) {
  const isDomainError = (err instanceof AppError);
  const status =
    isDomainError ? (ERROR_MAP[err.code] || BAD_REQUEST) : SERVER_ERROR;
  const error = 
	isDomainError
	? { code: err.code, message: err.message } 
        : { code: 'SERVER_ERROR', message: err.toString() };
  if (!isDomainError) console.error(err);
  return { status, error };
} 

/****************************** Utilities ******************************/



/** Return original URL for req */
function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
