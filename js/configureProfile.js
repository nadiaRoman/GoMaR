function fieldBlock(data) {
    let fb =
        `<div class="field">
            <div class="label">
                ${data.name}
            </div>`;
    if (data.selectorType.type === "dropdown") {
        fb +=
            `<div class="dropdown">
                <div class="custom-select">
                    <select class="selection">
                        <option value="0">Select ${data.name}:</option>`;
        data.tags.forEach(t => {
            fb += `<option value="${t._id}" ${t.checked ? 'selected="selected"' : ''}>${t.name}</option>`;
        });
        fb +=
            `</select>
                </div>
            </div>`;
    } else if (data.selectorType.type === "checkbox") {
        fb += `<div class="checkbox-list">`;
        data.tags.forEach(t => {
            fb +=
                `<label class="checkbox-container">${t.name}
                <input class="selection" type="checkbox" ${t.checked ? 'checked="checked"' : ''} value="${t._id}" name="${data._id}">
                <span class="checkbox-checkmark"></span>
            </label>`;
        });
        fb += `</div>`;
    }
    fb += `</div>`;
    return fb;
}

function saveProfile() {
    const allInputs = document.getElementsByClassName("selection");
    const selectedTags = [];
    [].forEach.call(allInputs, function (i) {
        if (i.tagName == "SELECT") {
            if (i.value != 0) {
                selectedTags.push(i.value);
            }
        } else if (i.tagName == "INPUT") {
            if (i.checked) {
                selectedTags.push(i.value);
            }
        }
    });
    const data = { tags: selectedTags };
    fetch('http://127.0.0.1:3333/configureProfile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("authToken")
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

(() => {
    fetch('http://127.0.0.1:3333/configureProfile', {
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
                    const container = document.getElementById("container");
                    data.forEach(d => {
                        let fb = fieldBlock(d);
                        container.innerHTML = fb + container.innerHTML;
                    });
                    createDropdowns();
                });

            }
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.replace("http://localhost:3000/login");
        });
})();
