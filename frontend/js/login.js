function loginUser() {
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    validateAll();

    if (username.classList.contains("invalid") ||
        password.classList.contains("invalid")) {
        return;
    }

    const data = { username: username.value, password: password.value };

    fetch('http://127.0.0.1:3333/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            response.json().then(function (data) {
                if (response.status == 200) {
                    if (data.authToken) {
                        localStorage.setItem("authToken", data.authToken);
                        window.location.replace("http://localhost:3000/");
                    }
                } else {
                    displayToastr('fail', data.response);
                }
            });
        })
        .catch((error) => {
            displayToastr('fail', "Server is down, try again later");
            console.error('Error:', error);
        });
}

var body = document.getElementsByTagName("body")[0];

body.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        loginUser();
    }
});

function validateAll() {
    validateUsernameField();
    validatePasswordField();
}


function validateUsernameField() {
    const username = document.getElementById("username");

    if (!username.value) {
        username.classList.add("invalid");
    } else {
        username.classList.remove("invalid");
    }
}

function validatePasswordField() {
    const password = document.getElementById("password");

    if (!password.value) {
        password.classList.add("invalid");
    } else {
        password.classList.remove("invalid");
    }
}

document.getElementById("username").addEventListener("keyup", function (event) {
    validateUsernameField();
});
document.getElementById("password").addEventListener("keyup", function (event) {
    validatePasswordField();
});
