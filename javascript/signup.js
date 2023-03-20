const form = document.querySelector(".signup form");
const err = document.querySelector(".error-text");

const pw = document.querySelector(".confirmPassword")
const icon = document.querySelector("#icon")

  icon.addEventListener("click",()=>{
    if(pw.type === "password"){
      pw.type = "text"
    }else{
      pw.type = "password"
    }
  })


form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get Values from the inputField
  const firstName = document.querySelector('.fname').value;
  const lastName = document.querySelector('.lname').value;
  const email = document.querySelector('.email').value;
  let photo = document.querySelector('.photo').files[0];
  const password = document.querySelector('.password').value;
  const passwordConfirm = document.querySelector('.confirmPassword').value;


  if(password.length < 8){
    err.style.display = "block"
    err.textContent = "Password must be at least 8 characters long"
    setTimeout(()=>{
      err.style.display = "none"
    },3000)
    return
  }

  if(password !== passwordConfirm){
    err.style.display = "block"
    err.textContent = "Password do not match"
    setTimeout(()=>{
      err.style.display = "none"
    },3000)
    return
  }


  let formData;

  formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("email", email);
  formData.append("photo", photo);
  formData.append("password", password);
  formData.append("passwordConfirm", passwordConfirm);
  

  const requestOptions = {
    method: 'POST',
    body: formData,
    redirect: 'follow'
  };

  fetch("/api/v1/users/signup", requestOptions)
  .then(response => response.json())
  .then(result => {
    localStorage.setItem("user", JSON.stringify(result))
    window.location.href = '../users.html'
  })
  .catch(error => console.log('error', error));

  form.reset();

  

});
