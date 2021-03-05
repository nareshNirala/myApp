

// Display current user name in the nabvar
// Fetch current user name
var userName = document.querySelector('#profile');
var NavLogInBtn = document.querySelector('.nav-login-btn');
var account = document.querySelector('#account');


fetch("/user")
.then(response => response.json())
.then(data =>{
   if(data){
	   userName.textContent = "Welcome, " + data;
	   account.style.display = "none";
	   NavLogInBtn.style.display="none";
	   
   }
   else{
	  account.style.display = "inline";
	  
   }
});



// java Script Code of thank you page started from here

