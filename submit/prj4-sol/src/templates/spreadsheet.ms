<!DOCTYPE html>
<html>
    <head>
    <title> CS 444 Spreadsheet Selection</title>
    <link rel="stylesheet" href="/style.css" type="text/css"/>
    </head>
    <body>
        <h1> CS444 Spreadsheet Update for {{ssName}} </h1>
        <p><a id="{{act}}" href="/"> Open other spreadsheet></a></p>
       
        <table class="ss">
          
          <tr>
          <th>{{ssName}}</th>{{#tableCol}}
          <th>{{.}}</th>
          {{/tableCol}}
          
          </tr>{{#tableRow}}
          <tr>
          <td>{{.}}</td>
          </tr>
          {{/#tableRow}}
        </table>
        {{#err}}
        <p class="error">{{msg}}</p>
        {{/err}}
        
        <form action="/ss/{{ssName}}" method="POST">
        <label for="ssAct">Action</label>
        <span>
        
        <fieldset>
        <div>
        <input name="ssAct" type="radio" id= "actClear" value="clear">
        <label for="actClear" > Clear Spreadsheet </label>
        </div>
       
       <div>
       <input name="ssAct" type="radio" id= "actDelete" value="deleleCell">
       <label for="actDelete" > Delete Cell </label>
       </div>
       
       <div>
       <input name="ssAct" type="radio" id= "actUpdate" value="updateCell">
       <label for="actUpdate" > Update Cell </label>
       </div>
       
       <div>
       <input name="ssAct" type="radio" id= "actCopy" value="copyCell">
       <label for="actCopy" > Copy Cell </label>
       </div>

        </fieldset>
        
        <br/>
        {{#errors}}
        <span class="error" id="ssActError"> {{errors.ssAct}}</span>
        {{/errors}}
        <br/>
        <label for="cellId" > Destination Cell ID </label>
        <span>
        <input name="cellId" {{#cellId}}value="{{friendlyName}}"{{/cellId}} id="cellId"/>
        <br/>
        <span class="error" id="cellIdError"></span>
        </span>
        
        <label name="formula"> Formula </label>
        <span>
        <input name="formula" {{#formula}}value="friendlyName"{{/formula}} id ="formula"/>
        
        <span class="error" id="formulaError">{{err}}</span>
        </span>
        <label> &nbsp;</label>
        <input type="submit" value="Update"/>
        
        </form>
        
            
    </body>
</html>

