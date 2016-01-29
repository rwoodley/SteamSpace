function htmlString() {

var retval = 
"<div style='color: #404040; font-size: 16px;'>" +
"Enter in any simple multiplication or division expression, followed by equals sign (=)." + 
"<br/>" + 
  "<i>Examples: <br/>" + 
    "2x3=<br/>" + 
    "12/3=<br/>" + 
    "3^3=  (for exponents)<br/>" + 
  "</i>" + 
  "</div>" +
  "<table >" + 
  "<tr>" + 
    "<td colspan='4' >" + 
      "<div style='float: left;'>" + 
      "<input id='edValue' type='text' autofocus='autofocus' style='float: right; font-size: 32;'><br/>" + 
      "</div>" + 
      "<div style='float: right; font-size: 32;' id='testText'> </div>      " + 
    "</td>" + 
  "</tr>" + 
  "<tr>" + 
    "<td style='padding:2px; padding-bottom: 2px;'>" + 
      "<div id='lcanvas' style='background: lightgrey;'>" + 
      "</div>" + 
    "</td>" + 
    "<td style='padding:2px; padding-bottom: 2px;'>" + 
      "<div id='rcanvas' style='background: lightgrey;'>" + 
      "</div>" + 
    "</td>" + 
    "<td style='padding:2px; padding-bottom: 2px;'>" + 
      "<div id='canvas' style='background: yellow;'>" + 
      "</div>" + 
    "</td>" + 
    "<td style='padding:2px; padding-bottom: 2px;'>" +
      "<div id='canvas2' style='background: beige;'>        " +
      "</div>" +
    "</td>" +
  "</tr>" +
  "<tr>" +
  "</tr>" +
"</table>";
	return retval;
}
