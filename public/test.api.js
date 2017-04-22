var request=window.superagent,
    should=chai.should();
describe('test authentication', function() {
  it('Should return access denied when no key', function(done) {
    request.get("/api/account").end(function(err,res){
      try {
        should.exist(err);
        err.status.should.equal(401);
        err.response.text.should.equal("Access Denied");
      } catch (e) {
        done(e);
      }
      done();
    });
  });
  it('Should return access denied when invalid key', function(done) {
    request.get("/api/account").set("X-API-Key","foobar").end(function(err,res){
      should.exist(err);
      err.status.should.equal(401);
      err.response.text.should.equal("Access Denied");
      done();
    });
  });
  it('Should accept test key', function(done){
    request.get("/api/account").set("X-API-Key","testkey").end(function(err,res){
      should.not.exist(err);
      should.exist(res);
      done();
    });
  });
  it('Should pass login', function(done){
    request.get("/api/login").end(function(err,res){
      should.not.exist(err);
      should.exist(res);
      done();      
    })
  })
});

describe('test login',function(){
  it('Should fail if missing user and password.',function(done){
    request.post("/api/login").end(function(err,res){
      should.exist(err);
      err.status.should.equal(403);
      err.response.text.should.equal("Authentication failed.");
      done();
    })
  });
  it('Should accept right user and password', function(done){
    request.post("/api/login").query({user:"test",password:"test"}).end(function(err,res){
      should.exist(res);
      should.exist(res.body);
      res.body.apikey.should.equal("testkey");
      done();
    })
  })
  it('Should fail on right user, but wrond password', function(done){
    request.post("/api/login").query({user:"test",password:"foobar"}).end(function(err,res){
      should.exist(err);
      err.status.should.equal(403);
      err.response.text.should.equal("Authentication failed.");
      done();
    })
  })
});
describe('test account management', function(){
  before(function(done){
    request.post("/api/account").query({name:"test1@example.com",uid:"DEADB11F"}).set("X-API-Key","testkey").end(
      function(err,res) {
        if(err) {
          done(err);
        } else {
          request.post("/api/account").query({name:"test2@example.com",uid:"DEADB22F"}).set("X-API-Key","testkey").end(
            function(err,res) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
        }
      });
  });
  it('Should be able to add account.',function(done){
    request.post("/api/account").query({name:"test@example.com",uid:"DEADBEEF"}).set("X-API-Key","testkey").end(
      function(err,res){
        try {
          should.exist(res);
          should.exist(res.body);
          res.body.name.should.equal("test@example.com");
          res.body.uid.should.equal("DEADBEEF");
          res.body.debit.should.equal(0);
          res.body.credit.should.equal(0);
          should.exist(res.body._id);
        } catch(e) {
          done(e);
        }
        done();
      });
  });
  it('Should get all three accounts.',function(done){
    request.get("/api/account").set("X-API-Key","testkey").end(function(err,res){
      try {
        should.exist(res);
        should.exist(res.body);
        console.log(res.body);
        res.body.length.should.be.at.least(3);
      } catch(e) {
        done(e);
      }
      done();
    });
  });
  
})