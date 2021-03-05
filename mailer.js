const nodemailer = require('nodemailer');
const { getMaxListeners } = require('npm');


module.exports = function(name, recipter, username){

const mailTransporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:'easymaths20@gmail.com',
        pass:'Nk@627374'
    }
})

var mailDetails = {
    from:'easymaths20@gmail.com',
    to:recipter,
    subject:'Welcome to perfect learn',
    html:`Hello, ${name} Thanks for joining us. Your username is ${username} use this for loging. We provided the best which you want to learn. If you face any problems please email us. Thanks for joinging us.`
}

 const mail = mailTransporter.sendMail(mailDetails, function(err, data){
if(err){
    console.error(err)
}
else{
    console.log('Email sent successfuly.')
}
})

}

