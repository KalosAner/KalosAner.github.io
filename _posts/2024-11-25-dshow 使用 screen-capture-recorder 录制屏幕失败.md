---
layout:       post
title:        "dshow 使用 screen-capture-recorder 录制屏幕失败"
author:       "KalosAner"
header-style: text
catalog:      false
tags:
    - ffmpeg
    - dshow

---

**原因**

使用 ffmpeg 的 dshow 输入命令 `ffmpegd -f dshow -list_devices true -i dummy`，会列出所有可用设备。

```sh
ffmpeg version 7.1 Copyright (c) 2000-2024 the FFmpeg developers
  built with msvc
  configuration: --enable-gpl --enable-version3 --enable-bzlib --enable-iconv --enable-lzma --enable-sdl2 --enable-zlib --enable-libmp3lame --enable-libvorbis --enable-libspeex --enable-libopus --enable-libilbc --enable-libtheora --enable-libx264 --enable-libx265 --enable-libxvid --enable-libvpx --enable-libgme --enable-libmodplug --enable-libsoxr --enable-libfreetype --enable-fontconfig --enable-libfribidi --enable-libharfbuzz --enable-libass --enable-libxml2 --enable-gnutls --disable-schannel --enable-gcrypt --enable-libssh --enable-libcdio --enable-libbluray --enable-opengl --enable-libmfx --enable-ffnvcodec --enable-cuda --enable-amf
  libavutil      59. 39.100 / 59. 39.100
  libavcodec     61. 19.100 / 61. 19.100
  libavformat    61.  7.100 / 61.  7.100
  libavdevice    61.  3.100 / 61.  3.100
  libavfilter    10.  4.100 / 10.  4.100
  libswscale      8.  3.100 /  8.  3.100
  libswresample   5.  3.100 /  5.  3.100
  libpostproc    58.  3.100 / 58.  3.100
[dshow @ 0000027C64A3F480] "screen-capture-recorder" (video)
[dshow @ 0000027C64A3F480]   Alternative name "@device_sw_{860BB310-5D01-11D0-BD3B-00A0C911CE86}\{4EA69364-2C8A-4AE6-A561-56E4B5044439}"
[dshow @ 0000027C64A3F480]   Alternative name "@device_cm_{33D9A762-90C8-11D0-BD43-00A0C911CE86}\wave_{FFCCBAEC-584E-4AC0-8CC4-2FA45D55527B}"
[dshow @ 0000027C64A3F480] "virtual-audio-capturer" (audio)
[dshow @ 0000027C64A3F480]   Alternative name "@device_sw_{33D9A762-90C8-11D0-BD43-00A0C911CE86}\{8E146464-DB61-4309-AFA1-3578E927E935}"
[in#0 @ 0000027C64A3F200] Error opening input: Immediate exit requested
Error opening input file dummy.
```

然后输入命令 `ffmpeg -f dshow -i video="screen-capture-recorder" -t 5 output.mp4` 录制屏幕提示失败。

```sh
[dshow @ 000001529B3FEF80] Could not enumerate video devices (or none found).
[in#0 @ 000001529B408FC0] Error opening input: I/O error
Error opening input file video=screen-capture-recorder.
Error opening input files: I/O error
```

**解决：**

卸载 screen-capture-recorder 之后从 [GitHub](https://github.com/rdp/screen-capture-recorder-to-video-windows-free) 上重新下载安装一下就好了。
