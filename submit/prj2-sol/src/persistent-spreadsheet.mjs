import AppError from './app-error.mjs';
import MemSpreadsheet from './mem-spreadsheet.mjs';

//use for development only
import { inspect } from 'util';

import mongo from 'mongodb';

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };



/**
 * User errors must be reported by throwing a suitable
 * AppError object having a suitable message property
 * and code property set as follows:
 *
 *  `SYNTAX`: for a syntax error.
 *  `CIRCULAR_REF` for a circular reference.
 *  `DB`: database error.
 */

export default class PersistentSpreadsheet{
   

  //factory method
  static async make(dbUrl, spreadsheetName) {
      
      let client
      let db;
    try {
      //@TODO set up database info, including reading data
      
         client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS);
         db = client.db(spreadsheetName);
       
    }
    catch (err) {
      const msg = `cannot connect to URL "${dbUrl}": ${err}`;
      throw new AppError('DB', msg);
    }
    return new PersistentSpreadsheet(client, db);
  }

 constructor(client, db ) {
       //@TODO
         this.client = client;
         this.db = db;
     this.collection = this.db.collection('spreadsheet');
         this.MemSpreadsheet = new MemSpreadsheet();
    
         
     }

  /** Release all resources held by persistent spreadsheet.
   *  Specifically, close any database connections.
   */
  async close() {
    //@TODO
      try {
          await this.client.close();
        }
        catch (err) {
          throw new AppError('DB', err.toString());
        }
      }
  

  /** Set cell with id baseCellId to result of evaluating string
   *  formula.  Update all cells which are directly or indirectly
   *  dependent on the base cell.  Return an object mapping the id's
   *  of all dependent cells to their updated values.
   */
  async eval(baseCellId, formula) {
      const results = /* @TODO delegate to in-memory spreadsheet */
       this.MemSpreadsheet.eval(baseCellId, formula);
      
    try {
      //@TODO
        
       //     console.log(this.query(baseCellId));
        if(this.collection.find({"id": Object.keys(results)})){
        await this.collection.insertOne({"id": Object.keys(results)}, results);
            
        }
        else{
            await this.collection.deleteOne({"id": Object.keys(results)});
            await this.collection.insertOne({"id": Object.keys(results)}, results);
        }
        
    }
    catch (err) {
      //@TODO undo mem-spreadsheet operation
        this.MemSpreadsheet.undo();
      const msg = `cannot update "${baseCellId}: ${err}`;
      throw new AppError('DB', msg);
    }
    return results;
  }

  /** return object containing formula and value for cell cellId 
   *  return { value: 0, formula: '' } for an empty cell.
   */
  async query(cellId) {
      return  this.MemSpreadsheet.query(cellId);
      /* @TODO delegate to in-memory spreadsheet */
  }

  /** Clear contents of this spreadsheet */
  async clear() {
    try {
      //@TODO
        //console.log("clear");
        await this.collection.deleteMany();
       // await this.db.dropDatabase();
        //this.i =0;
    }
    catch (err) {
      const msg = `cannot drop collection ${this.spreadsheetName}: ${err}`;
      throw new AppError('DB', msg);
    }
    /* @TODO delegate to in-memory spreadsheet */
      this.MemSpreadsheet.clear();
  }

  /** Delete all info for cellId from this spreadsheet. Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  
   */
  async delete(cellId) {
    let results;
    results = /* @TODO delegate to in-memory spreadsheet */ this.MemSpreadsheet.delete(cellId);
      //console.log(results);
    try {
        if( await this.collection.find({"id": Object.keys(results)})){
      await this.collection.deleteOne({"id": Object.keys(results)});;
        }
    }
    catch (err) {
      //@TODO undo mem-spreadsheet operation
        this.MemSpreadsheet.undo();
      const msg = `cannot delete ${cellId}: ${err}`;
      throw new AppError('DB', msg);
    }
    return results;
  }
  
  /** copy formula from srcCellId to destCellId, adjusting any
   *  relative cell references suitably.  Return an object mapping the
   *  id's of all dependent cells to their updated values. Copying
   *  an empty cell is equivalent to deleting the destination cell.
   */
  async copy(destCellId, srcCellId) {
    const srcFormula = /* @TODO get formula by querying mem-spreadsheet */ this.MemSpreadsheet.query(srcCellId);
    if (!srcFormula) {
      return await this.delete(destCellId);
    }
    else {
        const results = /* @TODO delegate to in-memory spreadsheet */ this.MemSpreadsheet.copy(destCellId, srcCellId);
      try {
	//@TODO
          await this.collection.insertOne({"id": Object.keys(results)}, results);
      }
      catch (err) {
	//@TODO undo mem-spreadsheet operation
           this.MemSpreadsheet.undo();
	const msg = `cannot update "${destCellId}: ${err}`;
	throw new AppError('DB', msg);
      }
      return results;
    }
  }

  /** Return dump of cell values as list of cellId and formula pairs.
   *  Do not include any cell's with empty formula.
   *
   *  Returned list must be sorted by cellId with primary order being
   *  topological (cell A < cell B when B depends on A) and secondary
   *  order being lexicographical (when cells have no dependency
   *  relation). 
   *
   *  Specifically, the cells must be dumped in a non-decreasing depth
   *  order:
   *     
   *    + The depth of a cell with no dependencies is 0.
   *
   *    + The depth of a cell C with direct prerequisite cells
   *      C1, ..., Cn is max(depth(C1), .... depth(Cn)) + 1.
   *
   *  Cells having the same depth must be sorted in lexicographic order
   *  by their IDs.
   *
   *  Note that empty cells must be ignored during the topological
   *  sort.
   */
  async dump() {
      return /* @TODO delegate to in-memory spreadsheet */this.MemSpreadsheet.dump();
  }

}

//@TODO auxiliary functions

