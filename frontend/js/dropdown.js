function createDropdowns() {
    var i, j;
    // Look for elements with the class "custom-select"
    var d = document.getElementsByClassName("custom-select");
    for (i = 0; i < d.length; i++) {
      var selElement = d[i].getElementsByTagName("select")[0];
      // For each element, create a new DIV that will act as the selected item
      var x = document.createElement("DIV");
      x.setAttribute("class", "select-selected");
      x.innerHTML = selElement.options[selElement.selectedIndex].innerHTML;
      d[i].appendChild(x);
      // For each element, create a new DIV that will contain the option list
      var y = document.createElement("DIV");
      y.setAttribute("class", "select-items select-hide");
      for (j = 1; j < selElement.length; j++) {
        // For each option in the original select element, create a new DIV that will act as an option item
        var z = document.createElement("DIV");
        z.innerHTML = selElement.options[j].innerHTML;
        z.addEventListener("click", function(e) {
          // When an item is clicked, update the original select box, and the selected item
          var i, j;
          var s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          var h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              var x = this.parentNode.getElementsByClassName("same-as-selected");
              for (j = 0; j < x.length; j++) {
                x[j].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
            h.click();
          });
          y.appendChild(z);
        }
        d[i].appendChild(y);
        x.addEventListener("click", function(e) {
          // When the select box is clicked, close any other select boxes, and open/close the current select box:
          e.stopPropagation();
          closeAllSelect(this);
          this.nextSibling.classList.toggle("select-hide");
          this.classList.toggle("select-arrow-active");
        });
      }
    }
      
    function closeAllSelect(element) {
      // Close all select boxes in the document, except the current select box
      var i, arrNo = [];
      var a = document.getElementsByClassName("select-items");
      var b = document.getElementsByClassName("select-selected");
      for (i = 0; i < b.length; i++) {
        if (element == b[i]) {
          arrNo.push(i)
        } else {
          b[i].classList.remove("select-arrow-active");
        }
      }
      for (i = 0; i < a.length; i++) {
        if (arrNo.indexOf(i)) {
          a[i].classList.add("select-hide");
        }
      }
    }
    // If the user clicks anywhere outside the select box, then close all select boxes
    document.addEventListener("click", closeAllSelect);