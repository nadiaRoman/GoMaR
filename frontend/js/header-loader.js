const xhr = new XMLHttpRequest();

xhr.onload = function () {
    if (this.status === 200) {
        document.getElementById('header').innerHTML = xhr.responseText;
        var activeNavbarButton = document.getElementById(window.location.pathname.substr(1));
        if (activeNavbarButton) {
            activeNavbarButton.classList.add("active");
        }
    }
}

xhr.open('get', '/html-blocks/header.html');
xhr.send();

function toggleMenu() {
    var menu = document.getElementById("nav-menu");
    var close = document.getElementById("close");
    var bars = document.getElementById("bars");
    if (bars.style.display === "none") {
        menu.style.opacity = "0";
        menu.style.top = "-300px";
        bars.style.display = "block";
        close.style.display = "none";
    } else {
        menu.style.opacity = "1";
        menu.style.top = "50%";
        bars.style.display = "none";
        close.style.display = "block";
    }
}

function logoutUser() {
    localStorage.removeItem("authToken");
    window.location.replace("http://localhost:3000/login");
}