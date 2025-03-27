---
layout:       post
title:        "Windows 下的重叠 IO"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
    - 网络编程
    - Windows
---

### 一、引言

同一个线程内部向多个目标发送（或者从多个目标接收）数据引起的 IO 重叠现象称为“重叠 IO”。为了完成这项任务，调用的 IO 函数应立即返回，只有这样才能发送后续数据。

![Snipaste_2025-03-27_15-25-32](\img\in-post\Snipaste_2025-03-27_15-25-32.png)

该功能可以实现类似于 Linux 下的分散读写。

### 二、重叠 IO 使用

**创建重叠 IO 套接字**

使用重叠 IO 需要创建适用于重叠 IO 的套接字，通过如下函数完成：

```c
#include <winsock2.h>

SOCKET WSASocket(int af, int type, int protocol, LPWSAPROTOCOL_INFO lpProtocolInfo, GROUP g, DWORD dwFlags);
```

`af`：协议族信息

`type`：套接字数据传输方式

`protocol`：用来最终决定使用的协议，一般传入 0，只有出现 “同一个协议族中存在多个数据传输方式相同的不同协议”时才需要使用。

`lpProtocolInfo`：保存发生的事件类型信息和错误信息的 `WSANETWORKEVENTS` 结构体变量地址值，不需要时传递 NULL。

`g`：为扩展函数而保留的参数，可以使用 0.

`dwFlags`：套接字述性信息，可以传递 WSA_FLAG_OVERLAPPED 用来赋予创建出的套接字重叠 IO 的特性。

**执行重叠 IO 发送**

创建出具有重叠 IO 属性的套接字之后，接下来两个套接字（服务端和客户端之间的）连接过程与一般的套接字连接过程相同，但传输数据时使用的函数不同。

发送数据函数：

```c
#include <winsock2.h>
typedef void *HANDLE;
typedef HANDLE WSAEVENT;
typedef struct __WSABUF {
    u_long len;		//待传输数据大小
    char FAR * buf;	//缓冲
} WSABUF, *LPWSABUF;

// Internal、InernalHigh 成员时进行重叠 IO 时操作系统内部使用的成员，Offset、OffsetHigh同样属于具有特殊用途的成员，使用该结构体只需要关注 hEvent 成员，
typedef struct _WSAOVERLAPPED{
    DWORD Internal;
    DWORD InternalHigh;
    DWORD Offset;
    DWORD OffsetHigh;
    WSAEVENT hEvent;
} WSAOVERLAPPED, * LPWSAOVERLAPPED;

int WSASend(SOCKET s, LPWSABUF lpBuffers, DWORD dwBufferCount, LPDWORD lpNumberOfBytesSent, DWORD dwFlags, LPWSAOVERLAPPED lpOverlapped, LPWSAOVERLAPPED_COMPLETION_ROUTINE lpCompletionRoutine);
```

`s`：套接字句柄，如果 `s` 具有重叠 IO 属性的套接字句柄则以重叠 IO 模型输出

`lpBuffers`：WSABUF 结构体变量数组的地址值，存有待发送数据

`dwBufferCount`：WSABUF 数组的长度

`lpNumberOfBytesSent`：传出参数，用于保存实际发送的字节数，在**同步模式**下（未使用重叠I/O），该参数需有效指针以返回结果；在**异步模式**下（使用 `lpOverlapped`），因未完成操作导致错误结果然后判断错误结果来确认传输是否完成；也可以设为 `NULL`，这样就不会返回错误结果

`dwFlags`：更改数据传输特性，`MSG_OOB`：发送带外数据，`MSG_DONTROUTE`：绕过路由表直接发送

`lpOverlapped`：指向重叠I/O操作的结构体，用于异步发送。

`lpCompletionRoutine`：异步操作完成时触发的回调函数。若未使用回调机制，应设为 `NULL`。

返回值：成功返回 0，失败返回 `SOCKET_ERROR`

**示例代码**

