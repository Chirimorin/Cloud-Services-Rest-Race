var race = "";

$(document).ready(function() {
	
	$.ajax({
		type: "GET",
		url: "/races/" + race_id + "?apikey=a",
		headers: {
			Accept: "application/json"
		},
		dataType: "json",
		success: function(data) {
			toonLocaties(data);
		}
	});
	
	$("#btn_locatieToevoegen").on("click", function() {
		
		$.ajax({
			type: "POST",
			url: "/races/" + race_id + "/location?apikey=a",
			headers: {
				Accept: "application/json"
			},
			dataType: "json",
			data: {
				"location": {
					"name": $("#naam").val(),
					"description": $("#omschrijving").val(),
					"lat": parseFloat($("#lat").val()),
					"long": parseFloat($("#long").val()),
					"distance": parseInt($("#afstand").val())	
				}	
			},
			success: function(data) {
				console.log("Locatie toegevoegd:");
				toonLocaties(race);
			},
			error: function() {
				console.log("Er is iets fout gegaan");
			}
		});
		
	});
	
	$("#btn_klaar").on("click", function() {
		window.location = "profile?apikey=a";
	});
	
});

function toonLocaties(race) {
	if (race.locations.length > 0) {
		for (var i = 0; i < race.locations.length; i++) {
			console.log(race.locations[i].location.name);
		}
	}
	else {
		console.log("Geen locations");
	}
	this.race = race
}