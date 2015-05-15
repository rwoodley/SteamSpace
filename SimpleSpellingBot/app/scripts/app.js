// This file contains the only code that is specific to the app.
// Perhaps it could/should be downloaded.
// The App is provided with generic Assignment information.
// Optionally it can do a 'doGet()' to get more meta-data about the assignment (for instance: spelling words)
// If calls doPost() as needed to return results.
// The code must implement 3 functions ss_getName(), ss_initApp() and ss_assignmentCallback()
var _app;
function speakWord(word, el) { _app.speakWord(word, el); }
function scoreAndSubmit() { _app.scoreAndSubmit(); }
function tryAgain() { _app.tryAgain(); }
function ss_getName() { return "SpellingBot"; }
function ss_canRunStandalone() { return false; }

$().ready(function() {
    // TODO: have the user enter these:
    var curriculumCategory = 'sample';
    var curriculumName = 'sample';
    var url = "https://s3.amazonaws.com/spellingapp/$0/$1.json";
    url = url.replace('$0',curriculumCategory).replace('$1', curriculumName);
  
    var jqxhr = $.ajax(url)
      .done(function(obj) {
        ss_init("loginId", curriculumName, obj);  // TODO: simplify this.
        console.log( "success" );
      })
      .fail(function(err, a1, a2) {
        console.log("error loading json: " + a1);
      });
});


function ss_initApp(loginID, panel, utils) {
  _app = new app();
  _app.initApp(loginID, panel, utils);
}
function ss_assignmentCallback(words, name, notes, sentences) { _app.assignmentCallback(words, name, notes, sentences); }

var app = function() {
  var _ssPanel;
  var _ssUtil;
  var _teacherKey;
  var _ssName;
  var _loginID;
  var _allWords; // this is only populated when answers are returned for use by 'Try Again' button.
  var _onlyWrongWords; // this is only populated when answers are returned for use by 'Try Again' button.
  var _assignmentName;
  var _assignmentNotes;
  var _sentenceLookup;

  this.initApp = function(loginID, panel, utils) { 
    _ssPanel = panel; 
    _ssUtil = utils;
    _loginID = loginID; 
  } 

  this.assignmentCallback = function(words, name, notes, sentences) {
    if (words == null) {
      _ssPanel.setContent("Error loading assignment. Sorry!");
      return;
    }
    this.initWords(words, name, notes, words, sentences);
  }
  this.initWords = function(allwords, name, notes, testwords, sentences) {

    var html = '';
    html += "<form id='spellingForm'>";
    var tmp = "<div class='main-title'>Assignment: $0</div><div class='main-subtitle'>$1</div>";
    html += tmp.replace('$0', name).replace('$1', notes);

    html += "<table>";
    html += "<tr><th>Listen:</th><th>Then type what you hear:</th></tr>";
    
    var template = "<tr><td data-th='Listen'>$2</td><td $d1>$1</td></tr>";
    var inputFieldTemplate = "<input class='color--remember' id=$0 name=\"$1\" disabled></input> "
    var inputFieldTemplateNoTest = "<input class='color--remember' id=$0 name=\"$1\" value=\"$2\"></input> "
    var playTemplate = "<img src='images/ic_action_play.png' id=$0  ></img>";
  
    var words = allwords;
    _assignmentName = name;
    _assignmentNotes = notes;
    _sentenceLookup = {};
  
    for (var i = 0; i < words.length; i++) {
      if (sentences != undefined && sentences.length > i) {
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
    html += "<a id='scoreAndSubmitButton' class='button--primary'>All Done! Score and Send to Teacher.</a>"
    _ssPanel.setContent(html);
    // now attach click handlers
    for (var i = 0; i < words.length; i++) {
      var inputFieldID = "word" + i;
      var imgFieldID = "img_word" + i;
      var imgel = document.getElementById(imgFieldID);
      var word = words[i];
      console.log(word + " = " + inputFieldID + ", " + imgFieldID);
      (function(w,i) { imgel.onclick = function() { speakWord(w,i)  }; })(word, inputFieldID);
      
    }
    var bigButton = document.getElementById('scoreAndSubmitButton');
    bigButton.onclick = scoreAndSubmit;
  }
  this.showResults = function(headers, answers) {

    var html = '';
    var tmp = "<div class='main-title'>Assignment: $0</div><div class='main-subtitle'>$1</div>";
    html += tmp.replace('$0', _assignmentName).replace('$1', _assignmentNotes);

    html += "<table>";
    html += "<tr><th>Spelling Word:</th><th>Your Answer:</th></tr>";
    var template = "<tr><td data-th='Spelling Word' class='spellingWord'>$0</td><td data-th='Your Answer' $2>$1</td></tr>";
  
    _allWords = removeKeyWordsFromWordList(headers); // for use by Try Again button.
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
    html += "<a id='tryAgainButton' class='button--primary'>Click to Try Again.</a>"
    _ssPanel.setContent(html);

    var bigButton = document.getElementById('tryAgainButton');
    bigButton.onclick = tryAgain;
  }
  this.scoreAndSubmit = function() {
    // _ssPanel.setContent('');   // don't do it this way. this gets rid of the form and no data is sent.
    var form = document.getElementById('spellingForm');
    form.style.display = 'none';
    var butt = document.getElementById('scoreAndSubmitButton');
    butt.style.display = 'none';
    words = [];
    answers = [];
    $('.color--remember').each(function(el) {
      words.push($(this)[0].name);
      answers.push($(this)[0].value == "" ? "No Answer" : $(this)[0].value);
    });
    this.showResults(words, answers);

  }
  this.tryAgain = function() {
    // if there are no wrong words, but they have pressed Try Again, give them all the words.
    var testWords = _onlyWrongWords.length == 0 ? _allWords : _onlyWrongWords;
    this.initWords(_allWords, _assignmentName, _assignmentNotes, testWords);
  }
  var _firstWord = true;
  var _voice;
  this.speakWord = function(word, inputElName) {
    var inputel = document.getElementById(inputElName);
    inputel.disabled = false;
    inputel.focus();
  
    if (_firstWord) {
      _firstWord = false;
      var voices = window.speechSynthesis.getVoices();
      for(var i = 0; i < voices.length; i++ ) {
        if (voices[i].lang == 'en-GB') {
          _voice = voices[i];
          break;
        }
      }
    }
    else
        window.speechSynthesis.cancel();
    var sentence = _sentenceLookup[word];
    var thingToSay = sentence != undefined ? word + ".   ." + sentence + ".   ."  + word + ".": word;
    var utt = new SpeechSynthesisUtterance(thingToSay);
    utt.voice = _voice;
    window.speechSynthesis.speak(utt);
  }
}
