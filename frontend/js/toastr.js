const toastrXhr = new XMLHttpRequest();

toastrXhr.onload = function () {
    if (this.status === 200) {
        document.getElementById('toastr').innerHTML = toastrXhr.responseText;
    }
}

toastrXhr.open('get', '/html-blocks/toastr.html');
toastrXhr.send();

function closeToastr() {
    const toastr = document.getElementById('toastr-container');
    toastr.classList.remove("toastr-success");
    toastr.classList.remove("toastr-fail");
}

function displayToastr(type, text) {
    const toastr = document.getElementById('toastr-container');
    const toastrText = document.getElementById('toastr-text');
    toastrText.innerText = text;
    toastr.classList.add(`toastr-${type}`);
    setTimeout(function(){
        closeToastr();
    }, 3000);
}