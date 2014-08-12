var _floorColor = 0x888888;
var _radians = 0;
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function rotateCameraY(radians) {
	var x = _camera.position.x;	var y = _camera.position.y;	var z = _camera.position.z;
	var signx = x > 0 ? 1 : -1;

    // get current radians from z and x coords.
	_radians = x == 0 ? Math.PI/2 : Math.atan(z/x);
    if (signx == -1) _radians += Math.PI;

    _radians += radians;
	if (_radians > Math.PI*2) _radians = _radians%(Math.PI*2);
	while (_radians < 0) _radians += Math.PI*2;

	//console.log( _radians);

	var radius = Math.sqrt(x*x + z*z);
	_camera.position.x = radius * Math.cos(_radians);
	_camera.position.z = radius * Math.sin(_radians);
    //_camera.position.y = 4;
}

function doFloor() {
	//var floorMaterial = new THREE.MeshLambertMaterial( { color: _floorColor, side:THREE.DoubleSide } );
	var floorMaterial = new THREE.MeshPhongMaterial( { color: _floorColor, side:THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(150, 1500,50,50);
	_floor = new THREE.Mesh(floorGeometry, floorMaterial);
	_floor.rotation.x = Math.PI / 2;
	_floor.position.y = -50;
	_floor.receiveShadow = true;
	_scene.add(_floor);
	return _floor;
}
function drawCoords() {
	drawLine(1000,0,0,'blue');
	drawLine(0,1000,0,'green');
	drawLine(0,0,1000,'red');
}
function drawLine(x,y,z,color1) { drawLineFrom(0,0,0,x,y,z,color1); }
function drawCoordsFrom(x,y,z,len) {
	drawLineFrom(x,y,z,x+len,y,z,'blue');
	drawLineFrom(x,y,z,x,y+len,z,'red');
	drawLineFrom(x,y,z,x,y,z+len,'yellow');
}
function drawLineFrom(x1,y1,z1,x2,y2,z2,color1) {
	var lineGeometry = new THREE.Geometry();
	var vertArray = lineGeometry.vertices;
	vertArray.push( new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2) );
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineBasicMaterial( { color:color1 } );
	var line = new THREE.Line( lineGeometry, lineMaterial );
	_scene.add(line);
}
function onWindowResize() {
	_camera.aspect = window.innerWidth / window.innerHeight;
	_camera.updateProjectionMatrix();
	_renderer.setSize( window.innerWidth, window.innerHeight );
}

function eventHandler(canvas, res, e) {
	// z = 90, a=65, x=88, s = 83, c= 67, d = 68, v= 86, f =70
    if (res == 'keydown') {
		console.log(e.keyCode);
		if (e.keyCode == 67) {
			ft_alert(
			_camera.position.x + "," +
			_camera.position.y + "," +
			_camera.position.z);
		}
        else if (e.keyCode >= 48 && e.keyCode < 57) {
            var cnum = e.keyCode - 48;
            var ypos = (cnum - 1)* 30 + -90;
        	_camera.position.y = ypos;
            //ft_alert(_camera.position.x + "," + _camera.position.y + "," + _camera.position.z);
            _camera.lookAt(new THREE.Vector3(100, ypos, 0));
            //ft_alert(_camera.target.position);
        }
	}
}
	
