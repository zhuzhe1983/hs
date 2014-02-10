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
    'root' : './',
    'persistence' : 'persistence.js',
  }, options);

  this.options.persistence = path.join(this.options.root, this.options.persistence);

  //events.EventEmitter.call(this);
  this.pool = {};
  this.persistence = {};
  this.init();
}

HS.prototype.init = function(){
  //load persistence config
  if(fs.existsSync(this.options.persistence)){
    var content = fs.readFileSync(this.options.persistence);
    if(content.length>0){
      try{
        this.persistence = JSON.parse(content);
        for(var type in this.persistence){
          for(var name in this.persistence[type]){
            this.load(this.persistence[type][name]);
          }
        }
      }catch(err){

      }
    }
  }else{
    //log.notice({message:"can't find persistence file"});
  }
};

//return hs object
HS.prototype.get = function(type, name, callback){
  var output = null;
  if(this.pool[type] != null && this.pool[type][name] != null){
    output = this.pool[type][name];
  }

  if(typeof callback == 'function'){
    return callback(output);
  }

  return output;
};

//write listener
HS.prototype.persist = function(plugin){
  var type = plugin.type;
  var name = plugin.name;

  if(this.persistence[type] == null){
    this.persistence[type] = {};
  }

  this.persistence[type][name] = plugin;
  
  var content = JSON.stringify(this.persistence);
  var file_name = this.options.persistence;

  fs.writeFile(file_name, content , function(err){
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

    if(typeof callback == 'function'){
      return callback(obj);
    }

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
    return callback(obj);
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
  }else{
    if(typeof callback == 'function'){
      callback({'message': "can't find " + name + " in " + type}, type, name);
    }
  }
 
  if(typeof callback == 'function'){
    callback(null, type, name);
  }
  //ep.emit('unplug', plugin);
}

HS.prototype.status = function(type, name){
  if(type == null && name == null){
    return this.persistence;
  }else if(name == null){
    return this.persistence[type];
  }else{
    return this.persistence[type][name];
  }
};

module.exports = HS;