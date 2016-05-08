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
		// startSearchYoutube('秋山殿');
	});

	// WEBカメラ監視開始
	capCamera();
	
});

//--------------------------------------------------------------------
// youtube
var player;
function onYouTubePlayerAPIReady() {
	player = new YT.Player('player', {
		height: 480*0.5,
		width: 854*0.5,
//		videoId: 'XofJrPcCtSQ',	// とりあえず秋山殿
		playerVars: {
			'rel': 0,
			'controls': 0,
			'autoplay': 1,
			'showinfo': 0,
			'loop': 0 
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange':onPlayerStateChange,
		}
	});
}

function onPlayerReady(event) {
	console.log('onPlayerReady', event);
	event.target.mute();
	startSearchYoutube('秋山殿');
}

function onPlayerStateChange(event) {
	console.log('onPlayerStateChange', player.getPlayerState());
	if (player.getPlayerState() == YT.PlayerState.ENDED) {
		startSearchYoutube('秋山殿');
	} else if (player.getPlayerState() == YT.PlayerState.CUED) {
		player.playVideo();
	}
}

var API_KEY='AIzaSyCwHpQkimDe9v6EtvwRIhhB8DwDDuFGSjQ';
var YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/';
function startSearchYoutube(query)
{
	var url = YOUTUBE_API_URL + 'search';
	var data = {
		part:'snippet',
		order:'relevance',
		q:query,
		type:'video',
		regionCode:'JP',
		maxResults:50,
		key:API_KEY,
	};
	var dataText = '';
	for (var key in data) {
		var value = encodeURIComponent(data[key]);
		if (0 < dataText.length) dataText += '&';
		dataText += key + '=' + value;
	}
	
	$.ajax({
		type:"get",                // method
		url:url,
		data:dataText,
		contentType: 'application/json', // リクエストの Content-Type
		dataType: "json",           // レスポンスをJSONとしてパースする
		success: function(json_data) {   // 200 OK時
			// JSON Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
			// console.log(json_data);
			var results = json_data.items;

			if (!results) {    // サーバが失敗を返した場合
				console.log("Transaction error. " + json_data[1]);
				return;
			}
			// 成功時処理
			// console.log(results);
			var playlist = [];
			for (var i=0; i<results.length; ++i) {
				var item = results[i];
				var video_id = item.id.videoId;
				playlist.push(video_id);
				console.log(video_id, item.snippet.title);
			}
			player.cuePlaylist(playlist);
		},
		error: function() {         // HTTPエラー時
			console.log("Server Error. Pleasy try again later.");
		},
		complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			console.log('startSearchYoutube complete.');
		}
	});
}


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
			video.muted = true;
			
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
// 直近のデータの平均値を現在ボリュームとする
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
	// remoteConsole.log('finalVol: ', finalVol);
	
	volumeNode.css('width', (finalVol*100) + 'px');
}