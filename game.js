/**
 * Author: Christer Byström
 */

CB.Class("Game", {
  /**
  * @param {Object}
  *   {Object} board
  *     Defines the board
  *       {Number} width 
  *       {Number} height
  *       {Object} exit
  *         {Number} x
  *         {Number} y
  *         {Number} width
  *         {Number} height
  *         exit defines the rectangel where exit is located
  *           
  *
  *   {Object} shapes
  *     Keys are shape names, values are hashes with dimensions:
  *     
  *     {Object}
  *       {Number} width
  *       {Number} height
  *
  *   {Array} pieces
  *     Defines the pieces on the board:
  *       {Number} x - position
  *       {Number} y - position
  *       {String} shape - shape from shapes (see above)
  *       {String} name - used to identify look, doesn't have to be unique
  *       {Boolean} target - true if this is the target piece
  *
  *   {Object} painter
  *     Object that paints the board
  *     Methods required:
  *       drawBoard()
  *       showMoves({Number} numMoves)
  *       drawPiece({CB.Piece} piece})
  *       showFailedMove()
  *       showWinGame({Number} numMoves)
  */
  
  initialize: function(params) {
    params = params || {};
    this._painter = params.painter;
    if (params.input) {
      this._setInput(params.input);
    }
    
    this._shapes = params.shapes || {};
    this._initPieces(params.pieces);
    
    this._width = params.board.width;
    this._height = params.board.height;
    this._exit = params.board.exit;
    this._moves = 0;
    this._gameWon = false;
    
    this._painter.drawBoard();
    this._painter.showMoves(0);
    this._drawPieces();
  },
  
  _setInput: function(input) {
    var that = this;
    input.setListener(function(action) {
      that._handleInput(action);
    });
    this._input = input;
  },
  
  /**
  * @param {String} action
  */
  _handleInput: function(action) {
    if (this._gameWon) {
      return;
    }
    if (this._pieceGrabbed) {
      switch(action) {
        case this._input.UP:
          this._tryMove(this._currentPiece, 0, -1);
          break;
        case this._input.DOWN:
          this._tryMove(this._currentPiece, 0, 1);
          break;
        case this._input.LEFT:
          this._tryMove(this._currentPiece, -1, 0);
          break;
        case this._input.RIGHT:
          this._tryMove(this._currentPiece, 1, 0);
          break;
        case this._input.OK:
          this._pieceGrabbed = false;
          this._currentPiece.unsetGrabbed();
          this._painter.drawPiece(this._currentPiece);
          break;
      }
    } else {
      var newPiece = null;
      var triedMove = false;
      switch(action) {
        case this._input.UP:
          newPiece = this._findUpperPiece(this._currentPiece);
          triedMove = true;
          break;
        case this._input.DOWN:
          newPiece = this._findLowerPiece(this._currentPiece);
          triedMove = true;
          break;
        case this._input.LEFT:
          newPiece = this._findLeftPiece(this._currentPiece);
          triedMove = true;
          break;
        case this._input.RIGHT:
          newPiece = this._findRightPiece(this._currentPiece);
          triedMove = true;
          break;
        case this._input.OK:
          this._pieceGrabbed = true;
          this._currentPiece.setGrabbed();
          this._painter.drawPiece(this._currentPiece);
          break;
      }
      if (newPiece && newPiece != this._currentPiece) {
        this._currentPiece.unsetSelected();
        newPiece.setSelected();
        this._painter.drawPiece(newPiece);
        this._painter.drawPiece(this._currentPiece);
        this._currentPiece = newPiece;
      } else {
        if (triedMove) {
          this._painter.showFailedMove(this._currentPiece);
        }
      }
    }
  },
  
  /**
   * Try to move a piece in desired direction
   * @param {CB.Piece} currentPiece
   * @param {Number} deltaX
   * @param {Number} deltaY
   * 
   * @returns {Boolean}
   *    true if piece was moved
   */
  _tryMove: function(currentPiece, deltaX, deltaY) {
    var x = currentPiece.getX() + deltaX;
    var y = currentPiece.getY() + deltaY;
    var hitsBorders = this._checkIfHitsBorders(currentPiece, x, y);
    if (hitsBorders || this._checkIfOverlaps(currentPiece, x, y)) {
      this._painter.showFailedMove(currentPiece, deltaX, deltaY);    
      return false;
    } else {
      currentPiece.move(deltaX, deltaY);
      this._painter.drawPiece(currentPiece);
      this._moves++;
      this._painter.showMoves(this._moves);
      
      if (this._allPiecesInPlace()) {
        currentPiece.unsetGrabbed();
        this._painter.drawPiece(currentPiece);
        this._winGame();
      }
      return true;
    } 
  },
  
  /**
   * Check if the piece will overlap another piece if moved to position x,y
   * 
   * @param {CB.Piece} currentPiece
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  _checkIfOverlaps: function(currentPiece, x, y) {
    // It's possible to improve speed by caching the board and just changing it
    // incrementally. But in reality, the speed gain is neglectable
    var board = CB.Field.createEmpty(this._width, this._height); 
    for (var i = 0; i < this._pieces.length; i++) {
      var piece = this._pieces[i];
      if (currentPiece !== piece) {
        board.drawSquare(piece.getX(), 
            piece.getY(), 
            piece.getWidth(), 
            piece.getHeight());
      }
    }
    var width = currentPiece.getWidth();
    var height = currentPiece.getHeight();
    for (var yy = 0; yy < height; yy++) {
      for (var xx = 0; xx < width; xx++) {
        if (board.getAtPos(xx+x, yy+y)) {
          return true;
        }
      }
    }
    return false;
  },
  
  
  /**
   * Check if the piece would hit the bounding borders of the gaming field
   * if moved to positon x, y
   * @param {Piece} currentPiece
   * @param {Number} x
   * @param {Number} y
   * @returns {Boolean}
   */
  _checkIfHitsBorders: function(currentPiece, x, y) {
    if (x < 0 || y < 0) {
      return true;
    }
    var width = currentPiece.getWidth();
    var height = currentPiece.getHeight();
    if (x + width > this._width || y + height > this._height) {
      return true;
    }
    return false;
  },
  
  _findLeftPiece: function(currentPiece) {
    return this._findPiece(currentPiece, 
        ["isLeftOf", "overlapsX"], 
        ["isRightOf", "isAbove"]);
  },
  
  _findRightPiece: function(currentPiece) {
    return this._findPiece(currentPiece, 
        ["isRightOf", "overlapsX"], 
        ["isLeftOf", "isAbove"]);
   },
  
  _findUpperPiece: function(currentPiece) {
    return this._findPiece(currentPiece, 
        ["isAbove", "overlapsY"], 
        ["isBelow", "isLeftOf"]);
  },

  _findLowerPiece: function(currentPiece) {
    return this._findPiece(currentPiece, 
        ["isBelow", "overlapsY"], 
        ["isAbove", "isRightOf"]);
  },
  
  /**
   * Find candidate to move to given a piece and 4 predicates
   * 
   * @param currentPiece
   * 
   * @param {Array [{String}, {String}] filterMethods
   *    An array of two strings that describes two methods of CB.Piece
   *    that are used to filter out candidates
   *    
   * @param {Array [{String}, {String}] sortMethods
   *    An array of two strings that describes two methods of CB.Piece
   *    that are used to order and chose between the candidates
   *    
   * @returns {CB.Piece}
   */
  _findPiece: function(currentPiece, filterMethods, sortMethods) {
    var candidates = this._filter(this._pieces, function(piece) {
      return piece !== currentPiece && piece[filterMethods[0]](currentPiece) && piece[filterMethods[1]](currentPiece);
    });
    
    var ordered = candidates.sort(function(b, a) {
      if (a[sortMethods[0]](b)) {
        return 1;
      }
      if (b[sortMethods[0]](a)) {
        return -1;
      }
      if (a[sortMethods[1]](b)) {
        return 1;
      }
      if (b[sortMethods[1]](b)) {
        return -1;
      }
      
      return 0;
    });
    
    return ordered[0];
  },
  
  /**
   * Filtering method for arrays
   * (To avoid putting something on the prototype of Array)
   * 
   * @param {Array} list 
   * @param {Function} filterFn
   *    return true if object should be include
   * @returns {Array}
   *    Filtered items
   */
  _filter: function(list, filterFn) {
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if (filterFn(list[i])) {
        filtered.push(list[i]);
      }
    }
    return filtered;
  },
  
  _initPieces: function(pieceTemplates) {
    this._pieces = [];
    this._pieceTarget = null;
    for (var i = 0; i < pieceTemplates.length; i++) {
      var pieceTemplate = pieceTemplates[i];
      var piece = new CB.Piece({ 
        name: pieceTemplate.name,
        targetx: pieceTemplate.targetx, 
        targety: pieceTemplate.targety,
        startx: pieceTemplate.startx, 
        starty: pieceTemplate.starty,
        width: this._shapes[pieceTemplate.shape].width,
        height: this._shapes[pieceTemplate.shape].height,
        selected: pieceTemplate.selected
      });
      if (pieceTemplate.selected) {
        this._pieceTarget = piece;
        this._currentPiece = piece;
      }
      this._pieces.push(piece);
    }
  },
  
  _allPiecesInPlace: function() {
    for (var i = 0; i < this._pieces.length; i++) {
      if (!this._pieces[i].isOnTarget()) {
        return false;
      }
    }
    return true;
  },
  
  _drawPieces: function() {
    for (var i = 0; i < this._pieces.length; i++) {
      this._painter.drawPiece(this._pieces[i]);
    }
  },
  
  _winGame: function() {
    this._gameWon = true;
    this._painter.showWinGame(this._moves);
  }
});


