const messageModel = require("../model/messageModel")

module.exports.addMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body
        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: from
        })
        if (data) return res.json({ mag: "消息发送成功" })
        else return res.json({ mag: "消息发送失败" })
    } catch (ex) {
        next(ex)
    }
}
module.exports.getAllMessage = async (req, res, next) => {
    try {
        const { from, to } = req.body
        // 查找所有消息，包含我和对方会话的
        const messages = await messageModel.find({
            users: {
                $all: [from, to],
            }
        }).sort({ updatedAt: 1 })
        // 对会话来源进行标记，方便后面样式处理自己和对方的消息
        const projectMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text
            }
        })
        res.json(projectMessages)
    } catch (ex) {
        next(ex)
    }
}