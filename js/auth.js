(() => {
    fetch('http://127.0.0.1:3333/auth', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("authToken")
        }
    })
        .then((response) => {
            if (response.status !== 200) {
                window.location.replace("http://localhost:3000/login");
            } else {
                document.getElementById('cover').style.display = "none";
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.replace("http://localhost:3000/login");
        });
})();