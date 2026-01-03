cd ..
del Calculator.exe

call neu.cmd build --release --embed-resources

move .\dist\Calculator\Calculator-win_x64.exe Calculator.exe
rmdir /S /Q dist
cd desktop-app