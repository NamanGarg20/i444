import Path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import querystring from 'querystring';

import {AppError, Spreadsheet} from 'cs544-ss';

import Mustache from './mustache.mjs';

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

//some common HTTP status codes; not all codes may be necessary
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

const __dirname = Path.dirname(new URL(import.meta.url).pathname);

export default function serve(port, store) {
  process.chdir(__dirname);
  const app = express();
  app.locals.port = port;
  app.locals.store = store;
  app.locals.mustache = new Mustache();
  app.use('/', express.static(STATIC_DIR));
 // setupTemplates(app);
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


/*********************** Routes and Handlers ***************************/

function setupRoutes(app) {
  app.use(bodyParser.urlencoded({extended: true}));
  
  //@TODO add routes
    app.get('/index.html', doSubmit(app));
    app.post('/index.html', postSubmit(app));
    app.get('/spreadsheet.html', doView(app));
    app.post('/spreadsheet.html', postView(app));
  //must be last
  app.use(do404(app));
  app.use(doErrors(app));

}

function doSumit(app) {
  return async function(req, res) {
     // var spreadsheetName = trimValues(req.body).ssName;
      var ss_view = {};
      ss_view['ssName'] = 'spreadsheetName';
      res.status(OK).send(app.locals.mustache.render('index', ss_view));
      
  };
}
               
function postSubmit(app){
   return async function(req, res) {
       
       var spreadsheetName = trimValues(req.body).ssName;
       var ss_view = {};
       ss_view['ssName'] = spreadsheetName;
       var errors ={};
       errors = validateField('ssName', req.body, errors);
       if(!errors){
           try{
       var spreadsheet = await Spreadsheet.make(spreadsheetName, app.locals.store);
       var ssDump = await spreadsheet.dump();
       if(ssDump!==undefined || ssDump.length!==0){
           res.redirect('ss'+spreadsheetName);
       }
           }catch(err){
               console.error(err);
           }
       }
       if(errors){
            res.status(NOT_FOUND).send(app.locals.mustache.render('index', ss_view));
       }
       
   };
}

//@TODO add handlers
function doView(app){
    return async function(req, res) {
        
        var spreadsheetName = req.params.ssName;
        var ss_view = {};
        ss_view['ssName'] = spreadsheetName;
        
        var spreadsheet = await spreadsheet.make(spreadsheetName, app.locals.store);
        var ssDump = await spreadsheet.dump();
        var ssTable = doTable(ssDump);
        var ssTableValues = ssTable[1];
        for(var node of ssDump){
            var col = node[0].charCodeAt(0)-96;
            var row = parseInt(node[0].substring[1]);
            var value = await spreadsheet.query(node[0]).value;
            ssTableValues[row][col] = value;
        }
        ss_view['tableCol'] = ssTable[0];
        ss_view['tableRow'] = ssTableValues;
        if(ssDump!==undefined || ssDump.length!==0){
            res.status(OK).send(app.locals.mustache.render('spreadsheet', ss_view));
        }
        else{
            var index_view ={};
            index_view['ssName'] = spreadsheetName;
             res.status(NOT_FOUND).send(app.locals.mustache.render('index', index_view));
        }
    };
}

function postView(app){
    return async function(req,res){
        var ss_obj = trimValues(req.body);
        var spreadsheetName = ss_obj.ssName;
        var ss_view={};
        
        var errors = {};
        var validError = validateUpdate(ss_obj,req.body);
        if(!validError){
            var ss = await Spreadsheet.make(spreadsheetName, app.locals.store);
            const act = ss_obj.ssAct ?? '';
            switch(act){
                case 'clear':
                    await ss.clear();
                    break;
                case 'deleteCell':
                    await ss.delete(ss_obj.cellId);
                    break;
                case 'updateCell':
                    await ss.eval(ss_obj.cellId,ss_obj.formula);
                    break;
                case 'copyCell':
                    await ss.copy(ss_obj.cellId,ss_obj.formula);
                    break;
                default:
                    console.log("Action not selected");
            }
            res.redirect('/ss/'+spreadsheetName);
        }
        else{
            res.sendStatus(BAD_REQUEST);
        }
    };
}

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    res.status(NOT_FOUND).
      send(app.locals.mustache.render('errors',
				      { errors: [{ msg: message, }] }));
  };
}

/** Ensures a server error results in an error page sent back to
 *  client with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.send(app.locals.mustache.render('errors',
					{ errors: [ {msg: err.message, }] }));
    console.error(err);
  };
}

/************************* SS View Generation **************************/

const MIN_ROWS = 10;
const MIN_COLS = 10;
const Str_values = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
//@TODO add functions to build a spreadsheet view suitable for mustache

