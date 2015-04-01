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
	
});



