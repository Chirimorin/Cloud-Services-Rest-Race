$(document).ready(function() {
    	
	$("#btn_locatieToevoegen").on("click", function() {
		
		$.ajax({
			type: "POST",
			url: "/races/" + race_id + "/location?apikey=a",
			headers: {
				Accept: "application/json"
			},
			dataType: "json",
			data: {
				"orderPosition": 1,
				"location": {
					"name": $("#naam").val(),
					"description": $("#omschrijving").val(),
					"lat": $("#lat").val(),
					"long": $("#long").val(),
					"distance": $("#afstand").val()	
				}	
			},
			success: function(data) {
				
			}
		});	
		
	});
	
	$("#btn_klaar").on("click", function() {
		window.location = "profile?apikey=a";
	});
	
});