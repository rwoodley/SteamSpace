// This file contains the only code that is specific to the app.
// Perhaps it could/should be downloaded.
// The App is provided with generic Assignment information.
// Optionally it can do a 'doGet()' to get more meta-data about the assignment (for instance: spelling words)
// If calls doPost() as needed to return results.
// The code must implement 4 functions ss_getName(), ss_initApp(), ss_assignmentCallback(), ss_standaloneMode()
var _app;
function ss_canRunStandalone() { return true; }
function ss_getName() { return "VisualCalculator"; }
function ss_initApp(loginID, panel, utils) {
  _app = new app();
  _app.initApp(loginID, panel, utils);
}
function ss_assignmentCallback(key, ssName, retval) { _app.assignmentCallback(key, ssName, retval); }
function postFormulaTextToServer(txt) { _app.postFormulaTextToServer(txt); }
function ss_standaloneMode() { _app.standaloneMode(); }
var app = function() {
  var _ssPanel;
  var _ssUtil;
  var _teacherKey;
  var _ssName;
  var _emailID;
  var _words; // this is only populated when answers are returned for use by '_words' button.

  this.initApp = function(loginID, panel, utils) { 
    _ssPanel = panel; 
    _ssUtil = utils;
    _emailID = loginID; 
  }

  this.assignmentCallback = function(key, ssname, retval) {
    _teacherKey = key;
    _ssName = ssname;
    initHTML();
    setup();
  }
  this.standaloneMode = function(key, ssname, retval) {
    initHTML();
    setup();
  }
  this.postFormulaTextToServer = function(txt) {
    if (_teacherKey == undefined) return;
    var serializedData = "LoginID=" + _emailID + "&SpreadSheetName=" + _ssName + "&Formula=" + txt;
    _ssUtil.ss_callWebApp(_teacherKey, serializedData, "post", resultsCallback);
  }
  function resultsCallback() { console.log("Formula posted"); }
  function initHTML() {
    _ssPanel.setContent(htmlString());
  }
}
