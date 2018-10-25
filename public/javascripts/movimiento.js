var movimiento = "stop";

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
            movimiento = "left";
            break;
        case 38: // up
            movimiento = "forward";
            break;
        case 39: // right
            movimiento = "right";
            break;
        case 40: // down
            movimiento = "backward";
            break;
        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
    console.log(movimiento);
    $.post('/movimiento/'+movimiento, function (data) {
        console.log(data);
    });
});

$(document).keyup(function(e) {
    switch(e.which) {
        case 37: // left
            movimiento = "stop";
            break;
        case 38: // up
            movimiento = "stop";
            break;
        case 39: // right
            movimiento = "stop";
            break;
        case 40: // down
            movimiento = "stop";
            break;
        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
    $.post('/movimiento/'+movimiento, function (data) {
        console.log(data);
    });
});