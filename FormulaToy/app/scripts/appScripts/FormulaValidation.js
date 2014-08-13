function ft_alert(msg) {
  var el = document.getElementById('helpText');
  el.innerHTML = msg;
  console.log("ALERT: " + msg);
}
function getPossibleValuesForSystem(system) {
    var possibleValues;
    if (_params.system == "cartesian") {
        possibleValues = "x,y,z,p";
    }
    if (_params.system == "spherical") {
        possibleValues = "radius,phi,theta,p";
    }
    if (_params.system == "cylindrical") {
        possibleValues = "z,radius,phi,p";
    }
    return possibleValues;
}
function getCleanFormula(system, userFormula) {
    var formula = userFormula.toLowerCase().replace(' ', '').replace(/math/g, 'Math');
    return formula;
}
function convertToJavascript(system, userFormula) {
    var possibleValues = getPossibleValuesForSystem(system);
    var formula = userFormula.toLowerCase().replace(/ /g, '').replace(/math/g, 'Math');
    if (formula.indexOf('[') > -1 || formula.indexOf(']') > -1) {
        ft_alert('No brackets in the formula please.');
        return null;
    }
    if (formula.indexOf(';') > -1) {
        ft_alert('No semi-colons in the formula please.');
        return null;
    }
    if (formula.indexOf('^') > -1) {
        ft_alert("The '^' character is not allowed. If you're trying to do exponentiation, use the pow function.\nFor instance pow(x,3) to cube x.");
        return null;
    }
    if (formula.split('(').length != formula.split(')').length) {
        ft_alert('Parentheses are not balanced.');
        return null;
    }
    var tokens = formula.split(/[=+\-\,\*\\/^\(\)]/);
    var formula = parseTokens(tokens, formula, possibleValues);
    if (formula == null) return null;
    var dependentVariable = formula.split("=");
    if (dependentVariable.length != 2) {
        ft_alert("Formula must be a = blah, where a is one of " + possibleValues + ", and blah is a function of same.");
        return null;
    }
    if (possibleValues.indexOf(dependentVariable[0]) < 0) {
        ft_alert('The dependent variable  "' + dependentVariable[0] + '" is not correct for this coordinate system.\n' + 
            'You need to use one of ' + possibleValues);
    }
    return formula;
}
function getDependentVariable(validatedFormula) {
    var dependentVariable = _params.formula.split("=");
    return dependentVariable[0];
}
function parseTokens(tokens, formula, possibleValues) {
    var alreadyReplaced = '';
    // note we start at 1. The left side of the '=' sign is tested above.
    for (var i = 1; i < tokens.length; i++) {
        var token = tokens[i];
        //console.log(token, possibleValues);
        if (
            token == 'cos' ||
            token == 'abs' ||
            token == 'acos' ||
            token == 'asin' ||
            token == 'atan' ||
            token == 'ceil' ||
            token == 'cos' ||
            token == 'exp' ||
            token == 'floor' ||
            token == 'log' ||
            token == 'max' ||
            token == 'min' ||
            token == 'pow' ||
            token == 'random' ||
            token == 'round' ||
            token == 'sin' ||
            token == 'sqrt' ||
            token == 'tan' 
            ) {
            if (alreadyReplaced.indexOf(token) >= 0) continue;
            alreadyReplaced += token;
            var regex = new RegExp(token, 'g');
            formula = formula.replace(regex, 'Math.' + token);
        }
        else {
            if (token == 'pi' || token == 'e') continue;
            if (possibleValues.indexOf(token) >= 0) continue;
            if (!isNaN(parseFloat(token)) && isFinite(token)) continue;

            ft_alert("I don't understand this: " + token);
            return null;
        }
    }
    return formula + ';';
}
