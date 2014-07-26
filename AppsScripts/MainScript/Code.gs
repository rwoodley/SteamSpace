// a change.
function doGet(e) {
  if (e.parameters.hasOwnProperty("Diagnostics")) return diagnostics(e);
  return AssignmentsScript.doGet(e); 
}
function diagnostics(e) {
    var retval = {
      "Version" : 5,
      "IThinkAssignmentScriptVersionIs" : 18,
      "AssignmentsScriptVersion" : AssignmentsScript.getVersion(),
      "e" : e
    };
    return AssignmentsScript.returnJSON('success',retval);
}
function doPost(e) {
  if (e.parameters.hasOwnProperty("Diagnostics")) return diagnostics(e);
  return AssignmentsScript.doPost(e); 
}
function invalidateApp() {
  ScriptApp.invalidateAuth();
}

function test() {
  var obj = JSON.parse('{"queryString":"Version=0","parameter":{"Version":"0"},"contextPath":"","parameters":{"Version":["0"]},"contentLength":-1}');
  var res = doGet(obj);
  Logger.log(res.getContent());
}
function test2() {
  var e = { parameter:
           {LoginID: 'joestudent@steamspace.net',
            AppName: 'SpellingBot'
           }
          };
  Logger.log(doGet(e).getContent());
}