```c
WSAEVENT event;
WSAOVERLAPPED overlapped;
WSABUF dataBuf;
char buf[BUF_SIZE] = {"DATA"};
int recvBytes = 0;
...
event = WSACreateEvent();
memset(&overlapped, 0, sizeof(overlapped));
overlapped.hEvent = event;
dataBuf.len = sizeof(buf);
dataBuf.buf = buf;
WSASend(hSocket, &dataBuf, 1, &recvBytes, 0, &overlapped, NULL);
...
```

**`lpNumberOfBytesSent` 参数**

`WSASend` 函数调用会立即返回，如果发送的数据小时，函数调用后可以立即完成数据传输，此时函数返回 0，`lpNumberOfBytesSent` 会保存实际发送的数据大小。如果该函数返回后仍需要发送数据时，将返回`SOCKET_ERROR` 并将 `WSA_IO_PENDING` 注册为错误代码然后可以通过 `WSAGetLastError` 函数得到。这时可以通过下列函数获取实际传输的数据大小。

```c
#include <winsock2.h>

BOOL WSAGetOverlappedResult(SOCKET s, LPWSAOVERLAPPED lpOverlapped, LPDWORD lpcbTransfer, BOOL fWait, LPDWORD lpdwFlags);
```

`s`：进行重叠 IO 的套接字句柄

`lpOverlapped`：进行重叠 IO 时传递的 WSAOVERLAPPED 结构体变量的地址值

`lpcbTransfer`：用于保存实际传输的字节数的变量地址值

`fWait`：如果调用该函数时仍在进行传输，fWait 为 TRUE 时等待 IO 完成，为FALSE 时则返回 FALSE 并跳出函数

`lpdwFlags`：调用 WSARecv 函数时，用于获取附加信息（例如 OOB 消息）。如果不需要可以传递 NULL。

**执行重叠 IO 接收**

```c
#include <winsock2.h>

int WSARecv(SOCKET s, LPWSABUF lpBuffers, DWORD dwBfuuerCount, LPDWORD lpNumberOfBytesRecvd, LPDWORD lpFlags, LPWSAOVERLAPPED lpOverlapped, LPWSAOVERLAPPED_COMPLETION_ROUTINE lpCompletionRoutine);
```

`s`：套接字句柄，如果 `s` 具有重叠 IO 属性的套接字句柄则以重叠 IO 模型输出

`lpBuffers`：WSABUF 结构体变量数组的地址值，用来保存待接收的数据

`dwBufferCount`：WSABUF 数组的长度

`lpNumberOfBytesRecvd`：传出参数，若操作**立即完成**，返回实际接收的字节数；若为**异步操作**（`lpOverlapped` 非空），应设为 `NULL` 以避免错误结果

`lpFlags`：控制接收行为的标志位，例如：`MSG_PUSH_IMMEDIATE`：立即推送数据；`MSG_PARTIAL`：允许部分接收（面向消息的协议）

`lpOverlapped`：指向重叠 I/O 结构的指针，用于异步操作。若套接字未启用重叠模式（非异步），此参数被忽略

`lpCompletionRoutine`：异步操作完成时调用的回调函数。仅在重叠 I/O 模式下有效，非异步操作需设为 `NULL`。

返回值：成功返回 0，失败返回 `SOCKET_ERROR`

### 三、重叠 IO 的完成确认

重叠 IO 有两种方法确认 IO 的完成并获取结果。

- 利用 `WSASend`、`WSARecv` 函数的第六个参数，基于事件对象。
- 利用 `WSASend`、`WSARecv` 函数的第七个参数，基于 Completion Routine。

#### 使用事件对象

当完成 IO 时，`WSAOVERLAPPED` 结构体变量引用的事件对象将变为 `signaled` 状态。为了验证 IO 的完成和结果，需要调用 `WSAGetOverlappedResult` 函数。

```c
#include <winsock2.h>

BOOL WSAAPI WSAGetOverlappedResult(
  SOCKET          s,                // 套接字句柄
  LPWSAOVERLAPPED lpOverlapped,     // 指向重叠结构的指针
  LPDWORD         lpcbTransfer,     // 实际传输字节数的指针
  BOOL            fWait,            // 是否等待操作完成标志
  LPDWORD         lpdwFlags         // 附加状态标志的指针
);

int WSAGetLastError(void);			// 返回错误代码，表示错误原因
```

