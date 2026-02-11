@echo off
TITLE Universal Smart Git Uploader
SETLOCAL EnableDelayedExpansion
CLS

:: Get the current folder name to use as a project title
for %%I in ("%cd%") do set "FolderName=%%~nxI"

:: Check if this is a new or existing project
IF EXIST ".git" GOTO UPDATE_EXISTING

:SETUP_NEW
echo ==========================================
echo       SETTING UP NEW REPO: !FolderName!
echo ==========================================
echo.

:: 1. Create a "Best of All Worlds" .gitignore
echo Creating universal .gitignore...
(
  echo # Web / Node
  echo node_modules/
  echo dist/
  echo .env
  echo .env.local
  echo.
  echo # Python
  echo __pycache__/
  echo *.pyc
  echo .venv/
  echo venv/
  echo.
  echo # C / C++ / Executables
  echo *.exe
  echo *.o
  echo *.out
  echo.
  echo # System Files
  echo .DS_Store
  echo Thumbs.db
) > .gitignore

:: 2. Initialize Git
echo Initializing Git...
git init
git add .
git commit -m "Initial commit for !FolderName!"
git branch -M main

:: 3. Connect to GitHub
echo.
echo PASTE YOUR REPO URL BELOW (Right-Click to Paste):
set /p repo_url="URL: "

echo.
echo Connecting to GitHub...
git remote add origin %repo_url%
git push -u origin main

echo.
echo [SUCCESS] !FolderName! is now LIVE on GitHub!
pause
EXIT

:UPDATE_EXISTING
echo ==========================================
echo       UPDATING REPO: !FolderName!
echo ==========================================
echo.

git add .
set /p commit_msg="Enter commit message (Press Enter for 'Update !FolderName!'): "
if "%commit_msg%"=="" set commit_msg="Update !FolderName!"

git commit -m "%commit_msg%"
git push origin main

echo.
echo [SUCCESS] Changes for !FolderName! uploaded!
pause
EXIT