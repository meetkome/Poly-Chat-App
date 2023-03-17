const form = document.querySelector(".typing-area"),
incoming_id = form.querySelector(".incoming_id").value,
inputField = form.querySelector(".input-field"),
sendBtn = form.querySelector("button"),
chatBox = document.querySelector(".chat-box");

const getUser =()=>{
    const currentUser = JSON.parse(localStorage.getItem("user"))
    if(!currentUser){
      return window.location.href = 'login.html'
    }
  }
  getUser()


form.onsubmit = (e)=>{
    e.preventDefault();
}

inputField.focus();
inputField.onkeyup = ()=>{
    if(inputField.value != ""){
        sendBtn.classList.add("active");
    }else{
        sendBtn.classList.remove("active");
    }
}

sendBtn.onclick = ()=>{
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/insert-chat.php", true);
    xhr.onload = ()=>{
      if(xhr.readyState === XMLHttpRequest.DONE){
          if(xhr.status === 200){
              inputField.value = "";
              scrollToBottom();
          }
      }
    }
    let formData = new FormData(form);
    xhr.send(formData);
}
chatBox.onmouseenter = ()=>{
    chatBox.classList.add("active");
}

chatBox.onmouseleave = ()=>{
    chatBox.classList.remove("active");
}

setInterval(() =>{
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/get-chat.php", true);
    xhr.onload = ()=>{
      if(xhr.readyState === XMLHttpRequest.DONE){
          if(xhr.status === 200){
            let data = xhr.response;
            chatBox.innerHTML = data;
            if(!chatBox.classList.contains("active")){
                scrollToBottom();
              }
          }
      }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("incoming_id="+incoming_id);
}, 500);

function scrollToBottom(){
    chatBox.scrollTop = chatBox.scrollHeight;
  }
 

const url = window.location.href.split("=")
const id = url[1]
  fetch(`/api/v1/users/${id}`)
  .then(response => response.json())
  .then(result => {
    const user = result.data.user
  console.log(result.data.user)
  let header = document.querySelector("#header")
    header.innerHTML = `
    <header>
    <a href="#" class="back-icon"><i class="fas fa-arrow-left"></i></a>
      <img src=${user.photo} alt="#">
      <div class="detail">
        <span>${user.firstName} ${user.lastName}</span>
        <p>${user.statuss}</p>
      </div>
    </header>
    <div class="status-dot"><i class="fas fa-circle"></i></div>
    `
})
  .catch(error => console.log('error', error));