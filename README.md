# Hot Swap Module

A hot swap module help you load node module dynamically.

currently only support local path.

```javascript
var HS = require('hs');
var hs = new HS();

var one = hs.plug('test', 'one', '../tests/mock/modules/one.js');
var two = hs.plug('test', 'two', '../tests/mock/modules/two.js');

one.test();
two.test();

hs.unplug('test', 'two', function(err, type, name){
  hs.get('test', 'two', function(obj){
    console.log(obj);
  });
});

hs.unplug('test', 'two');

try{
  console.log(two.test());
}catch(e){
  console.log(e);
}

```