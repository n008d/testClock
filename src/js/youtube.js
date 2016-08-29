
var remote = require('remote');
var remoteConsole = remote.require('./OutLog.js');
// var remoteConsole = remote.require('console');

var videoIdList = [
	
];

//--------------------------------------------------------------------
// youtube
function getYoutubeQuery()
{
	var idx = Math.floor (Math.random () * searchQuerys.length);
	// remoteConsole.log(idx + ' / ' + searchQuerys.length);

	// idx = searchQuerys.length-1;
	var query = searchQuerys[idx];
	return query;
}

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
	remoteConsole.log('onPlayerReady'+', '+ event);
//	event.target.mute();
	startSearchYoutube(getYoutubeQuery());
}

function onPlayerStateChange(event) {
	// remoteConsole.log('onPlayerStateChange'+', '+ player.getPlayerState()+', '+ event+', '+ player);

	var video = player.getVideoData();
	var logMsg = 'video_id="'+ video.video_id + '"';
	if (video.title)	logMsg += ', title="' + video.title + '"';
	if (video.author)	logMsg += ', author="' + video.author + '"';
	// console.log('video', video);
	// console.log('logMsg', logMsg);

	if (player.getPlayerState() == YT.PlayerState.ENDED) {
//		startSearchYoutube(getYoutubeQuery());
		remoteConsole.log('ENDED: '+ logMsg);
		youtubeNext();
	} else if (player.getPlayerState() == YT.PlayerState.CUED) {
		player.playVideo();
		remoteConsole.log('CUED: '+ logMsg);
	} else if (player.getPlayerState() == YT.PlayerState.PLAYING) {
		console.log('else: ' + player.getPlayerState());
		remoteConsole.log('PLAY: '+ logMsg);
	}
}

var API_KEY='AIzaSyCwHpQkimDe9v6EtvwRIhhB8DwDDuFGSjQ';
var YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/';
function startSearchYoutube(queryArray)
{
	var query = queryArray[0];
	var ignore_title = queryArray[1];
	var ignore_desc = queryArray[2];
	var ignore_video_id = queryArray[3];
	
	remoteConsole.log("startSearchYoutube"+', '+ query);
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
		success: finishedSearchYoutube,	 // 200 OK時
		error: function() {         // HTTPエラー時
			remoteConsole.log("Server Error. Pleasy try again later.");
		},
		complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			remoteConsole.log('startSearchYoutube complete.');
		}
	});

	function finishedSearchYoutube(json_data)
	{
		// JSON Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
		// console.log(json_data);
		var results = json_data.items;

		if (!results) {    // サーバが失敗を返した場合
			remoteConsole.log("Transaction error. " + json_data[1]);
			return;
		}
		// 成功時処理
		// console.log(results);
		
		// 順番シャッフル
		var shuffle = function() {return Math.random()-.5};
		results.sort(shuffle);
		
		// 有効なのをpush
		var playlist = [];
		for (var i=0; i<results.length; ++i) {
			var item = results[i];
			var video_id = item.id.videoId;
			var title = item.snippet.title;
			var desc= item.snippet.description;
	
			var skip = false;

			// 無視タイトルチェック
			for (var j=0; j<ignore_title.length; ++j) {
				if (0 <= title.indexOf(ignore_title[j])) {
					skip = true;
					break;
				}
			}
			if (skip) continue;
			// 無視詳細チェック
			for (var j=0; j<ignore_desc.length; ++j) {
				if (0 <=desc.indexOf(ignore_desc[j])) {
					skip = true;
					break;
				}
			}
			if (skip) continue;
			// 無視Video IDチェック
			for (var j=0; j<ignore_video_id.length; ++j) {
				if (video_id == ignore_video_id[j]) {
					skip = true;
					break;
				}
			}
			if (skip) continue;

			remoteConsole.log(">>>>"+ video_id+', '+ title+', '+ desc+', '+ item);
			playlist.push(video_id);
		}

		// テスト用短いだけの動画
		//; playlist = ['KfiRi-7SwtM', 'n0W5ecXrakY', ];

		for (var i=0; i<playlist.length; ++i) {
			videoIdList.push(playlist[i]);
		}

		remoteConsole.log('cuePlaylist');
		player.cueVideoById(videoIdList[0]);
		videoIdList.shift();
	}
}

function youtubeNext()
{
	if (0 < videoIdList.length) {
		player.cueVideoById(videoIdList[0]);
		videoIdList.shift();
	} else {
		startSearchYoutube(getYoutubeQuery());
	}
}

// 最初から再生する
function youtubePrev()
{
	player.seekTo(0, true);
}

// シャッフル再生
function youtubeSearchNext()
{
	videoIdList = [];
	startSearchYoutube(getYoutubeQuery());
}
