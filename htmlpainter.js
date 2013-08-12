/**
 * Author: Christer Byström
 */

CB.Class("HTMLPainter", {
  _DEFAULT_BLOCKSIZE: 20, 
  _PIECESURL: "graphic/board400x300.png",

  
  initialize: function(params) {
    this._width = params.width;
    this._height = params.height;
    this._container = params.container || null;
    var cssBlockSize = this._getBlockSizeFromCss();
    this._blockHeight =  cssBlockSize.height || this._DEFAULT_BLOCKSIZE;
    this._blockWidth =  cssBlockSize.width || this._DEFAULT_BLOCKSIZE;
    this._elements = {};
    // To be set later
    this._board = null;
    this._animations = {};
    this._boardId = "board_" + this.getInstanceId();
  },
  
  _getBlockSizeFromCss: function() {
    var div = document.createElement("div");
    var body = this._getBody();
    body.appendChild(div);
    $(div).addClass("blocksize");
    var width = parseInt($(div).css("width"), 10);
    var height = parseInt($(div).css("height"), 10);
    return {
      width: width,
      height: height
    };
  },
  
  
  /**
   * Show the game board
   */
  drawBoard: function() {
    this._getBoard();
  },
  
  _getBoard: function() {
    var board = this._getElement(this._boardId);
    if (!board) {
      this._createBoard();
    }
    return board;
  },
  
  _createBoard: function() {
    var el = document.createElement("div");
    
    el.className = "gamefield";
    el.id = "board_" + this.getInstanceId();
    this._getContainer().appendChild(el);
    this._elements[this._boardId] = el;
    return el;
  },
  
  /**
   * Display number of moves so far
   * @param {Number} numMoves
   */
  
  showMoves: function(numMoves) {
    this._setHeaderText("Moves: " + numMoves);
  },
  
  _setHeaderText: function(text) {
    var scoreId = "score_" + this.getInstanceId();
    var scoreDiv = this._getElement(scoreId);
    if (!scoreDiv) {
      scoreDiv = this._createScore(scoreId, "score");
    }
    $(scoreDiv).text(text);
  },
  
  _createScore: function(id, cssClass) {
    var element = document.createElement("div");
    $(element).addClass(cssClass);
    this._getContainer().appendChild(element);  
    this._elements[id] = element;
    return element;
  },
  
  
  /**
   * 
   * @param {CB.Piece} piece
   */
  drawPiece: function(piece) {
    var board = this._getBoard();
    if (!board) {
      throw new Error("HTMLPainter.drawPiece -> No board, something is wrong!");
    }
  
    var pos = piece.getPos();
    var name = piece.getName();
    var id = piece.getId();
    
    var element = this._getElement(id);
    if (!element) {
      var size = piece.getSize();
      element = this._createElement(id, name, size, piece.getTargetPos());
    }
    this._setElementPos(element, pos.x, pos.y);
    if (piece.isGrabbed()) {
      this._setGrabbed(element);
    } else {
      this._unsetGrabbed(element);
    }
    if (piece.isSelected() && !piece.isGrabbed()) {
      this._setSelected(element);
    } else {
      this._unsetSelected(element);
    }
  },
  
  /**
   * Animate that a movement failed
   * 
   * @param {CB.Piece} piece
   */
  showFailedMove: function(piece, x, y) {
    var element = this._getElement(piece.getId());
    var that = this;
    this._setMoveFailed(element);
    setTimeout(function() {
      that._unsetMoveFailed(element);
    }, 200);
    
  },
  
  /**
   * Show that game was won and number of moves used
   * @param numMoves
   */
  showWinGame: function(numMoves) {
    var that = this;
    setTimeout(function() {
      that._setHeaderText("Congratulations! Finished with " + numMoves + " moves. Reload browser to play again!");
    }, 0);
  },
  
  _setElementPos: function(element, x, y) {
    element.style.left = (x * this._blockWidth) + 1;
    element.style.top = (y * this._blockHeight) + 1;
  },
  
  _setElementSize: function(element, width, height) {
    element.style.width = (width * this._blockWidth) - 2;
    element.style.height = (height * this._blockHeight) - 2;
  },
  
  _setSelected: function(element) { 
    $(element).addClass("selected");
  },
  
  _unsetSelected: function(element) { 
    $(element).removeClass("selected").removeClass("movefailed");
  },
  
  _setGrabbed: function(element) { 
    $(element).addClass("grabbed");
  },
  
  _unsetGrabbed: function(element) { 
    $(element).removeClass("grabbed");
  },
  
  _setMoveFailed: function(element) { 
    $(element).addClass("movefailed").removeClass("selected");
  },
  
  _unsetMoveFailed: function(element) { 
    if ($(element).hasClass("movefailed")) {
      $(element).removeClass("movefailed").addClass("selected");
    }
  },
  
  _getContainer: function() {
    if (!this._container) {
      this._container = this._getBody();
    }
    
    return this._container;
  },
  
  _getBody: function() {
    return document.getElementsByTagName("body")[0];
  },
  
  /**
  * Get or create an HTML element for id
  * @param {String} id
  *
  * @returns {DOMElement}
  */
  _getElement: function(id) {
    return this._elements[id];
  },
  
  /**
   * Create a div
   * @param {String} id
   * @param {String} cssClass
   * @param {Object}
   *    {Number} width
   *    {Number} height
   * @param {String} gfx
   * @returns {DOMObject}
   */
  _createElement: function(id, cssClass, size, targetPos) {
    var element = document.createElement("div");
    $(element).addClass(cssClass);
    element.style.position = "absolute";
    element.id = id;
    this._setElementSize(element, size.width, size.height);
    var board = this._getBoard();
    board.appendChild(element);
    this._elements[id] = element;
    
    var x = targetPos.x * this._blockWidth;
    var y = targetPos.y * this._blockHeight;
    
    element.style.backgroundPositionX =  - x; 
    element.style.backgroundPositionY =  - y; 
    
    return element;
  },
  
  cleanup: function() {
    this._cleanupElements();
  },
  
  /**
   * Detach all elements from the DOM and remove all javascript references 
   * to allow the gc to handle them
   */
  _cleanupElements: function() {
    for (var id in this._elements) {
      if (this._elements.hasOwnProperty(id)) {
        var el = this._elements[id];
        el.parentNode.removeChild(el);
      }
    }

    this._elements = {};
    this._container = null;
  }
  
  
});