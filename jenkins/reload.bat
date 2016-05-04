@rem カレントディレクトリはtestClock直下とする
@echo off

rem ========================================================
rem プロセスが起動してたら終了
rem 起動してなかったらエラー出るけど気にしない
set PROCESS_NAME=electron.exe
Taskkill /IM "%PROCESS_NAME%" /F
rem --------------------------------------------------------


rem ========================================================
rem アプリ起動
set SRC_DIR=src
set ELECTRON=electron

echo start
call %ELECTRON% "%SRC_DIR%"
rem --------------------------------------------------------

echo finish
exit 0
