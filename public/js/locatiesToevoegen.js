function checkRemove() {
    if ($('div.locatie_gegevens').length == 1) {
        $('#remove').hide();
    } else {
        $('#remove').show();
    }
};

$(document).ready(function() {
    checkRemove();
    $('#add').click(function() {
        $('div.locatie_gegevens:last').after($('div.locatie_gegevens:first').clone());
        checkRemove();
    });
    $('#remove').click(function() {
        $('div.locatie_gegevens').remove();
        checkRemove();
    });
});