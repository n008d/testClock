
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