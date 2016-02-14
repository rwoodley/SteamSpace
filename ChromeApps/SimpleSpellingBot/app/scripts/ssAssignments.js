"use script"
var ss_logMessages = [];
var ss_logDate = new Date();
function ss_log(msg) {
  ss_logMessages.push(ss_logDate.toUTCString() + ":" + msg);
  if (ss_logMessages > 200)
    ss_logMessages = ss_logMessages.slice(100);
}
var _rawData;
function ssAssignments(ssutil) {
  var _ssUtil = ssutil;  

  this.ss_loadTeachers = function(callback, tag) {
    _rawData = tag;
    callback(Object.keys(_rawData.Classes));
    return;
  }
  this.ss_loadAssignment = function(teacherKey, assignment, curriculumName, callback) {
    console.log("loading assignment... for curriculum " + curriculumName + ", class " + teacherKey);

    callback(
      assignment.Words,
      assignment.Name,
      assignment.Notes,
      assignment.Sentences
      );
  }
  this.ss_loadAssignments = function(teacherKey, emailID, callback, appName) {
    console.log("loading assignments...");
    callback(_rawData.Classes[0].Assignments);  // NOTE! Assuming for now there is only one class.
    return;
 }
}