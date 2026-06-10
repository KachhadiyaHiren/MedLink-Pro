Set WshShell = CreateObject("WScript.Shell")

' Start Node app with timestamp logger
WshShell.Run "cmd /c cd /d ""C:\Users\hiren\OneDrive\Desktop\Healthcare"" && ""C:\Program Files\nodejs\node.exe"" run-with-timestamp.js", 0, False

' Wait a few seconds for the app to start
WScript.Sleep 10000

' Start ngrok and log output to ngrok.log
WshShell.Run "cmd /c ngrok http 3000 --log=stdout >> ""C:\Users\hiren\OneDrive\Desktop\Healthcare\ngrok.log"" 2>&1", 0, False