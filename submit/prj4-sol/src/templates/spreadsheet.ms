<!DOCTYPE html>
<html>
    <head>
    <title> CS 444 Spreadsheet Selection</title>
    <link rel="stylesheet" href="/style.css" type="text/css"/>
    </head>
    <body>
        <h1> CS444 Spreadsheet Update for {{ssName}} </h1>
        <p><a id="ss-act" href="/"> Open other spreadsheet></a></p>
       
        <table class="ss">
          
          <tr>
          <th>{{ssName}}</th>{{#tableCol}}
          <th>{{.}}</th>
          {{/tableCol}}
          
          </tr>
          {{#tableRow}}
          <tr>{{#.}}
          <th>{{.}}</th>
          {{/.}}
          </tr>
          {{/tableRow}}
        </table>
       
       {{#errors}}
       <p class="error"> {{.}}</p>
       {{/errors}}
        
        <form action="/ss/{{ssName}}" method="POST">
          <label for="ssAct">Action</label>
          <span>
              <fieldset>
              <div>
                  <input name="ssAct" type="radio" id="actClear" value="clear" {{clear_checked}}>
                  <label for="actClear">Clear Spreadsheet</label>
              </div>
              <div>
                <input name="ssAct" type="radio" id="actDelete" value="deleteCell" {{delete_checked}}>
                  <label for="act">Delete Cell</label>
              </div>
              <div>
                  <input name="ssAct" type="radio" id="actUpdate" value="updateCell" {{update_checked}}>
                  <label for="actUpdate">Update Cell</label>
              </div>
              <div>
                  <input name="ssAct" type="radio" id="actCopy" value="copyCell" {{copy_checked}}>
                  <label for="actCopy">Copy Cell</label>
              </div>
              </fieldset>
              <br>
              <span class="error" id="ssActError">{{ssActError}}</span>
          </span>
          <label for="cellId">Destination Cell ID</label>
          <span>
              <input name="cellId" value="" id="cellId">
              <br>
              <span class="error" id="cellIdError">{{cellIdError}}</span>
          </span>
            <label for="formula">Formula</label>
            <span>
              <input name="formula" value="" id="formula">
              <br>
              <span class="error" id="formulaError">{{formulaError}}</span>
          </span>
            <label>&nbsp;</label>
            <input type="submit" value="Update">
        </form>
            
    </body>
</html>

