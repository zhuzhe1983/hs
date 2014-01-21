# Hot Swap Module

A hot swap module help you load node module dynamically.

currently only support local path.

```javascript
var HS = require('hs');
var hs = new HS();

var one = hs.plug('test', 'one','../tests/mock/modules/one.js');
var two = hs.plug('test', 'two','../tests/mock/modules/two.js');

one.echo();
two.echo();

hs.unplug('test', 'two', function(type, name){
  console.log(type, name);
});

hs.unplug('test', 'two');

try{
  two.echo();
}catch(e){
  console.log(e);
}

```