---
layout:       post
title:        "FFMPEG交叉编译问题(FFmpeg安装没有ffplay)"
author:       "x-terminal"
header-style: text
catalog:      false
tags:
    - FFmpeg
    - 转载

---

记一次FFMPEG最新版本的编译问题

这里是FFMPEG当前最新版本安装使用问题，版本为FFMPEG-4.2

在源码编译阶段没有生成ffplay，在ffmpeg3.0以下时，我们使用ffmpeg源码编译时，项目bin下会生成一堆ffmpeg／ffplay／ffprobe等，但是以后的版本发现ffmpeg只有ffmpeg和ffprobe这两个，下面是对没有ffplay生成做一次记录

#### 没有ffplay

- 没有安装SDL

  这是第一种情况，之前我们需要安装libsdl1.2-dev这个版本，然后在安装sdl2多个版本，不过在ffmpeg最新版本的时候只用安装sdl2就可以了，如果有特殊需求，那就在安装libsdl1.2-dev不影响

  1.去官网上去下载sdl2.0：[http://www.libsdl.org/release/SDL2-2.0.9.tar.gz](http://www.libsdl.org/release/SDL2-2.0.9.tar.gz)

  2.`tar -zxvf SDL2-2.0.6.tar.gz`

  3.configure SDL库(具体参数，可自己设置，这里只指定目录，并未做详细配置)

  > configure --prefix=/usr/local/sdl2

  4.make -j4 && make install

- 安装了SDL还是没有

  我们进入ffmpeg目录通过`configure --help`这里 去查看问题

  在Program options中会看出默认ffplay是被disable掉的，也可以进入ffbuild文件夹下查看config.mak这个目录会有一个`!CONFIG_FFPLAY=YES`

  这种情况就需要我们使用**交叉编译**了

  - 先打开config.mak将CONFIG_FFPLAY前面的！去掉

  - 然后在configure ffmpeg的时候将sdl目录指定，参数我贴在下面

    > configure --prefix=/usr/local/ffmpeg --enable-cross-compile --enable-gpl --enable-nonfree --enable-libfdk-aac --enable-libx264 --enable-libx265 --enable-filter=delogo --enable-debug --disable-optimizations --enable-libspeex --enable-videotoolbox --enable-shared --enable-sdl --enable-ffplay --enable-ffprobe --enable-ffmpeg --enable-pthreads --enable-version3 --pkg-config-flags=–static --enable-ffplay --cc=clang --extra-cflags=-I/usr/local/sdl2/SDL2/include/SDL --extra-ldflags=-L/usr/local/sdl2/lib
    >
    > 注意，由于对markdown会对–这种符号变成-操作，若有问题，请排查下
    >
    > 不过亲测有效。。。

  - 如果运行出现`C compiler test failed.`错误，则参数如下：

    > configure --prefix=/usr/local/ffmpeg --enable-cross-compile --enable-gpl --enable-nonfree --enable-libfdk-aac --enable-libx264 --enable-libx265 --enable-filter=delogo --enable-debug --disable-optimizations --enable-libspeex --enable-videotoolbox --enable-shared --enable-sdl --enable-ffplay --enable-ffprobe --enable-ffmpeg --enable-pthreads --enable-version3 --enable-ffplay --cc=clang --extra-cflags=-I/usr/local/sdl2/SDL2/include/SDL
    >
    > 即可

  - 最后就是make && make install即可

由于我当时遇上这个问题，解决了两天才解决掉，故做记录，以防以后遇上

转载自：[https://blog.csdn.net/woqu000000/article/details/98472263](https://blog.csdn.net/woqu000000/article/details/98472263)
