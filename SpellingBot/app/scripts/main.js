'use strict'
var _that;
function ss_init(loginID, emailID) { // called on auth complete, kicks off menu initialization.
  _that.initGUIForSteamspace(loginID, emailID);
}
// Setup GUI - Called on page load.
(function () {
  'use strict';
  var voices = window.speechSynthesis.getVoices();  // this needs time to load, kick it off.
  var gui = new GUISetup();
})();
// handle user clicks. required because I used innerHTML property below.
function teacherSelected(teacherKey, emailID) { _that.teacherSelected(teacherKey, emailID); }
function assignmentSelected(assignmentKey) { _that.assignmentSelected(assignmentKey); }
function speakWord(word, el) { _that.speakWord(word, el); }
function scoreAndSubmit() { _that.scoreAndSubmit(); }

function GUISetup() {
  // ===== Generic Setup ======
  _that = this;
  var querySelector = document.querySelector.bind(document);

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = querySelector('main');
  
  var selectMenu = querySelector('.selectMenu-container');
  var selectMenuButton = querySelector('.selectMenu');
  selectMenu.style.display='none';

  function closeMenu() {
    body.classList.remove('open');
    appbarElement.classList.remove('open');
    navdrawerContainer.classList.remove('open');
    selectMenu.style.display = 'none';
  }

  function toggleMenu() {
    body.classList.toggle('open');
    appbarElement.classList.toggle('open');
    navdrawerContainer.classList.toggle('open');
  }
  function hideSelectMenu() {      selectMenu.style.display = 'none'; }
  function toggleSelectMenu() {
    if (selectMenu.style.display == 'none')
      selectMenu.style.display = 'block';
    else
      selectMenu.style.display = 'none';
  }

  selectMenuButton.addEventListener('click', toggleSelectMenu);
  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });
  // ======= Handle Steamspace Initialization ========
  var _loginID = "";
  var _emailID = "";
  this._successfulAuthorization = false;
  this.initGUIForSteamspace = function (loginID, emailID) {
    _that._successfulAuthorization = true;
    if (window.SpeechSynthesisUtterance === undefined) {
      return errorMsg("This browser does not support Speech Synthesis. Try another browser, like Chrome.")
    }
    if (loginID == null) return errorMsg("You are not logged in. Please log in to Google, and restart.");
    _loginID = loginID;
    _emailID = emailID;
    showLoading(true);
    ss_loadTeachers(initSelectMenuForTeachers);
  }

  // Some browsers won't show pop-ups except in response to a user click.
  // so if we timeout, lets put up a button to allow use to initiate login sequence.
  this.showLoginButton = function() {
    console.log("in here.");
    if (_that._successfulAuthorization) return; 
    var el = document.getElementById('mainel');
    el.innerHTML = "<button onclick='render()'>Click to Login to Google</button>";
  }
  console.log("set timeout.");
  window.setTimeout(this.showLoginButton, 5000);

  function errorMsg(mess) {
      //var querySelector = document.querySelector.bind(document);
      var mainEl = querySelector('main');
      mainEl.innerHTML = '<h3>' + mess + '</h3>';
  }
  function normalMsg(mess) {
      //var querySelector = document.querySelector.bind(document);
      var mainEl = querySelector('main');
      mainEl.innerHTML = '<h4>' + mess + '</h4>';
  }
  function showLoading(flag) { 
      var mainEl = querySelector('main');
//      mainEl.innerHTML = flag == true ? '<img src="images/loading.gif" />' : '';
      if (flag)
        mainEl.classList.add('loadingIcon');
      else
        mainEl.classList.remove('loadingIcon');

  }
  function initSelectMenuForTeachers(teachers) {
    showLoading(false);
    var menuEl = document.getElementById('teacherMenu');
    if (teachers == null || teachers.length == 0) {
      menuEl.innerHTML = '<li><h4>No Teachers Defined</h4></li>';
      return errorMsg('In order to use this app, you need a key file from your teacher.');
    }
    errorMsg('');

    var html = '';
    if (teachers.length > 1)
      html += '<li><h4>Pick a Teacher:</h4></li>';
    else
      html = '<li><h4>Your teacher is:</h4></li>'
    var template = '<li><a onclick=\'$0\'>$1</a></li>';
    for (var i=0; i < teachers.length; i++) {
      var cb = 'teacherSelected("'+teachers[i].teacherKey + '","' + _emailID + '")';
      html += template.replace('$0', cb)
                      .replace('$1',teachers[i].name);
    }
    menuEl.innerHTML = html;
    if (teachers.length == 1)
      teacherSelected(teachers[0].teacherKey, _emailID);
    else {
      toggleSelectMenu();
    }
  }
  this.teacherSelected = function(teacherKey, loginID) {
    normalMsg('');
    hideSelectMenu();
    showLoading(true);
    ss_loadAssignments(teacherKey, loginID, initAssignmentMenu)
  }
  function initAssignmentMenu(assignments) {
    showLoading(false);
    var menuEl = document.getElementById('assignmentMenu');
    if (assignments == null || assignments.length == 0) {
      menuEl.innerHTML = '<li><h4>No Assignments Defined</h4></li>';
      return errorMsg('Your teacher has not defined any assignments. Please check back later.');
    }
    errorMsg('');
  
    var html = '';
    if (assignments.length > 1)
      html += '<li><h4>Pick an Assignment:</h4></li>';
    else
      html = '<li><h4>Current Assignment:</h4></li>'
    var template = '<li><a onclick=\'$0\'>$1</a></li>';
    for (var i=0; i < assignments.length; i++) {
      var cb = 'assignmentSelected("'+assignments[i].key + '")';
      html += template.replace('$0',cb).replace('$1',assignments[i].name);
    }
    menuEl.innerHTML = html;
    
    assignmentSelected(assignments[0].key);
  }
  var _assignmentKey = '';
  this.assignmentSelected = function(assignmentKey) {
    closeMenu();
    errorMsg('');
    _assignmentKey =  assignmentKey;
    ss_loadAssignment(assignmentKey, _emailID, assignmentCallback);
  }
  function assignmentCallback(json) {
    var retval = JSON.parse(json);
    if (retval.answers)
      showResults(retval.answers);
    else
      initWords(retval.words);
  }
  function initWords(words) {
    //var form = document.getElementById(formName);
    var form = querySelector('main');
    
    //var html = "<table><tr><th></th><th>Type</th><th>Listen</th></tr>";
    var html = '';
    html += "<form id='spellingForm'>";
    html += "<table>";
    html += "<tr><th>Listen:</th><th>Then type what you hear:</th></tr>";
    
    var template = "<tr><td data-th='Listen'>$2</td><td $d1>$1</td></tr>";
    var inputFieldTemplate = "<input class='color--remember' id=$0 name='$1' disabled></input> "
    var playTemplate = "<img src='images/ic_action_play.png' onclick=speakWord($0,'$1')  ></img>";
  
    for (var i = 0; i < words.length; i++) {
      console.log(words[i]);
  
      var inputFieldID = "word" + i;
      var ifcopy = inputFieldTemplate.replace("$0",inputFieldID).replace("$1",words[i]);
  
      var pcopy = playTemplate.replace("$0","'" + words[i] + "'").replace("$1",inputFieldID);
  
      var copy = template;
      copy = copy.replace("$1", ifcopy).replace("$2", pcopy);
      copy = copy.replace("$d1","data-th='Word " + (i+1) + "'");
      html += copy;
      
      //console.log(copy);
    }
    html += "</table>";
    html += "</form>";
    html += "<a onclick='scoreAndSubmit()' class='button--primary'>All Done! Score and Send to Teacher.</a>"
    form.innerHTML = html;
  }
  function showResults(results) {
    var form = querySelector('main');
    
    //var html = "<table><tr><th></th><th>Type</th><th>Listen</th></tr>";
    var html = '';
    html += "<table>";
    html += "<tr><th>Spelling Word:</th><th>Your Answer:</th></tr>";
    var template = "<tr><td data-th='Spelling Word' class='spellingWord'>$0</td><td data-th='Your Answer' $2>$1</td></tr>";

    results.forEach(function(answer) {
      var aclass = (answer.word.trim().toUpperCase() == answer.student.trim().toUpperCase()) ?
        "correctAnswer" : "incorrectAnswer";
      var line = template.replace('$0', answer.word).replace('$1',answer.student).replace('$2','class='+aclass);
      html += line;
    });
    html+= "</table>";
    form.innerHTML = html;
  }
  this.scoreAndSubmit = function() {
    ss_postForm(_assignmentKey, _emailID, 'spellingForm', showResultsWrapper);
  }
  function showResultsWrapper(json) { 
    var retval = JSON.parse(json);
    if (retval.answers)
      showResults(retval.answers); 
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
