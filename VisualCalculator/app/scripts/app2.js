// this is the original code to run the calculator....
// assumes HTML is all set up correctly. Knows nothing about assignments.
  /* Diagram module */
var Diagram = (function () {
  /* Diagrams are just a list of centers and radii. */

  function diagram_size(diagram) {
    var d;
    var xmin = 0, xmax = 0, ymin = 0, ymax = 0;
    for (i in diagram) {
      d = diagram[i];
      xmin = Math.min(xmin, d[0] - d[2]);
      xmax = Math.max(xmax, d[0] + d[2]);
      ymin = Math.min(ymin, d[1] - d[2]);
      ymax = Math.max(ymax, d[1] + d[2]);
    }
    return({ xmin: xmin,
             xmax: xmax,
             ymin: ymin,
             ymax: ymax,
             width: xmax - xmin,
             height: ymax - ymin,
             centerX: (xmax - xmin)/2+xmin,
             centerY: (ymax - ymin)/2+ymin
           });
  }

  function place(positions, diagrams) {
    var i, j, a = [], len=0, pos, diagram, d;
    for (i=0; i < positions.length; i++) {
      pos     = positions[i];
      diagram = diagrams[i];
      for (j =0; j < diagram.length; j++) {
        d = diagram[j];
        a[j+len] = [ d[0] + pos[0], d[1] + pos[1], d[2]];
      }
      len += diagram.length;
    }
    return a;
  }

  /* Prime 'p' */
  function prime_diagram(p, diagram) {
    var i, inc = 2*Math.PI / p, angle = -Math.PI/2, a = [], r, positions = [],
        diagrams = [], sz;
    sz = diagram_size(diagram);
    // must choose r such that all dots fit around it.
    r = Math.max(sz.width, sz.height)*p/4
    for (i = 0; i < p; i++) {
      positions.push([(r)*Math.cos(angle), (r)*Math.sin(angle)]);
      diagrams.push(diagram);
      angle += inc;
    }
    return place(positions,diagrams);
  }

  /* Given an array of prime factors, this function draws
     a factor diagram. The array of primes should be in descending order. */
  function factor_diagram(ps, diagram) {
    var p, sz = diagram_size(diagram), positions, frac;
    if (ps.length === 0) {
      return(diagram.slice(0,diagram.length));
    } else {
      p = ps.shift();
      if (p === 1) {
        return factor_diagram(ps, diagram);
      } else if (p === 2) {
        frac = 11/16;
        if (sz.width >= sz.height) {
          positions=[[0,-frac*sz.height], [0,frac*sz.height]];
        } else {
          positions=[[-frac*sz.width,0], [frac*sz.width, 0]];
        }
        return factor_diagram(ps, place(positions, [diagram, diagram]));
      } else { // p is a prime
        return factor_diagram(ps, prime_diagram(p, diagram));
      }
    }
  }

  function scale(s, diagram) {
    var a = [], d, i;
    for (i=0; i < diagram.length; i++) {
      d = diagram[i];
      a[i] = [s*d[0], s*d[1], s*d[2]];
    }
    return a;
  }


  /* Draw diagram, centered */
  function draw(rcanvas, diagram) {
    var i, c, d, d2, x_offset, y_offset, x_offset_2, y_offset_2, set, sz, sz2;
    sz  = diagram_size(diagram);
    //alert("drawing" + sz);
    //sz2 = diagram_size(diagram2);


    x_offset = rcanvas.width/2 - sz.centerX;
    y_offset = rcanvas.height/2 - sz.centerY;


    //x_offset_2 = rcanvas.width/2 - sz2.centerX;
    //y_offset_2 = rcanvas.height/2 - sz2.centerY;

    set = rcanvas.set();

    for (i in diagram) {
      d = diagram[i];
      //d2 = diagram2[i];
      c = rcanvas.circle(d[0] + x_offset, d[1] + y_offset, d[2]);
      c.attr("fill", "#000");
      c.attr("stroke", "#000");
      //c.animate({cx: d2[0] + x_offset_2, cy: d2[1] + y_offset_2, r: d2[2]}, 500);
    }
  }

  // Returns prime factors of 'n'
  function factor(n) {
    var i;
    if (n===1) {
      return [1];
    } else {
      for (i=2; i < Math.sqrt(n) && n % i !== 0; i++);
      if (n % i === 0) {
        return([i].concat(factor(n/i)));
      } else {
        return [n];
      }
    }
  }

  /* Exported methods */
  return({ draw: draw,
           place: place,
           scale: scale,
           factor: factor,
           diagram_size: diagram_size,
           factor_diagram: factor_diagram });

})();

