'use strict';

// code to authenticate using gapi. This works for browser based apps, but not Chrome Web Apps because
// they have enhanced security.
// see line below to uncomment to enable.

(function() {
  'use strict';
  /* See: https://developers.google.com/+/web/signin/javascript-flow */
 var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
 po.src = 'https://apis.google.com/js/client.js?onload=render';
 var s = document.getElementsByTagName('script')[0]; 
// uncomment this line to turn this on. You might have to revert the API and ClientId
// s.parentNode.insertBefore(po, s);
})();

function getEmailAndOtherGoodies() {
    console.log("in getEmailAndOtherGoodies().")
    gapi.client.load('plus','v1', function(){
      console.log("in gapi.client.load().")
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
}
//--------
function signinCallback(authResult) {
  if (authResult && !authResult.error) {
    getEmailAndOtherGoodies();
  } else {
    console.log('Sign-in state: ' + authResult['error']);
    ss_init(null);
  }
}
/* Executed when the APIs finish loading */
//var _clientId = "683512459303-fju7kprs821m0ssdi1m5hruo7ff99lpg.apps.googleusercontent.com";
var _clientId = "683512459303-nfac0rlkdvvudbs0bh2jc2dk25ipv3qj.apps.googleusercontent.com";
function render() {
  //gapi.client.setApiKey("AIzaSyB6fvROFZyGeAEme7sLxRAG_XGewoivrPQ");
  gapi.client.setApiKey("ednohpldhkhgckejpgcehegljincabnk");
  var scopes = "https://www.googleapis.com/auth/plus.login  https://www.googleapis.com/auth/plus.profile.emails.read   https://www.googleapis.com/auth/drive";
  gapi.auth.authorize({client_id: _clientId, scope: scopes, immediate: false}, signinCallback);
  
}
