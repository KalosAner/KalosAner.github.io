---
layout:       post
title:        "IOCP：Windows下性能最好的 IO 模型"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - 网络编程
    - Windows
---

### 一、引言

如果已经了解 重叠 IO 的话再理解 IOCP（Input Output Completion Port）就会容易很多。IOCP 的基本流程就是第一步创建一个 IOCP 对象，该对象可以连接很多网络套接字；第二步就是把需要进行 IO 的套接字连接到刚创建好的 IOCP 对象上，这样传输到这些网络套接字的数据都会进入一个缓冲区队列中；第三步就是创建多个线程，每个线程都通过 `GetQueuedCompletionStatus` 函数得到缓冲区队列中的数据。

### 二、创建 IOCP 对象

**创建非阻塞套接字**

使用 IOCP 对象必须使用非阻塞的套接字，可以通过下列代码创建：

```c
int mode = 1;
// WSA_FLAG_OVERLAPPED 设置套接字支持重叠 IO。
SOCKET hLisnSock = WSASocket(PF_INET, SOCK_STREAM, 0, NULL, 0, WSA_FLAG_OVERLAPPED);
// 设置 hLisnSock 套接字的套接字 IO 模式（FIONBIO）为变量 mode 中的形式。
ioctlsocket(hLisnSock, FIONBIO, &mode);
```

**创建 IO 完成端口**

创建完成端口（Completion Port，简称 CP 对象）和绑定套接字到 CP 对象使用的是同一个函数，但是传输入的参数不同。

```c
#include <windows.h>

HANDLE CreateIoCompletionPort(HANDLE FileHandle, HANDLE ExistingCompletionPort, ULONG_PTR CompletionKey, DWORD NumberOfConcurrentThreads);
```

`FileHandle`：创建 CP 对象时传入 `INVALID_HANDLE_VALUE`。

`ExistingCompletionPort`：创建 CP 对象时传入 `NULL`。

`CompletionKey`：创建 CP 对象时传入 `0`。

`NumberOfConcurrentThreads`：分配给 CP 对象用来处理 IO 的线程数，如果传入正整数代表可以同时运行的线程数，如果传入 0 则代表 CPU 个数就是可以同时运行的最大线程数。

```c
HANDLE hCpObject =  CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 2);
```

**连接套接字**

```c
#include <windows.h>

HANDLE CreateIoCompletionPort(HANDLE FileHandle, HANDLE ExistingCompletionPort, ULONG_PTR CompletionKey, DWORD NumberOfConcurrentThreads);
```

`FileHandle`：要连接到 CP 对象的套接字句柄。

`ExistingCompletionPort`：要连接套接字的 CP 对象句柄。

`CompletionKey`：传递信息，可以通过 `GetQueuedCompletionStatus` 函数获取。

`NumberOfConcurrentThreads`：`ExistingCompletionPort` 非 NULL 时会忽略该值。

**创建多线程**

创建多线程需要把 CP 对象句柄当作参数传入线程函数中。

```c
_beginthreadex(NULL, 0, EchoThreadMain, (LPVOID)hComPort, 0, NULL);
```

### 三、代码示例

IOCP 模型是 Windows 上很重要的模型，也是不好理解的模型，通过代码可以更好的理解。

