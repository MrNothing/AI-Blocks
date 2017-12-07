@echo off
IF EXIST "app.asar" del "app.asar"
ECHO Building app.asar this usually takes 5-10 minutes...
asar pack . app.asar