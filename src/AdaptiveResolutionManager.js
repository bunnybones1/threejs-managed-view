var signals = require('signals');
var FPS = require('./FPS');

function AdaptiveResolutionManager(props) {
	props = props || {};
	this.degradeWhen = props.degradeWhen !== undefined ? props.degradeWhen : this.degradeWhen;
	this.upgradeWhen = props.upgradeWhen !== undefined ? props.upgradeWhen : this.upgradeWhen;
	this.denominatorMax = props.denominatorMax !== undefined ? props.denominatorMax : this.denominatorMax;
	this.changeFactor = props.changeFactor !== undefined ? props.changeFactor : this.changeFactor;
	this.updateFrequency = props.updateFrequency !== undefined ? props.updateFrequency : this.updateFrequency;
	this.onChange = new signals.Signal();
};

AdaptiveResolutionManager.prototype = {
	denominator: 1,
	degradeWhen: 10,
	upgradeWhen: 24,
	denominatorMax: 8,
	dirty: 0,
	updateFrequency: 5,
	changeFactor: 1.25,
	onChange: undefined,
	update: function(){
		if(this.dirty == 0) {
			if(FPS.fps <= this.degradeWhen) {
			  	this.denominator *= this.changeFactor;
				if(this.denominator <= this.denominatorMax) {

					this.makeDirty();
				} else {
					this.denominator = this.denominatorMax;
				}
			} else if (FPS.fps >= this.upgradeWhen) {
				this.denominator /= this.changeFactor;
				if(this.denominator >= .99) {
					
					this.makeDirty();
				} else {
					this.denominator = 1;
				}
			}
		}
		this.denominatorSquared = this.denominator * this.denominator;

		if(this.dirty > 0) {
			this.dirty--;
		}
	},
	makeDirty: function(){
	  	this.onChange.dispatch(1/this.denominator);
	  	this.dirty = this.updateFrequency;
	}
}

module.exports = AdaptiveResolutionManager;