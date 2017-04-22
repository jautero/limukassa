var mocha=require('mocha');
var Datastore = require('nedb');
var bcrypt=require('bcrypt');

exports.init=function(app) {
  app.accounts= new Datastore();
  app.users= new Datastore();
  bcrypt.hash("test",10,function(err,hash){
    if (err) {
      console.log(err);
    }
    app.users.insert({type:'admin',name:'test',hash:hash,apikey:'testkey'});
  });
  app.get('/test/',function (request, response) {
    response.sendFile(__dirname + '/../public/test.html');
  });
};
exports.run=function() {
  mocha.run();
};