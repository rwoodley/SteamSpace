// This file contains the only code that is specific to the app.
// Perhaps it could/should be downloaded.
// The App is provided with generic Assignment information.
// Optionally it can do a 'doGet()' to get more meta-data about the assignment (for instance: spelling words)
// If calls doPost() as needed to return results.
// The app must have 2 methods initApp() and assignmentCallback()
var _app;
function initApp(el, loginID) {
  _app = new app();
  _app.initApp(el, loginID);
}
function assignmentCallback(key, ssName, retval) { _app.assignmentCallback(key, ssName, retval); }
function postFormulaTextToServer(txt) { _app.postFormulaTextToServer(txt); }

var app = function() {
  var _element;
  var _teacherKey;
  var _ssName;
  var _emailID;
  var _words; // this is only populated when answers are returned for use by '_words' button.

  this.initApp = function(el, loginID) { 
    _element = el; 
    _emailID = loginID; 
  }

  this.assignmentCallback = function(key, ssname, retval) {
    _teacherKey = key;
    _ssName = ssname;
    initHTML();
    setup();
  }
  this.postFormulaTextToServer = function(txt) {
    //ss_postForm(_teacherKey, _emailID, _ssName, 'spellingForm', showResultsWrapper);    
    var serializedData = "LoginID=" + _emailID + "&SpreadSheetName=" + _ssName + "&Formula=" + txt;
    ss_callWebApp(_teacherKey, serializedData, "post", resultsCallback);
  }
  function resultsCallback() { console.log("Formula posted"); }
  function initHTML() {
    //var form = document.getElementById(formName);
    var form = _element;
    
    var html = htmlString();
    form.innerHTML = html;
    // now attach click handlers
  }
}
