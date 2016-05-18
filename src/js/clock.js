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
		$('#clock_month').text(curDate.getMonth()+1);
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
		player.mute();	// 画面暗くするときは必ずミュートする
	} else {
		fadeTargetLevel = 0.0;
		player.unMute();	// ミュート解除
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

	var isTouch = ('ontouchstart' in window);
	
	var drag = false;
	var posStart = { x:0, y:0 };
	var posPrev = { x:0, y:0 };
	var TOUCHMOVE_THRESHOLD = 200;
	$('#fadeLayer').bind( {
		'touchstart mousedown': function (event) {
			drag = true;
			// console.log('down', event.originalEvent.touches);
			var x = isTouch? event.originalEvent.touches[0].clientX : event.clientX;
			var y = isTouch? event.originalEvent.touches[0].clientY : event.clientY;
			posPrev.x = posStart.x = x;
			posPrev.y = posStart.y = y;
			// remoteConsole.log('#fadeLayer: down', x, y);
		},
		'touchmove mousemove': function (event) {
			if (!drag) return;
			var x = isTouch? event.originalEvent.touches[0].clientX : event.clientX;
			var y = isTouch? event.originalEvent.touches[0].clientY : event.clientY;
			posPrev.x = x;
			posPrev.y = y;
		},
		'touchend mouseup': function (event) {
			// remoteConsole.log('#fadeLayer: mouseup', event.clientX, event.clientY);
			if (!drag) return;
			drag = false;

			var diffX = posPrev.x - posStart.x;
			var diffY = posPrev.y - posStart.y;
			
			if (Math.abs(diffX) < TOUCHMOVE_THRESHOLD
				&& Math.abs(diffY) < TOUCHMOVE_THRESHOLD)
			{	// 近すぎ
				fadeLayoutClick();
				return;
			}
			
			if (Math.abs(diffY) < Math.abs(diffX)) {
				if (0 < diffX)	fadeLayerRight();
				else fadeLayerLeft();
			} else {
				if (0 < diffY)	fadeLayerDown();
				else fadeLayerUp();
			}
		}
	});
}

function toggleMute()
{
	if(!player.isMuted()) player.mute();
	else player.unMute();
}

function fadeLayoutClick()
{
	remoteConsole.log("fadeLayoutClick()");
	
	var idx = Math.floor(Math.random() * shffleStartVideo.length);
	var VideoId = shffleStartVideo[idx];
	videoIdList = [];
	player.cueVideoById(VideoId);
	// player.unMute();
	// startSearchYoutube(getYoutubeQuery());
}

function fadeLayerDown()
{
	remoteConsole.log("fadeLayerDown()");
	// $('#cursorLog').text('DOWN');
	toggleFadeMode();
}

function fadeLayerUp()
{
	remoteConsole.log("fadeLayerUp()");
	// $('#cursorLog').text('UP');
	toggleFadeMode();
}

function fadeLayerLeft()
{
	remoteConsole.log("fadeLayerLeft()");
	// $('#cursorLog').text('LEFT');
	// toggleMute();
}

function fadeLayerRight()
{
	remoteConsole.log("fadeLayerRight()");
	// $('#cursorLog').text('RIGHT');
	// toggleMute();
}
// --------------------------------------------
jQuery(function () {
	document.onkeydown = KeyDown;
});


function KeyDown(event)
{
	var KEY_CODE_ENTER		=  13;
	var KEY_CODE_NEXT		= 176;
	var KEY_CODE_PREV		= 177;
	var KEY_CODE_PLAY_PAUSE	= 179;


	var KEY_CODE_RELOAD     = 40;
	var KEY_CODE_NEXT2		= 39;
	var KEY_CODE_PREV2		= 37;

	// remoteConsole.log("key code: " + event.keyCode);
	// $("#cursorLog").text(event.keyCode);
	switch(event.keyCode) {
	case KEY_CODE_ENTER:
		// remoteConsole.log(" ENTER");
		toggleFadeMode();
		break;
	case KEY_CODE_PREV:
	case KEY_CODE_PREV2:
		// remoteConsole.log(" PREV");
		youtubePrev();
		break;
	case KEY_CODE_NEXT:
	case KEY_CODE_NEXT2:
		// remoteConsole.log(" NEXT");
		youtubeNext();
		break;
	case KEY_CODE_PLAY_PAUSE:
	case KEY_CODE_RELOAD:
		// remoteConsole.log(" PLAY");
		youtubeSearchNext();
		break;
	}
}

