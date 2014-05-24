/*
 hs - tests/test-hs.js 
 Copyright(c) 2013 alibaba-inc.com
 Author: zhe.zhu <zhe.zhu@alibaba-inc.com>
*/

var HS       = require('../lib/hs.js');
var expect   = require('expect.js');

describe('Hot Swap', function(){
  var hs = new HS({'root' : __dirname });
  
  before = function(done){
    done();
  };

  it('plug', function(done){
    hs.plug('interface', 'one', 'mock/modules/one.js', function(err, obj){
      expect(err).to.be(null);
      var output = obj.test();
      expect(output).to.be('one');
      done();
    });
  });


  it('get callback', function(done){
    hs.get('interface', 'one', function(err, obj){
      expect(err).to.be(null);
      expect(obj).not.to.be(null);
      done();
    });
  });

  it('get return', function(done){
    expect(hs.get('interface', 'one')).not.to.be(null);
    done();
  });

  it('unplug', function(done){
    var two = hs.plug('interface', 'two', 'mock/modules/two.js');
    hs.unplug('interface', 'two', function(err, plugin){
      expect(err).to.be(null);
      expect(plugin).not.to.be(null);
      hs.get('interface', 'two', function(err, obj){
        expect(err).to.be(null);
        expect(obj).to.be(null);
        done();
      });
    });
  });
  
  it('unplug plugin which is not exsiting', function(done){
    hs.unplug('interface', 'null', function(err, plugin){
      expect(err).not.to.be(null);
      expect(plugin).not.to.be(null);
      done();
    });
  });

  it('load', function(done){
    hs.load({
      "type": "interface",
      "name": "anothertwo",
      "location": "mock/modules/two.js"
    }, function(err, obj){
      var output = obj.test();
      expect(output).to.be('two');
      done();
    });
  });

  it('load not exsit plugin', function(done){
    hs.load({
      "type": "interface",
      "name": "null",
      "location": "mock/modules/null.js"
    }, function(err, obj){
      expect(err).not.to.be(null);
      expect(obj).to.be(null);
      done();
    });
  });

  it('load err plugin', function(done){
    hs.load({
      "type": "interface",
      "name": "null",
      "location": "mock/modules/err.js"
    }, function(err, obj){
      expect(err).not.to.be(null);
      expect(obj).to.be(null);
      done();
    });
  });

  it('list return', function(done){
    expect(hs.list('interface', 'one'))
      .to
      .be(hs.pool['interface']['one']);

    expect(hs.list('interface'))
      .to
      .be(hs.pool['interface']);

    expect(hs.list())
      .to
      .be(hs.pool);

    done();
  });

  it('list callback', function(done){
    hs.list('interface', 'one', function(err, list){
      expect(list).not.to.be(null);
      done();
    });
  });

  it('plug object', function(done){
    var OBJ = hs.plug( 'interface', 'obj', 'mock/modules/obj.js' );
    var obj = new OBJ({ 'key': 'init' });
    obj.setOption({'key' : 'set'});
    expect(obj.options['key']).to.be('set');
    done();
  });
});