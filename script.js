document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();


    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    
    const userData = {
        name: name,
        email: email,
        password: password
    };

    axios.post('http://localhost:3000/user/signup', userData)
        .then(response => {
          console.log( response.status === 200);
             
        })
        .catch(error => {
            console.error('Error:', error);
            
        });
});

document.getElementById('login-btn').addEventListener('click', function() {
    
    alert('Redirecting to login page...');
});
