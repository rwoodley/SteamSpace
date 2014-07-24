
function ss_getUserInfo(interactive) {
  ss_executeGAPICall('GET',
              'https://www.googleapis.com/plus/v1/people/me',
              interactive,
              onUserInfoFetched);
}
function ss_executeGAPICall(method, url, interactive, callback) {
  var access_token;

  var retry = true;

  getToken();

  function getToken() {
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError) {
        callback(chrome.runtime.lastError);
        return;
      }

      access_token = token;
      requestStart();
    });
  }

  function requestStart() {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.onload = requestComplete;
    xhr.send();
  }

  function requestComplete() {
    if (this.status == 401 && retry) {
      retry = false;
      chrome.identity.removeCachedAuthToken({ token: access_token },
                                            getToken);
    } else {
      callback(null, this.status, this.response);
    }
  }
}
function onUserInfoFetched(error, status, responseJSON) {
  if (!error && status == 200) {
    console.log(responseJSON);
    var response = JSON.parse(responseJSON);
    for (var emailInc = 0; emailInc < response.emails.length; emailInc++) {
      var thisEmail = response.emails[emailInc];
      if (thisEmail.type == 'account') {
          ss_init(response.displayName, response.emails[emailInc].value);  // caller must define ss_init
          return;
      }
    }
  } else {
    console.log("Error in onUserInfoFetched()");
  }
}
