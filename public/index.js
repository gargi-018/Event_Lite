// import { jwtDecode } from "jwt-decode";
// import jwt_decode from jwtDecode;

// Since i'm using vanilla js these import statements ain't working!? using cdn version now..check html bruh

console.log('JS is working');

document.getElementById("myForm").addEventListener("submit", (event) => {
    event.preventDefault();
    // const message = document.getElementById("message").value;
    // const userName = document.getElementById("userName").value;
    // const passWord = document.getElementById("passWord").value;

    fetch('/index', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', },
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        }),
    })
    .then((response) => {
        if (!response.ok){
            throw new Error('Network response was not Ok');
        }
        return response.json();
    })
    .then((data) =>{
        if (data.success) {
        localStorage.setItem("token", data.token);
        const token = localStorage.getItem("token");
        const decoded = jwt_decode(token);

        alert(`Welcome, ${decoded.username}!`);
        window.location.href = `dashboard.html`;
        } else {
        alert(data.message);
        document.getElementById('myForm').reset();
        }
    })
    .catch((error) => {
        console.log(error);
        alert(`An error occured: ${error}`);
    })
    });
    // if(userName && chat_room ){
    //     // console.log(`username: ${userName}, room: ${chat_room}`);
    //     window.location.href = `room.html?room=${chat_room}&name=${userName}`
    //     // socket.emit('joinRoom', {name: userName, room:chat_room} );
    //     // socket.emit('User message', {name: userName, room:chat_room} );
    //     document.getElementById("myForm").reset();
    //     // alert("message sent!");
    // }
    // else {
    //     alert("Please fill all the required data.")
    // };


// socket.on('userJoin', (msg)=>{
//     const chat = document.getElementById("chat_box");
//     chat.innerHTML += `<p class="middle">${msg}</p>`;
// });

// socket.on('newMessage', (data) =>{
//     const chat = document.getElementById("chat_box");
//     chat.innerHTML += `<p><b>${data.name}:</b> ${data.msg}</p>` ;
// })