CB.gameData = {
  board: {
    width: 6,
    height: 4,
    exit: {
      targetx: 1,
      targety: 5,
      width: 2,
      height: 1
    }
  },
  
  painter: null, // To be set later, after page is loaded
  input: null,  // To be set later, after page is loaded
  
  shapes: {
    s: { width: 1, height: 1 },
    v: { width: 1, height: 2 },
    h: { width: 2, height: 1 },
    b: { width: 2, height: 2 }
  },

  pieces: [
    { startx: 1, starty: 0, targetx: 0, targety: 0, shape: "v", name: "a", selected: true },
    { startx: 4, starty: 1, targetx: 1, targety: 0, shape: "h", name: "b" },
    { startx: 4, starty: 0, targetx: 1, targety: 1, shape: "h", name: "c" },
    { startx: 0, starty: 3, targetx: 3, targety: 0, shape: "s", name: "d" },
    { startx: 1, starty: 3, targetx: 4, targety: 0, shape: "s", name: "e" },
    { startx: 0, starty: 1, targetx: 5, targety: 0, shape: "v", name: "f" },
    { startx: 3, starty: 3, targetx: 3, targety: 1, shape: "s", name: "g" },
    { startx: 2, starty: 3, targetx: 4, targety: 1, shape: "s", name: "h" },
    { startx: 3, starty: 2, targetx: 0, targety: 2, shape: "s", name: "i" },
    { startx: 2, starty: 2, targetx: 1, targety: 2, shape: "s", name: "j" },
    { startx: 4, starty: 2, targetx: 2, targety: 2, shape: "b", name: "k" },
    { startx: 2, starty: 1, targetx: 0, targety: 3, shape: "h", name: "l" }
  ]
};

