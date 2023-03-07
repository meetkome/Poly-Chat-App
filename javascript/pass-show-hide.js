const pswrdField = document.querySelector(".form input[type='password']"),
conPswrdField = document.querySelector(".form input[type='password']"),
toggleIcon = document.querySelector(".form .field i");

toggleIcon.onclick = () =>{
  if(pswrdField.type === "password"){
    pswrdField.type = "text";
    toggleIcon.classList.add("active");
  }else{
    pswrdField.type = "password";
    toggleIcon.classList.remove("active");
  }
}

toggleIcon.onclick = () =>{
  if(conPswrdField.type === "password"){
    conPswrdField.type = "text";
    toggleIcon.classList.add("active");
  }else{
    conPswrdField.type = "password";
    toggleIcon.classList.remove("active");
  }
}
