function registerUser() {
    const username = document.getElementById("username");
    const publicname = document.getElementById("publicname");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    validateAll();

    if (publicname.classList.contains("invalid") ||
        username.classList.contains("invalid") ||
        password.classList.contains("invalid") ||
        confirmPassword.classList.contains("invalid")) {
        return;
    }

    const data = { publicname: publicname.value, username: username.value, password: password.value };

    fetch('http://127.0.0.1:3333/createAccount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            response.json().then(function (data) {
                if (response.status == 200) {
                    displayToastr('success', data.response);
                } else {
                    displayToastr('fail', data.response);
                }
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

var body = document.getElementsByTagName("body")[0];

body.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        registerUser();
    }
});

function validateAll() {
    validatePublicnameField();
    validateUsernameField();
    validatePasswordField();
    validateConfirmPasswordField();
}

function validatePublicnameField() {
    const publicname = document.getElementById("publicname");

    if (!publicname.value) {
        publicname.classList.add("invalid");
    } else {
        publicname.classList.remove("invalid");
    }
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

function validateConfirmPasswordField() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    if (!confirmPassword.value || confirmPassword.value != password.value) {
        confirmPassword.classList.add("invalid");
    } else {
        confirmPassword.classList.remove("invalid");
    }
}
document.getElementById("publicname").addEventListener("keyup", function (event) {
    validatePublicnameField();
});
document.getElementById("username").addEventListener("keyup", function (event) {
    validateUsernameField();
});
document.getElementById("password").addEventListener("keyup", function (event) {
    validatePasswordField();
});
document.getElementById("confirm-password").addEventListener("keyup", function (event) {
    validateConfirmPasswordField();
});