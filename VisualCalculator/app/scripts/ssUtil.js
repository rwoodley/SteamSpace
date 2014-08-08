'use strict'
function ss_callWebApp(key, params, getOrPost, callback) {
  var request;
  if (request) { request.abort(); }   // abort any pending request
  
  var urltemplate = "https://script.google.com/macros/s/$0/exec";
  request = $.ajax({
      url: urltemplate.replace('$0', key),
      type: getOrPost,
      data: params
  });

  request.done(function (response, textStatus, jqXHR){
    callback(jqXHR.responseText,'success');
  });

  request.fail(function (jqXHR, textStatus, errorThrown){ // failure.
    var errorMsg = "The following error occured: "+textStatus + ", error = " + errorThrown;
    callback(null, errorMsg); 
  });

  // callback handler that will be called regardless
  // if the request failed or succeeded
  request.always(function () {
  });
}
function ss_postForm(key, emailID, ssName, formName, resultsCallback) {
  var $form = $("#"+formName);
  var serializedData = $form.serialize();
  serializedData += "&LoginID=" + emailID + "&SpreadSheetName=" + ssName;
  ss_callWebApp(key, serializedData, "post", resultsCallback);
}
var SPREADSHEET_NAME_PARAM = "SpreadSheetName";
var LOGIN_ID_PARAM = "LoginID";
function doSpreadsheetGet(assignmentKey, spreadsheetName, loginId, callback) {
  var params = SPREADSHEET_NAME_PARAM + "=" + spreadsheetName + "&" + LOGIN_ID_PARAM + "=" + loginId
  ss_callWebApp(assignmentKey, params, "get", callback);
  // callback(obj). obj.headers has headers, and obj.answers has answers (if any) for loginId.
}
