'use strict';
var _that;
function ss_init(curriculumName, tag, firstName, lastName, classId, email) { // called on auth complete, kicks off menu initialization.
  _that.initGUIForSteamspace(curriculumName, tag, firstName, lastName, classId, email);
}
// Setup GUI - Called on page load.

$(function () {

  var voices = window.speechSynthesis.getVoices();  // this needs time to load, kick it off.
  //window.setTimeout(slowStart, 2000);
  slowStart();
  
});
function slowStart() {
  var gui = new GUISetup();
  //ss_getUserInfo(true);
}


// handle user clicks. required because I used innerHTML property below.
function assignmentSelected(assignment, el) { _that.assignmentSelected(assignment, el); }

function GUISetup() {
  console.log("HERE!!!");
  // ===== Generic Setup ======
  _that = this;
  var querySelector = document.querySelector.bind(document);

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = document.getElementById('mainel');
  var helptext = document.getElementById('HelpText');
  if (helptext != undefined)   helptext.addEventListener('click', closeMenu);

  var settingsMenuButton = querySelector('.settingsMenu');
  // var settingsMenu = querySelector('.settingsMenu-container');
  var settingsMenu = document.getElementById('settingsMenu')
  settingsMenu.style.display='none';

  var selectMenuButton = querySelector('.selectMenu');
  // var selectMenu = querySelector('.selectMenu-container');
  var selectMenu = document.getElementById('teacherMenu');
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
  function hideSettingsMenu() {      settingsMenu.style.display = 'none'; }
  function toggleSettingsMenu() {
    if (!_settingsMenuInited) return;
    if (settingsMenu.style.display == 'none') {
      hideSelectMenu();
      settingsMenu.style.display = 'block';
      initSettingsMenu();
    }
    else
      settingsMenu.style.display = 'none';
  }

  selectMenuButton.addEventListener('click', toggleSelectMenu);
  settingsMenuButton.addEventListener('click', toggleSettingsMenu);
  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });
  // ======= Handle Steamspace Initialization ========
  var _curriculumName = "";
  var _ssPanel;
  var _ssUtil;
  this._successfulAuthorization = false;
  this.initGUIForSteamspace = function(curriculumName, classData, firstName, lastName, classId, email) {
    var querySelector = document.querySelector.bind(document);
    var main = document.getElementById('mainel');
    _ssPanel = new ssPanel(main);
    _ssUtil = new ssUtil(_ssPanel);

    _that._successfulAuthorization = true;
    if (window.SpeechSynthesisUtterance === undefined) {
      return _ssPanel.errorMsg("This browser does not support Speech Synthesis. Try another browser, like Chrome.");
    }
    _curriculumName = curriculumName;

    ss_initApp(_ssPanel, _ssUtil, firstName, lastName, classId, email);
    _ssPanel.showLoading(true);
    initSelectMenuForTeachers(classData.Classes[0]);
  }
  var _settingsMenuInited = false;
  function initSettingsMenu() {
    if (_settingsMenuInited) return;
    _settingsMenuInited = true;
    var menuEl = document.getElementById('settingsMenu');
    menuEl.innerHTML = '<li><h4>No Teachers Defined</h4></li>';
    var html = '';
    html += '<li ><h4 class="selectMenu-container-header" >Choose a voice!</h4></li>';
    var voices = window.speechSynthesis.getVoices();
    var englishVoices = [];
    for(var i = 0; i < voices.length; i++ ) {
      if (voices[i].name.toUpperCase().indexOf('ENGLISH') > -1 ||
      voices[i].name.toUpperCase().indexOf('NATIVE') > -1) {
        englishVoices.push(voices[i]);
        console.log(voices[i].lang)
        var id = "voice"+i;
        html += "<li><a id='$0'>$1</a></li>".replace('$0', id).replace('$1', voices[i].name);
      }
    }
    menuEl.innerHTML = html;
    for(var i = 0; i < englishVoices.length; i++ ) {
      var id = "voice"+i;
      var el = document.getElementById(id);
      (function(t) { el.onclick = function() { 
        setVoice(t);
        hideSettingsMenu();
        }; })(englishVoices[i].name);
    }
  }
  function initSelectMenuForTeachers(classData) {
    _ssPanel.showLoading(false);
    var menuEl = document.getElementById('teacherMenu');
    _ssPanel.errorMsg('');

    var html = '<li><h4 class="selectMenu-container-header">Your class is:</h4></li>';
    var template = "<li><a id='$0' >$1</a></li>".replace('$1', classData.Name);
    menuEl.innerHTML = html + template;
    
    _ssPanel.normalMsg('');
    hideSelectMenu();
    initSettingsMenu();
    _ssPanel.showLoading(true);
    initAssignmentMenu(classData.Assignments);
  }
  var _assignmentMenuItems = [];
  function initAssignmentMenu(assignments) {
    var menuEl = document.getElementById('assignmentMenu');
    if (assignments == null || assignments.length == 0) {
      menuEl.innerHTML = '<li><h4>No Assignments Defined</h4></li>';
      return _ssPanel.errorMsg('Your teacher has not defined any assignments. Please check back later.');
    }
    _ssPanel.errorMsg('');
  
    var html = '';
    if (assignments.length > 1)
      html += '<li><h4>Pick an Assignment:</h4></li>';
    else
      html = '<li><h4>Current Assignment:</h4></li>';
    var template = '<li><a id=\'$0\'>$1</a></li>';
    for (var i=0; i < assignments.length; i++) {
      var id = 'assignment_'+i;
      html += template.replace('$0',id).replace('$1',assignments[i].Name);
    }
    menuEl.innerHTML = html;
    var lastAssignment, el;
    _assignmentMenuItems = [];
    for (var i=0; i < assignments.length; i++) {
      var id = 'assignment_'+i;
      el = document.getElementById(id);
      _assignmentMenuItems.push(el);

      (function(ss, menuel) { el.onclick = function() {  assignmentSelected(ss, menuel);  }; })(assignments[i], el);
      lastAssignment = assignments[i];
    }
    
    assignmentSelected(lastAssignment, el);
  }
  this.assignmentSelected = function(assignment, menuel) {
    for (var i = 0; i < _assignmentMenuItems.length; i++) 
      _assignmentMenuItems[i].classList.remove('navdrawer-container-selected');
    menuel.classList.add('navdrawer-container-selected');
    closeMenu();
    _ssPanel.errorMsg('');
    console.log(assignment.name + "," + assignment.notes);
    
    ss_assignmentCallback(
      assignment.Id,
      assignment.Words,
      assignment.Name,
      assignment.Notes,
      assignment.Sentences
      );

  }
}