```c
#include <stdio.h>
#include <stdlib.h>
#include <process.h>
#include <winsock2.h>
#include <windows.h>

#define BUF_SIZE 100
#define READ	3
#define	WRITE	5

typedef struct    // socket info
{
	SOCKET hClntSock;
	SOCKADDR_IN clntAdr;
} PER_HANDLE_DATA, *LPPER_HANDLE_DATA;

typedef struct    // buffer info
{
	OVERLAPPED overlapped;
	WSABUF wsaBuf;
	char buffer[BUF_SIZE];
	int rwMode;    // READ or WRITE
} PER_IO_DATA, *LPPER_IO_DATA;

DWORD WINAPI EchoThreadMain(LPVOID CompletionPortIO);
void ErrorHandling(char *message);

int main(int argc, char* argv[])
{
	WSADATA	wsaData;
	HANDLE hComPort;	
	SYSTEM_INFO sysInfo;
	LPPER_IO_DATA ioInfo;
	LPPER_HANDLE_DATA handleInfo;

	SOCKET hServSock;
	SOCKADDR_IN servAdr;
	int recvBytes, i, flags=0;

	if(WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
		ErrorHandling("WSAStartup() error!"); 
	// 创建 CP 对象
	hComPort=CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 0);
    // 得到系统信息，主要是 CPU 数量
	GetSystemInfo(&sysInfo);

	for(i=0; i<sysInfo.dwNumberOfProcessors; i++)
		_beginthreadex(NULL, 0, EchoThreadMain, (LPVOID)hComPort, 0, NULL);

    // 创建异步 IO 套接字
	hServSock=WSASocket(AF_INET, SOCK_STREAM, 0, NULL, 0, WSA_FLAG_OVERLAPPED);
	memset(&servAdr, 0, sizeof(servAdr));
	servAdr.sin_family=AF_INET;
	servAdr.sin_addr.s_addr=htonl(INADDR_ANY);
	servAdr.sin_port=htons(atoi(argv[1]));

	bind(hServSock, (SOCKADDR*)&servAdr, sizeof(servAdr));
	listen(hServSock, 5);
	
	while(1)
	{	
		SOCKET hClntSock;
		SOCKADDR_IN clntAdr;		
		int addrLen=sizeof(clntAdr);
		
		hClntSock=accept(hServSock, (SOCKADDR*)&clntAdr, &addrLen);		  
		// 保存客户端套接字信息，用来传递给多线程用来向客户端发送数据
		handleInfo=(LPPER_HANDLE_DATA)malloc(sizeof(PER_HANDLE_DATA));		
		handleInfo->hClntSock=hClntSock;
		memcpy(&(handleInfo->clntAdr), &clntAdr, addrLen);
		// 连接套接字并传递套接字信息
		CreateIoCompletionPort((HANDLE)hClntSock, hComPort, (DWORD)handleInfo, 0);
		
        // 保存需要重叠 IO 信息、传输的数据和传输模式（读或者写，因为 IOCP 不记录传输模式）
		ioInfo=(LPPER_IO_DATA)malloc(sizeof(PER_IO_DATA));
		memset(&(ioInfo->overlapped), 0, sizeof(OVERLAPPED));		
		ioInfo->wsaBuf.len=BUF_SIZE;
		ioInfo->wsaBuf.buf=ioInfo->buffer;
		ioInfo->rwMode=READ;

		WSARecv(handleInfo->hClntSock,	&(ioInfo->wsaBuf),	
			1, &recvBytes, &flags, &(ioInfo->overlapped), NULL);			
	}
	return 0;
}

// 线程里的函数
DWORD WINAPI EchoThreadMain(LPVOID pComPort)
{
	HANDLE hComPort=(HANDLE)pComPort;
	SOCKET sock;
	DWORD bytesTrans;
	LPPER_HANDLE_DATA handleInfo;
	LPPER_IO_DATA ioInfo;
	DWORD flags=0;
	
	while(1)
	{ 
        // 阻塞函数，当 IOCP 队列里有完成的 IO 时，获取传输的字节数 bytesTrans、
        // 额外信息 handleInfo、指向 OVERLAPPED 的指针（虽然实际传输的结构体指针
        // 并不是单纯指向 OVERLAPPED，但是由于结构体变量地址值与结构体第一个成员的地址值相同，
        // 所以这样传递合法。该方法可以用来传递更多的信息）、阻塞时间。
		GetQueuedCompletionStatus(hComPort, &bytesTrans, 
			(LPDWORD)&handleInfo, (LPOVERLAPPED*)&ioInfo, INFINITE);
		sock=handleInfo->hClntSock;

		if(ioInfo->rwMode==READ)
		{
			puts("message received!");
			if(bytesTrans==0)    // 传输到 EOF 时（末尾）
			{
				closesocket(sock);
				free(handleInfo); free(ioInfo);
				continue;		
			}

			memset(&(ioInfo->overlapped), 0, sizeof(OVERLAPPED));			
			ioInfo->wsaBuf.len=bytesTrans;
			ioInfo->rwMode=WRITE;
			WSASend(sock, &(ioInfo->wsaBuf), 
				1, NULL, 0, &(ioInfo->overlapped), NULL);

			ioInfo=(LPPER_IO_DATA)malloc(sizeof(PER_IO_DATA));
			memset(&(ioInfo->overlapped), 0, sizeof(OVERLAPPED));
			ioInfo->wsaBuf.len=BUF_SIZE;
			ioInfo->wsaBuf.buf=ioInfo->buffer;
			ioInfo->rwMode=READ;
			WSARecv(sock, &(ioInfo->wsaBuf), 
				1, NULL, &flags, &(ioInfo->overlapped), NULL);
		}
		else
		{
			puts("message sent!");
			free(ioInfo);
		}
	}
	return 0;
}

void ErrorHandling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

