var fs = require('fs');
var path = require('path');

var default_options = {
  'root' : './',
  'persistence' : 'persistence.js',
  'module_dir'  : './modules/',
};

//default options
function HS(options){
  this.options = options || default_options;
  //events.EventEmitter.call(this);
  this.pool = {};
  this.persistence = {};
  this.init();
}

HS.prototype.init = function(){
  //load persistence config
  var file = path.join(this.options.root, this.options.persistence);
  if(fs.existsSync(file)){
    var content = fs.readFileSync(file);
    if(content.length>0){
      try{
        this.persistence = JSON.parse(content);
        for(var type in this.persistence){
          for(var name in this.persistence[type]){
            this.load(this.persistence[type][name]);
          }
        }
      }catch(error){

      }
    }
  }else{
    //log.notice({message:"can't find persistence file"});
  }
};

//return hs object
HS.prototype.get = function(type, name){
  if(this.pool[type] == null || this.pool[type][name] == null){
    return null;
  }
  return this.pool[type][name];
};

//write listener
//event listener in the module can't be store permanently;
HS.prototype.persist = function(plugin){
  var file = path.join(this.options.root, this.options.persistence);
  var type = plugin.type;
  var name = plugin.name;

  if(this.persistence[type] == null){
    this.persistence[type] = {};
  }
  this.persistence[type][name] = plugin;
 
  fs.writeFile(file, JSON.stringify(this.persistence), function(err){
    if(err){
      console.log(err);
      //return log.error(err);
    }
    //return ep.emit('persist', plugin);
  });
};

//load local module
HS.prototype.load = function(plugin, callback){
  var type = plugin.type;
  var name = plugin.name;
  var location = plugin.location;
 
  try{
    var obj = require(location);
    if(this.pool[type] == null){
      this.pool[type] = {};
    }
    this.pool[type][name] = obj;
    this.persist(plugin);
    //this.emit('load', plugin);
    return obj;
  }catch(err){
    throw err;
  }
};

//plug external plugin
HS.prototype.plug = function(type, name, location, callback){
  var plugin = {
    type: type,
    name: name,
    location: location,
  };

  //load
  var obj = this.load(plugin);

  if(obj == null){
    //this.emit('error', plugin);
    //log.error('plug', plugin);
  }
 
  if(typeof callback == 'function'){
    callback(obj);
  }
 
  //this.emit('plug', plugin);
  return obj;
};

//unplug plugin
HS.prototype.unplug = function(type, name, callback){
  if(this.pool[type] == null || this.pool[type][name] == null){
    //return ep.emit('error', {message: "can't find plugin"});
  }

  // var obj = this.pool[type][name];

  // //TODO: remote event listener;
  // if(typeof obj == 'events.EventEmitter'){
  //   obj.removeAllListeners();
  // }
 
  if(this.pool[type] && this.pool[type][name]){
    delete(this.pool[type][name]);
  }
 
  if(typeof callback == 'function'){
    callback(type, name);
  }
  //ep.emit('unplug', plugin);
}

// HS.prototype.status = function(type, name, ver){
//   if(type === null){
//     return this.status;
//   }else if(name === null){
//     return this.status[type];
//   }else if(ver === null){
//     return this.status[type][name];
//   }
//   return this.status;
// };

module.exports = HS;

//test
// var hs = new HS();

// var one = hs.plug('test', 'one','../tests/mock/modules/one.js');
// var two = hs.plug('test', 'two','../tests/mock/modules/two.js');

// one.echo();
// two.echo();

// hs.unplug('test', 'two', function(type, name){
//   console.log(type, name);
// });

// hs.unplug('test', 'two');

// try{
//   two.echo();
// }catch(e){
//   console.log(e);
// }