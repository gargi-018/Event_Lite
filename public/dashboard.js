console.log('dashboard: JS is working');

const token = localStorage.getItem("token");
// const params = new URLSearchParams(window.location.search);
// const user = params.get('user');
// const role = params.get('role');
if(!token){
    alert(`Unauthorised access. Redirecting to login.`)
    window.location.href = `index.js`
}else{
    const decoded = jwt_decode(token);
    const user = decoded.username;
    const role = decoded.role;

    const profile = document.getElementById('profile');
    profile.innerHTML += `<pre>Username: ${user}
    Role: ${role}  <pre><hr>`;

    const adminDash = document.querySelectorAll('.adminDash');
    if(role === "attendee"){
        adminDash.forEach(element => element.hidden = true);
    }

    document.addEventListener('DOMContentLoaded', async() => {
        const eventOption = document.getElementById('eventOption');

        fetch('/existing_events')
        .then(response => response.json())
        .then((eventList) => {
            eventList.forEach(event => { 
               eventOption.innerHTML += `<option value="${event.eventName}">${event.eventName}</option>`;
           });
        })
        .catch((e) => alert(`an error occured while loading prev events: ${e}`));
    })

    document.getElementById('eventForm').addEventListener('submit', (event) =>{
       event.preventDefault();

        fetch('/eventAdd', {
           method: 'POST',
           headers: {
            'Content-type' : 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem("token")}`
            },
           body: JSON.stringify({
               eventName: document.getElementById('eventName').value
          }),
       })
        .then((response) =>{
            if(!response.ok){
                throw new Error('an error occured.');
            }
            return response.json();
        })
        .then((data) => {
            if(data.success){
                alert(`${data.message}`);
                window.location.reload();
                document.getElementById('eventForm').reset();
            }
            else{
                alert(`${data.message}`);
                document.getElementById('eventForm').reset();
            }
        })
        .catch((e) => {
            console.log(e);
            alert(`An error occurred: ${e}`);
        })
    })

    document.getElementById("eventCard").addEventListener("submit", (event) => {
        event.preventDefault();
        const chat_room = document.getElementById('chat_room');
        window.location.href = `room.html?room=${chat_room.value}`;
        document.getElementById('eventCard').reset();
    })

    document.getElementById('logout').addEventListener('click', ()=>{
        window.location.href = `index.html`;
    })
}


