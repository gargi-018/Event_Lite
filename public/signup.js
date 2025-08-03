console.log("JS is working!");

document.getElementById("signupForm").addEventListener("submit",(event) =>{
    event.preventDefault();

    fetch('/signup', {
        method: 'POST',
        headers: {'Content-type' : 'application/json',},
        body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        }),
    })
    .then((response) => {
        if(!response.ok){
            throw new Error('An error occurred.');
        }
        return response.json();
    })
    .then((data) => {
        if(data.success){
            alert(`${data.message}`);
            window.location.href = `index.html`;
        }
        else{
            alert(`${data.message}`);
        }
    })
    .catch((e) => {
        console.log(e);
        alert(`An error occurred: ${e}`);
    })
})