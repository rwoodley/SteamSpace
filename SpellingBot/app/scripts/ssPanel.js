// An app only writes to the element contained in this object.
// This class does a few basic things:
// 1 - Holds the DOM element reference
// 2 - Handles simple status/error messages
// 3 - Handles loading icon
var ssPanel = function(el) {
  var _element = el;
  this.setContent = function(html) {
    this.showLoading(false);
    _element.innerHTML = html;
  }
  this.errorMsg = function(mess) {
      this.setContent('<h3>' + mess + '</h3>');
  }
  this.normalMsg = function(mess) {
      this.setContent('<h4>' + mess + '</h4>');
  }
  this.showLoading = function(flag) { 
      if (flag)
        _element.classList.add('loadingIcon');
      else
        _element.classList.remove('loadingIcon');
  }
}