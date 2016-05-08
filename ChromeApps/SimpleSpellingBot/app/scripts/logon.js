var _getURL = "http://localhost:50906/SpellingTest.aspx";

$().ready(function() {
    doLogon();      // Start here
});

// ---- All this to handle logon
function doLogon() {

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
        ss_init(obj.Curriculum, obj, firstName, lastName, classId);  // TODO: simplify this.
        console.log( "success" );
      })
      .fail(function(err, a1, a2) {
        console.log("error loading json: " + a1);
        ss_modalDialog("#errorConnecting-message");
      });
}

