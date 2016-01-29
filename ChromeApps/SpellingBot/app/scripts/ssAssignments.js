"use script"
var ss_logMessages = [];
var ss_logDate = new Date();
function ss_log(msg) {
  ss_logMessages.push(ss_logDate.toUTCString() + ":" + msg);
  if (ss_logMessages > 200)
    ss_logMessages = ss_logMessages.slice(100);
}
function ssAssignments(ssutil) {
  var _ssUtil = ssutil;  

  this.ss_loadTeachers = function(callback) {
    // Lookup all SteamSpaceKeyFiles, should be one for teacher.
    var queryString = "title contains 'SteamSpaceKeyFile' and mimeType = 'application/vnd.google-apps.spreadsheet'"
    ss_executeGAPICall('GET',
              'https://www.googleapis.com/drive/v2/files?q='+queryString,
              true,
              function(error, status, responseJSON) {
                if (!error && status == 200) {
                  var response = JSON.parse(responseJSON);
                  if (response.items === undefined || response.items.length == 0) {
                    ss_log("No key files found.");
                    return callback(null);
                  }
                  var teachers = [];
                  for (i = 0; i < response.items.length; i++) {
                    var entry = response.items[i];
                    if (entry.labels.trashed == true) continue;
                    var teacherName = entry.title.replace('SteamSpaceKeyFile-','');
                    teachers.push({ name: teacherName, teacherKey: entry.description }); // key is in the description!
                  }
                  ss_log("Found " + teachers.length + " key files.");
                  callback(teachers);
                } else {
                console.log("Error searching for key file.");
                }
              }
      );
  }
  this.ss_loadAssignment = function(teacherKey, assignment, loginID, callback) {
    var ssName = assignment.spreadSheet;
    _ssUtil.ss_callWebApp(teacherKey, 'LoginID='+loginID+"&SpreadSheetName="+ssName, "get", function(json, errormess) {
      if (json == null) { ss_log(errormess); callback(null);   }  // failure.
      else {
        var obj = JSON.parse(json);
        if (obj.result != 'success') { ss_log(obj.error); callback(teacherKey, ssName, null); }
        else 
	  //console.log(assignment.name + ":" + JSON.stringify(obj.resultObj.headers));
          callback(teacherKey, ssName, obj.resultObj, assignment.name, assignment.notes);
      }
    });
  }
  this.ss_loadAssignments = function(teacherKey, emailID, callback, appName) {
  
    var datatemplate = "LoginID=$0&AppName=$1";
    var params = datatemplate.replace('$0', emailID).replace('$1', appName);
    
    _ssUtil.ss_callWebApp(teacherKey, params, "get", function(json, errormess) {
      if (json == null) { ss_log(errormess); callback(null);   }  // failure.
      else {
        var assignments = [];
        var results = JSON.parse(json).resultObj
        if (results == undefined) { ss_log("bad json object"); callback(null);   }  // failure.
        else {
          results.forEach(
            function(x) { 
              if (x.State.toUpperCase() != "OK") return;
              var obj =  { name: x.AssignmentName, spreadSheet: x.SpreadSheet, notes: x.Notes};
              assignments.push(obj);
            }
          );
          callback(assignments);
        }
      }
    });
  }
}
