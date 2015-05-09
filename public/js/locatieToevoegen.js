var race = ""

$(document).ready(function() {
	getRace();
	
	$("#btn_locatieToevoegen").on("click", function() {
		locatieToevoegen();
	});
	
	$("#btn_klaar").on("click", function() {
		race.locations.length > 0 ? window.location = "profile?apikey=a" : alert("Een race moet minstens 1 locatie hebben.");
	});
});

function getRace() {
	$.ajax({
		type: "GET",
		url: "/races/" + race_id + "?apikey=a",
		headers: {
			Accept: "application/json"
		},
		dataType: "json",
		success: function(data) {
			toonLocaties(data);
			race = data;
		}
	});
}

function toonLocaties(race) {
	$("#locaties").empty(); 
	
	if (race.locations.length > 0) {
		for (var i = 0; i < race.locations.length; i++) {
			$("#locaties").append("<div id=" + race.locations[i]._id + "><div class='col-sm-9'><span>" + race.locations[i].location.name + "</span><br /><span>(" + race.locations[i].location.lat + ", " + race.locations[i].location.long + ")</span></div><div class='col-sm-3'><button id=" + race.locations[i]._id + " class='location btn btn-danger'>Verwijder</button></div></div><br/ ><br/ ><br/ >");
			
			$(".location").click(function() {
				locatieVerwijderen($(this).attr("id"));
			});
		}
	}
	else {
		$("#locaties").append("<span>Er zijn nog geen locaties toegevoegd.</span>");
	}
}

function locatieToevoegen() {
	$.ajax({
		type: "POST",
		url: "/races/" + race_id + "/location?apikey=a",
		headers: {
			Accept: "application/json"
		},
		dataType: "json",
		data: {
			location: {
				"name": $("#naam").val(),
				"description": $("#omschrijving").val(),
				"lat": parseFloat($("#lat").val()),
				"long": parseFloat($("#long").val()),
				"distance": parseInt($("#afstand").val())	
			}	
		},
		success: function(data) {
			getRace();
		}
	});	
}

function locatieVerwijderen(idLocatie) {
	$.ajax({
		type: "DELETE",
		url: "/races/" + race_id + "/location/" + idLocatie + "?apikey=a",
		headers: {
			Accept: "application/json"
		},
		dataType: "json",
		success: function(data) {
			getRace();
		}
	}); 
}
