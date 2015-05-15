'use strict'
var _that;
function ss_init(loginID, curriculumName, tag) { // called on auth complete, kicks off menu initialization.
  _that.initGUIForSteamspace(loginID, curriculumName, tag);
}
// Setup GUI - Called on page load.

$(function () {
  'use strict';
  var voices = window.speechSynthesis.getVoices();  // this needs time to load, kick it off.
  //window.setTimeout(slowStart, 2000);
  slowStart();
  
});
function slowStart() {
  var gui = new GUISetup();
  //ss_getUserInfo(true);
}


// handle user clicks. required because I used innerHTML property below.
function teacherSelected(teacherKey, curriculumName) { _that.teacherSelected(teacherKey, curriculumName); }
function assignmentSelected(assignment, el) { _that.assignmentSelected(assignment, el); }

function GUISetup() {
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
  var _curriculumName = "";
  var _ssPanel;
  var _ssUtil;
  var _ssAssignments;
  this._successfulAuthorization = false;
  this.initGUIForSteamspace = function (loginID, curriculumName, tag) {
    var querySelector = document.querySelector.bind(document);
    var main = document.getElementById('mainel');
    _ssPanel = new ssPanel(main);
    _ssUtil = new ssUtil(_ssPanel);
    _ssAssignments = new ssAssignments(_ssUtil);

    _that._successfulAuthorization = true;
    if (window.SpeechSynthesisUtterance === undefined) {
      return _ssPanel.errorMsg("This browser does not support Speech Synthesis. Try another browser, like Chrome.");
    }
    if (loginID == null) return _ssPanel.errorMsg("You are not logged in. Please log in to Google, and restart.");
    _loginID = loginID;
    _curriculumName = curriculumName;

    ss_initApp(_curriculumName, _ssPanel, _ssUtil);
    _ssPanel.showLoading(true);
    _ssAssignments.ss_loadTeachers(initSelectMenuForTeachers, tag);
  }

  function initSelectMenuForTeachers(teachers) {
    _ssPanel.showLoading(false);
    var menuEl = document.getElementById('teacherMenu');
    if (!ss_canRunStandalone() && (teachers == null || teachers.length == 0)) {
      menuEl.innerHTML = '<li><h4>No Teachers Defined</h4></li>';
      return _ssPanel.errorMsg('In order to use this app, you need a key file from your teacher.');
    }
    _ssPanel.errorMsg('');

    var html = '';
    html += '<li ><h4 class="selectMenu-container-header" >Welcome ' + _loginID + '!</h4></li>';
    if (teachers.length == 0) {
      html += '<li><h4>No teacher key file detected.</h4></li>';
      html += "<li><h4><div id='showApp'>Running in stand-alone mode.</div></h4></li>";
      html += "<li><h4><div id='topic1'>Click here for more info.</div></h4></li>";
    }
    else if (teachers.length > 1)
      html += '<li><h4>Please select a teacher/class:</h4></li>';
    else
      html += '<li><h4>Your class is:</h4></li>'
    var template = "<li><a id='$0' >$1</a></li>";
    for (var i=0; i < teachers.length; i++) {
      var id = "teacher"+i;
      html += template.replace('$0', id)
                      .replace('$1',teachers[i]);
    }
    menuEl.innerHTML = html;
    for (var i=0; i < teachers.length; i++) {
      var id = "teacher"+i;
      var el = document.getElementById(id);
      var tkey = teachers[i];
      console.log(tkey);
      (function(t,e) { el.onclick = function() { teacherSelected(t,e)  }; })(tkey, _curriculumName);
    }
    if (teachers.length == 0) {
      document.getElementById('topic1').onclick = function() { 
        toggleSelectMenu();
        _ssPanel.showHelpTextForURL("http://www.steamspace.net/appdocs/topic1.html"); 
      }
      ss_standaloneMode();
    }
    else if (teachers.length == 1)
      teacherSelected(teachers[0].teacherKey, _curriculumName);
    else {
      toggleSelectMenu();
    }
  }
  var _teacherKey;
  this.teacherSelected = function(teacherKey, loginID) {
    console.log("key is " + teacherKey);
    _teacherKey = teacherKey;
    _ssPanel.normalMsg('');
    hideSelectMenu();
    _ssPanel.showLoading(true);
    _ssAssignments.ss_loadAssignments(teacherKey, loginID, initAssignmentMenu, ss_getName());
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
      html = '<li><h4>Current Assignment:</h4></li>'
    var template = '<li><a id=\'$0\'>$1</a></li>';
    for (var i=0; i < assignments.length; i++) {
      var id = 'assignment_'+i;
      html += template.replace('$0',id).replace('$1',assignments[i].Assignment);
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
    _ssAssignments.ss_loadAssignment(_teacherKey, assignment, _curriculumName, ss_assignmentCallback);
  }
}
