// 1. All passengers share same onclick event;
    // - 1.1 Check boat position
    // - 1.2 Check clicked passenger position
    // - 1.3 Toggle on-board class to passenger

// 2. Click boat:
    // - 2.1 Get elemetns with on-board class, toggle class and hide
    // - 2.2 Show respective elements on the other side of bridge
    // - 2.3 Check move against constraint
    // - 2.4 Check game win logic

$(document).ready(function() {
    $("#move-boat-btn").click(function() {
        $("#boat-container").toggleClass("cross-bridge");
    });
});