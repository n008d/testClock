"use strict";

var WEEK_DAYS= new Array("日","月","火","水","木","金","土");
setInterval(function (){
	var curDate = new Date();
	$('#clock_year').text(curDate.getFullYear());
	$('#clock_month').text(curDate.getMonth());
	$('#clock_day').text(curDate.getDate());
	$('#clock_dayOfWeek').text(WEEK_DAYS[curDate.getDay()]);

	var h = curDate.getHours();
	var m = curDate.getMinutes();
	var s = curDate.getSeconds();
	
	if (h < 10) h = '0' + h;
	if (m < 10) m = '0' + m;
	if (s < 10)	s = '0' + s;
	
	$('#clock_hh').text(h);
	$('#clock_mm').text(m);
	$('#clock_ss').text(s);
}, 100);