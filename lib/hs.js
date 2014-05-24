/*
 * hs - hs.js, hot swap module lib.
 *
 * Copyright(c) 2013 Alibaba Group Holding Limited.
 * Authors:
 *   Zhu Zhe <zhe.zhu@alibaba-inc.com> (http://www.orzk.com)
 */

var fs = require('fs');
var path = require('path');
var os = require('options-stream');

function HS(options){
  this.options = os({
    'root' : '.'
  }, options);

  //events.EventEmitter.call(this);
  this.pool = {};
  this.init();
}

HS.prototype.init = function(){
};

//return hs object
HS.prototype.get = function(type, name, version, callback){
  version = version || "*";
  
  if(typeof version  == 'function'){
    callback = version;
    version = "*";
  }

  var output = null;

  if(this.pool[type] != null && this.pool[type][name] != null && this.pool[type][name][version] != null){
    output = this.pool[type][name][version];
  }

  if(typeof callback == 'function'){
    return callback(null, output);
  }

  return output;
};

//load local module
HS.prototype.load = function(plugin, callback){
  var type = plugin.type;
  var name = plugin.name;
  var version = plugin.version || "*";
  var location = path.join(this.options.root, plugin.location);
 
  if(!fs.existsSync(location)){
    return callback({
      message : "can not find module " + location
    }, null);
  }

  try{

    var obj = require(location);

    if(this.pool[type] == null){
      this.pool[type] = {};
    }
    
    if(this.pool[type][name] == null){
      this.pool[type][name] = {};
    }

    this.pool[type][name][version] = obj;

    if(typeof callback == 'function'){
      return callback(null, obj);
    }

    return obj;
  }catch(err){
    return callback({message:"plugin load failed: " + name + " @ " + version + " of " + type }, null);  
    //throw err;
  }
};

//plug external plugin
HS.prototype.plug = function(type, name, version, location, callback){
  
  if(arguments.length < 5){
    callback = location;
    location = version;
    version = "*";
  }

  var plugin = {
    type: type,
    name: name,
    version: version,
    location: location,
  };

  return this.load(plugin, callback);
};

//unplug plugin
HS.prototype.unplug = function(type, name, version, callback){
  if(typeof version == 'function'){
    callback = version;
    version = "*";
  }

  if(this.pool[type] == null || this.pool[type][name] == null || this.pool[type][name][version] == null){
    var err = {'message': "can't find " + name + "@" + version + " of " + type};
    if(typeof callback == 'function'){
      callback(err, plugin);
    }
    return;
  }
 
  var plugin = {
    type : type,
    name : name,
    version : version
  };
    
  if(this.pool[type] && this.pool[type][name] && this.pool[type][name][version]){
    
    delete(this.pool[type][name][version]);

    if(typeof callback == 'function'){
      callback(null, plugin);
    }
  }
}

HS.prototype.list = function(type, name, callback){
  var output = {};

  if(type == null && name == null){
    output = this.pool;
  }else if(name == null){
    output = this.pool[type];
  }else{
    output = this.pool[type][name];
  }

  if(typeof callback == 'function'){
    callback(output);
  }else{
    return output;
  }
};

module.exports = HS;