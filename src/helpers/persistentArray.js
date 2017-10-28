/**
 * Persistent array class for google chrome extensions
 *
 * @author DraCzris <draczris@gmail.com>
 */
;(function(){
	var Def = function(){ return constructor.apply(this,arguments); }
	var attr = Def.prototype;

	// list the attributes
	attr.namespace;
	attr.data = [];


	// event functions
	attr.loading = function(){console.log("loading")};
	attr.loaded = function(){console.log("loaded")};
	attr.saved = function(){console.log("saved")};

	/**
	 * Constructor of persistable array
	 * @param  {string} namespace Unique array namespace
	 * @param  {object} callbacks Callback functions for event reaction
	 */
	function constructor(namespace, callbacks) {
	    this.namespace = 'persistArray_' + namespace;

	    if (typeof callbacks !== 'undefined') {
	    	this.loading = typeof callbacks.loading !== 'undefined' ? callbacks.loading : attr.loading;
	    	this.loaded = typeof callbacks.loaded !== 'undefined' ? callbacks.loaded : attr.loaded;
	    	this.saved = typeof callbacks.saved !== 'undefined' ? callbacks.saved : attr.saved;
	    }

	    this.data = [];
	}

	/**
 	 * BASIC ARRAY MANIPULATION
 	 */
 	attr.get = function(index) {
 		return this.data[index];
 	}

 	attr.getAll = function() {
 		return this.data;
 	}

	attr.size = function() {
		return this.data.length;
	}

 	attr.add = function(item) {
 		this.data.push(item);
 		this._persist();
 	}


	attr.remove = function(index) {
		this.data.splice(index, 1);
		this._persist();
	}


	/**
	 * CORE
	 */

	/**
	 * Set data of array
	 * @param  {Array} array Array of items
	 */
	attr._setData = function(array) {
		this.data = array;
	}

	/**
	 * Getter on data
	 * @return {Array} Array of items
	 */
	attr._getData = function() {
		return this.data;
	}

	/**
	 * Load array from storage
	 */
	attr._load = function() {
		this.loading();

		var that = this;

		var loadFunc = function(persistObject) {
			if (typeof persistObject[that.namespace] === 'undefined') {
				that._setData(new Array());
			} else {
				that._setData(persistObject[that.namespace]);
			}

			that.loaded();
		}

		chrome.storage.sync.get(this.namespace, loadFunc);
	}

	/**
	 * Persists array to storage
	 * @return {[type]} [description]
	 */
	attr._persist = function() {
		this.loading();

		var that = this;
		var payload = {};
		payload[this.namespace] = this.data;

		chrome.storage.sync.set(payload, function() {
			that.saved();
		});
	}

	attr._clear = function() {
		chrome.storage.sync.clear(function(){alert("Cleared");});
	}

	window.PersistentArray = Def;
})();
