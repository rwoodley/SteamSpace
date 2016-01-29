function doGet() {
  return HtmlService.createHtmlOutputFromFile('InstallerLog.html');
}
var _date = new Date();
var _html;
function logMsg(msg) {
  Logger.log(msg);
  _html += "<br/>" + _date.toUTCString() + ": " + msg;
  return _html;
}
var ROSTERS = "Rosters";
var ASSIGNMENTS = "Assignments";
var FOLDER_NAME = "SteamSpaceTeacher";
var MAINSCRIPT = "MainScript";
var KEYFILEROOT = "SteamSpaceKeyFile-";
function installScriptPart2(formObject) {
  try {
    // Build key file for teacher. (He/she will share this with her students via a link).
    _html = '';
    logMsg("Key is " + formObject.TeacherKey);
    logMsg("Teacher name is " + formObject.TeacherName);
    
    var folder = createFolder(FOLDER_NAME);
    if (folder == null) return logMsg("Can't create folder: " + FOLDER_NAME);
    
    var ssfile = createSpreadsheet(folder, KEYFILEROOT+formObject.TeacherName);
    var file = DriveApp.getFileById(ssfile.getId());
    file.setDescription(formObject.TeacherKey);
    var sheet = ssfile.getActiveSheet();
    sheet.appendRow(["Teachers:"]);
    sheet.appendRow(["You need to share this file so your students can see it."]);
    sheet.appendRow(["Click the share button and then select 'Anyone who has the link can view'."]);
    sheet.appendRow(["Copy the link displayed and put it on your web site, or alternatively invite students to share via the email option."]);
    sheet.appendRow([" "]);
    sheet.appendRow(["Students:"]);
    sheet.appendRow(["Since you are reading this, you have opened this file. That's all you needed to do."]);
    sheet.appendRow(["You may close the file now."]);
    logMsg("Teacher still needs to run 'test' to authorize the app!!!!");
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
  }
  finally { return _html; }
}
function installScriptPart1() {
  try {
    _html = '';
    var folder = createFolder(FOLDER_NAME);
    if (folder == null) return logMsg("Can't create folder: " + FOLDER_NAME);
    
    var res = createRosterFile(folder);
    if (res == null) logMsg("Didn't create Rosters file.");
    
    var res = createAssignmentsFile(folder);
    if (res == null) logMsg("Didn't create Assignments file.");
    
    var res = copyMainScript(folder);
    if (res == null) logMsg("Didn't copy Main Script file.");
    
    logMsg("Successful completion of part 1 of installation script.");
    logMsg("At this point you need to publish the Main script. Unfortunately this is a manual process.");
    _html += "Click <a href='http://SteamSpace.net/PublishingInstructions.html' target='_blank'>here</a> for instructions. This link will open in a separate tab."
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
  }
  finally { return _html; }
}
function copyMainScript(folder) {
  try {
    var fileName = MAINSCRIPT;
    var files = folder.searchFiles("title contains '" + fileName + "'");
    if (files.hasNext()) {
      logMsg("File " + fileName + " already exists.");
      return null;
    }
    logMsg("Trying to create " + fileName);

    // the Key in this statement comes from the URL you get when you want to share the doc. Attn: DONT publish the MainScript, share it!
    var file = DriveApp.getFileById("16NbSrGiTPUGQ-JYNy5khD4bUOqjgWFwKLMQUGf_K452-OoSzB6tQA7ox");  // MainScript (wrapper)
    logMsg("Renaming to " + fileName);
    file.makeCopy(fileName, folder);

    logMsg("Made local copy of " + fileName);
    return file;
  }
  catch (e) {
    logMsg("Unexpected error: " + e);
    return null;
  }
}
function createAssignmentsFile(folder) {
  var file = createSpreadsheet(folder, ASSIGNMENTS);
  if (file == null) return file;
  var sheet = file.getActiveSheet();
  sheet.setName("Assignments");
  sheet.appendRow(["AssignmentID","AssignmentName","SteamSpaceApp","Roster","Key","State","Notes"]);
  return file;
}
function createRosterFile(folder) {
  var file = createSpreadsheet(folder, ROSTERS);
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
function createEmptyDoc(folder, fileName) {  // pretty much a clone of previous function.
  try {
    var files = folder.searchFiles("title contains '" + fileName + "'");
    if (files.hasNext()) {
      logMsg("File " + fileName + " already exists.");
      return null;
    }
    logMsg("Trying to create " + fileName);

    var ss = DriveApp.createFile(fileName, '');  // this is the different line!
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
