var _camera, _scene, _renderer, _system;
var _pointLight,_pointLightSphere;
var _spotLight;
var _controls;
var _stats;
var _mat;
var _lastMesh;
var _params;
var _drawClicked = false;
var _lastFormulaPosted = '';
startFormulaToy();
function userClickedDraw() {
    _drawClicked = true;
    draw();
}
function clearPlot() {
    if (_lastMesh != undefined) {
        _scene.remove(_lastMesh);
        //		_lastMesh.deallocate();
        _lastMesh = undefined;
    }
}
function draw() {
    clearPlot();
	doPlot();
}
function startFormulaToy() {
  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
  _params = new params();
  _params.initFromURL();
  _renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });

  _renderer.setSize(window.innerWidth, window.innerHeight);
	_renderer.shadowMapEnabled = true;
  _renderer.sortObjects = false; // see http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs

	document.body.appendChild( _renderer.domElement );

	_camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 4000 );
	_camera.position.x = 0;
	_camera.position.y = 4;
	_camera.position.z = 8                                                             ;
	_controls = new THREE.OrbitControls( _camera, _renderer.domElement );

    // STATS
	_stats = new Stats();
	_stats.domElement.style.position = 'absolute';
	_stats.domElement.style.bottom = '0px';
	_stats.domElement.style.zIndex = 100;
	document.body.appendChild( _stats.domElement );

	_scene = new THREE.Scene();
	_camera.lookAt(_scene.position);

	var ambientLight = new THREE.AmbientLight(0x333333);
	_scene.add(ambientLight);

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 40, 390, -30);
	spotLight.intensity = 3;
	spotLight.distance=600;
	_scene.add( spotLight );

	spotLight = new THREE.SpotLight( 0xaaaaff );
	spotLight.position.set(-40, -190, 80);
	spotLight.intensity = 2;
	spotLight.distance=400;
	_scene.add( spotLight );

	drawLine(0,1000,0,'blue');
	//drawCoords();
    setupDatGui();  // this will draw a shape.
	animate();

}
function doPlot() {
    var mesh;
    var color = 0xffffff;
    //var Mat = new THREE.MeshLambertMaterial({color: 0xaaaaaa, opacity: 1 });
    //var Mat2 = new THREE.MeshLambertMaterial({color: 0xddaaaa, opacity: 1 });

    // the default material which will be over-ridden in updateMeshAppearance() immediately.
    _mat = new THREE.MeshPhongMaterial(
    { ambient: 0x555555, color: color, specular: 0x0000cc, shininess: 20,shading: THREE.SmoothShading  }  );

    var tmpFormula = _params.formula.replace(/ /g,'');
    tmpFormula = 'Formula='+encodeURIComponent(tmpFormula)+"&System="+_params.system;
    if (tmpFormula != _lastFormulaPosted)
      parent.postMessage(tmpFormula,"*");
    _lastFormulaPosted = tmpFormula;

    var jsFormula = convertToJavascript(_params.system,_params.formula);
    if (jsFormula == null) return;
    _params.setFormula(getCleanFormula(_params.system,_params.formula));
    var dependentVariable = getDependentVariable(_params.formula);

	var prefix, postfix;
    if (_params.system == "cartesian") {
        prefix = dependentVariable == 'x' ?
        "var x = v * 2 - 1; \
        var y = u * 2 - 1; \
        var z = v * 2 - 1; " :
        "var x = u * 2 - 1; \
        var y = v * 2 - 1; \
        var z = v * 2 - 1; " ;

        var postFix = "";
    }
    if (_params.system == "spherical") {
        prefix = dependentVariable != 'phi' ?
        "var phi = u * 2 * Math.PI; \
         var theta = v*Math.PI; \
         var radius = v;" :
        "var phi = v * 2 * Math.PI; \
         var theta = u*Math.PI; \
         var radius = v;" ;

        var postFix =
        "z = radius * Math.cos(theta); \
        x = radius*Math.sin(theta)*Math.cos(phi); \
        y = radius*Math.sin(theta)*Math.sin(phi); \
        ";
    }
    if (_params.system == "cylindrical") {
        prefix = dependentVariable != 'phi' ?
        "var phi = u * 2 * Math.PI; \
        var radius = v; \
        var z = v * 2 -1;" :
        "var phi = v * 2 * Math.PI; \
        var radius = u; \
        var z = v * 2 -1;";
        var postFix =
        "var x = radius*Math.cos(phi); \
        var y = radius*Math.sin(phi); \
        ";
    }

    //console.log(jsFormula);
    var preprefix = "var pi = Math.PI; var e = Math.E; var p = " + _params.P + ";";
    var newCode = preprefix + prefix + jsFormula + postFix;
    try {
        eval(newCode);
    } catch (e) {
        if (e instanceof SyntaxError) {
            ft_alert('There is a syntax error with your formula. Try again please');
            return;
        }
    }
    newCode += "var scale = 1; return new THREE.Vector3(x*scale, z*scale, y*scale);  "; // put this after the eval() or non-Chrome browsers will complain.
	  var myFunc = new Function("u,v",newCode);

    var minZ = 99999; var maxZ = -99999;
    for (var u = 0; u <= 1; u +=1/90) {
      for (var v = 0; v <= 1; v +=1/90) {
        var z = myFunc(u,v).z;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }

    doShape(0,0,0,myFunc);
    updateMeshAppearance(minZ, maxZ);
}
function doShape(x, y, z, daFunc) {
    // per the three.js docs, daFunc is called for u,v values ranging from 0 to 1
    var Geo3 = new THREE.ParametricGeometry(daFunc, 90, 90, false);
    mesh = new THREE.Mesh( Geo3, _mat );
    mesh.position.x = x; mesh.position.y = y; mesh.position.z = z;
    this._scene.add(mesh);
  	_lastMesh = mesh;
    //ft_alert(_params.spinSpeed);
}
function animate() {
	requestAnimationFrame( animate );
	if (_params.spin) rotateCameraY(_params.spinSpeed);
    // put the 'lookAt' after the camera rotation or it will be askew.
	_camera.lookAt(new THREE.Vector3(_params.X,_params.Z,_params.Y));
	render();
}
function render() {
    _renderer.render( _scene, _camera );
	_controls.update();
    _stats.update();
}

