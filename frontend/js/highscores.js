(() => {
    fetch('http://127.0.0.1:3333/highscores', {
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
                response.json().then(function (data) {
                    if (response.status == 200) {
                        testsData = data;
                        const container = document.getElementById("container");
                        data.forEach((d, index) => {
                            container.innerHTML +=
                                `<div class="grid-row">
                                    <div class="grid-item ${isSpecial(d.isCurrentUser)}" title="${index + 1}">${index + 1}</div>
                                    <div class="grid-item ${isSpecial(d.isCurrentUser)}" title="${d.publicname}">${d.publicname}</div>
                                    <div class="grid-item ${isSpecial(d.isCurrentUser)}" title="${d.highscore}">${d.highscore}</div>
                                </div>`;
                        });
                    } else {
                        displayToastr('fail', data.response);
                    }
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.replace("http://localhost:3000/login");
        });
})();

function isSpecial(isSpecial) {
    return isSpecial ? 'grid-item-special' : '';
}