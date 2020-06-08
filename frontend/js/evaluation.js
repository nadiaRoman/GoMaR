let testsData = [];

function evaluationBlock(data) {
    let eb =
        `<div class="container">
            <div class="evaluation">
                <div class="evaluation-dificulty">`;
    eb += starsDificulty(data);
    eb += `</div>
            <div class="evaluation-details">
                <div class="evaluation-title">
                    ${data.title}
                </div>
                <div class="evaluation-dificulty2">`
    eb += starsDificulty(data);
    eb += `</div>
            <div class="evaluation-description">
                ${data.description}
            </div>
            <div class="evaluation-results-content">
                <div class="tags">`;
    data.tags.forEach(t => {
        eb += `<div class="evaluation-tag">${t.name}</div>`;
    });
    eb += `</div>
            <div class="evaluation-score">
                <div class="evaluation-points">${data.score}</div>
                <button class="primary-btn" onclick="startTest('${data._id}')">Start</button>
            </div>
        </div>
        </div>
        </div>
        </div>`;
    return eb;
}

function starsDificulty(data) {
    let starsHtml = '';
    for (let i = 0; i < 5; ++i) {
        if (i < data.dificulty) {
            starsHtml += `<i class="star star-color fa fa-star"></i>`;
        } else {
            starsHtml += `<i class="star fa fa-star"></i>`;
        }
    }
    return starsHtml;
}

(() => {
    fetch('http://127.0.0.1:3333/evaluations?selection=self', {
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
                        data.forEach(d => {
                            let eb = evaluationBlock(d);
                            container.innerHTML = eb + container.innerHTML;
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

function prepareTest(data) {
    let testHtml = `<div class="container">
    <div class="evaluation-info2">
      <div class="title-wrapper2">
        <div class="evaluation-title2">${data.title}</div>
        <div class="evaluation-rate">`;
    testHtml += starsDificulty(data);
    testHtml += `</div>
                </div>
                <div class="evaluation-description">${data.description}</div>
            </div>`;
    data.questions.forEach((q, index) => {
        testHtml += `<div class="field">
        <div class="label">
          Q${index + 1}: ${q.question}
        </div>`;
        if (q.selectorType.type == 'radiobutton') {
            testHtml += `<div class="radiobutton-list">`;
            q.answers.forEach(a => {
                testHtml += `<label class="radiobutton-container">${a}
                                <input type="radio" name="${q._id}" value="${a}">
                                <span class="radiobutton-checkmark"></span>
                            </label>`;
            });
            testHtml += `</div>`;
        } else if (q.selectorType.type == 'checkbox') {
            testHtml += `<div class="checkbox-list">`
            q.answers.forEach(a => {
                testHtml +=
                    `<label class="checkbox-container">${a}
                    <input class="selection" type="checkbox" value="${a}" name="${q._id}">
                    <span class="checkbox-checkmark"></span>
                </label>`
            });
            testHtml += `</div>`
        }
        testHtml += `</div>`;
    });
    testHtml += `<div class="btn-field">
    <button id="submit-test" onclick="evaluateTest('${data._id}');" class="primary-btn">Submit</button>
  </div></div><div class="btn-field">
  <button onclick="backButton();" class="third-btn">Back</button>
</div>`;
    return testHtml;
}

function registerScore(score, evaluationId) {

    const data = { evaluationId: evaluationId, score: score };

    fetch('http://127.0.0.1:3333/results', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("authToken")
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            response.json().then(function (data) {
                if (response.status != 200) {
                    displayToastr('fail', data.response);
                }
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.replace("http://localhost:3000/login");
        });
}

function evaluateTest(evaluationId) {
    document.getElementById("submit-test").setAttribute('disabled', '');
    let correctAnswers = 0;
    let correctAnswersTotal = 0;
    const test = testsData.find(t => t._id == evaluationId);
    test.questions.forEach(q => {
        correctAnswersTotal += q.correctAnswers.length;
        document.querySelectorAll(`input[name='${q._id}']`).forEach(qs => {
            if (q.correctAnswers.indexOf(qs.value) > -1) {
                if (qs.checked) {
                    ++correctAnswers;
                    qs.nextElementSibling.classList.add("valid");
                }
            } else {
                if (qs.checked) {
                    --correctAnswers;
                    qs.nextElementSibling.classList.add("wrong");
                }
            }
        });
    });
    correctAnswers = correctAnswers > 0 ? correctAnswers : 0;
    const score = Math.floor((correctAnswers * 100) / correctAnswersTotal);
    if (score <= 33) {
        displayToastr('fail', `Your score is ${score}`);
    } else if (score <= 66) {
        displayToastr('orange', `Your score is ${score}`);
    } else {
        displayToastr('success', `Your score is ${score}`);
    }
    if (score > test.score) {
        registerScore(score, evaluationId);
    }
}

function startTest(evaluationId) {
    const firstContainer = document.getElementById("container");
    const secondContainer = document.getElementById("container2");
    secondContainer.innerHTML = prepareTest(testsData.find(t => t._id == evaluationId));
    firstContainer.style.display = "none";
    secondContainer.style.display = "block";
}

function backButton() {
    window.location.replace("http://localhost:3000/evaluation");
}