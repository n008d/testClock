@rem �J�����g�f�B���N�g����testClock�����Ƃ���
@echo off

rem ========================================================
rem �v���Z�X���N�����Ă���I��
rem �N�����ĂȂ�������G���[�o�邯�ǋC�ɂ��Ȃ�
set PROCESS_NAME=electron.exe
Taskkill /IM "%PROCESS_NAME%" /F
rem --------------------------------------------------------


rem ========================================================
rem �A�v���N��
set SRC_DIR=src
set ELECTRON=electron

echo start
call %ELECTRON% "%SRC_DIR%"
rem --------------------------------------------------------

echo finish
exit 0
