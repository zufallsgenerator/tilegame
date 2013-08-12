/**
 * Author: Christer Byström
 */

CB.Class("KeyboardInput", {
  _DEFAULT_MAPPING: {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    ok: 13
  },
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  OK: "ok",
  
  
  /**
   * 
   * @param {Object} mapping
   *    Keyboard configuration for the control keys
   *    up, down, left, right, ok
   *    
   *    Ex {
   *      up: 38
   *      ...
   *      ok: 13
   *    }
   *    
   *    
   */
  initialize: function(mapping) {
    if (mapping) {
      this._mapping = mapping;
    } else {
      this._mapping = this._DEFAULT_MAPPING;
    }
    
    var that = this;
    $(document).keydown(function(event) {
      var handled = that._onKeyDown(event);
      return !handled;
    });
  },
  
  /**
   * 
   * @param {Function} listener
   */
  setListener: function(listener) {
    this._listener = listener;
  },
  
  removeListener: function() {
    this._listener = null;
  },
  
  _onKeyDown: function(e) {
    var keynum = e.which;
    var mapping = this._mapping;
    var handled = true;

    
    switch( keynum ) {
      case mapping.up: // Up
        this._sendKey(this.UP);
        break;
      case mapping.down: // Down
        this._sendKey(this.DOWN);
        break;
      case mapping.left: // Left
        this._sendKey(this.LEFT);
        break;
      case mapping.right: // Right
        this._sendKey(this.RIGHT);
        break;
      case mapping.ok: // ok/enter
        this._sendKey(this.OK);
        break;
      default:
        handled = false;
    }
    return handled;
  },
  
  _sendKey: function(key) {
    if (this._listener) {
      this._listener(key);
    }
  }
});