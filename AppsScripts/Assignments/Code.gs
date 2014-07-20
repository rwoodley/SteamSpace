// This is a web app. The Chrome Web app queries it for a list of assignments. As it now stands it is read-only.

var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service
function doGet(e){
  return handleResponse(e);
}
 
function doPost(e){
  return handleResponse(e);
}
 
function handleResponse(e) {
  try {
    var loginID = e.parameter["LoginID"];
    var appName = e.parameter["AppName"];
//    return ContentService
//    .createTextOutput(JSON.stringify(e))
//    .setMimeType(ContentService.MimeType.JSON);
    //return getAssignments("RobertWoodley@steamspace.net", "VisualCalculator");
    return getAssignments(loginID, appName);
  } catch(e){
    return returnJSON("error", e);
  } finally { }
}
function test() {
  var retval = getAssignments("rlwoodley@gmail.comx", "SpellingBot");
  Logger.log("Success! " + retval.getContent());
}
function getAssignments(loginID, inAppName) {
  var inAppName = inAppName.toUpperCase();
  var rostersText = getRostersForLoginID(loginID);
  if (rostersText == null) return returnJSON('error', "Can't read Rosters file");
  Logger.log("Roster text = " + rostersText);
  var rosters = rostersText.split(';');
  Logger.log(rosters);

  try {
//    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var doc = getSpreadsheet("Assignments");
    var sheet = doc.getSheetByName("Assignments");
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
      if (appName.toUpperCase() != inAppName) continue;
      if (rosters.indexOf(roster) < 0) continue;
      var retobj = { 
        AssignmentName : assignmentName,
        Key : key,
        Notes: notes
      };
      retval.push(retobj);
    }
    return returnJSON('success', retval);
  } catch(e){
    return returnJSON('error', e);
  } finally { 
  }
}
// --- GetRosters() code.
function getRostersForLoginID(loginID) {
  var loginID = 'rlwoodley@gmail.com';
  
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
  return getSpreadsheet("Rosters");
}
function getSpreadsheet(fileName) {
  var folderName = 'SteamSpaceTeacher';
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

