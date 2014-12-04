var ManagedView = require('./');
var loadAndRunScripts = require('loadandrunscripts');
var Resize = require('input-resize');

loadAndRunScripts(
	[
		'bower_components/three.js/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js'
	],
	function() {

		var containerDiv = document.createElement('div');
		containerDiv.id = 'threejsContainer';
		document.getElementsByTagName('body')[0].appendChild(containerDiv);
		console.log(containerDiv);
		containerDiv.style.position = 'absolute';
		containerDiv.style.left = '25%';
		containerDiv.style.top = '25%';
		containerDiv.style.width = '50%';
		containerDiv.style.height = '50%';

		Resize.minWidth = 600;
		Resize.minHeight = 400;
		var view = new ManagedView.View({
			stats: true,
			camera: new THREE.OrthographicCamera(0, 200, 0, 200),
			canvasContainer: containerDiv,
			adaptiveResolution: false,
			adaptiveResolutionSettings: {
				upgradeWhen: 55,
				degradeWhen: 50
			}
		});

		var cols = 10;
		var rows = 10;

		var minX = 20;
		var minY = 20;
		var rangeX = 400;
		var rangeY = 400;
		
		var geom = new THREE.SphereGeometry(10, 16, 16);

		var mat = new THREE.MeshBasicMaterial();

		for (var ix = cols - 1; ix >= 0; ix--) {
			var ratioX = ix / cols;
			for (var iy = rows - 1; iy >= 0; iy--) {
				var ratioY = iy / rows;
				var mesh = new THREE.Mesh(geom, mat);
				mesh.position.x = minX + ratioX * rangeX;
				mesh.position.y = minY + ratioY * rangeX;
				view.scene.add(mesh);
			};
		};
	}
)