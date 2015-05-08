$(document).ready(function(){      //Add this line (and it's closing line)
    
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
	
	$("#btn_raceAanmaken").on("click", function() {

		var name = $("#naam").val();
		var startTime = $("#jaar_start").val() + "-" + $("#maand_start").val() + "-" + $("#dag_start").val() + " " + $("#uur_start").val() + ":" + $("#minuten_start").val();
		var endTime = $("#jaar_eind").val() + "-" + $("#maand_eind").val() + "-" + $("#dag_eind").val() + " " + $("#uur_eind").val() + ":" + $("#minuten_eind").val();
			
		$.ajax({
			type: "POST",
			url: "/races?apikey=a",
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
				window.location = "/races/" + data._id + "/location?apikey=a"
			}
		});
		
		//window.location = "/races/554a16d39fb4eee81b84cb0b/location?apikey=a"
		
	});
	
});



