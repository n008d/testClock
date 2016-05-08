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
	
	
	// クリックしたら明るさ復帰
	$('#fadeLayer').click(function () 
	{
		remoteConsole.log('#fadeLayer: clicked');
		fadeTargetLevel = 0.0;
		// updateVolume();
	});
	
	capCamera();
	// canWebcam();
});

//--------------------------------------------------------------------
// ウェブカメラ起動
var audioCtx;
var analyser;

function capCamera(){
	navigator.getUserMedia = (
		navigator.getUserMedia || 
		navigator.webkitGetUserMedia ||
		window.navigator.mozGetUserMedia);
	window.URL = window.URL || window.webkitURL;

	remoteConsole.log('capCamera()');
	var video = document.getElementById('camera');
	var localStream = null;
	navigator.getUserMedia({video: true, audio: true},
		// ストリームオープン
		function(stream) {
			remoteConsole.log(stream);
			video.src = window.URL.createObjectURL(stream);
			
			audioCtx = new AudioContext;
			// remoteConsole.log(audioCtx);
			analyser = audioCtx.createAnalyser();
			var source = audioCtx.createMediaStreamSource(stream);
			source.connect(analyser);

			// 音量取得
			setInterval(function() {
				updateVolume();
			}, 100);
			
		},
		// errorコールバック
		function(err) {
			remoteConsole.log(err);
		}
	);
}

// ボリュームチェック
var volumeNode;
var VOLUME_CHECK_SIZE = 5;

var volumeArray = new Uint8Array(VOLUME_CHECK_SIZE);
var volumeArrayIndex = 0;
for (var i=0; i<volumeArray.length; ++i) volumeArray[i] = 0;

function updateVolume() {
	if (!volumeNode) volumeNode = $('#volume');
	var dataArray = new Uint8Array( analyser.frequencyBinCount );
	analyser.getByteTimeDomainData( dataArray ); // 現在の波形データを配列へコピー
	
	var total = 0;
	for (var i=0; i< dataArray.length; ++i) {
		total += Math.abs(128 - dataArray[i]);
		// remoteConsole.log('[' + i + '] ' + Math.abs(128 - dataArray[i]));
	}
	var average = total / dataArray.length;
	var volume = average; // Math.abs(128 - dataArray[0]);
	// remoteConsole.log('total: ', total);
	// remoteConsole.log('average: ', total / dataArray.length);
	// remoteConsole.log('audio: ', volume);
	
	volumeArrayIndex++;
	if (volumeArray.length <= volumeArrayIndex) volumeArrayIndex = 0;
	volumeArray[volumeArrayIndex] = volume;
	
	var finalVol = 0;
	for (var i=0; i<volumeArray.length; ++i) finalVol += volumeArray[i];
	finalVol /= volumeArray.length;
	remoteConsole.log('finalVol: ', finalVol);
	
	volumeNode.css('width', (finalVol*100) + 'px');
}