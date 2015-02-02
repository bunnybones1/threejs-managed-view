var Signal = require('signals').Signal;
function RenderRegion(view) {
	var renderer = view.renderer;
	var _state = false;
	var _fullscreen = true;
	var _fullWidth = 0;
	var _fullHeight = 0;
	var _halfWidth = 0;
	var _halfHeight = 0;
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
		_wHalf = _w * .5;
		_hHalf = _h * .5;
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
		_halfWidth = _fullWidth * .5;
		_halfHeight = _fullHeight * .5;
		_fullscreen = _x === 0 && _y === 0 && _w == _fullWidth && _h == _fullHeight;
		update(true);
	}
	var point = {
		x: 0,
		y: 0
	};

	function getScreenSpacePositionOfPixel(x, y) {
		if(_state && !_fullscreen) {
			point.x = (x - _x) / _wHalf - 1;
			point.y = (y - _y) / _hHalf - 1;
		} else {
			point.x = x / _halfWidth - 1;
			point.y = y / _halfHeight - 1;
		}
		return point;
	}
	this.onRenderRegionChangeSignal = onRenderRegionChangeSignal;
	this.setRegion = setRegion;
	this.setState = setState;
	this.setSize = setSize;
	this.getScreenSpacePositionOfPixel = getScreenSpacePositionOfPixel;

}

module.exports = RenderRegion