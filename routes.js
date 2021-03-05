const passport = require('passport');
const bcrypt = require('bcrypt');
const pug = require('pug');
const mail = require('./mailer');
const flash = require('connect-flash');
//var flash = require('express-flash-messages');





module.exports = function(app, myDataBase, newsletterUsers, contactUsUsers){

   

  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin:true,
      showRegistration:true,
      showSocialAuth:true
      
    });
  });
    app.route('/register').get(function(req, res){
      res.render(process.cwd() + '/views/pug/register.pug');
    });
    app.route('/login').get(function(req, res){
      res.render(process.cwd() + '/views/pug/login');
    })
    app.route('/profile').get(function(req, res){
      res.render(process.cwd() + '/views/pug/profile');
    })
  
  app.route('/register').post(function(req, res, next){
    const name = req.body.name;
    const username = req.body.username;
    const email = username;
    const mobileNumber = req.body.mobile_number;
    
    const password = req.body.password;
    const conformPassword = req.body.conform_password;
    const hash = bcrypt.hashSync(password, 12);
    myDataBase.findOne({username: req.body.username}, function(err, user){
      if(err){
        next(err)
      }
      else if(user){
       res.render(process.cwd() + '/views/pug/register', {message: 'The username already taken. If yours please login or try another.'})
       

      }
      else{
        if(password !== conformPassword){
          res.render(process.cwd() + '/views/pug/register', {message: "Password does not match. Password and conform password should be same."})
        }
        else if( password.length < 6){
          res.render(process.cwd() + '/views/pug/register', {message: "Password should be minimum 6 digit long."})
        }
        else{
          myDataBase.insertOne({
            name: name,
            username:username,
            email: username,
            mobile: mobileNumber,
            password: hash
          }, function(err, doc){
            if(err){
            res.redirect('/')
          }
          else{
            // The inserted document is held within the ops property of the
            next(null, doc.ops[0])
            
           // message = `Thanks for joining us. Your username is  ${doc.ops[0].username} Please login`;
            
           mail(name, email, doc.ops[0].username);
            
          }
          })
          res.render(process.cwd() + '/views/pug/thanks-page', {message: 'Thanks for joining us. Please login'});
        }
          
        
      
      }
        
        
      
    });
  });
  
  // add social authentication login
  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(passport.authenticate('github', {failureRedirect:'/'}), function(req, res){
     req.session.user_id = req.user.user_id
     res.redirect('/');
  })
  // Google authentication login
  app.route('/auth/google').get(passport.authenticate('google',{scope:["email", "profile"]}));
  app.route('/auth/google/callback').get(passport.authenticate('google', {failureRedirect:'/'}), function(req, res){
     req.session.user_id = req.user.user_id
     res.redirect('/');
  })
  
  // Facebook authentication
  app.route('/auth/facebook').get(passport.authenticate('facebook'));
  app.route('/auth/facebook/callback').get(passport.authenticate('facebook', {failureRedirect:'/login'}), function(req, res){
    req.session.user_id = req.user.user_id
    res.redirect('/')
  })




  
  app.route('/login').post(passport.authenticate('local', {failureRedirect:'/'}), function(req, res){
    res.redirect('/profile')
    
  });
  
  app.route('/profile').get(ensureAuthenticated, function(req, res){
    res.render(process.cwd()+ '/views/pug/profile', {username: req.user.name})
    
  });
    

  // Send username to display in navbar
  app.route('/user').get(function(req, res){
    
    var userName;
    if(req.user){
       userName = req.user.name;
      console.log(userName);
      res.json(userName)
    }
    
  
    
  });
  
  app.route('/logout').get(function(req, res){
    
    req.logout();
    res.redirect('/');
  })
   // Adding route for newslatter users
   
   app.route('/newsletter').post(function(req, res){
     const userEmail = req.body.newsletter_email;
     newsletterUsers.findOne({email:userEmail}, function(err, email){
       if(err) throw err ;
       else if(email){
         
      
        res.render(`${process.cwd()}/views/pug/thanks-page`, {message: "You are already subscriber of Perfect Learn."});
       }
       else{
         newsletterUsers.insertOne({
           email: userEmail,
           date: new Date()
         },function(err, doc){
           if(err) throw err;
           else{
             
            res.render(`${process.cwd()}/views/pug/thanks-page`, {message: "Thanks for contacting us"});
             
           }
         })
       }
     })
   })
   
   
   
   // Adding contact us users
    
   app.route("/contact").post(function(req, res){
     const name = req.body.name;
     const email = req.body.email;
     const mobile = req.body.mobile;
     const message = req.body.message;
     contactUsUsers.findOne({email: email, mobile:mobile}, function(err, doc){
       if (err) throw err;
       else if(doc){
         
         res.render(`${process.cwd()}/views/pug/thanks-page`, {message: "This email id is already exits. Please privide another email id."});
       }
      
       else{
         contactUsUsers.insertOne({
           date: new Date(),
           name:name,
           email: email,
           mobile: mobile,
           message: message
         },function(err, doc){
           if(err) throw err;
           else{
             
            res.render(`${process.cwd()}/views/pug/thanks-page`, {message: "Thanks for contacting us. We will be response as soon as possible."});
           }
         })
       }
     })


   })
   

  app.route('/thanks').get(function(req, res){
    res.render(`${process.cwd()}/views/pug/thanks-page`, {message: "Thanks for contacting us"});
  })

  
  app.use(function(req, res, next){
    res.status(404)
    .type('text')
    .send("Not Found")
  })
  
}

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/')
}


