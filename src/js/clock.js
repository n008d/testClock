"use strict";

var WEEK_DAYS= new Array("日","月","火","水","木","金","土");
setInterval(function (){
	var curDate = new Date();
	$('#clock_year').text(curDate.getFullYear());
	$('#clock_month').text(curDate.getMonth());
	$('#clock_day').text(curDate.getDate());
	$('#clock_dayOfWeek').text(WEEK_DAYS[curDate.getDay()]);

	$('#clock_hh').text(curDate.getHours());
	$('#clock_mm').text(curDate.getMinutes());
	$('#clock_ss').text(curDate.getSeconds());
}, 100);