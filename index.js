const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messagesRoute = require("./routes/messagesRoute")
const app = express()
const socket = require("socket.io")
require("dotenv").config()

app.use(cors())
app.use(express.json())

app.use("/api/auth", userRoutes)
app.use("/api/message", messagesRoute)

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connection Successful")
}).catch((r) => {
    console.log(r.message)
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Serve Started on Port ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: "http://192.168.43.71:3000",
        credentials: true,
    }
})

// 将所有在线用户存入map中
global.onlineUsers = new Map()
// 首先只要有连接就会有聊天，将socket存入全局中
io.on("connection", (socket) => {
    global.chatSocket = socket;
    // 只要用户登录就会触发add-user，获取用户的id和当前的socket id
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    })

    // 当用户发送消息时候
    socket.on("send-msg", (data) => {
        // 在map中获取发送目标对象
        const sendUserSocket = onlineUsers.get(data.to)
        // 如果用户在线则推送消息
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message)
        }
    })
})