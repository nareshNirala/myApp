const passport = require('passport');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const dotenv = require('dotenv');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(app, myDataBase){
  //serialization and deserialization here..
  passport.serializeUser((user, done) =>{
    done(null, user._id);
  });
  
 passport.deserializeUser((id, done)=> {
  myDataBase.findOne({_id: new ObjectID(id)}, (err, doc) =>{
    done(null, doc)
  });
 });
  
  passport.use(new LocalStrategy(
  function(username, password, done){
    myDataBase.findOne({username:username}, function(err, user){
      console.log('User ' + username + ' attempted to log in.');
      
      if(err){return done(err);}
      if(!user){return done(null, false, {message:"Username does not exist"})}
      if(!bcrypt.compareSync(password, user.password)){
        return done(null, false)
      }
      
      return done(null, user);
      
    });
  }
  ));
 // add social login
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret:process.env.GITHUB_CLIENT_SECRET,
    callbackURL:'http://localhost:3000/auth/github/callback'
  }, function(accessToken, refreshToken, profile, cb){
  
    myDataBase.findOneAndUpdate({id:profile.id},
      {
        $setOnInsert:{
          id: profile.id,
          name: profile.displayName || '',
          photo: profile.photos[0].value || '',
          email: Array.isArray(profile.emails[0]) ? profile.emails[0].value :'No public email',
          created_on: new Date(),
          provider: profile.provider || ''

        },
        $set: {
          last_login: new Date()
        },
        $inc:{
          login_count:1
        }
      },
      {upsert: true, new:true},
      (err, doc) => {
        return cb(null, doc.value)
      }
      
      )
  }
  ))


  // adding google authentication
  passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, cb) {
    
   myDataBase.findOneAndUpdate({id:profile.id},
    {
      $setOnInsert:{
        id: profile.id,
        name: profile.displayName || '',
        photo: profile.photos[0].value || '',
        email: Array.isArray(profile.emails[0]) ? profile.emails[0].value :'No public email',
        created_on: new Date(),
        provider: profile.provider || ''

      },
      $set: {
        last_login: new Date()
      },
      $inc:{
        login_count:1
      }
    },
    {upsert: true, new:true},
    (err, doc) => {
      return cb(null, doc.value)
    }
    
    )
  }
  ))
  // use facebook strategy

  passport.use(new FacebookStrategy({
    clientID:process.env.FACEBOOK_CLIENT_ID,
    clientSecret:process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, cb) {
    
   myDataBase.findOneAndUpdate({id:profile.id},
    {
      $setOnInsert:{
        id: profile.id,
        name: profile.displayName || '',
       // photo: profile.photos[0].value || '',
       // email: Array.isArray(profile.emails[0]) ? profile.emails[0].value :'No public email',
        created_on: new Date(),
        provider: profile.provider || ''

      },
      $set: {
        last_login: new Date()
      },
      $inc:{
        login_count:1
      }
    },
    {upsert: true, new:true},
    (err, doc) => {
      return cb(null, doc.value)
    }
    
    )
  }
  ))
  /*
  app.use(new FacebookStrategy(
    {
      clientID:'process.env.FACEBOOK_CLIENT_ID',
      clientSecret:'process.env.FACEBOOK_CLIENT_SECRET',
      callbackURL:'http://localhost:3000/auth/facebook/callback'
    },
    function(request, accessToken, refreshToken, profile, cb){
      myDataBase.findOneAndUpdate({id: profile.id}, 
        {
           $setOnInsert:{
          id: profile.id,
          name: profile.displayName || '',
          photo: profile.photos[0].value || '',
          email: Array.isArray(profile.emails[0]) ? profile.emails[0].value :'No public email',
          created_on: new Date(),
          provider: profile.provider || ''
        },
        $set:{
          last_login: new Date()
        },
        $inc:{
          login_count:1
        }
             
      },
      {upsert:true, new: true},
      (err, doc) =>{
        return cb(null, doc.value)
      }
      )
    }
  ))


  */
  
  
}