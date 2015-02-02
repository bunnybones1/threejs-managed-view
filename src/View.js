var DOMMode = require('./DOMMode'),
	EventUtils = require('browser-event-adder'),
	Signal = require('signals').Signal,
	AdaptiveResolutionManager = require('./AdaptiveResolutionManager'),
	RenderRegion = require('./RenderRegion'),
	Resize = require('input-resize'),
	_ = require('lodash'),
	RenderStats = require('./RenderStats'),
	RenderManager = require('./RenderManager');
/**
 * View is the viewport canvas and the renderer
 * @param {Object} props an object of properties to override default dehaviours
 */
function View(props) {
	props = props || {};
	this.addCanvasContainerToDOMBody = this.addCanvasContainerToDOMBody.bind(this);
	this.addCanvasToContainer = this.addCanvasToContainer.bind(this);

	this.adaptiveResolution = props.adaptiveResolution;
	this.adaptiveResolutionManager = new AdaptiveResolutionManager(props.adaptiveResolutionSettings);


	this.skipRender = Boolean(props.skipRender);
	this.scene = props.scene || new THREE.Scene();
	props.rendererSettings = props.rendererSettings || {};
	if(props.camera) {
		this.camera = props.camera;
	} else {
		this.camera = new THREE.PerspectiveCamera();
		this.scene.add(this.camera);
		this.camera.position.z = 8.50;
		this.camera.position.y = 8.0;
		this.camera.lookAt(this.scene.position);
	}
	if(this.camera instanceof THREE.PerspectiveCamera) {
		this.setCamera = this.setCameraPerspective;
	} else if (this.camera instanceof THREE.OrthographicCamera) {
		this.setCamera = this.setCameraOthrographic;
	}
	this.autoStartRender = props.autoStartRender !== (undefined ? props.autoStartRender : true);
	this.canvasContainerID = props.canvasContainerID || "WebGLCanvasContainer";

	this.domMode = props.domMode || (props.canvasContainer ? DOMMode.CONTAINER : DOMMode.FULLSCREEN);
	this.canvasContainer = props.canvasContainer || this.createCanvasContainer(this.canvasContainerID);
	this.canvasID = props.canvasID || "WebGLCanvas";
	this.domMode = props.domMode || (this.canvasContainer ? DOMMode.CONTAINER : DOMMode.FULLSCREEN);
	this.domSize = {x:0, y:0};
	
	//use provided canvas or make your own
	this.canvas = document.getElementById(this.canvasID) || this.createCanvas();
	this.rendererSettings = _.merge({
		canvas: this.canvas,
		antialias: true,
	}, props.rendererSettings);

	if( props.renderer !== undefined) {
		this.renderer = props.renderer;
	} else {
		this.renderer = new THREE.WebGLRenderer(this.rendererSettings);
	}

	if(this.rendererSettings.autoClear === false) this.renderer.autoClear = false;

	this.renderManager = new RenderManager(this, props.useRafPolyfill);
	if(this.autoStartRender) this.renderManager.start();

	this.adaptiveResolutionManager.onChange.add(this.onAdaptiveResolutionManagerChangeResolution.bind(this));

	this.setupResizing();

	if(props.stats) {
		this.stats = new RenderStats(this.renderer);
		this.renderManager.onEnterFrame.add(this.stats.onEnterFrame);
		this.renderManager.onExitFrame.add(this.stats.onExitFrame);
	}

}

