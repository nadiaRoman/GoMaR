function recomandationBlock(data) {
    let rb =
        `<div class="container">
            <div class="recomandation">
                <div class="recomandation-top">
                    <p>${data.manner}</p>
                </div>
                <div class="recomandation-bottom">`;
    data.tags.forEach(t => {
            rb += `<span class="recomandation-tag">${t.name}</span>`;
    });
    rb +=
        `</div>
            </div>
        </div>`;
    return rb;
}

(() => {
    fetch('http://127.0.0.1:3333/goodManners?selection=self', {
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
                        const container = document.getElementById("container");
                        data.forEach(d => {
                            let fb = recomandationBlock(d);
                            container.innerHTML = fb + container.innerHTML;
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
