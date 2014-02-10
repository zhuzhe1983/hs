var os = require('options-stream');

function OBJ(options){
  this.options = os({
    'key' : 'def',
  }, options);
}

OBJ.prototype.setOption = function(options){
  this.options = os(this.options, options);
}

module.exports = OBJ;