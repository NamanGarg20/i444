import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';
import { cellRefToCellId } from './util.mjs';

//use for development only
import { inspect } from 'util';

export default class Spreadsheet {

  //factory method
  static async make() { return new Spreadsheet(); }

  constructor() {
    //@TODO
      this.cells = [];
      
      this.graph = new DAG();
      this.adjList = this.graph.getAdjList();
      
  }
    

  /** Set cell with id baseCellId to result of evaluating formula
   *  specified by the string expr.  Update all cells which are
   *  directly or indirectly dependent on the base cell.  Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  User errors must be reported by throwing a suitable
   *  AppError object having code property set to `SYNTAX` for a
   *  syntax error and `CIRCULAR_REF` for a circular reference
   *  and message property set to a suitable error message.
   */
  async eval(baseCellId, expr) {
    const updates = {};
    //@TODO
	let ast= parse(expr, baseCellId);
      //console.log(inspect(ast, false, Infinity));
      
      
      let val = this.eval1(ast, baseCellId);
      
      let newcell = new CellInfo();
      newcell.id = baseCellId;
      newcell.expr = expr;
      newcell.value = val;
      newcell.dependents ;
      newcell.ast = ast;
      
      this.cells.push(newcell);
     
      
      updates[baseCellId] = val;
    return updates;

  }

  //@TODO add methods
   eval1(ast, baseCellId){
	var retval= 0;
       
	switch(ast.type){
        case 'num' :
            retval = retval + ast.value;
        break;
        
        case 'app' :
            let refarray = [];
            
            if(ast.kids.length === 1){
                refarray.push(0);
                if(ast.kids[0] != null) refarray.push(this.eval1(ast.kids[0], baseCellId));
            }
            else{
            if(ast.kids[0] != null) refarray.push(this.eval1(ast.kids[0], baseCellId));
            if(ast.kids[1] != null) refarray.push(this.eval1(ast.kids[1], baseCellId));
            }
            
            retval = retval + refarray.reduce(FNS[ast.fn]);
            
            break;
        
        case 'ref' :
            
        
        default:
            retval= 0;
	
		}
	return retval;

	}
    
}

//Map fn property of Ast type === 'app' to corresponding function.
const FNS = {
  '+': (a, b) => a + b,
  '-': (a, b=null) => b === null ? -a : a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
}


//@TODO add other classes, functions, constants etc as needed

class CellInfo{
    constructor(){
    this.id = '';
    this.expr = '';
    this.value = 0;
    this.dependents = new Set();
    this.ast = null;
        
    }

}

class DAG {
    
    constructor(){
        this.adj = new Map();
    }
    
    addVertex(v){
        this.adj.set(v,[]);
    }
    
    addEdge(v,u){
        if(typeof w != "undefined")  this.adj.get(v).push(u);
    }
    
    update(v, w){
        if(typeof w != "undefined"){
            for(var i = 0; i<this.adj.length; i++){
                if(this.adj.at(i) === v) {
                    this.adj.set(i, w);
                }
                 
            }
           
        }
    }
    
    depthFirstSearch(node){
        var visited = {};
        this.dfsHelper(node,visited);
        
    }
    
    getAdjList(){
        return this.adj;
    }
    
    dfsHelper(node, visited){
        visited[node] = true;
        
        var adjNode = this.adj[node];
        
        for(var i in adjNode){
            var nNode = adjNode(i);
            if(!visited[nNode]){
                this.dfsHelper(nNode, visited);
                
            }
            
        }
    }
    
    
}
