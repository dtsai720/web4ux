export GOOS=windows
export GOARCH=amd64
export CC=x86_64-w64-mingw32-gcc

wails build -platform windows/amd64
