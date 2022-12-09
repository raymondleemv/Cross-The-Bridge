function boatSpace() {
    let boatPassengers = $("#boat-container").find(".passenger-icon");
    for (let i = 0; i < boatPassengers.length; ++i) {
        if ($(boatPassengers[i]).css("display") === "none") {
            return $(boatPassengers[i]);
        }
    }
    return null;
}

function hidden(visibility) {
    return function(index, element) {
        return visibility ? $(element).css("display") === "none" : $(element).css("display") !== "none";
    }
}

function showPopup(id) {
    $(".popup").not("#" + id).hide();
    $("#" + id).toggle();
    if ($(".popup").filter(hidden(true)).length === $(".popup").length) {
        $("#game-content").removeClass("unclickable");
    } else {
        $("#game-content").addClass("unclickable");
    }
}

function reset() {
    $("#game-content").removeClass("unclickable");
    $("#boat-container").find(".passenger-icon").hide();
    $(".passengers-container.crossed-bridge").find(".passenger-icon").hide();
    $(".passengers-container").not(".crossed-bridge").find(".passenger-icon").show();
    $("#boat-container").removeClass("cross-bridge");
    $("#error-message").hide();
    $(".popup").hide();
    $("#game-buttons").removeClass("unclickable");
}

function findPassengers(container, person) {
    return container.find("[data-person=" + person + "]");
}

function waitForClick(element, ms) {
    element.click();
    return new Promise (resolve => setTimeout(resolve, ms));
}

$(document).ready(function() {
    // Save variables for easy reference
    let onboardPassengers = $("#boat-container").find(".passenger-icon");
    let crossedBridgePassengers = $(".passengers-container.crossed-bridge").find(".passenger-icon");
    let passengers = $(".passengers-container").not(".crossed-bridge").find(".passenger-icon");

    // 1. Set initial display conditions
    reset();

    // 2. On click event for passengers
    $(".passenger-icon").click(function() {
        // 2.1 If passenger is on board, alight that passenger on the side where the boat is at.
        if ($(this).parent().is("#boat-container")) {
            if ($("#boat-container").hasClass("cross-bridge")) {
                $(crossedBridgePassengers.parent().find("[data-person=" + $(this).attr("data-person") + "]").filter(hidden(true))[0]).show(); 
            }
            else {
                $(passengers.parent().find("[data-person=" + $(this).attr("data-person") + "]").filter(hidden(true))[0]).show();
            }
            $(this).attr("data-person", "");
            $(this).hide();
            return;
        }
        // 2.2 Check boat position, and guard against passengers onboarding from the wrong side
        if ($("#boat-container").hasClass("cross-bridge")) {
            // Boat on the right, passengers on the left have no effect
            if (!$(this).parent().hasClass("crossed-bridge")) {
                return;
            }
        } else {
            // Boat on the left, passengers who crosed bridge have no effect
            if ($(this).parent().hasClass("crossed-bridge")) {
                return;
            }
        }
        //2.3 Check whether boat is full, and control the onboarding of passengers
        let boatPassenger = boatSpace();
        if (boatPassenger !== null) {
            // Boat is not full, onboard the passenger
            $(this).hide();
            boatPassenger.attr("data-person", $(this).attr("data-person"));
            boatPassenger.attr("src", $(this).attr("src"));
            boatPassenger.show();
        }
    });

    // 3. On click event for moving the boat
    $("#move-boat-btn").click(function() {
        // 3.1 Check if no one is on board, dont move the boat
        if (onboardPassengers.filter(hidden(true)).length > 1) {
            $("#error-message").text("Oops, it seems that no one is on the boat to drive!").show();
            return;
        }

        let numPolicemanLeft = passengers.parent().find("[data-person=policeman]").filter(hidden(false)).length;
        let numCriminalLeft = passengers.parent().find("[data-person=criminal]").filter(hidden(false)).length;
        let numPolicemanRight = crossedBridgePassengers.parent().find("[data-person=policeman]").filter(hidden(false)).length;
        let numCriminalRight = crossedBridgePassengers.parent().find("[data-person=criminal]").filter(hidden(false)).length;

        if (!$("#boat-container").hasClass("cross-bridge")) {
            numPolicemanRight += onboardPassengers.parent().find("[data-person=policeman]").length;
            numCriminalRight += onboardPassengers.parent().find("[data-person=criminal]").length;
        } else {
            numPolicemanLeft += onboardPassengers.parent().find("[data-person=policeman]").length;
            numCriminalLeft += onboardPassengers.parent().find("[data-person=criminal]").length;
        }
        if (numPolicemanLeft !== 0 && numCriminalLeft > numPolicemanLeft) {
            $("#error-message").text("Oops, there are more criminals than policemen on the left!").show();
            return;
        }
        if (numPolicemanRight !== 0 && numCriminalRight > numPolicemanRight) {
            $("#error-message").text("Oops, there are more criminals than policemen on the right!").show();
            return;
        }

        $("#error-message").hide();
        $("#boat-container").toggleClass("cross-bridge");

        if (passengers.filter(hidden(true)).length === passengers.length) {
            showPopup("won");
            $("#game-buttons").addClass("unclickable"); 
        }
    });

    $("#instructions-btn").click(function() {
        showPopup($(this).attr("data-for"));
        $("#game-buttons").children(":not(#instructions-btn)").toggleClass("unclickable");
    });

    $("#play-again-btn").click(function() {
        reset();
    });

    $(".close").click(function() {
        showPopup($(this).parent().id);
        $("#game-buttons").children(":not(#instructions-btn)").toggleClass("unclickable");
    });

    $("#solution-btn").click(async function() {
        // 1. Reset game
        $("#boat-container").hasClass("cross-bridge") ? await waitForClick($("#play-again-btn"), 2000) : reset();

        // 2. Disable view solution btn
        $("#game-buttons").addClass("unclickable");
    
        // 3. 2 criminals cross bridge
        $(passengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]).click();
        await waitForClick($(passengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 4. [crossed bridge] 1 criminal alight and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 5. 1 criminal onboard and cross bridge
        await waitForClick($(passengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 6. [crossed bridge] 1 criminal alight and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 7. 1 criminal alight, 2 policemen onboard and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($(passengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($(passengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 8. [crossed bridge] 1 policeman alight, 1 criminal onboard and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($(crossedBridgePassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 9. 1 criminal alight, 1 policeman onboard and cross bridge      
        await waitForClick($(onboardPassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($(passengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 10. [crossed bridge] 2 policemen alight, 1 criminal onboard and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($(onboardPassengers.parent().find("[data-person=policeman]").filter(hidden(false))[0]), 500);
        await waitForClick($(crossedBridgePassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 11. 1 criminal onboard and cross bridge
        await waitForClick($(passengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 12. [crossed bridge] 1 criminal alight and cross bridge
        await waitForClick($(onboardPassengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        await waitForClick($("#move-boat-btn"), 2000);

        // 13. 1 criminal onboard and cross bridge
        await waitForClick($(passengers.parent().find("[data-person=criminal]").filter(hidden(false))[0]), 500);
        $("#move-boat-btn").click();
    });
});