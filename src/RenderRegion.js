var Signal = require('signals').Signal;
function RenderRegion(view) {
	var renderer = view.renderer;
	var _state = false;
	var _fullscreen = true;
	var _fullWidth = 0;
	var _fullHeight = 0;
	var _x = 0;
	var _y = 0;
	var _w = 0;
	var _h = 0;

	var onRenderRegionChangeSignal = new Signal();

	function update(shouldDispatch) {
		if(_state && !_fullscreen) {
			// console.log('regioned', shouldDispatch);
			renderer.setScissor(_x, _fullHeight-_y-_h, _w, _h);
			renderer.setViewport(_x, _fullHeight-_y-_h, _w, _h);
			renderer.enableScissorTest(true);
			// view.setCamera(_w, _h);
		} else {
			// console.log('fullscreened', shouldDispatch);
			renderer.setScissor(0, 0, _fullWidth, _fullHeight);
			renderer.setViewport(0, 0, _fullWidth, _fullHeight);
			renderer.enableScissorTest(false);
			// view.setCamera(_fullWidth, _fullHeight);
		}
		if(shouldDispatch) onRenderRegionChangeSignal.dispatch(_x, _y, _w, _h);
	}

	function setRegion(x, y, w, h){
		// console.log('region setRegion');
		_state = true;
		_x = ~~x;
		_y = ~~y;
		_w = ~~w;
		_h = ~~h;
		_fullscreen = _x === 0 && _y === 0 && _w == _fullWidth && _h == _fullHeight;
		update(true);
	}

	function setState(state, shouldDispatch) {
		_state = state;
		update(shouldDispatch);
	}

	function setSize(w, h) {
		_fullWidth = ~~w;
		_fullHeight = ~~h;
		_fullscreen = _x === 0 && _y === 0 && _w == _fullWidth && _h == _fullHeight;
		update(true);
	}
	this.onRenderRegionChangeSignal = onRenderRegionChangeSignal;
	this.setRegion = setRegion;
	this.setState = setState;
	this.setSize = setSize;

}

module.exports = RenderRegion