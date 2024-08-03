cd ..
del Calculator.exe
del Calculator_Linux_MacOS.zip
call neu.cmd build --release
cd desktop-app
"C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
move Calculator.exe ..
cd ..
move .\dist\Calculator-release.zip Calculator_Linux_MacOS.zip
rmdir /S /Q dist
cd desktop-app