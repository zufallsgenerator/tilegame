/**
 * Author: Christer Byström
 */

CB.Class("Field", {
  /**
  * Create an empty field
  * 
  */
  initialize: function(field) {
    this._field = this._copyField(field);
    this.getSize();
  },
  
  getSize: function() {
    if (!this._size) {
      var field = this._field;
      var height = field.length;  
      var width = 0;
      for (var y = 0; y < field.length; y++) {
        if (width < field[y].length) {
          width = field[y].length;
        };
      }
      this._size = {
        width: width,
        height: height
      };
      this._width = width;
      this._height = height;
    }
    return this._size;
  },
  
  clone: function() {
    return new CB.Field(this._field);
  },
  
  drawSquare: function(x, y, width, height) {
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (j+x < this._width && i+y < this._height)
        this._field[i+y][j+x] = 1;
      }
    }
  },
  
  getAtPos: function(x, y) {
    var row = this._field[y];
    if (row) {
      return row[x];
    }
    return null;
  },
  
  _copyField: function(field) {
    var fieldCopy = [];
    for (var i = 0; i < field.length; i++) {
      var col = field[i];
      var colCopy = [];
      for (var j = 0; j < col.length; j++) {
        colCopy[j] = col[j];
      }
      fieldCopy[i] = colCopy;
    }
    return fieldCopy;
  }
}).addStatic({
  
  /**
  * Create an empty field
  *
  * @param {Number} width
  * @param {Number} height
  *
  * @returns {Array} 
  *   A two-dimensional array
  */
  createEmpty: function(width, height) {
    var field = [];
    
    for (var y = 0; y < height; y++) {
      var col = [];
      for (var x = 0; x < width; x++) {
        col.push(0);
      }
      field.push(col);
    }
    
    var objField = new CB.Field(field);
    objField._size = {
      width: width,
      height: height
    };
    objField._width = width;
    objField._height = height;
    
    return objField;
  }
});