View.prototype = {
	setupResizing: function() {
		this.onResizeSignal = Resize.onResize;
		this.setSize = this.setSize.bind(this);
		this.renderRegion = new RenderRegion(this);
		this.onResizeSignal.add(this.setSize);
		Resize.bump();
	},
	/**
	 * Renders the scene to the canvas using the renderer
	 * @return {[type]} [description]
	 */
	render: function () {
		if(this.adaptiveResolution) this.adaptiveResolutionManager.update();
		if (!this.skipRender) {
			this.renderer.render(this.scene, this.camera);
		}
	},

	/**
	 * Creates the canvas DOM Element and appends it to the document body
	 * @return {CanvasElement} The newly created canvas element.
	 */
	createCanvasContainer: function(id) {
		var canvasContainer = document.createElement("div");
		canvasContainer.id = id;
		canvasContainer.width = window.innerWidth;
		canvasContainer.height = window.innerHeight;
		this.addCanvasContainerToDOMBody(canvasContainer);
		this.setDOMMode(canvasContainer, this.domMode);
		return canvasContainer;
	},

	createCanvas: function() {
		var canvas = document.createElement("canvas");
		canvas.id = this.canvasID;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		this.addCanvasToContainer(canvas);
		this.setDOMMode(canvas, this.domMode);
		return canvas;
	},

	addCanvasContainerToDOMBody: function(canvasContainer) {
		canvasContainer = canvasContainer || this.canvasContainer;
		if(document.body) {
			document.body.appendChild(canvasContainer);
		} else {
			setTimeout(this.addCanvasContainerToDOMBody, 50);
		}
	},

	addCanvasToContainer: function(canvas) {
		canvas = canvas || this.canvas;
		if(this.canvasContainer) {
			this.canvasContainer.appendChild(canvas);
		} else {
			setTimeout(this.addCanvasToContainer, 50);
		}
	},

	/**
	 * sets the DOM Mode, which controls the css rules of the canvas element
	 * @param {String} mode string, enumerated in DOMMode
	 */
	setDOMMode: function(element, mode) {
		var style = element.style;
		switch(mode) {
			case DOMMode.FULLSCREEN:
				style.position = "fixed";
				style.left = "0px";
				style.top = "0px";
				style.width = '100%';
				style.height = '100%';
				break;
			case DOMMode.CONTAINER:
				style.position = "absolute";
				style.left = "0px";
				style.top = "0px";
				style.width = this.canvasContainer.clientWidth + 'px';
				style.height = this.canvasContainer.clientHeight + 'px';
				break;
			default:
		}
	},

	setSize: function(w, h, force) {
		if(this.domMode == DOMMode.CONTAINER && !force) {
			w = this.canvasContainer.clientWidth;
			h = this.canvasContainer.clientHeight;
		}
		this.domSize.x = w;
		this.domSize.y = h;
		this.canvas.style.width = w;
		this.canvas.style.height = h;
		this.setCamera(w, h);

		this.setResolution(
			~~(w / this.adaptiveResolutionManager.denominator), 
			~~(h / this.adaptiveResolutionManager.denominator)
		);
		this.renderRegion.setSize(w, h);
	},

	setCameraPerspective: function(w, h) {
		this.camera.aspect = w/h;
		this.camera.setLens(w, h);
		if(w == 720) {
			console.log(w, h);
		}
		this.camera.updateProjectionMatrix();
	},

	setCameraOthrographic: function(w, h) {
		this.camera.left = 0;
		this.camera.right = w;
		this.camera.top = 0;
		this.camera.bottom = h;
		this.camera.updateProjectionMatrix();
	},

	getSize: function() {
		return {
			width: this.domSize.x,
			height: this.domSize.y
		};
	},

	setResolution: function(w, h) {
		this.canvas.width = w;
		this.canvas.height = h;
		this.renderer.setSize(w, h, false);
		this.canvas.style.width = this.domSize.x + 'px';
		this.canvas.style.height = this.domSize.y + 'px';
	},

	getResolution: function() {
		return {
			width: this.canvas.width,
			height: this.canvas.height
		}
	},

	onAdaptiveResolutionManagerChangeResolution: function(dynamicScale) {
		this.setResolution(
			~~(window.innerWidth * dynamicScale),
			~~(window.innerHeight * dynamicScale)
		);
	},

	getScreenSpacePositionOfPixel: function(x, y) {
		return this.renderRegion.getScreenSpacePositionOfPixel(x, y);
	},

	captureImageData: function(options) {
		var canvas = this.canvas;
		var oldWidth = this.domSize.x;
		var oldHeight = this.domSize.y;

		options = _.merge({
			width: oldWidth,
			height: oldHeight,
			format: 'jpeg'
		}, options);
		var format = options.format === 'jpg' ? 'jpeg' : options.format;

		this.setSize(options.width, options.height);
		
		var type = 'image/' + format;
		var originalSkip = this.skipRender;
		this.skipRender = false;
		this.renderManager.render();
		this.skipRender = originalSkip;

		var imageData = canvas.toDataURL(type, options.encoderOptions);
		this.setSize(oldWidth, oldHeight);
		return imageData;
	}
};

module.exports = View;