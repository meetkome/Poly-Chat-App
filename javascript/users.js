// const { callbackPromise } = require("nodemailer/lib/shared");

const searchBar = document.querySelector(".search input"),
searchIcon = document.querySelector(".search button"),
usersList = document.querySelector(".users-list");
const logout = document.querySelector(".logout")
// console.log(logout)

//Getting a particular login user
const getUser =()=>{
  const currentUser = JSON.parse(localStorage.getItem("user"))
  if(!currentUser){
    return window.location.href = 'login.html'
  }
  const user = currentUser.data.user
  const content = document.querySelector(".content")
  content.innerHTML = `
    <img src=${user.photo} alt="">
    <div class="details">
      <span>${user.firstName} ${user.lastName}</span>
      <p>${user.statuss}</p>
    </div>
  `
}
getUser()


// toggle the search icon
searchIcon.onclick = ()=>{
  searchBar.classList.toggle("show");
  searchIcon.classList.toggle("active");
  searchBar.focus();
  if(searchBar.classList.contains("active")){
    searchBar.value = "";
    searchBar.classList.remove("active");
  }
}

// Search for a particular Active user
const searchInput = document.getElementById("searchInput");
const items = document.getElementsByClassName("names");
console.log(items)

searchInput.addEventListener("keyup", function(event) {
  const query = event.target.value.toLowerCase();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.innerHTML.toLowerCase().indexOf(query) > -1) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  }
});


// Deleting user from local storage and redirect to login page
logout.addEventListener("click", ()=>{
  localStorage.removeItem("user")
  window.location.href = '../login.html'
})

fetch("/api/v1/users/")
  .then(response => response.json())
  .then(result => {
  // console.log(result.data.users)
  const usersList = document.querySelector(".users-list")  
  const users = result.data.users
  users.forEach(user => {
    const userElement = document.createElement("a")
    userElement.setAttribute("class", "names")
    userElement.innerHTML = `
    <div class="content">
      <img src=${user.photo} alt="#">
      <div class="detail">
        <span>${user.firstName} ${user.lastName}</span>
        <p>${user.statuss}</p>
      </div>
    </div>
    <div class="status-dot"><i class="fas fa-circle"></i></div>
    `
    usersList.appendChild(userElement)
  });
})
  .catch(error => console.log('error', error));



// searchBar.onkeyup = ()=>{
//   let searchTerm = searchBar.value; 
//   if(searchTerm != ""){
//     searchBar.classList.add("active");
//   }else{
//     searchBar.classList.remove("active");
//   }
//   let xhr = new XMLHttpRequest();
//   xhr.open("POST", "php/search.php", true);
//   xhr.onload = ()=>{
//     if(xhr.readyState === XMLHttpRequest.DONE){
//         if(xhr.status === 200){
//           let data = xhr.response;
//           usersList.innerHTML = data;
//         }
//     }
//   }
//   xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//   xhr.send("searchTerm=" + searchTerm);
// }

// setInterval(() =>{
//   let xhr = new XMLHttpRequest();
//   xhr.open("GET", "php/users.php", true);
//   xhr.onload = ()=>{
//     if(xhr.readyState === XMLHttpRequest.DONE){
//         if(xhr.status === 200){
//           let data = xhr.response;
//           if(!searchBar.classList.contains("active")){
//             usersList.innerHTML = data;
//           }
//         }
//     }
//   }
//   xhr.send();
// }, 500);