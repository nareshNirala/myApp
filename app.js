// server.js
// where your node app starts
"use strict"
require('dotenv').config()
const routes = require('./routes');
const auth = require('./auth')
const myDB = require('./connection');
const passport = require('passport');
const session = require('express-session');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const bodyParser = require('body-parser');


// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({url:URI});

  
  app.use(flash());
  //app.use(express.bodyParser());
  app.use(bodyParser.urlencoded({extended:true}));

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use("/public", express.static(process.cwd()+ "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'pug');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookies:{secure:false},
  key: 'express.sid',
  store: store
}))

app.use(passport.initialize());
app.use(passport.session());


// uses of socket io
io.use(
passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.SESSION_SECRET,
  store: store,
  onAuthorizeSuccess: onAuthorizeSuccess,
  onAuthorizeFail: onAuthorizeFail
})
)

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept(null, true)
}

function onAuthorizeFail(data, message, error, accept){
  if(error) throw new Error(message);
  console.log('failed connection to socket.io');
  accept(null, false)
}

myDB(async (client) => {
  const db = await client.db('perfect_learn');
 // const myDataBase = db.collection('users');

  const myDataBase = await client.db('perfect_learn').collection('users');

  const newsletterUsers = db.collection('newsletter_users');
  const contactUsUsers = db.collection('contact_us_users');
  
  routes(app, myDataBase, newsletterUsers, contactUsUsers);
  auth(app, myDataBase);
  
  
}).catch((e) =>{
  app.route('/').get((req, res) => {
    res.render('pug', {title: e, mesage: 'Unable to login'})
  });
});


// listen for requests :)
const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
