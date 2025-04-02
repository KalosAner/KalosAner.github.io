---
layout:       post
title:        "Windows 下的异步通知 IO"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - 网络编程
    - Windows
    - I/O
---

### 一、异步通知 IO

同步 IO 就是调用 IO 函数会阻塞直到数据完成发送或者完成接收，IO 函数才返回结果。

异步 IO 就是调用 IO 函数的同时立马返回，此时数据可能还在缓冲区进行发送或者接收。也就是说在进行 IO 的同时，CPU可以执行其他任务。

通知 IO 是“通知输入缓冲收到数据并需要读取数据，以及输出缓冲为空故可以发送数据”。典型的通知 IO 模型是 select 方式。

异步通知 IO 模型是一种高效的 IO 处理机制，其核心特点是通过事件驱动驱动实现非阻塞操作，允许应用程序在发起 IO 请求后继续执行其他任务，待 IO 就绪后由操作系统主动通知程序处理结果。

Windows 上有两种方法实现异步通知 IO：一种是 `WSAEventSelect` 函数，另一种是 `WSAAsyncSelect` 函数。

**异步与同步**

异步适用于高并发、任务复杂的场景、资源充足的场景，如命令行工具，批处理脚本，实时控制脚本。

同步适用于业务逻辑简单、实时性要求高、开发成本低、资源受限的场景，如高并发服务器开发。

**注册监视事件**

`WSAEventSelect` 函数：设置对套接字的监视事件。

```c
#include <winsock2.h>

int WSAEventSelect(SOCKET s, WSAEVENT hEventObject, long lNetworkEvents);
```

`s`：监视的套接字句柄

`hEventObject`：传出参数，传递事件句柄以验证事件发生与否

`lNetworkEvents`：要监视的事件类型

- `FD_READ`：是否有可读的数据
- `FD_WRITE`：能否以非阻塞方式发送数据
- `FD_OOB`：是否收到带外数据
- `FD_ACCEPT`：是否有新的连接请求
- `FD_CLOSE`：是否有断开连接的请求

返回值：成功返回 0，失败返回 `SOCKET_ERROR`

`WSAEventSelect` 函数是非阻塞函数，调用后直接返回。该函数只能对一个套接字调用，但该函数传递的套接字信息会注册到操作系统，所以无需重复调用。

**manual-reset 模式事件的其他创建方法**

```c
#define WSAEVENT HANDLE
#include <winsock2.h>

WSAEVENT WSACreateEvent(void);
BOOL WSACloseEvent(WSAEVENT, hEvent);
```

该函数可以直接创建 manual-reset 模式事件。

**检测发生的事件**

```c
#include <winsock2.h>

DWORD WSAWaitForMultipleEvents(DWORD cEvents, const WSAEVENT * lphEvents, BOOL fWaitAll, DWORD dwTimeout, BOOL fAlertable);
```

`cEvents`：需要检测的事件对象的个数

`lphEvents`：存有事件对象句柄的数组

`fWaitAll`：传递 TRUE时，所有事件对象在 signaled 状态时返回，传递 FALSE 时，只要其中一个变为 signaled 状态就返回。

`dwTimeout`：阻塞 `dwTimeout` 毫秒，传递 WSA_INFINITE 时阻塞到事件完成

`fAlertable`：传递 TRUE 时进入 alertable wait 状态

返回值：返回值减去常量 `WSA_WAIT_EVENT_0` 可以得到转变为 signaled 状态的事件对象句柄对应的索引，该索引可以用来在第二个参数中查找句柄。如果有多个事件对象变为 signaled 状态，则会得到其中较小的值。超时则返回 WAIT_TIMEOUT。

该函数最多可以传递 64 个事件对象，如果需要监视更多句柄，就只能创建线程或者扩展保存句柄的数组，并多次调用上述函数。

由于该函数每次只能返回一个索引，如果需要找到所有转为 signaled 状态的事件对象句柄的信息需要用到 `for` 循环。

```c
int posInfo, startIdx, i;
posInfo = WSAWaitForMultipleEvents(numOfSock, hEventArray, FALSE, WSA_INFINITE, FALSE);
startIdx = posInfo - WSA_WAIT_EVENT_0;
for (i = startIdx; i < numOfSock; ++ i) {
	int sigEventIdx = WSAWaitForMultipleEvents(1, &hEventArray[i], TRUE, 0, FALSE);
}
```

