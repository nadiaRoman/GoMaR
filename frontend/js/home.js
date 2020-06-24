(() => {
    fetch('http://127.0.0.1:3333/goodManners?selection=random', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("authToken")
        }
    })
        .then((resp) => {
            // Check if user is logged in
            if (resp.status !== 200) {
                window.location.replace("http://localhost:3000/login");
            } else {
                response.json().then(function (data) {
                    // Display random manner
                    document.getElementById("manner").innerText = data[0].manner;
                    document.getElementById("manner-container").style.display = "block";
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.replace("http://localhost:3000/login");
        });
})();