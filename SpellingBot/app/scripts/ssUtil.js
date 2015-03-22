'use strict'
var _ssUtil;
function ss_setHTMLContent(html, errmsg) { 
  if (html == null)
    _ssUtil.getPanel().setHelpContent(errmsg); 
  else
    _ssUtil.getPanel().setHelpContent(html);
}
function ss_showHelpPage(url) {
  _ssUtil.ss_getWebContent(url, '', 'get', ss_setHTMLContent);
}


function ssUtil(panel) {
  var SPREADSHEET_NAME_PARAM = "SpreadSheetName";
  var LOGIN_ID_PARAM = "LoginID";
  var _panel = panel;
  _ssUtil = this;
  this.getPanel = function() { return _panel; }
  this.ss_callWebApp = function(key, params, getOrPost, callback) {

    key = key.trim();
    var lowercaseKey = key.toLowerCase();
    if (lowercaseKey.substring(0,5) != 'https') {
       // seems like at one time the key wored this way.
        var urltemplate = "https://script.google.com/macros/s/$0/exec";
        var url = urltemplate.replace('$0', key);
    }
    else {
        // now (3/2015) it seems to work this way:
        url = key;
    }
    this.ss_getWebContent(url, params, getOrPost, callback);
  }
  this.ss_getWebContent = function(url, params, getOrPost, callback) {
    _panel.showLoading(true);
    var request;
    if (request) { request.abort(); }   // abort any pending request
    
    request = $.ajax({
        url: url,
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