> `WSAWaitForMultipleEvents` 会把 `Auto-Reset Event` 从 `signaled` 变为 `non-signaled`。所以使用 `for`  循环应注意使用 `manual-Reset Event`。

**区分事件类型**

通过 `WSAWaitForMultipleEvents` 可以得到转为 `signaled` 状态的事件对象，然后就需要确定相应对象进入  `signaled` 状态的原因。

```c
#include <winsock2.h>

typedef struct _WSANETWORKEVENTS {
    long lNetworkEvents;
    int iErrorCode[FD_MAX_EVENTS];
} WSANETWORKEVENTS, * LPWSANETWORKEVENTS;

int WSAEnumNetworkEvents(SOCKET s, WSAEVENT hEventObject, LPWSANETWORKEVENTS lpNetworkEvents);

WSANETWORKEVENTS netEvents;

WSAEnumNetworkEvents(hSock, hEvent, &netEvents);
if (netEvents.lNetworkEvents & FD_ACCEPT) {
    // 处理
}
if (netEvents.lNetworkEvents & FD_READ) {
    // 处理
}
if (netEvents.lNetworkEvents & FD_CLOSE) {
    // 处理
}
```

`s`：发生时间的套接字

`hEventObject`：与套接字相连的（由`WSAEventSelect` 函数调用引发的） `signaled` 状态的事件对象句柄。

`lpNetworkEvents`：保存发生的事件类型信息和错误信息的 `WSANETWORKEVENTS` 结构体变量地址值。

返回值：成功返回 0，失败返回 SOCKET_ERROR。

如果发生 `FD_XXX` 相关错误，可以在 `iErrorCode[FD_XXX_BIT]` 中保存除 0 之外的其他值。

**检测错误**

```C
WSANETWORKEVENTS netEvents;
...
WSAEnumNetworkEvents(hSock, hEvent, &netEvents);
...
if (netEvents.iErrorCode[FD_READ_BIT] != 0) {
    // 处理
}
```

### 二、代码示例

使用异步通知 IO 实现回声服务器

