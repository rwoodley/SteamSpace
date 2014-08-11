'use strict'
function ssUtil(panel) {
  var _panel = panel;
  this.ss_callWebApp = function(key, params, getOrPost, callback) {
    _panel.showLoading(true);
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
      _panel.showLoading(false);
    });
  }
  var SPREADSHEET_NAME_PARAM = "SpreadSheetName";
  var LOGIN_ID_PARAM = "LoginID";
  this.ss_postForm = function(key, emailID, ssName, formName, resultsCallback) {
    var $form = $("#"+formName);
    var serializedData = $form.serialize();
    serializedData += "&" + LOGIN_ID_PARAM  + "=" + emailID + "&" + SPREADSHEET_NAME_PARAM + "=" + ssName;
    this.ss_callWebApp(key, serializedData, "post", resultsCallback);
  }
  // this.doSpreadsheetGet = function(assignmentKey, spreadsheetName, loginId, callback) {
  //   var params = SPREADSHEET_NAME_PARAM + "=" + spreadsheetName + "&" + LOGIN_ID_PARAM + "=" + loginId
  //   this.ss_callWebApp(assignmentKey, params, "get", callback);
  // }
}
