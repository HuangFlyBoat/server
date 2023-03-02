# ChatOL 后端

前端地址：https://github.com/HuangFlyBoat/chatOL-front

## WebSoket 实现即时通讯

```js
// 将所有在线用户存入map中
global.onlineUsers = new Map();
// 首先只要有连接就会有聊天，将socket存入全局中
io.on('connection', (socket) => {
  global.chatSocket = socket;
  // 只要用户登录就会触发add-user，获取用户的id和当前的socket id
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  // 当用户发送消息时候
  socket.on('send-msg', (data) => {
    // 在map中获取发送目标对象
    const sendUserSocket = onlineUsers.get(data.to);
    // 如果用户在线则推送消息
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.message);
    }
  });
});
```

## Moogodb 数据库设计

简单的实现用户登录注册和消息获取

```js
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: '',
  },
});
```

```js
const messageSchema = new mongoose.Schema(
  {
    message: {
      text: {
        type: String,
        required: true,
      },
    },
    // users是一个数组[from,to]，分别存放着发送人的Id和接收者的Id
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
```
