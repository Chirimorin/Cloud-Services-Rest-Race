/**
 * Created by Thomas on 31-3-2015.
 */

var currentPage;
var itemsPerPage;
var type;

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

function getRaces() {
    console.log("Getting races page " + currentPage);

    $.ajax({
        url: "/races?apikey=" + apiKey +
            "&type=" + type +
            "&pageSize=" + itemsPerPage +
            "&page=" + currentPage,
        method: "GET"
    }).success(function(data) {
        if (data.length != 0) {
            var raceList = "";

            $.each(data, function (index, race) {
                var startTime = new Date(race.startTime).toLocaleDateString();
                var endTime = "";
                if (race.endTime != null) {
                    endTime = " - " + new Date(race.endTime).toLocaleDateString();
                }

                raceList += "<li class=\"list-group-item clickable\">" +
                    "<span class=\"badge\">" + race.participants.length + " deelnemers" + "</span>" +
                    "<strong>" + race.name + "</strong><br/>" +
                    "<span class=\"tijd\">" + startTime + endTime + "</span>" +
                    "</li>";
            });

            $("#racesList").html(raceList);

            if (data.length != itemsPerPage) {
                lastPage(true);
            }
            else {
                $.ajax({
                    url: "/races?apikey=" + apiKey +
                    "&type=" + type +
                    "&pageSize=" + itemsPerPage +
                    "&page=" + (currentPage + 1),
                    method: "GET"
                }).success(function(data) {
                    console.log(data);
                    lastPage(data.length == 0)
                });
            }
        }
        else {
            lastPage(true);
            alert("Geen races meer gevonden.");
        }
    });

    firstPage(currentPage == 1);
}

function previousPage() {
    if (!$(".previous").hasClass("disabled")) {
        currentPage--;
        getRaces();
    }
}

function nextPage() {
    if (!$(".next").hasClass("disabled")) {
        currentPage++;
        getRaces();
    }
}

function itemsPerPageChanged() {
    itemsPerPage = $('#itemsPerPage').val();
    localStorage.setItem("itemsPerPage", itemsPerPage);
    currentPage = 1;
    getRaces();
}

function lastPage(value) {
    if (value) {
        $(".next").addClass("disabled");
    } else {
        $(".next").removeClass("disabled");
    }
}

function firstPage(value) {
    if (value) {
        $(".previous").addClass("disabled");
    } else {
        $(".previous").removeClass("disabled");
    }
}

$(document).ready(function() {
    currentPage = 1;
    type = "owner"
    itemsPerPage = localStorage.getItem("itemsPerPage");
    if (!itemsPerPage) {
        itemsPerPage = 5;
    }
    $('#itemsPerPage').val(itemsPerPage);
    itemsPerPageChanged();

    $("#updateNickname").click(updateNickname);
    $("#prevPage").click(previousPage);
    $("#nextPage").click(nextPage);
    $("#itemsPerPage").change(itemsPerPageChanged);
});