// An app only writes to the element contained in this object.
// This class does a few basic things:
// 1 - Holds the DOM element reference
// 2 - Handles simple status/error messages
// 3 - Handles loading icon
// 4 - Handles displaying help text. Help text expects 2 divs: a button with id=HelpButton, a display area with id=HelpText, hidden on start.
var ssPanel = function(el) {
  this.element = el;
  this.helpbutton = document.getElementById('HelpButton');
  this.helptext = document.getElementById('HelpText');
  var _that = this;
  this.setContent = function(html) {
    this.showLoading(false);
    this.element.innerHTML = html;
  }
  this.errorMsg = function(mess) {
      this.setContent('<h3>' + mess + '</h3>');
  }
  this.normalMsg = function(mess) {
      this.setContent('<h4>' + mess + '</h4>');
  }
  this.showLoading = function(flag) { 
      if (flag)
        this.element.classList.add('loadingIcon');
      else
        this.element.classList.remove('loadingIcon');
  }
  this.getElement = function() { return this.element; }

  // Help Text Support
  this.setHelpContent = function(html) {
    this.showLoading(false);
    this.helptext.innerHTML = html;
  }
  this.revertHelpText = function() {
    _that.setHelpButtonCB(_that.showHelpText);
    _that.helptext.style.display = 'none';
    _that.element.style.display = 'block';
  }
  this.showHelpText = function() {
    var url = "http://www.steamspace.net/appdocs/$1.html".replace('$1', ss_getName());
    _that.showHelpTextForURL(url);
  }
  this.showHelpTextForURL = function(url) {
    ss_showHelpPage(url); 
    _that.setHelpButtonCB(_that.revertHelpText);
    _that.element.style.display = 'none';
    _that.helptext.style.display = 'block';
  }
  this.setHelpButtonCB = function(cb) {
    if (this.helpbutton == undefined)
      console.log('No help button defined.');
    else 
      this.helpbutton.onclick = cb; 
  }
  this.setHelpButtonCB(this.showHelpText);
}