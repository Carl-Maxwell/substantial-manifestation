Keyboard = {
  initialize: function() {
    addEventListener('keydown', this.keyDown.bind(this));
    addEventListener('keyup'  , this.keyUp  .bind(this));

    this.keyStates = {};
    this.callbacks = {};
  },

  isDown: function(key) {
    return this.keyStates[key];
  },

  keyDown: function(evt) {
    let key = fromWhichToString(evt.which);

    console.log(key);

    let change = !this.keyStates[key];
    this.keyStates[key] = true;

    if (change) this.emit(key, evt);
  },

  emit: function(name, evt) {
    if (this.callbacks[name] && this.callbacks[name].length) {
      this.callbacks[name].forEach(function(callback) {
        callback(evt);
      });

      this.callbacks[name] = this.callbacks[name].filter(function(callback) {
        return !callback.once;
      });
    }
  },

  keyUp: function(evt) {
    let key = fromWhichToString(evt.which);

    this.emit(key + ':released', evt);

    this.keyStates[key] = false;
  },

  on: function(key, callback) {
    if (key in this.callbacks) {
      this.callbacks[key].push(callback);
    } else {
      this.callbacks[key] = [callback];
    }
  },

  off: function(key) {
    this.callbacks[key] = [];
  },

  once: function(key, callback) {
    this.callback.once = true;
    this.on(key, callback);
  }
};
