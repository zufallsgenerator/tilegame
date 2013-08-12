var CB = new function() {
  /**
  * Function for creating a class
  *
  * @param {String} name
  *   name of the class
  * 
  * @param {Object} members
  *    methods, constants and class variables    
  *
  * @return {Function} 
  *    The instantiated class
  */
  this.Class = function(name, members) {
    if (!window._classes) {
      window._classes = {};
    }

    CB[name] = function() { 
      CB[name].__instanceCount__++; 
      this.__instanceId__ = "cb_" + name + klass.__instanceCount__; 
      if (this.initialize) {  
        this.initialize.apply(this,  arguments)
      }
    };
    
    var klass = CB[name];
    
    // Copy member objects
    for (var key in members) {
      if (members.hasOwnProperty(key)) {
        klass.prototype[key] = members[key];
      }
    }
    
    // Extra functions on prototype
    klass.__instanceCount__ = 0;
    
    klass.prototype.getInstanceId = function() {
      return this.__instanceId__;    
    };
    
    
    if (Array.constructor) {
      klass.prototype._assertParams = _assertParams;
    } else {
      klass.prototype._assertParams = function() {};
    }
    
    
    // Method for adding class methods/variables
    klass.addStatic = function(members) {
      for (var key in members) {
        if (members.hasOwnProperty(key)) {
          klass[key] = members[key];
        }
      }
      
      return klass;
    };
    
    return klass;
  };


  function _assertParams(params, template) {
    // This probably requires a pretty new web browser
    for (var name in template) {
      if (template.hasOwnProperty(name)) {
        var expectedType = template[name];
        var expectedStr = "parameter '" + name + "' of type '" + 
        	expectedType.name + "'";
        if (params[name] === undefined) {
          throw new Error("Missing: " + expectedStr);
        }
        
        if (params[name].constructor !== expectedType) {
          throw new Error("Wrong type: " + (typeof params[name]) +
        		  ". Expected " + expectedStr);
        }
      }
    }
  };
}();

