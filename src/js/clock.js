"use strict";

var remote = require('remote');
var remoteConsole = remote.require('console');
var fadeTargetLevel = 0.0;

// 時間表示
var WEEK_DAYS= new Array("日","月","火","水","木","金","土");
jQuery(function () {
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

	// 画面の明るさ管理
	initFadeLayer();
	setInterval(function () {
		var FADE_SPEED = 0.1;
		var screen_level = parseFloat($('#fadeLayer').css('opacity'));
		if (screen_level == fadeTargetLevel) return;
		
		if (Math.abs(fadeTargetLevel - screen_level) < FADE_SPEED) {
			screen_level = fadeTargetLevel;
		} else if (fadeTargetLevel < screen_level) {
			screen_level -= FADE_SPEED;
		} else if (screen_level < fadeTargetLevel) {
			screen_level += FADE_SPEED;
		}
		// remoteConsole.log('#fadeLayer: ', fadeTargetLevel, screen_level);
		// remoteConsole.log('#fadeLayer: update: ' + screen_level);
		$('#fadeLayer').css('opacity', screen_level);
	}, 50);	
	
	// WEBカメラ監視開始
	if ($('#camera')[0]) {
		capCamera();
	}
	
});

function toggleFadeMode()
{
	if (fadeTargetLevel <= 0.0) {
		fadeTargetLevel = 0.9;
	} else {
		fadeTargetLevel = 0.0;
	}
}

function initFadeLayer()
{
	// クリックしたら明るさ復帰
//	$('#fadeLayer').click(function () 
//	{
//		remoteConsole.log('#fadeLayer: clicked');
//		toggleFadeMode();
//	});

	var drag = false;
	var posStart = { x:0, y:0 };
	var posPrev = { x:0, y:0 };
	$('#fadeLayer').mousedown(function (event) {
		drag = true;
		posPrev.x = posStart.x = event.clientX;
		posPrev.y = posStart.y = event.clientY;
		// remoteConsole.log('#fadeLayer: mousedown', event.clientX, event.clientY);
	});
	$('#fadeLayer').mouseup(function (event) {
		// remoteConsole.log('#fadeLayer: mouseup', event.clientX, event.clientY);
		drag = false;
		var diffX = event.clientX - posStart.x;
		var diffY = event.clientY - posStart.y;
		
		if (Math.abs(diffX)<300 && Math.abs(diffY)<300) return; // 近すぎ
		// remoteConsole.log('---> ', diffX, diffY);
		
		if (Math.abs(diffY) < Math.abs(diffX)) {
			if (0 < diffX)	fadeLayerRight();
			else fadeLayerLeft();
		} else {
			if (0 < diffY)	fadeLayerDown();
			else fadeLayerUp();
		}
	});
	$('#fadeLayer').mousemove(function (event) {
		if (!drag) return;
		posPrev.x = event.clientX;
		posPrev.y = event.clientY;
		// remoteConsole.log('#fadeLayer: mousemove', event.clientX, event.clientY);
	});
}


function fadeLayerDown()
{
	remoteConsole.log("fadeLayerDown()");
	$('#cursorLog').text('DOWN');
}

function fadeLayerUp()
{
	remoteConsole.log("fadeLayerUp()");
	$('#cursorLog').text('UP');
}

function fadeLayerLeft()
{
	remoteConsole.log("fadeLayerLeft()");
	$('#cursorLog').text('LEFT');
}

function fadeLayerRight()
{
	remoteConsole.log("fadeLayerRight()");
	$('#cursorLog').text('RIGHT');
}
