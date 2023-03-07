const form = document.querySelector(".signup form");

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get Values from the inputField
  const firstName = document.querySelector('.fname').value;
  const lastName = document.querySelector('.lname').value;
  const email = document.querySelector('.email').value;
  let photo = document.querySelector('.photo').files[0];
  const password = document.querySelector('.password').value;
  const passwordConfirm = document.querySelector('.confirmPassword').value;

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
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

});
