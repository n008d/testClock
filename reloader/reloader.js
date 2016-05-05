/**
 * 必要モジュールメモ
 * npm install comma-separated-values
 */
var CSV = require("comma-separated-values");
var child_process = require('child_process');
var fs = require('fs');

//-------------------------------------------------------------------------
// Reboot対象
var image_name = "electron.exe";
var window_title = "testClock";
var run_command = "electron ..\\src";

//-------------------------------------------------------------------------
/** コマンド実行関数ラッパー
 * @param[in] cmd コマンド文字列
 * @param[out] callback コールバック関数.nullなら出力をconsole.log()へ出力
 */
function execCmd(spawn, cmd, callback)
{
	console.log("> " + cmd);
	var callback_func = function(err, stdout, stderr){
		if (err || stderr || (!stdout)) {	// エラー
			if (err)	     console.log("[err]\n" + err);
			if (stdout)    console.log("[stdout]\n" + stdout);
			if (stderr)     console.log("[stderr]\n" + stderr);
		}
		if (callback)	callback(err, stdout, stderr);
		
		if (!callback) {
			if (err || stderr || (!stdout)) {	// エラー出力済
			} else {
				if (err)	     console.log("[err]\n" + err);
				if (stdout)    console.log("[stdout]\n" + stdout);
				if (stderr)     console.log("[stderr]\n" + stderr);
			}
		}
	};
	
	var exec = child_process.exec; 
	if (spawn) {
		var out = fs.openSync('./out.log', 'a');
		var err = fs.openSync('./out.log', 'a');
		var arg = { 
			detached: false,
			stdio: [ 'ignore', out, err ]
		};
		var child = child_process.exec(cmd, arg, callback_func);
		child.unref();
	} else {
		child_process.exec(cmd, callback_func);
	}
}

/** 指定したアプリに終了リクエストを投げて、終了を待つ
 * @param[in] img_name	   終了したいアプリのイメージ名.nullで全部
 * @param[in] window_title  対象タイトル名.nullで全部
 * @param[out] callback コールバック関数.nullなら出力をconsole.log()へ出力
 */
function closeApp(img_name, window_title, callback)
{
	var cmd = "tasklist /FO csv /NH";
	if (img_name) cmd += ' /FI "IMAGENAME eq ' + img_name + '"';
	if (window_title) cmd += ' /FI "WINDOWTITLE eq ' + window_title + '"';
	
	execCmd(false, cmd, function (err, stdout, stderr) {
		// SJIS対応がめんどくさいのでヘッダは自分で設定する
		var csv = "image,PID,session,sesson_number,used_memory\n" + stdout;
		var result = new CSV(csv, { header: true }).parse();
		console.log(csv); 

		// PIDリストを生成する
		var pids = "";
		for (var i=0; i<result.length; ++i) {
			var process_info = result[i];
			var img = process_info['image'];
			var pid  = process_info['PID'];
			if (!pid) continue;
			// console.log(" - [" + pid + "] " + img);
			pids += " /PID " + pid;
		}
		
		if (0 < pids.length) {
			// プロセスがあれば終了する
			var taskkill_cmd = "taskkill " + pids;
			execCmd(false, taskkill_cmd, callback);
		} else if (callback) {
			callback(err, stdout, stderr);
		}
	});
}

//------------------------------------------------------------------------------------------
function RebootCommand(image_name, window_title, run_command, callback)
{
	var reboot_flag = false;
	closeApp(image_name, window_title, function (err, stdout, stderr) {
		console.log("closed app");
		reboot_flag = true;
	});

	// 終了完了を待つ？
	setInterval(function(){
		if (reboot_flag) {
			reboot_flag = false;
			console.log("Reboot!");
			
			execCmd(true, run_command);

			// 再起動まで適当に待つ
			setTimeout(callback, 1000);
		}
	},500);
}

//-------------------------------------------------------------------------
// REBOOT状態遷移
var REBOOT_IDLE = 0;
var REBOOT_START = 1;
var REBOOT_STARTING = 2;
var REBOOT_EXIT = 3;
var STR_REBOOT_STAT = {
	0: "IDLE",
	1: "REBOOT",
	2: "REBOOTING",
	3: "EXIT"
};

var reboot_stat = REBOOT_IDLE;
function rebootStat(stat) {
	if (reboot_stat == REBOOT_EXIT) {
		console.log("already exit status: " + STR_REBOOT_STAT[reboot_stat] + " -> " + STR_REBOOT_STAT[stat]);
		return false;
	}
	if (reboot_stat != stat) {
		console.log("reboot stat: " + STR_REBOOT_STAT[reboot_stat] + " -> " + STR_REBOOT_STAT[stat]);
		reboot_stat = stat;
		return true;
	}
	return false;
}

//-------------------------------------------------------------------------
// 人力入力用stdin監視
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	chunk = chunk.replace(/\r*\n/, '');
	// console.log('data > [' + chunk + ']');
	switch (chunk) {
	case 'exit':
	case 'quit':
	case 'e':
	case 'q':
	case '':
		if (reboot_stat==REBOOT_IDLE) {
			rebootStat(REBOOT_EXIT);
		} else {
			console.log("status not IDLE.");
		}
		break;
	case 'r':
	case 'reboot':
		if (reboot_stat==REBOOT_IDLE) {
			rebootStat(REBOOT_START);
		} else {
			console.log("status not IDLE.");
		}
		break;
	default:
		console.log('unknown command :[' + chunk + ']');
		console.log('	for exit: quit , exit, q, e, ENTER');
		console.log('	for reboot: reboot , r');
		break;
	}
});

//-------------------------------------------------------------------------
// reboot処理用ファイル監視
var filepath = '../jenkins/reload.log'
console.log('start watch: %s', filepath);

if (fs.existsSync(filepath)) {
	fs.unlinkSync(filepath);
}

fs.watchFile(filepath, function (curr, prev) {
	// console.dir(curr);
	// console.log('the current mtime is: ' + curr.mtime);
	// console.log('the previous mtime was: ' + prev.mtime);
	if (fs.existsSync(filepath)) {
		fs.unlinkSync(filepath);
		
		if (reboot_stat == REBOOT_IDLE) {
			rebootStat(REBOOT_START);
		} else {
			// とりあえず、適当に待機してからreboot要請
			setTimeout(function () {
				rebootStat(REBOOT_START);
			}, 5000);
		}
	}
});

//-------------------------------------------------------------------------
rebootStat(REBOOT_START);

setInterval(function(){
	switch(reboot_stat) {
	case REBOOT_IDLE:
		break;
	case REBOOT_START:
		rebootStat(REBOOT_STARTING);
		RebootCommand(image_name, window_title, run_command, function () {
			rebootStat(REBOOT_IDLE);
		});
		break;
	case REBOOT_STARTING:
		break;
	case REBOOT_EXIT:
		process.exit();
		break;
	}
}, 500);
