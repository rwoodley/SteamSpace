var _html;
var _date = new Date();

// TODO: 
// insert headers on spread-sheet creation.

var FOLDER_NAME = "SteamSpaceTeacher";
var SPREADSHEET_NAME_PARAM = "SpreadSheetName";
var LOGIN_ID_PARAM = "LoginID";
var SHEET_NAME = 'Sheet1';
function test() {
  var fakeParams = {};
  fakeParams[SPREADSHEET_NAME_PARAM] = 'FormulaToyAssignment_0001';
  fakeParams['LoginID'] = ['x@y.com'];
  fakeParams['Formula'] = ['z = x + y'];
  fakeParams['Emotion'] = ['curious'];
  var ssName = fakeParams[SPREADSHEET_NAME_PARAM];
  updateSpreadSheet(ssName, fakeParams);
}
function updateSpreadSheet(ssname, fields) {
  _html = "";
  try {
    var folder = getFolder(FOLDER_NAME);
    if (folder == null) return returnJSON('error', 'folder ' + FOLDER_NAME + "doesn't exist!");
    var ss = createSpreadsheet(folder, ssname, fields);
    
    var lock = LockService.getPublicLock();
    lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
   
    var doc = SpreadsheetApp.openById(ss.getId());
    var sheet = doc.getSheetByName(SHEET_NAME);
    var headRow = 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = [];
    // loop through the header columns
    for (i in headers){
      if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else { // else use header name to get data
        row.push(fields[headers[i]][0]);  // note extra [0] since params are all presented as arrays.
      }
    }
    // more efficient to set values as [][] array than individually
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    return returnJSON('success', _html);
  } catch(e){
    return returnJSON('error', { 'e' : e, 'log' : _html});
  } finally {
    lock.releaseLock();
  }
}
function createSpreadsheet(folder, fileName, fields) {
  try {
    var files = folder.searchFiles("title contains '" + fileName + "'");
    if (files.hasNext()) {
      logMsg("File " + fileName + " already exists.");
      return files.next();
    }
    logMsg("Trying to create " + fileName);

    var ss = SpreadsheetApp.create(fileName);
    var newFileId = ss.getId();
    var newFile = DriveApp.getFileById(newFileId);
    folder.addFile(newFile);
    DriveApp.getRootFolder().removeFile(newFile);
    
    logMsg("Created spreadsheet: " + fileName);

    // first row should be headers.
    var row = [];
    row.push('Timestamp');
    for(var key in fields){
      if (key == SPREADSHEET_NAME_PARAM) continue;
      if(fields.hasOwnProperty(key)) {
         row.push(key);
      }
    }
    // more efficient to set values as [][] array than individually
    var sheet = ss.getSheetByName(SHEET_NAME);
    sheet.getRange(1, 1, 1, row.length).setValues([row]);

    return ss;
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
    return null;
  }
}
function getFolder(folderName) {
  try {
    var folders = DriveApp.searchFolders("title contains '" + folderName + "'");
    if (folders.hasNext()) {
      logMsg("Folder " + folderName + " exists.");
      return folders.next();
    }
    logMsg("Folder " + folderName + " does not exist!");
    return null;
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
    return null;
  }
}
function logMsg(msg) {
  Logger.log(msg);
  _html += "<br/>" + _date.toUTCString() + ": " + msg;
  return _html;
}


