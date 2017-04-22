// server.js
// where your node app starts

// init project
var express = require('express');
var Datastore = require('nedb');
var bcrypt = require('bcrypt');

var app = express();
var allowed_commands = {admin:['account','balance','debit','credit'],pos:['balance','debit','credit'] };

app.users = new Datastore({filename:'.data/users',autoload: true}),
app.accounts = new Datastore({filename:'.data/accounts',autoload: true});

if (process.env.TEST) {
  var test=require('./test');
  test.init(app);
}

app.users.count({}, function (err,count) {
  if (err) {
    console.log("Error "+err+" reading users database.");
  } else if (count === 0) {
    bcrypt.hash(process.env.ADMIPW,process.env.SALT_ROUNDS+0,function(err,hash){
      app.users.insert({type:'admin', name: 'admin', hash:process.env.ADMINPW, apikey:process.env.ADMINKEY})
    })
  }
});
// we've started you off with Express, 

function authenticate(request, response, next) {
  if (request.params['command']=='login') {
    console.log("Don't authenticate login");
    next();
  } else {
    var token=request.get("X-API-Key");
    if (!token) {
      response.status(401).send("Access Denied");
    } else {
      app.users.findOne({apikey:token},function (err,doc) {
        if (doc) {
          if (allowed_commands[doc.type].indexOf(request.params['command'])!=-1) {
            console.log("Success")
            next();
          } else {
              response.status(401).send("Access Denied");          
        }} else {
                    response.status(401).send("Access Denied");
        }
      });
    }
  }
}
  
function filterQuery(query,keys) {
  var result={};
  for (var i in keys) {
    var key=keys[i];
    var value=query[key];
    if (value!=null) {
      result[key]=value;
    }
  }
  return result;
}
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use('/api/:command',authenticate);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post("/api/login", function (request, response) {
  app.users.findOne({name:request.query['user']},function(err,doc){
    if (err) {
      console.log(err);
    }
    if (!doc) {
      response.status(403).send("Authentication failed.");
    } else {
      console.log(doc.hash)
      bcrypt.compare(request.query['password'],doc.hash,function(err,res){
        if (res) {
          response.json({'apikey':doc.apikey});
        } else {
          response.status(403).send("Authentication failed.");
        }
      })      
    }
  });
});

app.post("/api/account", function(request, response) {
  var update=filterQuery(request.query,['name','uid','_id']);
  if (request.query.hasOwnProperty('_id')) {
    app.accounts.update({_id:request.query['_id']},{$set: update},{returnUpdatedDocs: true},function (err,doc){
      if (err) {
        console.log(err);
        response.status(500).send(err);
      } else {
        response.json(doc);
      }
    })
  } else {
    update['debit']=0;
    update['credit']=0;
    app.accounts.insert(update,function(err,doc){
      if (err) {
        console.log(err);
        response.status(500).send(err);
      } else {
        response.json(doc);
      }
    })
  }
})

app.get('/api/account',function (request, response) {
  console.log(request.query);
  if (request.query=={}) {
    console.log("No data")
    app.accounts.find({},function(err,docs){
      if (err) {
        console.log(err);
        response.status(500).send(err);
      } else {
        response.json(docs);
      }
    })
  } else if (request.query.hasOwnProperty('_id')) {
    app.accounts.findOne({_id:request.query['_id']},function(err,doc){
      if (err) {
        console.log(err);
        response.status(500).send(err);
      } else {
        response.json(doc);
      }
    })
  } else {
    var query=filterQuery(request.query,['name','uid'])
    app.accounts.find(query,function(err,docs){
      console.log(docs)
      if (err) {
        console.log(err);
        response.status(500).send(err);
      } else {
        response.json(docs);
      }
    })
  }
});
app.all("/api/:command", function (request, response) {
  response.send("Done");
});
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
