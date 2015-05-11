$(document).ready(function() {
	
	var start = new Date(selectedRace.startTime);
	var end = new Date(selectedRace.endTime);
	
	$("#startDate").datepicker({ 
		dateFormat: "dd-mm-yy" 
	});
	
	$("#endDate").datepicker({ 
		dateFormat: "dd-mm-yy" 
	});
	
	// Uren toevoegen
	for (var i = 0; i <= 23; i++) {
		var uur = ("0" + i).slice( -2 );
		uur == start.getHours() ? $("#uur_start").append("<option selected>" + uur + "</option>") : $("#uur_start").append("<option>" + uur + "</option>");
	}
	for (var i = 0; i <= 23; i++) {
		var uur = ("0" + i).slice( -2 );
		uur == end.getHours() ? $("#uur_eind").append("<option selected>" + uur + "</option>") : $("#uur_eind").append("<option>" + uur + "</option>");
	}

	// Minuten toevoegen
	for (var i = 0; i <= 59; i++) {
		var minuten = ("0" + i).slice( -2 );
		minuten == start.getMinutes() ? $("#minuten_start").append("<option selected>" + minuten + "</option>") : $("#minuten_start").append("<option>" + minuten + "</option>");
	}
	for (var i = 0; i <= 59; i++) {
		var minuten = ("0" + i).slice( -2 );
		minuten == end.getMinutes() ? $("#minuten_eind").append("<option selected>" + minuten + "</option>") : $("#minuten_eind").append("<option>" + minuten + "</option>");
	}
	
	$("#naam").val(selectedRace.name);
	$("#startDate").val(('0' + start.getDate()).slice(-2) + "-" + ('0' + (start.getMonth()+1)).slice(-2) + "-" + start.getFullYear());
	$("#endDate").val(('0' + end.getDate()).slice(-2) + "-" + ('0' + (end.getMonth()+1)).slice(-2) + "-" + end.getFullYear());
	
	
	toonLocaties(selectedRace);
	
	$("#btn_locatieToevoegen").on("click", function() {
		locatieToevoegen();
	})
	
	$("#btn_save").on("click", function() {
		
		var start = $("#startDate").datepicker('getDate');
		var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), $("#uur_start").val(), $("#minuten_start").val(), 0, 0);
		
		var end = $("#endDate").datepicker('getDate');
		var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), $("#uur_eind").val(), $("#minuten_eind").val(), 0, 0);
		
		$.ajax({
			type: "PUT",
			url: "/races/" + selectedRace._id + "?apikey=a",
			headers: {
				Accept: "application/json"
			},
			dataType: "json",
			data: {
				"private": false,
				"name": $("#naam").val(),
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
		data: /*{
			"orderPosition": 1,
			"location": {
				"name": $("#naam").val(),
				"description": $("#omschrijving").val(),
				"lat": parseFloat($("#lat").val()),
				"long": parseFloat($("#long").val()),
				"distance": parseInt($("#afstand").val())	
			}
		},*/
		{
			"orderPosition": 1,
			"location": {
				"name": "Testtest",
				"lat": 10,
				"long": 20,
				"distance": 2	
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
