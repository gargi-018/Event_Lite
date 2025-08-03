const params = new URLSearchParams(window.location.search);
const room = params.get('room');
// const uName = params.get('name');
const token = localStorage.getItem("token");
const decoded = jwt_decode(token);
const uName = decoded.username;

const roomName = document.getElementById('roomName');
roomName.innerHTML += `${room}`;

// chat.innerHTML += `<p class="middle">${uName} joined the room</p>`

socket.emit('joinRoom', {name: uName, room: room} );

socket.on('userJoin', (msg)=>{
    console.log(`${msg}`);
    const chat = document.getElementById("chat_box");
    chat.innerHTML += `<p class="middle">${msg}</p>`;
    // const active_users = document.getElementById("active_users");
    // active_users.innerHTML += `<p>${data.name}</p>`;
});

socket.emit('getMsg_h', (room));

socket.on('msg_history', (data) => {
    const chat = document.getElementById("chat_box");
    chat.innerHTML += `<p class="middle">[Message History]</p>`;

    for(let msg of data) {
        chat.innerHTML += `<p><b>${msg.sender}:</b> ${msg.content}</p>`
    }

    chat.innerHTML += `<hr>`;
    chat.innerHTML += `<p class="middle">[New Messages]</p>`;                   //ADD TIMESTAMPS ALSOOOOOO!!!!!
});

document.getElementById('chat_form').addEventListener("submit", (event) =>{
    event.preventDefault();
    const message = document.getElementById("message").value;
    if(message){
        // socket.emit('joinRoom', {uName, room} );
        socket.emit('User message', {name: uName, room: room, msg: message} );
        document.getElementById("chat_form").reset();       
    }
    else{
        alert('No message attached!')
    }
})

socket.on('newMessage', (data) =>{
    const chat = document.getElementById("chat_box");
    chat.innerHTML += `<p><b>${data.name}:</b> ${data.msg}</p>` ;
})

document.getElementById('cut_btn').addEventListener("click", (event) =>{
    event.preventDefault();
    socket.emit('leaveRoom', {name: uName, room: room} );
    window.location.href = `index.html`;
})

socket.on('userLeft', (msg)=>{
    console.log(`${msg}`);
    const chat = document.getElementById("chat_box");
    chat.innerHTML += `<p class="middle">${msg}</p>`;
});

console.log("Requesting user list...")
socket.emit('userList', {roomName: room});

socket.on('userList', (data) => {
    console.log("client working");
    const online = document.getElementById("active_users");
    online.innerHTML = "";
    for (let name of data) {
        online.innerHTML += `@${name}  `;
    }
});


