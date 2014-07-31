// This file contains the only code that is specific to the app.
// Perhaps it could/should be downloaded.
// The App is provided with generic Assignment information.
// Optionally it can do a 'doGet()' to get more meta-data about the assignment (for instance: spelling words)
// If calls doPost() as needed to return results.
// The app must have 2 methods initApp() and assignmentCallback()
var _app;
function speakWord(word, el) { _app.speakWord(word, el); }
function scoreAndSubmit() { _app.scoreAndSubmit(); }
function tryAgain() { _app.tryAgain(); }
function initApp(el, loginID) {
  _app = new app();
  _app.initApp(el, loginID);
}
function assignmentCallback(key, ssName, retval) { _app.assignmentCallback(key, ssName, retval); }
var app = function() {
  var _element;
  var _teacherKey;
  var _ssName;
  var _emailID;
  var _words; // this is only populated when answers are returned for use by '_words' button.

  this.initApp = function(el, loginID) { 
    _element = el; 
    _emailID = loginID; 
  }

  this.assignmentCallback = function(key, ssname, retval) {
    if (key == null) {
      _element.innerHTML = "Error loading assignment. Sorry!";
      return;
    }
    _teacherKey = key;
    _ssName = ssname;
    if (retval.answers && retval.answers.length > 0)
      showResults(retval.headers, retval.answers);
    else
      initWords(retval.headers);
  }
  function initWords(inwords) {
    //var form = document.getElementById(formName);
    var form = _element;
    
    //var html = "<table><tr><th></th><th>Type</th><th>Listen</th></tr>";
    var html = '';
    html += "<form id='spellingForm'>";
    html += "<table>";
    html += "<tr><th>Listen:</th><th>Then type what you hear:</th></tr>";
    
    var template = "<tr><td data-th='Listen'>$2</td><td $d1>$1</td></tr>";
    var inputFieldTemplate = "<input class='color--remember' id=$0 name='$1' disabled></input> "
    var playTemplate = "<img src='images/ic_action_play.png' id=$0  ></img>";
  
    var words = removeKeyWordsFromWordList(inwords);
  
    for (var i = 0; i < words.length; i++) {
      console.log(words[i]);
      var inputFieldID = "word" + i;
      var imgFieldID = "img_word" + i;
      var ifcopy = inputFieldTemplate.replace("$0",inputFieldID).replace("$1",words[i]);
  
      var pcopy = playTemplate.replace("$0",imgFieldID);
  
      var copy = template;
      copy = copy.replace("$1", ifcopy).replace("$2", pcopy);
      copy = copy.replace("$d1","data-th='Word " + (i+1) + "'");
      html += copy;
      
      //console.log(copy);
    }
    html += "</table>";
    html += "</form>";
    html += "<a id='scoreAndSubmitButton' class='button--primary'>All Done! Score and Send to Teacher.</a>"
    form.innerHTML = html;
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
  function removeKeyWordsFromWordList(inwords) {
    var words = [];
    for (var i = 0; i < inwords.length; i++) {
      if (inwords[i].toUpperCase() == "LOGINID") continue;
      if (inwords[i].toUpperCase() == "TIMESTAMP") continue;
      if (inwords[i].toUpperCase() == "SCORE") continue;
      words.push(inwords[i]);
    }
    return words;    
  }
  function showResults(headers, answers) {
    var form = _element;
    
    //var html = "<table><tr><th></th><th>Type</th><th>Listen</th></tr>";
    var html = '';
    html += "<table>";
    html += "<tr><th>Spelling Word:</th><th>Your Answer:</th></tr>";
    var template = "<tr><td data-th='Spelling Word' class='spellingWord'>$0</td><td data-th='Your Answer' $2>$1</td></tr>";
  
    _words = removeKeyWordsFromWordList(headers); // for use by Try Again button.
    for (var i = 0; i < headers.length; i++) {
      var word = headers[i]; var student = answers[answers.length-1][i];  // only display most recent answers tho teacher sees all.
      if (word == 'LoginID' || word == 'Timestamp' || word == 'Score') continue;
      var aclass = (word.trim().toUpperCase() == student.trim().toUpperCase()) ?
        "correctAnswer" : "incorrectAnswer";
      var line = template.replace('$0', word).replace('$1',student).replace('$2','class='+aclass);
      html += line;
      
    }
    // results.forEach(function(answer) {
    //   var aclass = (answer.word.trim().toUpperCase() == answer.student.trim().toUpperCase()) ?
    //     "correctAnswer" : "incorrectAnswer";
    //   var line = template.replace('$0', answer.word).replace('$1',answer.student).replace('$2','class='+aclass);
    //   html += line;
    // });
    html+= "</table>";
    html += "<a id='tryAgainButton' class='button--primary'>Try Again.</a>"
    form.innerHTML = html;

    var bigButton = document.getElementById('tryAgainButton');
    bigButton.onclick = tryAgain;
  }
  this.scoreAndSubmit = function() {
    ss_postForm(_teacherKey, _emailID, _ssName, 'spellingForm', showResultsWrapper);
  }
  this.tryAgain = function() {
    initWords(_words);
  }
  function showResultsWrapper(json) { 
    var retval = JSON.parse(json);
    if (retval.resultObj.answers && retval.resultObj.answers.length > 0)
      showResults(retval.resultObj.headers, retval.resultObj.answers); 
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
    var utt = new SpeechSynthesisUtterance(word);
    utt.voice = _voice;
    window.speechSynthesis.speak(utt);
  }
}
