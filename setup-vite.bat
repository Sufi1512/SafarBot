@echo off
echo Setting up SafarBot with Vite...

echo.
echo 1. Installing root dependencies...
npm install

echo.
echo 2. Installing client dependencies...
cd client
npm install

echo.
echo 3. Installing server dependencies...
cd ../server
pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo To start development:
echo - Run backend: cd server && uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo - Run frontend: cd client && npm run dev
echo - Or run both: npm run dev (from root directory)
echo.
pause