`s`：套接字句柄

`lpOverlapped`：指向重叠结构的指针，其中有一个事件成员需要传入一个事件对象

`lpcbTransfer`：传出参数，接收实际传输的字节数，不可为 NULL

`fWait`：如果调用该函数时仍在进行传输，fWait 为 TRUE 时等待 IO 完成，为FALSE 时则返回 FALSE 并跳出函数

`lpdwFlags`：传出参数，接收操作完成时的附加状态标志

**示例**

发送

```c
WSABUF dataBuf;
WSAEVENT evObj;
WSAOVERLAPPED overlapped;
...
evObj = WSACreateEvent();
memset(&overlapped, 0, sizeof(overlapped));
overlapped.hEvent = evObj;
dataBuf.len = strlen(msg) + 1;
dataBuf.buf = msg;
if (WSASend(hSocket, &dataBuf, 1, &sendBytes, 0, &overlapped, NULL) == SOCKET_ERROR) {
	if (WSAGetLastError() == WSA_IO_PENDING) {	// 判断是 WSASend 函数错误
		puts("Background data send");
		WSAWaitForMultipleEvents(1, &evObj, TRUE, WSA_INFINTE, FALSE);
		WSAGetOverlappedResult(hSocket, &overlapped, &sendBytes, FALSE, NULL);
	} else {
        ErrorHandling("WSARecv() error");
    }
}
printf("Send data size: %d \n", sendBytes);
WSACloseEvent(evObj);
closesocket(hSocket);
WSACleanup();
```

接收

```c
WSABUF dataBuf;
WSAEVENT evObj;
WSAOVERLAPPED overlapped;
char buf[BUF_SIZE];
...
evObj = WSACreateEvent();
memset(&overlapped, 0, sizeof(overlapped));
overlapped.hEvent = evObj;
dataBuf.len = BUF_SIZE;
dataBuf.buf = buf;
int flag;
if (WSARecv(hSocket, &dataBuf, 1, &sendBytes, &flag, &overlapped, NULL) == SOCKET_ERROR) {
	if (WSAGetLastError() == WSA_IO_PENDING) {	// 判断是 WSASend 函数错误
		puts("Background data recv");
		WSAWaitForMultipleEvents(1, &evObj, TRUE, WSA_INFINTE, FALSE);
		WSAGetOverlappedResult(hSocket, &overlapped, &sendBytes, FALSE, NULL);
	} else {
        ErrorHandling("WSARecv() error");
    }
}
printf("Received messages: %s \n", buf);
WSACloseEvent(evObj);
closesocket(hSocket);
WSACleanup();
```

#### 使用 Completion Routine 函数

Completion Routine 函数（简称 CR）类似回调函数，当传输完成时会调用此函数，并且进行传输的线程必须处于 `alertable wait` 状态才可以调用 CR 函数。`alertable wait` 状态是等待接收操作系统消息的线程状态。

```c
WSABUF dataBuf;
WSAEVENT evObj;
WSAOVERLAPPED overlapped;
char buf[BUF_SIZE];
...
evObj = WSACreateEvent();
memset(&overlapped, 0, sizeof(overlapped));
overlapped.hEvent = evObj;
dataBuf.len = BUF_SIZE;
dataBuf.buf = buf;
int flag;
if (WSARecv(hSocket, &dataBuf, 1, &sendBytes, &flag, &overlapped, CompRoutine) == SOCKET_ERROR) {
	if (WSAGetLastError() == WSA_IO_PENDING) {	// 判断是 WSASend 函数错误
		puts("Background data recv");
	}
}
// WSAWaitForMultipleEvents 函数最后一个参数传入 TRUE　线程进入　alertable wait　状态。
int idx = WSAWaitForMultipleEvents(1, &evObj, FALSE, WSA_INFINTE, TRUE);
if (idx == WAIT_IO_COMPLETION) {
    puts("Overlapped IO Completedd");
} else {
    ErrorHandling("WSARecv() error");
}
WSACloseEvent(evObj);
closesocket(hSocket);
WSACleanup();
```

