const form = document.querySelector(".login form"),
errorText = form.querySelector(".error-text");


form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get Values from the inputField
  const email = document.querySelector('.email').value;
  const password = document.querySelector('.password').value;

  let formData;

  formData = new FormData();
  
  formData = JSON.stringify({
    "email": email,
    "password": password
  });

  const requestOptions = {
    method: 'POST',
    body: formData,
    redirect: 'follow'
  };

  fetch("/api/v1/users/login", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

  form.reset();
});
