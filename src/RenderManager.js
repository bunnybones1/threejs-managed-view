var signals = require('signals');
var raf = require('raf');

/**
 * Manages render timing, pause and unpause
 * @param {View} view the view to manage
 */
function RenderManager(view) {
	this.running = false;
	this._frame = 0;

	this.view = view;
	this.skipFrames = 0;
	this.skipFramesCounter = 0;
	this.onEnterFrame = new signals.Signal();
	this.onExitFrame = new signals.Signal();
	this.render = this.render.bind(this);
	this.renderLoop = this.renderLoop.bind(this);
};

RenderManager.prototype = {	
	/**
	 * a flag to request that the render loop stops next at the next frame
	 * @type {Boolean}
	 */
	_requestStop: false,

	/**
	 * the repeating renderLoop calls itself with requestAnimationFrame to act as the render timer
	 */
	renderLoop : function() {
		if(this.skipFramesCounter < this.skipFrames) {
			this.skipFramesCounter++;
		} else {
			this.render();
			this.skipFramesCounter = 0;
		}

		this._frame = raf(this.renderLoop);
	},

	/**
	 * render one frame
	 */
	render: function() {
		this.onEnterFrame.dispatch();
		this.view.render();
		this.onExitFrame.dispatch();
	},

	/**
	 * start rendering
	 */
	start: function() {
		if (this.running) return;
		this.running = true;
		debugger;
		this._frame = raf(this.renderLoop);
	},

	/**
	 * stop rendering
	 */
	stop: function() {
		this.running = false;
		if (this._frame !== 0)
			raf.cancel(this._frame);
		
	}
}

module.exports = RenderManager;