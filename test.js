var THREE = require('three');
window.THREE = THREE;
var ManagedView = require('./');
var loadAndRunScripts = require('loadandrunscripts');
var Resize = require('input-resize');

loadAndRunScripts(
	[
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
			canvasContainer: containerDiv,
			adaptiveResolution: false,
			adaptiveResolutionSettings: {
				upgradeWhen: 55,
				degradeWhen: 50
			},
			useRafPolyfill: false
		});

		view.camera.position.y = 0;
		view.camera.lookAt(new THREE.Vector3());
		var cols = 30;
		var rows = 30;

		var minX = -6;
		var minY = -6;
		var rangeX = 12;
		var rangeY = 12;
		
		var geom = new THREE.SphereGeometry(.1, 16, 16);

		var mat = new THREE.MeshBasicMaterial();

		for (var ix = cols - 1; ix > 0; ix--) {
			var ratioX = ix / cols;
			for (var iy = rows - 1; iy > 0; iy--) {
				var ratioY = iy / rows;
				var mesh = new THREE.Mesh(geom, mat);
				mesh.position.x = minX + ratioX * rangeX;
				mesh.position.y = minY + ratioY * rangeX;
				view.scene.add(mesh);
			};
		};

		// setTimeout(function() {
		// 	var format = 'jpeg';
		// 	var imageData = view.captureImageData({
		// 		width: 1920,
		// 		height: 1080,
		// 		format: format
		// 	});
		// 	var image = imageData.replace("image/"+format, "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
		// 	window.location.href = image;
		// });
	}
)