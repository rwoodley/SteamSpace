function doGet() {
  return HtmlService.createHtmlOutputFromFile('bobtest.html');
}
var _date = new Date();
var _html;
function logMsg(msg) {
  Logger.log(msg);
  _html += "<br/>" + _date.toUTCString() + ": " + msg;
  return msg;
}
function testSpreadSheetOpen(folderName, fileName) {
  var folderName = 'SteamSpaceTeacher';
  var fileName = 'SteamSpace-Rosters';
  var folders = DriveApp.getFoldersByName(folderName);

  if (!folders.hasNext())
    return errorMsg("No such folder");
  
  //var files = folders.next().getFilesByType('application/vnd.google-apps.spreadsheet');
  var count = 0;
  var returnSheet;
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
      Logger.log("N sheets = "  + spreadsheet.getNumSheets());
      if (file.getName() == fileName)
        returnSheet = file;
    }
  }
  if (returnSheet === undefined)
    Logger.log("can't find file: " + fileName);
}
var FOLDER_NAME = "SteamSpaceTeacherNew";
function installScript() {
  _html = '';
  var folder = createFolder(FOLDER_NAME);
  if (folder == null) return logMsg("Can't create folder: " + FOLDER_NAME);

  var res = createRosterFile(folder);
  if (res == null) return logMsg("Can't create rosters file.");
  
}
function createFolder(folderName) {
  try {
    var folders = DriveApp.searchFolders("title contains '" + folderName + "'");
    if (folders.hasNext()) {
      logMsg("Folder " + folderName + " already exists, not recreating.");
      return folders.next();
    }
    var folder = DriveApp.createFolder(folderName);
    logMsg("Created folder: " + folderName);
    return folder;
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
    return null;
  }
}

function createRosterFile(folder) {
  var file = createSpreadsheet(folder, "Rosters");
  if (file == null) return file;
  var sheet = file.getActiveSheet();
  sheet.setName("Class");
  sheet.appendRow(["This spreadsheet holds the emails of students in your class."]);
  sheet.appendRow(["You can edit this by hand and add the emails in column 1 of this sheet."]);
  sheet.appendRow(["You may create additional rosters by adding additional sheets to this spreadsheet."]);
  sheet.appendRow(["(Just put the name for the new rosters on the tabs of the additional sheets.)"]);
  sheet.appendRow(["You may delete these instructions if you like."]);
  return file;
}
function createSpreadsheet(folder, fileName) {
  try {
    var files = folder.searchFiles("title contains '" + fileName + "'");
    if (files.hasNext()) {
      logMsg("File " + fileName + " already exists.");
      return null;
    }
    logMsg("Trying to create " + fileName);
    //var file = folder.createFile(fileName, '',"application/vnd.google-apps.spreadsheet");

    var ss = SpreadsheetApp.create(fileName);
    var newFileId = ss.getId();
    var newFile = DriveApp.getFileById(newFileId);
    folder.addFile(newFile);
    DriveApp.getRootFolder().removeFile(newFile);
    
    logMsg("Created file: " + fileName);
    return ss;
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
    return null;
  }
}
function listFiles() {
// Process all files in the user's Drive.
 var files = DriveApp.getFiles();
 var html = '';
 while (files.hasNext()) {
   var file = files.next();
   Logger.log(file);  
   html += file + "<br/>";
 }
 return html;
}

