document.addEventListener("DOMContentLoaded", function () {

    let elements = null;
    let filteredElementSet = null;
    fetch('./elements.json')
      .then(
        function(response) {
          if (response.status !== 200) {
            console.log('There was a problem Fetching elements.json. Status Code: ' +
              response.status);
            return;
          }
    
          // Examine the text in the response
          response.json().then(function(data) {
              elements = data;
              renderElements(elements, "trigger");
            console.log(data);
          });
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });

    var rightcard = false;
    var touchBlock;
    var dragBlock;

    function renderElements(elements, type){
        document.getElementById("blocklist").innerHTML = "";

        let elementCount = 0;
        filteredElementSet = elements.Elements.filter(element => element.type == type);
        filteredElementSet.forEach(element => {
            document.getElementById("blocklist").innerHTML += 
            '<div class="blockelem create-flowy noselect">\
                <input type="hidden" name="blockelemtype" class="blockelemtype" value="'+elementCount+'">\
                <input type="hidden" name="blockClass" class="blockelemtype" value="'+element.class+'">\
                <div class="grabme">\
                    <img src="assets/grabme.svg">\
                </div>\
                <div class="blockin">\
                    <div class="blockico">\
                        <span></span>\
                        <img src="'+ element.iconInactive + '">\
                    </div>\
                    <div class="blocktext">\
                        <p class="blocktitle">'+ element.name + '</p>\
                        <p class="blockdesc">'+ element.info + '</p>\
                    </div>\
                </div>\
            </div>';

            elementCount++;
        });
    }

    function renderProperties(source){
        document.getElementById("proplist").innerHTML = "";
        sourceType = source.getElementsByClassName("blockelemtype")[1].value;
        
        let formText = "";
        filteredElementSet = elements.Elements.filter(element => element.class == sourceType);
        filteredElementSet[0].properties.forEach(properties => {
            formText +=`<p class="inputlabel">${properties.name}</p>`;
            switch(properties.type) {
                case "string":
                    formText += `<div class="textinput">${properties.default}</div>`;
                    break;
                case "datetime":
                    // code block
                    break;
                case "choice":
                    formText += `<div class="dropme">${properties.default}<img src="assets/dropdown.svg"></div>`
                    break;
                case "checkbox":
                    formText += '<div class="checkus"><img src="assets/checkoff.svg"><p>Give priority to this block</p></div>';
                    break; 
                default:
                // do Nothing
            }
        });
        formText += '<div class="submit">Save</div>';
        document.getElementById("proplist").innerHTML += formText;
        document.getElementById("properties").classList.add("expanded");
        document.getElementById("propwrap").classList.add("itson");
        rightcard = true;
    }

    function findAncestor (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    flowy(document.getElementById("canvas"), drag, release, snapping);
    function addEventListenerMulti(type, listener, capture, selector) {
        var nodes = document.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].addEventListener(type, listener, capture);
        }
    }
    function snapping(drag, first) {
        var grab = drag.querySelector(".grabme");
        grab.parentNode.removeChild(grab);
        var blockin = drag.querySelector(".blockin");
        blockin.parentNode.removeChild(blockin);

        index = parseInt(drag.querySelector(".blockelemtype").value);

        drag.innerHTML += "<div class='blockyleft'> " +
                            "<img src='" + filteredElementSet[index].iconActive + "'> \
                                    <p class='blockyname'>" + filteredElementSet[index].name +"</p> \
                                </div> \
                                <div class='blockyright'> \
                                    <img src='assets/more.svg'> \
                                </div> \
                                <div class='blockydiv'></div> \
                                <div class='blockyinfo'>" +
                                    filteredElementSet  [index].name +
                                "</div>";
        return true;
    }
    function drag(block) {
        block.classList.add("blockdisabled");
        dragBlock = block;
    }
    function release() {
        if (dragBlock) {
            dragBlock.classList.remove("blockdisabled");
            renderProperties(dragBlock);
        }
    }
    var disabledClick = function () {
        document.querySelector(".navactive").classList.add("navdisabled");
        document.querySelector(".navactive").classList.remove("navactive");
        this.classList.add("navactive");
        this.classList.remove("navdisabled");

        renderElements(elements, this.getAttribute("id"))
    }

    addEventListenerMulti("click", disabledClick, false, ".side");
    document.getElementById("close").addEventListener("click", function () {
        if (rightcard) {
            rightcard = false;
            document.getElementById("properties").classList.remove("expanded");
            setTimeout(function () {
                document.getElementById("propwrap").classList.remove("itson");
            }, 300);
            touchBlock.classList.remove("selectedblock");
        }
    });

    document.getElementById("removeblock").addEventListener("click", function () {
        flowy.deleteBlocks();
    });
    var aclick = false;
    var noinfo = false;
    var beginTouch = function (event) {
        aclick = true;
        noinfo = false;
        if (event.target.closest(".create-flowy")) {
            noinfo = true;
        }
    }
    var checkTouch = function (event) {
        aclick = false;
    }
    var doneTouch = function (event) {
        if (event.type === "mouseup" && aclick && !noinfo) {
            if (!rightcard && event.target.closest(".block") && !event.target.closest(".block").classList.contains("dragging")) {
                touchBlock = event.target.closest(".block");

                var source = event.target || event.srcElement;
                renderProperties(source);
                touchBlock.classList.add("selectedblock");
            }
        }
    }
    addEventListener("mousedown", beginTouch, false);
    addEventListener("mousemove", checkTouch, false);
    addEventListener("mouseup", doneTouch, false);
    addEventListenerMulti("touchstart", beginTouch, false, ".block");
});
