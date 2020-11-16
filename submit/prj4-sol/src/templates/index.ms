<!DOCTYPE html>
<html>
    <head>
    <title> CS 444 Spreadsheet Selection</title>
    <link rel="stylesheet" href="/style.css" type="text/css"/>
    </head>
    <body>
        <h1> CS444 Spreadsheet Selection </h1>
        {{#error}}
        <span class="error">{{msg}}</span>
        {{/errors}}
        
        <form action="/index.html" method ="POST">
        {{fields}}
            <label for="ssName"> Open Spreadsheet Name</label>
            <span>
            <input name="ssName" type="text" ""value="{{ssName}}" id ="ssName"/>
            <br/>
            <span class="error" id="ssNameError"></span>
            </span>
            <input type="submit" value="Open"/>
        </form>
    </body>
</html>
