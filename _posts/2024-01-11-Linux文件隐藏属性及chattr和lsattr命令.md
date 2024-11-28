---
layout:       post
title:        "Linux文件隐藏属性及chattr和lsattr命令"
author:       "KalosAner"
header-style: text
catalog:      false
tags:
    - 后端
    - Linux

---

### chattr命令

```sh
[root@study ~]# chattr [+-=] [ASacdistu] 文件或目录名称
选项与参数：
	+ ：增加某一个特殊参数，其他原本存在参数则不动。
	- ：移除某一个特殊参数，其他原本存在参数则不动。
	= ：设置等于，且仅有后面接的参数
	A ：当设置了 A 这个属性时，若你有存取此文件（或目录）时，他的存取时间 atime 将不会被修改，可避免 I/O 较慢的机器过度的存取磁盘。（目前建议使用文件系统挂载参数处理这个项目）
	S ：一般文件是非同步写入磁盘的（原理请参考前一章sync的说明），如果加上 S 这个属性时，当你进行任何文件的修改，该更动会“同步”写入磁盘中。
	a ：当设置 a 之后，这个文件将只能增加数据，而不能删除也不能修改数据，只有root 才能设置这属性
	c ：这个属性设置之后，将会自动的将此文件“压缩”，在读取的时候将会自动解压缩，但是在储存的时候，将会先进行压缩后再储存（看来对于大文件似乎蛮有用的！）
	d ：当 dump 程序被执行的时候，设置 d 属性将可使该文件（或目录）不会被 dump 备份
	i ：这个 i 可就很厉害了！他可以让一个文件“不能被删除、改名、设置链接也无法写入或新增数据！”对于系统安全性有相当大的助益！只有 root 能设置此属性
	s ：当文件设置了 s 属性时，如果这个文件被删除，他将会被完全的移除出这个硬盘空间，所以如果误删了，完全无法救回来了！
	u ：与 s 相反的，当使用 u 来设置文件时，如果该文件被删除了，则数据内容其实还存在磁盘中，可以使用来救援该文件！
注意1：属性设置常见的是 a 与 i 的设置值，而且很多设置值必须要身为 root 才能设置
注意2：xfs 文件系统仅支持 AadiS 参数
范例：到/tmp下面创建文件，并加入 i 的参数，尝试删除看看。
[root@study ~]# cd /tmp
[root@study tmp]# touch attrtest <==创建一个空文件
[root@study tmp]# chattr +i attrtest <==给予 i 的属性
[root@study tmp]# rm attrtest <==尝试删除看看
rm: remove regular empty file `attrtest'? y
rm: cannot remove `attrtest': Operation not permitted
设置i属性的文件连 root 也没有办法将这个文件删除
范例：将该文件的 i 属性取消！
[root@study tmp]# chattr -i attrtest
```

### lsattr命令

```sh
[root@study ~]# lsattr [-adR] 文件或目录
选项与参数：
	-a ：将隐藏文件的属性也秀出来；
	-d ：如果接的是目录，仅列出目录本身的属性而非目录内的文件名；
	-R ：连同子目录的数据也一并列出来！
[root@study tmp]# chattr +aiS attrtest
[root@study tmp]# lsattr attrtest
--S-ia---------- attrtest
```

**注：这两个指令在使用上必须要特别小心，否则会造成很大的困扰。例如：某天你心情好，突然将 /etc/shadow 这个重要的密码记录文件给他设置成为具有 i 的属性，那么过了若干天之后， 你突然要新增使用者，却一直无法新增，那么很有可能就是它的原因。（当Linux无法新增使用者时可以作为一个思路）**
