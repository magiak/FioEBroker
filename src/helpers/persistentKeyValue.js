(function(window){

    var Storage = function(namespace, defaults){
        this.namespace = 'persistenObject_' + namespace;
        this.data = {};

        for (var key in defaults) {
            if (defaults.hasOwnProperty(key)){
                this.data[this.namespace + key] = defaults[key];
            }
        }

        this._listeners = [];

        this.load();
        chrome.storage.onChanged.addListener((function(storage) {
            return function(){
                storage.load();
            };
        })(this))
    };

    Storage.prototype = {

        get: function(key) {
            return this.data[this.namespace + key];
        },

        _load:function() {
            var self = this;
            return new Promise(function(resolve, reject){
                chrome.storage.sync.get(self.data, function(items){
                    if (items === chrome.runtime.lastError){
                        reject(items);
                    }
                    return resolve(items);
                });
            });
        },

        load: function() {
            var self = this;
            this._load().then(function(items){
                self.data = items;
                self._notify();
            });
        },

        _notify: function() {
            for (var i in this._listeners){
                if (this._listeners.hasOwnProperty(i)){
                    this._listeners[i](self);
                }
            }
        },

        set: function(key, value) {
            this.data[this.namespace + key] = value;
            chrome.storage.sync.set(this.data);
        },

        onchange: function(listener){
            this._listeners.push(listener);
        }
    };

    window.PersistentKeyValue = Storage;
})(window);