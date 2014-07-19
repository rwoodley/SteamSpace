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
function ss_postForm(key, emailID, formName, resultsCallback) {
  var $form = $("#"+formName);
  var serializedData = $form.serialize();
  serializedData += "&LoginID=" + emailID;
  callWebApp(key, serializedData, "post", resultsCallback);
}
