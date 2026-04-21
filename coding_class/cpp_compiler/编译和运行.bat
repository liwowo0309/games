@echo off
chcp 65001 >nul
echo ====================================
echo C++ 编译和运行脚本
echo ====================================
echo.

REM 检查是否安装了 g++
where g++ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检测到 g++ 编译器 (MinGW)
    echo 正在编译 test.cpp...
    g++ test.cpp -o test.exe
    if %ERRORLEVEL% EQU 0 (
        echo 编译成功！
        echo.
        echo 运行程序：
        echo ====================================
        test.exe
        echo ====================================
    ) else (
        echo 编译失败！请检查代码。
    )
    goto :end
)

REM 检查是否安装了 cl (MSVC)
where cl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检测到 cl 编译器 (MSVC)
    echo 正在编译 test.cpp...
    cl test.cpp /EHsc
    if %ERRORLEVEL% EQU 0 (
        echo 编译成功！
        echo.
        echo 运行程序：
        echo ====================================
        test.exe
        echo ====================================
        del test.obj >nul 2>&1
    ) else (
        echo 编译失败！请检查代码。
    )
    goto :end
)

echo 错误：未找到 C++ 编译器！
echo.
echo 请先安装编译器：
echo 1. MinGW-w64 (推荐)
echo 2. Visual Studio (MSVC)
echo.
echo 详细安装说明请查看：C++编译器安装指南.md
echo.

:end
pause