function doTable(ssDump){
    var max_row=MIN_ROWS;
    var max_col=MIN_COLS;
    for(var node of ssDump){
        var col_ref= node[0].charCodeAt(0) - 96;
        var row_ref = parseInt(node[0].substring(1));
        if(max_col<col_ref){
            max_col = col_ref;
        }
        if(max_row<row_ref){
            max_row = row_ref;
        }
    }
    var tableColHeader=[];
    var tableValues=[];
    var table=[];
    for(var i=0; i<max_col;i++){
        tableColHeader.push(Str_values[i]);
    }
    table.push(tableColHeader);
    for(var i=0;i<max_row;i++){
        var tableRow =[];
        tableRow.push(i+1);
        for(var j=0;j<max_col;j++){
            tableRow.push("");
        }
        tableValues.push(tableRow);
    }
    table.push(tableValues);
    return table;
    
    
}

/**************************** Validation ********************************/


const ACTS = new Set(['clear', 'deleteCell', 'updateCell', 'copyCell']);
const ACTS_ERROR = `Action must be one of ${Array.from(ACTS).join(', ')}.`;

//mapping from widget names to info.
const FIELD_INFOS = {
  ssAct: {
    friendlyName: 'Action',
    err: val => !ACTS.has(val) && ACTS_ERROR,
  },
  ssName: {
    friendlyName: 'Spreadsheet Name',
    err: val => !/^[\w\- ]+$/.test(val) && `
      Bad spreadsheet name "${val}": must contain only alphanumeric
      characters, underscore, hyphen or space.
    `,
  },
  cellId: {
    friendlyName: 'Cell ID',
    err: val => !/^[a-z]\d\d?$/i.test(val) && `
      Bad cell id "${val}": must consist of a letter followed by one
      or two digits.
    `,
  },
  formula: {
    friendlyName: 'cell formula',
  },
};


/** return true iff params[name] is valid; if not, add suitable error
 *  message as errors[name].
 */
function validateField(name, params, errors) {
  const info = FIELD_INFOS[name];
  const value = params[name];
  if (isEmpty(value)) {
    errors[name] = `The ${info.friendlyName} field must be specified`;
    return false;
  }
  if (info.err) {
    const err = info.err(value);
    if (err) {
      errors[name] = err;
      return false;
    }
  }
  return true;
}

  
/** validate widgets in update object, returning true iff all valid.
 *  Add suitable error messages to errors object.
 */
function validateUpdate(update, errors) {
  const act = update.ssAct ?? '';
  switch (act) {
    case '':
      errors.ssAct = 'Action must be specified.';
      return false;
    case 'clear':
      return validateFields('Clear', [], ['cellId', 'formula'], update, errors);
    case 'deleteCell':
      return validateFields('Delete Cell', ['cellId'], ['formula'],
			    update, errors);
    case 'copyCell': {
      const isOk = validateFields('Copy Cell', ['cellId','formula'], [],
				  update, errors);
      if (!isOk) {
	return false;
      }
      else if (!FIELD_INFOS.cellId.err(update.formula)) {
	  return true;
      }
      else {
	errors.formula = `Copy requires formula to specify a cell ID`;
	return false;
      }
    }
    case 'updateCell':
      return validateFields('Update Cell', ['cellId','formula'], [],
			    update, errors);
    default:
      errors.ssAct = `Invalid action "${act}`;
      return false;
  }
}

function validateFields(act, required, forbidden, params, errors) {
  for (const name of forbidden) {
    if (params[name]) {
      errors[name] = `
	${FIELD_INFOS[name].friendlyName} must not be specified
        for ${act} action
      `;
    }
  }
  for (const name of required) validateField(name, params, errors);
  return Object.keys(errors).length === 0;
}


/************************ General Utilities ****************************/

/** return new object just like paramsObj except that all values are
 *  trim()'d.
 */
function trimValues(paramsObj) {
  const trimmedPairs = Object.entries(paramsObj).
    map(([k, v]) => [k, v.toString().trim()]);
  return Object.fromEntries(trimmedPairs);
}

function isEmpty(v) {
  return (v === undefined) || v === null ||
    (typeof v === 'string' && v.trim().length === 0);
}

/** Return original URL for req.  If index specified, then set it as
 *  _index query param 
 */
function requestUrl(req, index) {
  const port = req.app.locals.port;
  let url = `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
  if (index !== undefined) {
    if (url.match(/_index=\d+/)) {
      url = url.replace(/_index=\d+/, `_index=${index}`);
    }
    else {
      url += url.indexOf('?') < 0 ? '?' : '&';
      url += `_index=${index}`;
    }
  }
  return url;
}
            



