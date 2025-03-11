$(document).ready(function() {
    localStorage.clear();
    let screenshotCount = 0;
    let offcanvasElement = new bootstrap.Offcanvas(document.getElementById("offcanvasProperties"));
    let cardCount = 0;
    
    $("#capture").click(function () {
        cardCount++
        let cardId = "screenShot_" + cardCount;
        let titleCardId = "titleCard" + cardCount;
        let newCard = `
            <div class="row-auto">
                <div class="col">
                    <div class="card mt-1 clickable-card " id="${cardId}" style="cursor: pointer;">
                        <div class="card-header" id="titleCardId">
                           screenShot_${cardCount}
                        </div>
                    </div>
                </div>
            </div>
        `;


        $("#processFlowContainer").append(newCard);
    });

    $("#recordBtn").click(function () {
        $.get("/capture_screenshot", function (response) {
            if (response.filename) {
                setTimeout(function () {
                    screenshotCount++; 
                    let selectedImageName = $("#imgName").val(); 
                    $("#screenshot-container").empty();

                    let screenshotId = "Image-" + screenshotCount;
                    
                    let newScreenshot = $(`
                        <div class="screenshot-wrapper" id="wrapper-${screenshotId}">
                            <img src="/get_screenshot/${response.filename}" class="screenshot" id="${screenshotId}">
                        </div>
                    `);
                    $("#screenshot-container").html(newScreenshot);
                    //$("#screenshot-container").append(newScreenshot);

                    localStorage.setItem(selectedImageName + "Img", screenshotId);
                    localStorage.setItem(selectedImageName + "Src", response.filename);
                    $("#actionBtn").removeAttr("disabled");

                    let img = $("#" + screenshotId);
        
                    // Wait for the image to load before setting size
                    img.on("load", function () {
                        img.css({
                            width: img[0].naturalWidth + "px",
                            height: img[0].naturalHeight + "px"
                        });
        
                        // Wrap the image in a div so both draggable and resizable work together
                        let wrapper = $("#wrapper-" + screenshotId);
                        wrapper.css({
                            position: "absolute",
                            display: "inline-block"
                        });
        
                        wrapper.draggable({
                            handle: "img",
                            containment: "#screenshot-container"
                        }).resizable({
                            alsoResize: img, // Resize image along with wrapper
                            handles: "n, e, s, w, ne, se, sw, nw",
                        });
                    });
                   
                    
                }, 5000); 
            }
        });
    });


    $("#processFlowContainer").on("click", ".clickable-card", function () {
        let clickedCardId = $(this).attr("id");
        let actBtn = $("#actionBtn");
        $("#imgName").val(clickedCardId);
        $("#screenshot-container").html("");
        
        if (actBtn.val() == null){
            actBtn.attr("disabled", "disabled");
        }
        
        actBtn.val(localStorage.getItem(clickedCardId + "Act"));
        let screenshotId2 = localStorage.getItem(clickedCardId + "Img");
        let screenshotSrc = localStorage.getItem(clickedCardId + "Src");

        
        
        if (screenshotSrc != null) {
            let newScreenshot = $(`
                <div class="screenshot-wrapper" id="wrapper-${screenshotId2}">
                    <img src="/get_screenshot/${screenshotSrc}" class="screenshot" id="${screenshotId2}">
                </div>
            `);
            $("#screenshot-container").html(newScreenshot);
        }
       
        $(this).attr({
            "data-bs-toggle": "offcanvas",
            "data-bs-target": "#offcanvasProperties",
            "aria-controls": "offcanvasProperties"
        });

        if ($("#offcanvasProperties").hasClass("show")) {
            offcanvasElement.show(); 
           
        } else {
            offcanvasElement.show(); 
        }

    });

    
    $("#actionBtn").change(function () {
        let selectedImageName = $("#imgName").val(); 
        let selectedAction = $(this).val(); 
       
        let newCard = `
           <div class="card-header" id="titleCardId">
                ${selectedImageName} >> ${selectedAction} 
            </div>
        `;
        localStorage.setItem(selectedImageName + "Act", selectedAction);
        $(`#${selectedImageName}`).html(`${newCard}`);

    }); 

});