function draw3Numbers(i1,i2,i3) {
    var lcanvas = $("#lcanvas");
    drawNumber(r1, lcanvas, i1);
    var rcanvas = $("#rcanvas");
    drawNumber(r2, rcanvas, i2);
    var canvas = $("#canvas");
    drawNumber(r3, canvas, i3);
    drawNumber(rr, canvas, 0);
}
function draw4Numbers(i1,i2,i3,i4) {
    var lcanvas = $("#lcanvas");
    drawNumber(r1, lcanvas, i1);
    var rcanvas = $("#rcanvas");
    drawNumber(r2, rcanvas, i2);
    var canvas = $("#canvas");
    drawNumber(r3, canvas, i3);
    var canvas2 = $("#canvas");
    drawNumber(rr, canvas, i4);
}
function drawNumber(r, canvas, num) {
    r.clear();
    if (num <= 0) return;
    r.text(20,10, num).attr({"font-size":16, "font-family": "Arial, Helvetica, sans-serif" });
    var m = Math.min(canvas.height(),canvas.width())*0.9;
    var d = Diagram.factor_diagram(Diagram.factor(num),[[0,0,m/2]]);
    var sz;

    sz = Diagram.diagram_size(d);
    d = Diagram.scale(m/Math.max(sz.width, sz.height), d);
    Diagram.draw(r,d);
}
function myKeyPress(e)
{
  document.getElementById("testText").innerHTML = "";
  var keynum;
  
  if(window.event){ // IE					
      keynum = e.keyCode;
  }else
  if(e.which){ // Netscape/Firefox/Opera					
          keynum = e.which;
  }
  var chr = String.fromCharCode(keynum);

  if ((chr < '0' || chr > '9') && keynum != 8 && chr != 'x' && chr != '*' && chr !='/' && chr != '^' && chr != '=') {
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
    return;
  }
  
  var edValue = document.getElementById("edValue");
  var s;
  if (keynum == 8) {    // handle backspace
    var tempS = edValue.value;
    if (tempS.length > 0)
      s = tempS.substring(0,tempS.length-1);
  }
  else
    s = edValue.value+chr;
  var numbers = s.split(/\/|x|\*|=|\^/);
  if ((window.event && numbers.length >= 2 && chr == '=') || numbers.length >= 3)  {	// split behaves differently for IE
    if (chr != '=') {
      e.preventDefault ? e.preventDefault() : e.returnValue = false;
      return; // last char must be an = sign.
    }
    var i1 = numbers[0];
    var i2 = numbers[1];

    var result;
    var txt;
    if (s.indexOf('x') != -1 || s.indexOf('*') != -1) {
      result = i1 * i2;
      if (result > 20000) { alert("That's too big a number for my little brain, try again."); return; }
      draw3Numbers(i1,i2,result);
      txt = edValue.value + chr + result;
    }
    else
    if (s.indexOf('^') != -1) {
      result = Math.pow(i1,  i2);
      if (result > 20000) { alert("That's too big a number for my little brain, try again."); return; }
      draw3Numbers(i1,i2,result);
      txt = edValue.value + chr + result;
    }
    else {
      if (i1 > 20000 || i2 > 20000) { alert("That's too big a number for my little brain, try again."); return; }
      rmdr = i1%i2;
      result = (i1-rmdr)/i2;
      draw4Numbers(i1,i2,result, rmdr);
      var txt;
      if (rmdr > 0) {
        txt = edValue.value + chr + result + ", " + rmdr + " left over";
      }
      else
        txt = edValue.value + chr + result;
    }

    document.getElementById("testText").innerHTML = txt;
    postFormulaTextToServer(txt);

    edValue.value = "";
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
    return;
  }
  if (chr == '=') {
    e.preventDefault ? e.preventDefault() : e.returnValue = false; return;
  }
  if (numbers.length >= 2 && numbers[1].length > 0) {
    if (numbers[0] > 9999 || numbers[1] > 9999) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        return;
    }
    draw3Numbers(numbers[0],numbers[1],0);
  }
  else if (numbers.length >= 1) {
    if (numbers[0] > 9999) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        return;
    }
    draw3Numbers(numbers[0],0,0);
  }
}
var r1, r2, r3, rr;
function setup() {
  var edvalue = document.getElementById("edValue")
  edvalue.value = "";
  edvalue.addEventListener("keypress", function(event){return myKeyPress(event);}, false);
  document.getElementById("testText").innerHTML = "";
  var nCanvas = 4;
  var b = document.getElementsByTagName('body')[0];
  var cw = b.clientWidth/nCanvas-12;
  var canvas = $("#lcanvas");
  canvas.height(cw);    canvas.width(cw);

  r1 = Raphael(canvas.attr('id'), canvas.width(), canvas.height());
  var canvas = $("#rcanvas");  
  canvas.height(cw);    canvas.width(cw);

  r2 = Raphael(canvas.attr('id'), canvas.width(), canvas.height());
  var canvas = $("#canvas");  
  canvas.height(cw);    canvas.width(cw);

  r3 = Raphael(canvas.attr('id'), canvas.width(), canvas.height());
  var canvas = $("#canvas2");  
  canvas.height(cw);    canvas.width(cw);

  rr = Raphael(canvas.attr('id'), canvas.width(), canvas.height());
  
}

