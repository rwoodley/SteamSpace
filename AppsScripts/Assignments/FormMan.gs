var _html;
var _date = new Date();

// TODO: 
// insert headers on spread-sheet creation.

var FOLDER_NAME = "SteamSpaceTeacher";
var SPREADSHEET_NAME_PARAM = "SpreadSheetName";
var LOGIN_ID_PARAM = "LoginID";
var SHEET_NAME = 'Sheet1';
function test2() {
  Logger.log(getSpreadSheetData("xxxFormulaToyAssignment_0001", "x@y.com").getContent());
}
function test3() {
  var fakeParams = {};
  fakeParams[SPREADSHEET_NAME_PARAM] = 'SteamSpaceAssignment-00001';
  fakeParams['LoginID'] = ['x@y.com'];
  fakeParams['play'] = ['play'];
  fakeParams['mouse'] = ['mouse'];
  var ssName = fakeParams[SPREADSHEET_NAME_PARAM];
  updateSpreadSheet(ssName, fakeParams);
}
function test() {
  var fakeParams = {};
  fakeParams[SPREADSHEET_NAME_PARAM] = 'FormulaToyAssignment_0001';
  fakeParams['LoginID'] = ['x@y.com'];
  fakeParams['Formula'] = ['z = x + y'];
  fakeParams['Emotion'] = ['curious'];
  var ssName = fakeParams[SPREADSHEET_NAME_PARAM];
  updateSpreadSheet(ssName, fakeParams);
}
function getSpreadSheetData(ssname, loginID) {
  _html = "";
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
  try {
    var folder = getFolder(FOLDER_NAME);
    if (folder == null) return returnJSON('error', 'folder ' + FOLDER_NAME + "doesn't exist!");
    var ss = createSpreadsheet(folder, ssname, null);
    Logger.log("ss is " + ss);
    if (ss == undefined) return returnJSON('error', 'Spreadsheet "' + ssname + '" does not exist.');
    
    var doc = SpreadsheetApp.openById(ss.getId());
    var sheet = doc.getSheetByName(SHEET_NAME);
    
    return getDataForSheet(sheet, loginID);
  } catch(e){
    return returnJSON('error', { 'e' : e, 'log' : _html});
  } finally {
    lock.releaseLock();
  }
}
function getDataForSheet(sheet, loginID) {
    var loginID = loginID.toString().toUpperCase();

    // get headers
    var headRow = 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var obj = { headers: headers};
    
    // get answers
    var retval = "";
    var loginCol = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] == LOGIN_ID_PARAM)
        loginCol = i;
    }
    Logger.log("Login Col = " + loginCol);
    if (loginCol == -1) return returnJSON('error', "There must be a column in the spread-sheet called " + LOGIN_ID_PARAM);
    
    var sum = 0;
    var rowData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var answers = [];
    for (j in rowData){
      var rowLoginID = rowData[j][loginCol].toString().toUpperCase();
      Logger.log(rowLoginID + ", " + loginID);
      if (rowLoginID == loginID)
        answers.push(rowData[j]);
    }
    obj.answers = answers;
    
    return returnJSON('success', obj);
}
function updateSpreadSheet(ssname, fields) {
  _html = "";
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
  try {
    if(!fields.hasOwnProperty(LOGIN_ID_PARAM)) return returnJSON('error', 'Did not specify parameter: ' + LOGIN_ID_PARAM);
    var folder = getFolder(FOLDER_NAME);
    if (folder == null) return returnJSON('error', 'folder ' + FOLDER_NAME + "doesn't exist!");
    var ss = createSpreadsheet(folder, ssname, fields);
       
    var doc = SpreadsheetApp.openById(ss.getId());
    var sheet = doc.getSheetByName(SHEET_NAME);
    var headRow = 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = [];
    // loop through the header columns
    for (i in headers){
      Logger.log("header = " + headers[i]);
      if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else { // else use header name to get data
        if (fields.hasOwnProperty(headers[i]))
          row.push(fields[headers[i]][0]);  // note extra [0] since params are all presented as arrays.
        else
          row.push("No Answer");
      }
    }
    // more efficient to set values as [][] array than individually
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    //return returnJSON('success', _html);
    return getDataForSheet(sheet, fields[LOGIN_ID_PARAM]);
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
    if (fields != null) {
      logMsg("Trying to create " + fileName);
      
      var ss = SpreadsheetApp.create(fileName);
      var newFileId = ss.getId();
      var newFile = DriveApp.getFileById(newFileId);
      folder.addFile(newFile);
      DriveApp.getRootFolder().removeFile(newFile);
    
      logMsg("Creating spreadsheet: " + fileName);
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
    }
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

