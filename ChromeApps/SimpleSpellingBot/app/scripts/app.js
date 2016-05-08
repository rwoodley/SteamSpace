// This file contains the only code that is specific to the app.
// Perhaps it could/should be downloaded.
// The App is provided with generic Assignment information.
// Optionally it can do a 'doGet()' to get more meta-data about the assignment (for instance: spelling words)
// If calls doPost() as needed to return results.
// The code must implement 3 functions ss_getName(), ss_initApp() and ss_assignmentCallback()
var _app;
var _postURL = "http://localhost:50906/Answers.aspx";
function speakWord(word, el) { _app.speakWord(word, el); }
function scoreAndSubmit() { _app.scoreAndSubmit(); }
function tryAgain() { _app.tryAgain(); }
function ss_getName() { return "SpellingBot"; }
function ss_canRunStandalone() { return false; }

function ss_modalDialog(divName) {
  console.log('in modelDialog' + $(divName));
  $( divName ).dialog({
      modal: true,
      dialogClass: "no-close",
      buttons: {
      }
  });  
}

function ss_initApp(panel, utils, firstName, lastName, classId, email) {
  _app = new app();
  _app.initApp(panel, utils, firstName, lastName, classId, email);
}
function ss_assignmentCallback(id, words, name, notes, sentences) { _app.assignmentCallback(id, words, name, notes, sentences); }

