
var fs = require('fs');

var LOG_FILE_NAME = 'testClock.log';

function OutPutLog() {
	var Nowymdhms　=　new Date();
	var NowYear = Nowymdhms.getYear();
	var NowMon = Nowymdhms.getMonth() + 1;
	var NowDay = Nowymdhms.getDate();
	var NowHour = Nowymdhms.getHours();
	var NowMin = Nowymdhms.getMinutes();
	var NowSec = Nowymdhms.getSeconds();
	var textDate = NowYear+"/"+NowMon+"/"+NowDay+' '+NowHour+":"+NowMin+":"+NowSec+"";

	//argumentsに渡された引数が入ってる！
	for (var i = 0; i < arguments.length; i++) {
		var str = arguments[i];
		if (!str) continue;
		console.log(str);
		fs.appendFileSync(LOG_FILE_NAME, '[' + textDate + '] ' + str + "\r\n");
	}
}


exports.log = function(text, text1, text2, text3) {
	OutPutLog(text, text1, text2, text3);
}
