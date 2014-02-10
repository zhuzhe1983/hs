/*
 hs - tests/test-hs.js 
 Copyright(c) 2013 alibaba-inc.com
 Author: zhe.zhu <zhe.zhu@alibaba-inc.com>
*/

var HS       = require('../lib/hs.js');
var expect   = require('expect.js');

describe('Hot Swap', function(){
  var hs = new HS({'root' : "./tests/mock/" });
  
  before = function(done){
    done();
  };

  it('plug', function(done){
    hs.plug('interface', 'one', '../tests/mock/modules/one.js', function(obj){
      var output = obj.test();
      expect(output).to.be('one');
      done();
    });
  });

  it('get', function(done){
    var two = hs.plug('interface', 'two', '../tests/mock/modules/one.js');
    hs.get('interface', 'two', function(obj){
      expect(obj).not.to.be(null);
      done();
    });
  });

  it('unplug', function(done){
    var two = hs.plug('interface', 'two', '../tests/mock/modules/two.js');
    hs.unplug('interface', 'two', function(err, type, name){
      expect(err).to.be(null);
      hs.get('interface', 'two', function(obj){
        expect(obj).to.be(null);
        done();
      });
    });
  });

  it('persist', function(done){
    var hs_new = new HS({'root' : "./tests/mock/" });
    hs_new.get('interface', 'one', function(obj){
      var output = obj.test();
      expect(output).to.be('one');
      done();
    });
  });

  it('load', function(done){
    hs.load({
      "type": "interface",
      "name": "anotherone",
      "location": "../tests/mock/modules/two.js"
    }, function(obj){
      var output = obj.test();
      expect(output).to.be('two');
      done();
    });
  });
});