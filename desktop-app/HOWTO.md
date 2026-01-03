# How to build a desktop app of Calculator

Calculator can be used as a web service.
To use the service just go to

**[a-herzog.github.io/Calc](https://a-herzog.github.io/Calc/)**

Calculator can also be built to a exe file. Neutralinojs is used for building the standalone app.
Follow these steps to build the stand alone app:

1. Install Neutralinojs: `npm install -g @neutralinojs/neu`
2. Run `0_Prepare.bat` to add the Neutralinojs files to the Calculator folder.
3. Run `1_Test.bat` to test the standalone app or `2_Build_exe.bat` or `2_Build_zip.bat` to build the app. The exe or the zip file will appear in the root folder (one level up).
4. Run `3_Clean.bat` to delete the Neutralinojs files created in step 3.