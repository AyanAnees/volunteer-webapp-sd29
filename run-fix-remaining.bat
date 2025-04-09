@echo off
echo Running PowerShell script to fix remaining attribution issues...
powershell -ExecutionPolicy Bypass -File fix-remaining-attribution.ps1
echo Done.
pause
