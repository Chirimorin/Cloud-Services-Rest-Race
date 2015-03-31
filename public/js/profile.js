/**
 * Created by Thomas on 31-3-2015.
 */

function updateNickname() {
    var nickname = $("input#nickname").val();
    $.ajax({
        url: "/users/nickname?apikey=" + apiKey,
        method: "PUT",
        data: { nickname: nickname }

    }).done(function() {
        location.reload();
    });
}

$(document).ready(function() {
    $("#updateNickname").click(updateNickname);
});