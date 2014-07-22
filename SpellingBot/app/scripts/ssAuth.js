'use strict';

(function() {
  'use strict';
  /* See: https://developers.google.com/+/web/signin/javascript-flow */
 //render();
 var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
 po.src = 'https://apis.google.com/js/client.js?onload=render';
 var s = document.getElementsByTagName('script')[0]; 
 s.parentNode.insertBefore(po, s);
})();

var _inHere = false;
function signinCallback(authResult) {
  //if (_inHere) return;  // this is neede because 2nd gapi.auth.signIn below seems to recurse.
  _inHere = true;
  if (authResult && !authResult.error) {
    /*
    var additionalParams = {
      'scope' : ' https://www.googleapis.com/auth/plus.profile.emails.read',
      'callback': function(ar) { 
        gapi.client.load('plus','v1', function(){
        var request = gapi.client.plus.people.get({
           'userId': 'me'
        });
        request.execute(function(resp) {
            for (var emailInc = 0; emailInc < resp.emails.length; emailInc++) {
              var thisEmail = resp.emails[emailInc];
              if (thisEmail.type == 'account') {
                  ss_init(resp.displayName, resp.emails[emailInc].value);  // caller must define ss_init
                  return;
              }
            }
         });
        });
      }
    };
    gapi.auth.signIn(additionalParams); // yes, have to sign in again to get permission to get email.
    */
    gapi.client.load('plus','v1', function(){
    var request = gapi.client.plus.people.get({
       'userId': 'me'
    });
    console.log("Executing request");
    request.execute(function(resp) {
      console.log("got response");
      for (var emailInc = 0; emailInc < resp.emails.length; emailInc++) {
        var thisEmail = resp.emails[emailInc];
        if (thisEmail.type == 'account') {
            ss_init(resp.displayName, resp.emails[emailInc].value);  // caller must define ss_init
            return;
        }
      }
     });
    });

  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
    ss_init(null);
  }
}
/* Executed when the APIs finish loading */
var _clientId =  "683512459303-fju7kprs821m0ssdi1m5hruo7ff99lpg.apps.googleusercontent.com";
function render() {
        _inHere = false;
  gapi.client.setApiKey("AIzaSyB6fvROFZyGeAEme7sLxRAG_XGewoivrPQ");

  // Additional params including the callback, the rest of the params will
  // come from the page-level configuration.
  var additionalParams = {

   clientid:  "683512459303-fju7kprs821m0ssdi1m5hruo7ff99lpg.apps.googleusercontent.com",
   scope:     "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read",
   immediate: 'true'

  };

//  gapi.auth.authorize(additionalParams, signinCallback); // Will use page level configuration
  var scopes = "https://www.googleapis.com/auth/plus.login  https://www.googleapis.com/auth/plus.profile.emails.read   https://www.googleapis.com/auth/drive";
  gapi.auth.authorize({client_id: _clientId, scope: scopes, immediate: false}, signinCallback);
  
  
}
function requestScope(inscope, callback) {
  gapi.auth.authorize({client_id: _clientId, scope: inscope, immediate: false}, signinCallback);
}
