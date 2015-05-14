$(document).ready(function(){      //Add this line (and it's closing line)
    
	$("#startDate").datepicker({ 
		dateFormat: "dd-mm-yy" 
	});
	
	$("#endDate").datepicker({ 
		dateFormat: "dd-mm-yy" 
	});
	
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

		var start = $("#startDate").datepicker('getDate');
		var startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), $("#uur_start").val(), $("#minuten_start").val(), 0, 0);
		
		var end = $("#endDate").datepicker('getDate');
		var endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), $("#uur_eind").val(), $("#minuten_start").val(), 0, 0);
			
		$.ajax({
			type: "POST",
			url: "/races?apikey=a",
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
				window.location = "/races/" + data._id + "/location?apikey=a"
			}
		});
		
		//window.location = "/races/554a16d39fb4eee81b84cb0b/location?apikey=a"
		
	});
	
});



