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
      this.cell = new CellInfo();
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
      let val = this.eval1(ast)
      this.cell.id = baseCellId;
      this.cell.expr = expr;
      this.cell.value = val;
      this.cell.dependents[baseCellId] = val;
      this.cell.ast = ast;
	console.log(inspect(ast, false, Infinity));
      
     
     // updates.push({baseCellId: this.eval1(ast)});
     console.log(baseCellId + ":" + val)
      
      
      updates[baseCellId] = val;
    return updates;

  }

  //@TODO add methods
   eval1(ast){
	var retval= 0;
       let refarray = [];
	switch(ast.type){
        case 'num' :
            if(ast.fn !== null){
                let str = ast.fn;
                console.log(FNS.str);
            }
            else{
                retval = retval + ast.value;
            }
        break;
        
        case 'app' :
            
            if (ast.type === 'num'){
                    retArray.push(x.value);
                }
//                else if(x.type === 'ref'){
//                    refdata = cellRefToCellId;

               // }
            
            break;
        
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
    this.dependents = {};
    this.ast = null;
}

};

class DAG {
    
    constructor(){
        this.adj = new Map();
    }
    
    addVertex(v){
        this.adj.set(v,[]);
    }
    
    addEdge(v,u){
        this.adj.get(v).push(u);
    }
    
    depthFirstSearch(node){
        var visited = {};
        this.dfsHelper(node,visited);
        
    }
    
    getAdjList(){
        return adj;
    }
    
    print(){
        var dag = this.adj.keys();
        for( var i in dag){
            var val = this.adj.get(i);
            var conc = "";
            
            for(var j in val){
                conc += j + " ";
            }
            console.log(i + " -> " + conc);
        }
    }
    
    dfsHelper(node, visited){
        visited[node] = true;
        
        var adjNode = this.adj.get(node);
        
        for(var i in adjNode){
            var nNode = adjNode(i);
            if(!visited[nNode]){
                this.dfsHelper(nNode, visited);
                
            }
            
        }
    }
    
    
}
