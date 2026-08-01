# 生成 PWA 图标（512 主图标 + 180 apple-touch-icon）
Add-Type -AssemblyName System.Drawing

function New-Icon([int]$size, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # 深蓝渐变背景
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 21, 94, 117),
        [System.Drawing.Color]::FromArgb(255, 7, 11, 26),
        45.0)
    $g.FillRectangle($bg, $rect)

    # 金色圆环
    $pen = New-Object System.Drawing.Pen(
        [System.Drawing.Color]::FromArgb(255, 255, 204, 0),
        [single]([Math]::Max(2.0, $size / 42.0)))
    $g.DrawEllipse($pen, $size * 0.13, $size * 0.13, $size * 0.74, $size * 0.74)

    # 金色 ⊕ 字符
    $fontSize = [single]($size * 0.42)
    $font = New-Object System.Drawing.Font('Consolas', $fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 204, 0))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $drawRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString([string][char]0x2295, $font, $brush, $drawRect, $sf)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "created $path"
}

New-Icon 512 'D:\VscodeTable\Nim_game\public\icon-512.png'
New-Icon 180 'D:\VscodeTable\Nim_game\public\icon-180.png'
