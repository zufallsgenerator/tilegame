/**
 * Author: Christer Byström
 */

CB.Class("Piece", {
  /**
  * @param {Object}
  *   {Field} field
  *     Is NOT copied, so pass a static or unique field
  *
  *   {Number} startx - initial position
  *   {Number} starty - initial position
  *   {Number} targetx - "correct" position
  *   {Number} targety - "correct" position
  *   {Number} width
  *   {Number} height
  *   {String} name 
  *   {Boolean} selected - (optional) set to true for selected look
  *
  */
  initialize: function(params) {
    this._assertParams(params, {
      startx: Number, 
      starty: Number, 
      targetx: Number, 
      targety: Number, 
      width: Number, 
      height: Number
    });
    this._targetX = params.targetx; 
    this._x = params.startx;
    this._targetY = params.targety; 
    this._y = params.starty;
    this._width = params.width;
    this._height = params.height;
    this._name = params.name || "unknown";
    this._gfx = "" + this._x + ";" + this._y;
    this._selected = params.selected || false;
  },
  
  /**
  * @returns {Object}
  *   {Number} x
  *   {Number} y
  */
  getPos: function() {
    return { 
      x: this._x,
      y: this._y
    };
  },
  
  getX: function() {
    return this._x;
  },
  
  getY: function() {
    return this._y;
  },
  
  getSize: function() {
    return {
      width: this._width,
      height: this._height
    };
  },
  
  getTargetPos: function() {
    return { x: this._targetX, y: this._targetY };
  },
  
  getWidth: function() {
    return this._width;
  },
  
  getHeight: function() {
    return this._height;
  },
  
  isOnTarget: function() {
    return this._x === this._targetX && this._y === this._targetY;
  },
  
  move: function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
  },
  
  getName: function() {
    return this._name;
  },
  
  getId: function() {
    return this.getInstanceId();
  },
  
  isSelected: function() {
    return this._selected;
  },
  
  setSelected: function() {
    this._selected = true;
  },
  
  unsetSelected: function() {
    this._selected = false;
  },
  
  setGrabbed: function() {
    this._grabbed = true;
  },
  
  unsetGrabbed: function() {
    this._grabbed = false;
  },
  
  isGrabbed: function() {
    return this._grabbed;
  },
  
  isLeftOf: function(piece) {
    return this._x < piece.getPos().x;
  },
  
  isRightOf: function(piece) {
    return this._x > piece.getPos().x;
  },
  
  isAbove: function(piece) {
    return this._y < piece.getPos().y;
  },
  
  isBelow: function(piece) {
    return this._y > piece.getPos().y;
  },
  
  overlapsX: function(piece) {
    var bottom = this._y + this._height;
    var otherY = piece.getPos().y;
    var otherBottom = otherY + piece.getHeight();
    
    if ((this._y < otherBottom && this._y >= otherY) || 
      (otherY < bottom && otherY >= this._y)) {
      return true;
    }
    return false;
  },
  
  overlapsY: function(piece) {
    var right = this._x + this._width;
    var otherX = piece.getPos().x;
    var otherRight = otherX + piece.getWidth();
    
    if ((this._x < otherRight && this._x >= otherX) || 
      (otherX < right && otherX >= this._x)) {
      return true;
    }
    return false;
  }
});
