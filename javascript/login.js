const form = document.querySelector(".login form"),
err = form.querySelector(".error-text");


form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get Values from the inputField
  const email = document.querySelector('.email').value;
  const password = document.querySelector('.password').value;

  
  
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const formData = JSON.stringify({
    "email": email,
    "password": password
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formData,
    redirect: 'follow'
  };

  fetch("/api/v1/users/login", requestOptions)
  .then(response => response.json())
  .then(result => {
    if(result.status === "fail"){
      err.style.display = "block"
      err.textContent = "Invalid username or password"
      setTimeout(()=>{
        err.style.display = "none"
      },3000)
      return
    }
    localStorage.setItem("user", JSON.stringify(result))
    window.location.href = '../users.html'
  })
  .catch(error => console.log('error', error));

  form.reset();
});
