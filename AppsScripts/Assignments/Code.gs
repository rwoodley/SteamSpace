// This is a web app. You query it for a list of assignments. As it now stands it is read-only.
var PARAM_LOGIN_ID = "LoginID";
var PARAM_APP_NAME = "AppName";
var FOLDER = "SteamSpaceTeacher";
var ROSTERSFILE = "Rosters";
var ASSIGNMENTFILE = "Assignments";
var ASSIGNMENTSHEET = "Assignments";

function doGet(e){
  return handleResponse(e);
}
 
function doPost(e){
  return handleResponse(e);
}
 
function handleResponse(e) {
  try {
    var loginID = e.parameter[PARAM_LOGIN_ID];
    var appName = e.parameter[PARAM_APP_NAME];
    //return ContentService
    //.createTextOutput(JSON.stringify(e))
    //.setMimeType(ContentService.MimeType.JSON);
    //return getAssignments("RobertWoodley@steamspace.net", "VisualCalculator");
    return getAssignments(loginID, appName);
  } catch(e){
    return returnJSON("error", "loginID = " + loginID + ", appName = " + appName);
  } finally { }
}
function test() {
  var retval = getAssignments("rlwoodley@gmail.comx", "SpellingBot");
  Logger.log("Success! " + retval.getContent());
}
function getAssignments(loginID, inAppName) {
  var inAppName = inAppName.toUpperCase();
  var rostersText = getRostersForLoginID(loginID);
  if (rostersText == null) return returnJSON('error', "No rosters for " + loginID);
  Logger.log("Roster text = " + rostersText);
  var rosters = rostersText.split(';');
  Logger.log(rosters);

  try {
    var doc = getSpreadsheet(ASSIGNMENTFILE);
    var sheet = doc.getSheetByName(ASSIGNMENTSHEET);
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
      var enabled = "";
      var notes = "";
      var key = "";
      for (i in headers) {
        if (headers[i] == "AssignmentID") assignmentId = rows[j][i];
        if (headers[i] == "AssignmentName") assignmentName = rows[j][i];
        if (headers[i] == "SteamSpaceApp") appName = rows[j][i];
        if (headers[i] == "Roster") roster = rows[j][i];
        if (headers[i] == "Enabled") enabled = rows[j][i];
        if (headers[i] == "Notes") notes = rows[j][i];
        if (headers[i] == "Key") key = rows[j][i];
      }
      Logger.log("Comparing " + appName.toUpperCase() + " to " + inAppName);
      if (appName.toUpperCase() != inAppName) continue;
      Logger.log("Checking rosters for " + roster);
      if (rosters.indexOf(roster) < 0) continue;
      Logger.log("Found an assignment.");
      var retobj = { 
        AssignmentName : assignmentName,
        Key : key,
        Notes: notes
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
      if (file.getName() == fileName)
        returnSheet = spreadsheet;
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
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
  else
    return ContentService
    .createTextOutput(JSON.stringify({"result":"error", "error": object}))
    .setMimeType(ContentService.MimeType.JSON);
}
