---
layout:       post
title:        "Cookie, Session, Token简单总结"
author:       "KalosAner"
header-style: text
catalog:      true
tags:
    - 后端
---

### Cookie

Cookie 是一种小型文本文件，保存在客户端的浏览器中，每个 Cookie 的大小一般不超过 **4KB**。每个 Cookie 可以设置 **过期时间**，过期后 Cookie 将被删除。一个 Cookie 包含：Name, Value, Domain, Path, Expires/Max-Age, Size, HttpOnly, Secure, SameSite, Partion Key Site, Cross Site, Priority。

- **名称 (Name)** 和 **值 (Value)**：存储的实际内容。

- **过期时间 (Expires/Max-Age)**：决定 Cookie 的生命周期。

- **作用域 (Path 和 Domain)**：控制 Cookie 的有效路径和域，`Path=/`：表示整个网站都可以访问该 Cookie。

- **安全标志 (Secure 和 HttpOnly)**：

  - `Secure`：只有在 HTTPS 下传输。

  - `HttpOnly`：禁止 JavaScript 访问，防止 XSS 攻击。

下面四个是不太常用的：

- **SameSite (同站属性)**：控制 Cookie 在跨站请求中是否会被发送，主要用于防范 **跨站请求伪造（CSRF）** 攻击。
- **Partitioned Key Site(分区 Key Cookie)**：是浏览器在隐私保护政策下引入的一种机制，用于限制第三方 Cookie 的跨站共享。
- **Cross-Site(跨站请求)**：指 Cookie 在不同域名之间的传输行为，例如从站点 `A.com` 发起请求到站点 `B.com`，这被视为跨站请求。
- **Priority(Cookie 优先级)**：用于指定 Cookie 的重要程度，浏览器在面对内存压力或存储空间不足时，会根据优先级删除低优先级的 Cookie。

### Session

服务器会为一个客户端的每次会话生成一个 Session 存放在服务器（可以存放在服务器的数据库中），Session 主要包括的内容可能有（主要有服务器决定）：

1. **Session ID**：唯一标识符。
2. **用户身份信息**：如用户 ID 和登录状态。
3. **用户个性化数据**：如偏好设置。
4. **临时状态数据**：如购物车数据。
5. **访问控制信息**：如角色和权限。
6. **会话超时与过期信息**：确保 Session 生命周期安全。
7. **安全校验数据**：防止篡改和攻击。
8. **其他业务数据**：根据具体应用场景而定。

服务器会把 Session ID 发送给客户端存放在客户端的 Cookie 并设置**过期时间**，Session ID 是一个字符串，生成规则一般由服务器决定，每个会话的 Session ID 都是唯一的，以避免会话冲突。

**工作原理：**

1. 用户首次访问时，服务器生成一个唯一的 Session ID 并存储在服务器。
2. 服务器将 Session ID 发送给客户端，通常通过 Cookie 传输。
3. 客户端后续的请求都会携带该 Session ID。
4. 服务器根据 Session ID 找到对应的 Session 数据，从而识别用户身份。

Python 代码示例：

```python
from flask import Flask, session, request, jsonify, redirect, url_for
from datetime import timedelta

app = Flask(__name__)
app.secret_key = "secret_key_for_session"  # 用于加密 Session 数据
app.permanent_session_lifetime = timedelta(minutes=30)  # 设置 Session 过期时间为30分钟

@app.route('/')
def home():
    if "username" in session:
        return f"Welcome back, {session['username']}!"
    return "Hello! Please log in"

@app.route('/login', methods=['POST'])
def login():
    # 模拟用户登录，获取用户名
    username = request.form.get('username')
    if username:
        session['username'] = username  # 将用户名存储到 Session 中
        session.permanent = True  # 激活 Session 过期时间
        return jsonify({"message": f"Hello, {username}. You are logged in!"})
    return jsonify({"error": "Username is required"}), 400

@app.route('/logout')
def logout():
    # 删除 Session 数据
    session.pop('username', None)
    return jsonify({"message": "You have been logged out."})

@app.route('/profile')
def profile():
    # 读取 Session 数据
    if 'username' in session:
        username = session['username']
        return jsonify({"message": f"Welcome, {username}. This is your profile."})
    return jsonify({"error": "You are not logged in."}), 401

if __name__ == '__main__':
    app.run(debug=True)
```

### Token

Token 是一种身份验证机制，通常基于加密签名生成的字符串。常用的 Token 形式包括 JWT（JSON Web Token）。

一个标准的 JWT 包含三部分：

1. **Header**（头部）：Token 类型和签名算法。
2. **Payload**（负载）：包含用户身份信息和自定义字段。
3. **Signature**（签名）：对 Header 和 Payload 进行加密签名。

例如：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYifQ.4Q6wA9fx...`。

**工作原理：**

1. 用户登录时，服务器验证用户信息，并生成 Token 返回给客户端。
2. 客户端将 Token 保存在本地，后续请求时将 Token 放入 HTTP Header。
3. 服务器验证 Token 的合法性（验证签名和过期时间），通过后返回响应。

```python
import jwt
import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)
SECRET_KEY = "secret_key_for_token"  # 用于加密和解密 Token

# 生成 Token
def generate_token(username):
    payload = {
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # 过期时间
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

# 验证 Token
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token 过期
    except jwt.InvalidTokenError:
        return None  # Token 无效

@app.route('/login', methods=['POST'])
def login():
    # 模拟用户登录
    username = request.form.get('username')
    if username:
        token = generate_token(username)
        return jsonify({"message": "Login successful", "token": token})
    return jsonify({"error": "Username is required"}), 400

@app.route('/profile')
def profile():
    # 从请求头获取 Token
    token = request.headers.get('Authorization')
    if token:
        token = token.split("Bearer ")[-1]  # 提取 Token 部分
        payload = verify_token(token)
        if payload:
            username = payload['username']
            return jsonify({"message": f"Welcome, {username}. This is your profile."})
        return jsonify({"error": "Invalid or expired token."}), 401
    return jsonify({"error": "Token is required."}), 401

@app.route('/logout')
def logout():
    # 由于 Token 是无状态的，不需要存储，无法强制失效
    return jsonify({"message": "Token invalidation is client-side. Simply discard it."})

if __name__ == '__main__':
    app.run(debug=True)
```