```c
#include <stdio.h>
#include <string.h>
#include <winsock2.h>

#define BUF_SIZE 100

void CompressSockets(SOCKET hSockArr[], int idx, int total);
void CompressEvents(WSAEVENT hEventArr[], int idx, int total);
void ErrorHandling(char *msg);

int main(int argc, char *argv[])
{
	WSADATA wsaData;
	SOCKET hServSock, hClntSock;
	SOCKADDR_IN servAdr, clntAdr;

	SOCKET hSockArr[WSA_MAXIMUM_WAIT_EVENTS]; 
	WSAEVENT hEventArr[WSA_MAXIMUM_WAIT_EVENTS];
	WSAEVENT newEvent;
	WSANETWORKEVENTS netEvents;

	int numOfClntSock=0;
	int strLen, i;
	int posInfo, startIdx;
	int clntAdrLen;
	char msg[BUF_SIZE];
	
	if(argc!=2) {
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}
	if(WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
		ErrorHandling("WSAStartup() error!");

	hServSock=socket(PF_INET, SOCK_STREAM, 0);
	memset(&servAdr, 0, sizeof(servAdr));
	servAdr.sin_family=AF_INET;
	servAdr.sin_addr.s_addr=htonl(INADDR_ANY);
	servAdr.sin_port=htons(atoi(argv[1]));

	if(bind(hServSock, (SOCKADDR*) &servAdr, sizeof(servAdr))==SOCKET_ERROR)
		ErrorHandling("bind() error");

	if(listen(hServSock, 5)==SOCKET_ERROR)
		ErrorHandling("listen() error");

	newEvent=WSACreateEvent();
	if(WSAEventSelect(hServSock, newEvent, FD_ACCEPT)==SOCKET_ERROR)
		ErrorHandling("WSAEventSelect() error");

	hSockArr[numOfClntSock]=hServSock;
	hEventArr[numOfClntSock]=newEvent;
	numOfClntSock++;

	while(1)
	{
		posInfo=WSAWaitForMultipleEvents(
			numOfClntSock, hEventArr, FALSE, WSA_INFINITE, FALSE);
		startIdx=posInfo-WSA_WAIT_EVENT_0;

		for(i=startIdx; i<numOfClntSock; i++)
		{
			int sigEventIdx = WSAWaitForMultipleEvents(1, &hEventArr[i], TRUE, 0, FALSE);
			if((sigEventIdx == WSA_WAIT_FAILED || sigEventIdx == WSA_WAIT_TIMEOUT))
			{
				continue;
			}
			else
			{
				sigEventIdx = i;
				WSAEnumNetworkEvents(hSockArr[sigEventIdx], hEventArr[sigEventIdx], &netEvents);
				if(netEvents.lNetworkEvents & FD_ACCEPT)
				{
					if(netEvents.iErrorCode[FD_ACCEPT_BIT] != 0)
					{
						puts("Accept Error");
						break;
					}
					clntAdrLen=sizeof(clntAdr);
					hClntSock=accept(hSockArr[sigEventIdx], (SOCKADDR*)&clntAdr, &clntAdrLen);
					newEvent=WSACreateEvent();
					WSAEventSelect(hClntSock, newEvent, FD_READ|FD_CLOSE);

					hEventArr[numOfClntSock]=newEvent;
					hSockArr[numOfClntSock]=hClntSock;
					numOfClntSock++;
					puts("connected new client...");
				}

				if(netEvents.lNetworkEvents & FD_READ)
				{
					if(netEvents.iErrorCode[FD_READ_BIT]!=0)
					{
						puts("Read Error");
						break;
					}
					strLen=recv(hSockArr[sigEventIdx], msg, sizeof(msg), 0);
					send(hSockArr[sigEventIdx], msg, strLen, 0);
				}

				if(netEvents.lNetworkEvents & FD_CLOSE)
				{
					if(netEvents.iErrorCode[FD_CLOSE_BIT]!=0)	
					{
						puts("Close Error");
						break;
					}
					WSACloseEvent(hEventArr[sigEventIdx]);
					closesocket(hSockArr[sigEventIdx]);
					
					numOfClntSock--;
					CompressSockets(hSockArr, sigEventIdx, numOfClntSock);
					CompressEvents(hEventArr, sigEventIdx, numOfClntSock);
				}
			}
		}
	}
	WSACleanup();
	return 0;
}

void CompressSockets(SOCKET hSockArr[], int idx, int total)
{
	int i;
	for(i=idx; i<total; i++)
		hSockArr[i]=hSockArr[i+1];
}
void CompressEvents(WSAEVENT hEventArr[], int idx, int total)
{
	int i;
	for(i=idx; i<total; i++)
		hEventArr[i]=hEventArr[i+1];
}
void ErrorHandling(char *msg)
{	
	fputs(msg, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>

#define BUF_SIZE 1024
void ErrorHandling(char *message);

int main(int argc, char *argv[])
{
	WSADATA wsaData;
	SOCKET hSocket;
	char message[BUF_SIZE];
	int strLen;
	SOCKADDR_IN servAdr;

	if(argc!=3) {
		printf("Usage : %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	if(WSAStartup(MAKEWORD(2, 2), &wsaData)!=0)
		ErrorHandling("WSAStartup() error!"); 

	hSocket=socket(PF_INET, SOCK_STREAM, 0);   
	if(hSocket==INVALID_SOCKET)
		ErrorHandling("socket() error");
	
	memset(&servAdr, 0, sizeof(servAdr));
	servAdr.sin_family=AF_INET;
	servAdr.sin_addr.s_addr=inet_addr(argv[1]);
	servAdr.sin_port=htons(atoi(argv[2]));
	
	if(connect(hSocket, (SOCKADDR*)&servAdr, sizeof(servAdr))==SOCKET_ERROR)
		ErrorHandling("connect() error!");
	else
		puts("Connected...........");
	
	while(1) 
	{
		fputs("Input message(Q to quit): ", stdout);
		fgets(message, BUF_SIZE, stdin);
		
		if(!strcmp(message,"q\n") || !strcmp(message,"Q\n"))
			break;

		send(hSocket, message, strlen(message), 0);
		strLen=recv(hSocket, message, BUF_SIZE-1, 0);
		message[strLen]=0;
		printf("Message from server: %s", message);
	}
	
	closesocket(hSocket);
	WSACleanup();
	return 0;
}

void ErrorHandling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

