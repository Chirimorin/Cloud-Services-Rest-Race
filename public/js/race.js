$(document).ready(function() {
	
	$("#naam").val(selectedRace.name);
	toonLocaties(selectedRace);
	
	
	// Dagen toevoegen
	for (var i = 1; i <= 31; i++) {
		var dag = ("0" + i).slice( -2 );
		$(".dag").append("<option>" + dag + "</option>");
	}
	
	// Maanden toevoegen
	for (var i = 1; i <= 12; i++) {
		var maand = ("0" + i).slice( -2 );
		$(".maand").append("<option>" + maand + "</option>");
	}
	
	// Jaren toevoegen
	var currentYear = new Date().getFullYear();
	for (var i = currentYear; i <= (currentYear + 10); i++) {
		$(".jaar").append("<option>" + i + "</option>");
	}
	
	// Uren toevoegen
	for (var i = 0; i <= 23; i++) {
		var uur = ("0" + i).slice( -2 );
		$(".uur").append("<option>" + uur + "</option>");
	}
	
	// Minuten toevoegen
	for (var i = 0; i <= 59; i++) {
		var minuten = ("0" + i).slice( -2 );
		$(".minuten").append("<option>" + minuten + "</option>");
	}
	
	
	
	$("#btn_locatieToevoegen").on("click", function() {
		locatieToevoegen();
	})
	
	$("#btn_save").on("click", function() {
		var name = $("#naam").val();
		var startTime = $("#jaar_start").val() + "-" + $("#maand_start").val() + "-" + $("#dag_start").val() + " " + $("#uur_start").val() + ":" + $("#minuten_start").val();
		var endTime = $("#jaar_eind").val() + "-" + $("#maand_eind").val() + "-" + $("#dag_eind").val() + " " + $("#uur_eind").val() + ":" + $("#minuten_eind").val();
		
		$.ajax({
			type: "PUT",
			url: "/races/" + selectedRace._id + "?apikey=a",
			headers: {
				Accept: "application/json"
			},
			dataType: "json",
			data: {
				"private": false,
				"name": name,
				"startTime": startTime,
				"endTime": endTime,
				"hasSpecificOrder": false
			},
			success: function(data) {
				if (data.locations.length > 0) {
					$('#raceBewerken').modal('hide');
					location.reload();
				}
				else {
					 alert("Een race moet minstens 1 locatie hebben.");
				}
			}
		});	
	})
		
});

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
		url: "/races/" + selectedRace._id + "/location?apikey=a",
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
			getRace(data._id);
		}
	});	
}

function locatieVerwijderen(idLocatie) {
	$.ajax({
		type: "DELETE",
		url: "/races/" + selectedRace._id + "/location/" + idLocatie + "?apikey=a",
		headers: {
			Accept: "application/json"
		},
		dataType: "json",
		success: function(data) {
			getRace(data._id);
		}
	}); 
}

function getRace(race_id) {
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
}