var app = function() {
  var _email;
  var _classId;
  var _firstName;
  var _lastName;
  var _assignmentId;
  
  var _ssPanel;
  var _ssUtil;
  var _teacherKey;
  var _ssName;
  var _allWords; // this is only populated when answers are returned for use by 'Try Again' button.
  var _onlyWrongWords; // this is only populated when answers are returned for use by 'Try Again' button.
  var _assignmentName;
  var _assignmentNotes;
  var _sentenceLookup;

  this.initApp = function(panel, utils, firstName, lastName, classId, email) { 
    _ssPanel = panel; 
    _ssUtil = utils;
    
    _classId = classId;
    _email = email;
    _firstName = firstName;
    _lastName = lastName;
  } ;

  this.assignmentCallback = function(id, words, name, notes, sentences) {
    if (words === null) {
      _ssPanel.setContent("Error loading assignment. Sorry!");
      return;
    }
    this.initWords(id, words, name, notes, words, sentences);
  };
  this.initWords = function(id, allwords, name, notes, testwords, sentences) {

    var html = '';
    html += "<form id='spellingForm'>";
    var tmp = "<div class='main-title'>$0</div><div class='main-subtitle'>$1</div>";
    html += tmp.replace('$0', name).replace('$1', notes);

    html += "<table>";
    html += "<tr><th>Listen:</th><th>Then type what you hear:</th></tr>";
    
    var template = "<tr><td data-th='Listen'>$2</td><td $d1>$1</td></tr>";
    var inputFieldTemplate = "<input class='color--remember' id=$0 name=\"$1\" disabled></input> ";
    var inputFieldTemplateNoTest = "<input class='color--remember' id=$0 name=\"$1\" value=\"$2\"></input> ";
    var playTemplate = "<img src='images/ic_action_play.png' id=$0  ></img>";
  
    var words = allwords;
    _assignmentId = id;
    _assignmentName = name;
    _assignmentNotes = notes;
    _sentenceLookup = {};
  
    for (var i = 0; i < words.length; i++) {
      if (sentences !== undefined && sentences.length > i) {
        _sentenceLookup[words[i]] = sentences[i];
      }
      console.log(words[i]);
      var inputFieldID = "word" + i;
      var imgFieldID = "img_word" + i;
      var ifcopy;
      if (testwords.indexOf(words[i]) > -1)
        ifcopy = inputFieldTemplate.replace("$0",inputFieldID).replace("$1",words[i]);
      else
        // if they get this word right already, don't make them type it again.
        // Instead we show the answer so it gets scored when they submit.
        ifcopy = inputFieldTemplateNoTest.replace("$0",inputFieldID).replace("$1",words[i]).replace("$2", words[i]);
  
      var pcopy = playTemplate.replace("$0",imgFieldID);
  
      var copy = template;
      copy = copy.replace("$1", ifcopy).replace("$2", pcopy);
      copy = copy.replace("$d1","data-th='Word " + (i+1) + "'");
      html += copy;
    }
    html += "</table>";
    html += "</form>";
    html += "<a id='scoreAndSubmitButton' class='button--primary'>All Done! Show me how I did.</a>";
    _ssPanel.setContent(html);
    // now attach click handlers
    for (var i = 0; i < words.length; i++) {
      var inputFieldID = "word" + i;
      var imgFieldID = "img_word" + i;
      var imgel = document.getElementById(imgFieldID);
      var word = words[i];
      console.log(word + " = " + inputFieldID + ", " + imgFieldID);
      (function(w,i) { imgel.onclick = function() { speakWord(w,i);  }; })(word, inputFieldID);
      
    }
    var bigButton = document.getElementById('scoreAndSubmitButton');
    bigButton.onclick = scoreAndSubmit;
  };
  this.showResults = function(headers, answers) {

    var html = '';
    var tmp = "<div class='main-title'>$0</div><div class='main-subtitle'>$1</div>";
    html += tmp.replace('$0', _assignmentName).replace('$1', _assignmentNotes);

    html += "<table>";
    html += "<tr><th>Spelling Word:</th><th>Your Answer:</th></tr>";
    var template = "<tr><td data-th='Spelling Word' class='spellingWord'>$0</td><td data-th='Your Answer' $2>$1</td></tr>";
  
    _allWords = headers; // for use by Try Again button.
    _onlyWrongWords = [];
    for (var i = 0; i < headers.length; i++) {
      var word = headers[i]; var student = answers[i];  // only display most recent answers tho teacher sees all.
      if (word == 'LoginID' || word == 'Timestamp' || word == 'Score') continue;
      var aclass = (word.trim().toUpperCase() == student.trim().toUpperCase()) ?
        "correctAnswer" : "incorrectAnswer";
      if (aclass == "incorrectAnswer") _onlyWrongWords.push(word);
      var line = template.replace('$0', word).replace('$1',student).replace('$2','class='+aclass);
      html += line;
      
    }

    html+= "</table>";
    html += "<a id='tryAgainButton' class='button--primary'>Click to Try Again.</a>";
    _ssPanel.setContent(html);

    var bigButton = document.getElementById('tryAgainButton');
    bigButton.onclick = tryAgain;
  };
  this.scoreAndSubmit = function() {
    // _ssPanel.setContent('');   // don't do it this way. this gets rid of the form and no data is sent.
    var form = document.getElementById('spellingForm');
    form.style.display = 'none';
    var butt = document.getElementById('scoreAndSubmitButton');
    butt.style.display = 'none';
    words = [];
    answers = [];

    postData = '';
    $('.color--remember').each(function(el) {
      words.push($(this)[0].name);
      answers.push($(this)[0].value === "" ? "No Answer" : $(this)[0].value);
      postData += "&" + encodeURIComponent($(this)[0].name) + "="
                + encodeURIComponent($(this)[0].value);
    });
    this.showResults(words, answers);

   postData += "&email=" + encodeURIComponent(_email);
   postData += "&classId=" + encodeURIComponent(_classId);
   postData += "&assignmentId=" + encodeURIComponent(_assignmentId);
   postData += "&firstName=" + encodeURIComponent(_firstName);
   postData += "&lastName=" + encodeURIComponent(_lastName);
   $.post(_postURL, postData).done(function() {
      console.log("Uploaded to server");
    })
    .fail(function() {
      console.log("Failed uploading to server!!");
    });

  };
  this.tryAgain = function() {
    // if there are no wrong words, but they have pressed Try Again, give them all the words.
    var testWords = _onlyWrongWords.length === 0 ? _allWords : _onlyWrongWords;
    this.initWords(_assignmentId, _allWords, _assignmentName, _assignmentNotes, testWords);
  };
  var _firstWord = true;
  var _voice;
  this.speakWord = function(word, inputElName) {
    var inputel = document.getElementById(inputElName);
    inputel.disabled = false;
    inputel.focus();
  
    if (_firstWord) {
      _firstWord = false;
      if (_voice === undefined) {
        var voices = window.speechSynthesis.getVoices();
        for(var i = 0; i < voices.length; i++ ) {
          if (voices[i].lang == 'en-GB') {
            _voice = voices[i];
            break;
          }
        }
      }
    }
    else
        window.speechSynthesis.cancel();
    var sentence = _sentenceLookup[word];
    var thingToSay = sentence !== undefined ? "The word is " + word + ". " 
          + sentence + "." : word;
    var utt = new SpeechSynthesisUtterance(thingToSay);
    utt.voice = _voice;
    window.speechSynthesis.speak(utt);
  };
  setVoice = function(voiceName) {
    var voices = window.speechSynthesis.getVoices();
    for(var i = 0; i < voices.length; i++ ) {
      if (voices[i].name == voiceName) {
        _voice = voices[i];
        console.log('*** voice is now '+_voice.name);
        break;
      }
    }
  };
};
