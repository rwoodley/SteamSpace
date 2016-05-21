var _getURL = "https://spellingbot.net/SpellingTest.aspx";
//var _getURL = "https://localhost:44300/SpellingTest.aspx";
var _googleEmail = '';
var _googleFirstName = '';
var _googleLastName = '';

$().ready(function() {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    console.log(token);
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
    x.onload = function() {
        console.log(x.response);
        var data = JSON.parse(x.response);
        _googleEmail = data.email;
        _googleFirstName = data.given_name;
        _googleLastName = data.family_name;
        doLogon(_googleFirstName,_googleLastName );      // Start here
    };
    x.send();
  });
});

// ---- All this to handle logon
function doLogon(firstname, lastname) {

    dialog = $( "#logon-form" ).dialog({
      autoOpen: true,
      dialogClass: "no-close",
      height: 450,
      width: 450,
      modal: true,
      buttons: {
        "Logon": processUserLogonInputs
      },
    });
    document.getElementById('firstname').value = firstname;
    document.getElementById('lastname').value = lastname;

    form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addUser();
    });
}
function processUserLogonInputs() {
    var valid = true;

    classid = $( "#classid" );
    firstname = $( "#firstname" );
    lastname = $( "#lastname" );

    valid = valid && checkRegexp( classid, /^[a-z0-9]/i, "A class id is a combination of letters and numbers." );
    valid = valid && checkRegexp( firstname, /^[a-z]/i, "Please enter a valid first name." );
    valid = valid && checkRegexp( lastname, /^[a-z]/i, "Please enter a valid last name." );

    if ( valid ) {
      console.log(firstname);
      dialog.dialog( "close" );
      postLogonCallback(firstname.val().toUpperCase(), lastname.val().toUpperCase(), 
        classid.val().toUpperCase());
    }
    return valid;
}
function updateTips( t ) {
  tips = $( ".validateTips" );
  tips
    .text( t )
    .addClass( "ui-state-highlight" );
  setTimeout(function() {
    tips.removeClass( "ui-state-highlight", 1500 );
  }, 500 );
}

function checkRegexp( o, regexp, n ) {
  if ( !( regexp.test( o.val() ) ) ) {
    o.addClass( "ui-state-error" );
    updateTips( n );
    return false;
  } else {
    return true;
  }
}
// ---- END: All this to handle logon
function postLogonCallback(firstName, lastName, classId) {

    var url = _getURL + "?classCode=$1&firstName=$2$lastName=$3";
    url = url.replace('$1', classId).replace('$2', firstName).replace('$3', lastName);
    console.log("reading " + url);
    var jqxhr = $.ajax({ url: url, timeout: 5000 })
      .done(function(obj) {
        ss_init(obj.Curriculum, obj, firstName, lastName, classId, _googleEmail);  // TODO: simplify this.
        console.log( "success" );
      })
      .fail(function(err, a1, a2) {
        console.log("error loading json: " + a1);
        ss_modalDialog("#errorConnecting-message");
      });
}