CB.gameData2 = {
  board: {
    width: 6,
    height: 4,
    exit: {
      targetx: 1,
      targety: 5,
      width: 2,
      height: 1
    }
  },
  
  painter: null, // To be set later, after page is loaded
  input: null,  // To be set later, after page is loaded
  
  shapes: {
    s: { width: 1, height: 1 },
    v: { width: 1, height: 2 },
    h: { width: 2, height: 1 },
    b: { width: 2, height: 2 }
  },

  pieces: [
    { startx: 0, starty: 0, targetx: 0, targety: 0, shape: "v", name: "a", selected: true },
    { startx: 1, starty: 0, targetx: 1, targety: 0, shape: "h", name: "b" },
    { startx: 1, starty: 1, targetx: 1, targety: 1, shape: "h", name: "c" },
    { startx: 3, starty: 0, targetx: 3, targety: 0, shape: "s", name: "d" },
    { startx: 4, starty: 0, targetx: 4, targety: 0, shape: "s", name: "e" },
    { startx: 5, starty: 0, targetx: 5, targety: 0, shape: "v", name: "f" },
    { startx: 3, starty: 1, targetx: 3, targety: 1, shape: "s", name: "g" },
    { startx: 4, starty: 1, targetx: 4, targety: 1, shape: "s", name: "h" },
    { startx: 0, starty: 2, targetx: 0, targety: 2, shape: "s", name: "i" },
    { startx: 1, starty: 2, targetx: 1, targety: 2, shape: "s", name: "j" },
    { startx: 3, starty: 2, targetx: 2, targety: 2, shape: "b", name: "k" },
    { startx: 0, starty: 3, targetx: 0, targety: 3, shape: "h", name: "l" }
  ]
};



window.onload = function() {
  var data;
  if (window.location.href.indexOf("useBoard=2") > -1) {
    data = CB.gameData2;
  } else {
    data = CB.gameData;
  }
  data.input = new CB.KeyboardInput();
  data.painter = new CB.HTMLPainter({width: data.board.width, height: data.board.height});
  
  document.getElementById("loading").style.display = "none";
  CB.game = new CB.Game(data);
};
