// This is a web app. You query it for a list of assignments. As it now stands it is read-only.
var PARAM_LOGIN_ID = "LoginID";
var PARAM_APP_NAME = "AppName";
var FOLDER = "SteamSpaceTeacher";
var ROSTERSFILE = "Rosters";
var ASSIGNMENTFILE = "Assignments";
var ASSIGNMENTSHEET = "Assignments";

function test2b() {
  var e = { parameters:
           {LoginID: 'law@steamspace.net',
            AppName: 'SpellingBot'
           }
          };
  Logger.log(doGet(e));
}
function asstest3() {
    Logger.log("start asstest3…");
  var retval = getAssignments("law@steamspace.net", "SpellingBot");
  Logger.log("Success! " + retval.getContent());
}

function getVersion() {
  return "Version is 31";
}
function doGet(e){
  if (e.parameters.hasOwnProperty(SPREADSHEET_NAME_PARAM)) {
    var ssName = e.parameter[SPREADSHEET_NAME_PARAM];
    return getSpreadSheetData(ssName, e.parameter[PARAM_LOGIN_ID]);
  }
  else
    return handleResponse(e);  // get assignment data.
}
 
function doPost(e){
  if (e.parameters.hasOwnProperty(SPREADSHEET_NAME_PARAM)) {
    var ssName = e.parameter[SPREADSHEET_NAME_PARAM];
    return updateSpreadSheet(ssName, e.parameters);
  }
  else
    return handleResponse(e);  // get assignment data.
}
 
function handleResponse(e) {
  try {
    Logger.log("1-in here");
    var loginID = e.parameter[PARAM_LOGIN_ID];
    Logger.log("2-in here");
    var appName = e.parameter[PARAM_APP_NAME];
    Logger.log("3-in here");
    //return ContentService
    //.createTextOutput(JSON.stringify(e))
    //.setMimeType(ContentService.MimeType.JSON);
    //return getAssignments("RobertWoodley@steamspace.net", "VisualCalculator");
    return getAssignments(loginID, appName);
  } catch(e){
  } finally { }
}
function getAssignments(loginID, inAppName) {
  try {
    Logger.log("start…");
    var inAppName = inAppName.toUpperCase();
    var rostersText = getRostersForLoginID(loginID);
    if (rostersText == null) {
      Logger.log("No rosters for " + loginID);
      return returnJSON('error', "No rosters for " + loginID);
    }
    Logger.log("****Roster text = " + rostersText);
    var rosters = rostersText.split(';');
    Logger.log(rosters);

    var doc = getSpreadsheet(ASSIGNMENTFILE);
    Logger.log("doc ( " + ASSIGNMENTFILE + ") = " + doc.getName());
    if (doc == undefined) {
      return returnJSON('error', "Teacher doesn't have an assignments file.");
    }
    var sheet = doc.getSheetByName(ASSIGNMENTSHEET);
    if (sheet == null) {
      return returnJSON('error', "Assignments spreadsheet must have a tab called: " + ASSIGNMENTSHEET);
    }
    Logger.log("doc = " + sheet.name);
    var retval = [];
    
    var headRow = 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    Logger.log(" last row is " + sheet.getLastRow());
    var rows = sheet.getRange(headRow + 1, 1, sheet.getLastRow() - headRow, sheet.getLastColumn()).getValues();
    for (j in rows){
      Logger.log("row " + j);
      var assignmentId;
      var assignmentName;
      var appName = "";
      var roster = "";
      var state = "";
      var notes = "";
      var ss = "";
      for (i in headers) {
        if (headers[i] == "AssignmentID") assignmentId = rows[j][i];
        if (headers[i] == "AssignmentName") assignmentName = rows[j][i];
        if (headers[i] == "SteamSpaceApp") appName = rows[j][i];
        if (headers[i] == "Roster") roster = rows[j][i];
        if (headers[i] == "State") state = rows[j][i];
        if (headers[i] == "Notes") notes = rows[j][i];
        if (headers[i] == "SpreadSheet") ss = rows[j][i];
      }
      Logger.log("Comparing " + appName.toUpperCase() + " to " + inAppName);
      if (appName.toUpperCase() != inAppName) continue;
      Logger.log("Checking rosters for " + roster);
      if (rosters.indexOf(roster) < 0) continue;
      Logger.log("Found an assignment.");
      var retobj = { 
        AssignmentName : assignmentName,
        SpreadSheet : ss,
        Notes: notes,
        State: state
      };
      retval.push(retobj);
    }
    Logger.log("Done checking assignments, retval = " + JSON.stringify(retval));
    return returnJSON('success', retval);
  } catch(e){
    return returnJSON('error', e);
  } finally { 
  }
}
// --- GetRosters() code.
function getRostersForLoginID(loginID) {
//  var loginID = 'rlwoodley@gmail.com';
  
  var ss = getRosterSpreadsheet();
  if (ss == null) return null;
  Logger.log("N sheets = "  + ss.getNumSheets());

  var loginID = loginID.toUpperCase();
  var retval = "";
  var sheets = ss.getSheets();

  var sum = 0;
  for (var i = 0; i < sheets.length ; i++ ) {
    var sheet = sheets[i]; 
    if (sheet.getLastRow() == 0 || sheet.getLastColumn() == 0) continue;  // no data on sheet.
    var headers = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    for (j in headers){
      var name = headers[j].toString();
      if (name.toUpperCase() == loginID)
        retval += sheet.getName() + ";";
    }
  }
  Logger.log(retval);
  return retval;

}
function getRosterSpreadsheet() {
  return getSpreadsheet(ROSTERSFILE);
}
function getSpreadsheet(fileName) {
  var folderName = FOLDER;
  var folders = DriveApp.getFoldersByName(folderName);
  var returnSheet;

  if (!folders.hasNext())
    return errorMsg("No such folder");
  
  var count = 0;
  while (folders.hasNext()) {
    count++;
    if (count > 1) return errorMsg("Found more than 1 folders with the name " + folderName);
    var folder = folders.next();
    Logger.log("Found " + folder.getName());
    var files = folder.getFilesByType("application/vnd.google-apps.spreadsheet");
    while (files.hasNext()) {
      var file = files.next();
      Logger.log(file.getName() + file.getMimeType());
      var spreadsheet = SpreadsheetApp.openById(file.getId());
      if (file.getName() == fileName) {
        Logger.log("match");
        returnSheet = spreadsheet;
      }
    }
  }
  return returnSheet;
}
function errorMsg(msg) {
  Logger.log(msg);
  return null;
}
// --- Utilities
function returnJSON(successOrFailure, object) {
  if (successOrFailure == 'success')
    return ContentService
    .createTextOutput(JSON.stringify({"result":"success", "resultObj" : object}))
    .setMimeType(ContentService.MimeType.JSON);
  else
    return ContentService
    .createTextOutput(JSON.stringify({"result":"error", "error": object}))
    .setMimeType(ContentService.MimeType.JSON);
}
