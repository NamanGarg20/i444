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

    app.use(bodyParser.json());
    //retrieve all spreadsheet data
    app.get('/api/store/:spreadsheetName', doGetSpreadsheet(app));
    // replace all spreadsheet data
    app.put('/api/store/:spreadsheetName', doReplace(app));
    //Update spreadsheet data
    app.patch('/api/store/:spreadsheetName',doUpdateSpreadsheet(app) );
    //Clear spreadsheet
    app.delete('/api/store/:spreadsheetName', doClear(app));
   // Replace spreadsheet cell
    app.put('/api/store/:spreadsheetName/:cellId',doReplaceSpreadsheetCell(app));
    //Update spreadsheet cell
    app.patch('/api/store/:spreadsheetName/:cellId',doUpdateSpreadsheetCell(app));
     //Delete spreadsheet cell
    app.delete('/api/store/:spreadsheetName/:cellId', doDeleteCell(app));
    //must be last
    app.use(do404(app));
    app.use(doErrors(app));
}

/****************************** Handlers *******************************/

//@TODO

function doGetSpreadsheet(app) {
  return (async function(req, res) {
      try {
      var ss = req.params.spreadsheetName;
      var results = await app.locals.ssStore.readFormulas(ss);
      res.status(OK).json(results);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function doClear(app) {
  return (async function(req, res) {
    try {
      const ss = req.params.spreadsheetName;
      await app.locals.ssStore.clear(ss);
      res.sendStatus(NO_CONTENT);
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
    var result ;
      const ss_Name = req.params.spreadsheetName;
        const obj =  Object.assign({}, req.body);
        await app.locals.ssStore.clear(ss_Name);
        for(var key in obj){
            if (obj.hasOwnProperty(key)){
            result = await app.locals.ssStore.updateCell(ss_Name, obj[key][0], obj[key][1]);
            }else{
            res.sendStatus(BAD_REQUEST);
            }
        }
      res.sendStatus(CREATED);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}


function doUpdateSpreadsheet(app) {
  return (async function(req, res) {
      try {
          var obj = Object.assign({}, req.body);
          var ss_Name = req.params.spreadsheetName;
          let results ;
        
          for(var key in obj){
              if (obj.hasOwnProperty(key)){
              results = await app.locals.ssStore.updateCell(ss_Name, obj[key][0], obj[key][1]);
              }else{
              res.sendStatus(BAD_REQUEST);
              }
          }
      res.sendStatus(NO_CONTENT);
        }
    catch(err) {
        const mapped = mapError(err);
        res.status(mapped.status).json(mapped);
        }
  });
}
            
function doUpdateSpreadsheetCell(app) {
        return (async function(req, res) {
            try {
         const ss = req.params.spreadsheetName;
            const cellId = req.params.cellId;
         const formula = req.body.formula;
            if(formula=== undefined) {
                res.sendStatus(BAD_REQUEST);
            }
      var result =  await app.locals.ssStore.updateCell(ss, cellId, formula);
        res.sendStatus(CREATED);
                } catch(err) {
                  const mapped = mapError(err);
                  res.status(mapped.status).json(mapped);
                }
                
              });
            }
      
function doReplaceSpreadsheetCell(app) {
        return (async function(req, res) {
              try {
        const ss = req.params.spreadsheetName;
        const cellId = req.params.cellId;
        const formula = req.body.formula;
        if(formula === undefined) {
            res.sendStatus(BAD_REQUEST);
        }
        
        var result =  await app.locals.ssStore.updateCell(ss, cellId, formula);
        res.sendStatus(CREATED);
            } catch(err) {
              const mapped = mapError(err);
              res.status(mapped.status).json(mapped);
            }
            
    });
}

function doDeleteCell(app){
        return (async function(req, res){
            try {
            var ssName = req.params.spreadsheetName;
            var id = req.params.cellId;
            var result = await app.locals.ssStore.delete(ssName, id);
                res.sendStatus(NO_CONTENT);
            } catch(err) {
              const mapped = mapError(err);
              res.status(mapped.status).json(mapped);
            }
            
        });
    }

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
