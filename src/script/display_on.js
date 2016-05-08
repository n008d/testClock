var ffi = require('ffi');

//------------------------------------------------------
// for SendInput
var ref = require ('ref');
var struct = require ('ref-struct');

var MouseInput = struct ({
    'type': 'int',
    'dx': 'long',
    'dy': 'long',
    'mouseData': 'int',
    'dwFlags': 'int',
    'time': 'int',
    'dwExtraInfo': 'int'
});
var MouseInputPtr = ref.refType(MouseInput);
var mouseInput = new MouseInput();
mouseInput.type = 0;
mouseInput.dx = 1;
mouseInput.dy = 1;
mouseInput.dwFlags = 0x0001;
mouseInput.mouseData = 0;
mouseInput.time = 0;
mouseInput.dwExtraInfo = 0;
//------------------------------------------------------
var User32 = ffi.Library('User32', {
	'PostMessageA': ['uint32', ['uint32', 'uint32', 'int', 'int']],
	'SendInput': [ 'int', [ 'uint', MouseInputPtr, 'int' ] ],
	'MessageBoxA': ['int', ['int', 'string', 'string', 'int']],
});

var HWND_BROADCAST = 0xFFFF;
var WM_SYSCOMMAND = 0x0112;
var SC_MONITORPOWER = 0xF170;

var DISPLAY_ON = -1;
var DISPLAY_OFF = 2;

function DisplayOff()
{
	User32.PostMessageA(HWND_BROADCAST,
		WM_SYSCOMMAND, SC_MONITORPOWER, DISPLAY_OFF);
}

function DisplayOn()
{
	User32.PostMessageA(HWND_BROADCAST,
		WM_SYSCOMMAND, SC_MONITORPOWER, DISPLAY_ON);
	
	// さらにマウスを動かしてディスプレイを復帰させる	
	var arch = require('os').arch();

	User32.SendInput (1, mouseInput.ref() , arch === 'x64' ? 40 : 28);
	setTimeout(function () {
		User32.SendInput (1, mouseInput.ref() , arch === 'x64' ? 40 : 28);
		User32.PostMessageA(HWND_BROADCAST,
			WM_SYSCOMMAND, SC_MONITORPOWER, DISPLAY_ON);
	}, 500);
}


if (process.argv.length < 3) {
	DisplayOff();
} else if (process.argv[2] == 'OFF') {
	DisplayOff();
} else {
	DisplayOn();
}


