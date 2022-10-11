const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const jsonwebtoken = require("jsonwebtoken");

module.exports.createGroupRoom = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { chatType, groupName, salesId } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let receiverIds = []
            let s2 = dbScript(db_sql['Q138'], { var1: salesId })
            let salesDetails = await connection.query(s2)
            receiverIds.push(salesDetails.rows[0].closer_id)

            let s3 = dbScript(db_sql['Q139'], { var1: salesId })
            let supporters = await connection.query(s3)
            for (let supporterData of supporters.rows) {
                receiverIds.push(supporterData.supporter_id)
            }

            let s4 = dbScript(db_sql['Q140'], { var1: salesId, var2: chatType })
            let findRoom = await connection.query(s4)

            if (findRoom.rowCount == 0) {
                await connection.query('BEGIN')
                let id = uuid.v4()
                let s5 = dbScript(db_sql['Q129'], { var1: id, var2: '', var3: '', var4: chatType, var5: salesId })
                let createRoom = await connection.query(s5)
                if (createRoom.rowCount > 0) {
                    for (let i = 0; i < receiverIds.length; i++) {
                        let id = uuid.v4()
                        let s6 = dbScript(db_sql['Q133'], { var1: id, var2: createRoom.rows[0].id, var3: receiverIds[i], var4: groupName })
                        let addGroupMember = await connection.query(s6)
                    }
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Chat group created successfully",
                        data: {
                            roomId: createRoom.rows[0].id,
                            senderId: checkUser.rows[0].id,
                            senderName: groupName,
                            senderProfile: process.env.DEFAULT_GROUP_LOGO,
                            lastMessage: '',
                            messageDate: '',
                            receiverId: '',
                            chatType: chatType
                        }
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Chat group already innitiated ",
                    data: {
                        roomId: findRoom.rows[0].id,
                        senderId: findRoom.rows[0].sender_id,
                        senderName: groupName,
                        senderProfile: process.env.DEFAULT_GROUP_LOGO,
                        lastMessage: findRoom.rows[0].last_message,
                        messageDate: findRoom.rows[0].updated_at,
                        receiverId: '',
                        chatType: chatType
                    }
                })
            }

        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.createSingleRoom = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { receiverId, chatType } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let s2 = dbScript(db_sql['Q128'], { var1: checkUser.rows[0].id, var2: receiverId })
            let findRoom = await connection.query(s2)
            if (findRoom.rowCount == 0) {
                await connection.query('BEGIN')
                let id = uuid.v4()
                let s3 = dbScript(db_sql['Q129'], { var1: id, var2: checkUser.rows[0].id, var3: receiverId, var4: chatType, var5: '' })
                let createRoom = await connection.query(s3)
                if (createRoom.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Chat room initiated",
                        data: {
                            roomId: createRoom.rows[0].id,
                            senderId: checkUser.rows[0].id,
                            senderName: checkUser.rows[0].full_name,
                            senderProfile: checkUser.rows[0].avatar,
                            lastMessage: '',
                            messageDate: '',
                            receiverId: receiverId,
                            chatType: chatType
                        }
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            } else {
                let s4 = dbScript(db_sql['Q130'], { var1: findRoom.rows[0].id })
                let findChat = await connection.query(s4)
                if (findChat.rowCount > 0) {
                    let s5 = dbScript(db_sql['Q10'], { var1: findChat.rows[findChat.rows.length - 1].sender_id })
                    let findSender = await connection.query(s5)
                    res.json({
                        status: 200,
                        success: true,
                        message: "Chat already initiated",
                        data: {
                            roomId: findChat.rows[0].room_id,
                            senderId: findSender.rows[0].id,
                            senderName: findSender.rows[0].full_name,
                            senderProfile: findSender.rows[0].avatar,
                            lastMessage: findChat.rows[findChat.rows.length - 1].chat_message,
                            messageDate: findChat.rows[findChat.rows.length - 1].created_at,
                            receiverId: findRoom.rows[0].receiver_id,
                            chatType: findRoom.rows[0].chat_type
                        }
                    })
                } else {
                    if (findChat.rows.length == 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Chat already initiated",
                            data: {
                                roomId: findRoom.rows[0].id,
                                senderId: "",
                                senderName: "",
                                senderProfile: "",
                                lastMessage: "",
                                messageDate: "",
                                receiverId: "",
                                chatType: findRoom.rows[0].chat_type
                            }
                        })
                    } else {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something Went wrong"
                        })
                    }

                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

let verifyTokenFn = async (req) => {
    let token = req.headers.authorization
    let user = await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
        if (err) {
            return 0
        } else {
            var decoded = {
                id: decoded.id,
                email: decoded.email,
            };
            return decoded;
        }
    });
    return user
}

module.exports.sendMessage = async (req) => {
    try {
        let user = await verifyTokenFn(req)
        if (user) {
            let { chatType, roomId, chatMessage } = req.body;

            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkUser = await connection.query(s1)

            if (checkUser.rows.length > 0) {
                if (chatType == 'one to one') {

                    await connection.query('BEGIN')

                    let s2 = dbScript(db_sql['Q136'], { var1: roomId })
                    let findRoom = await connection.query(s2)

                    let id = uuid.v4()
                    let s3 = dbScript(db_sql['Q131'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: mysql_real_escape_string(chatMessage) })
                    let createMessage = await connection.query(s3)

                    let recieverId = (findRoom.rows[0].receiver_id == checkUser.rows[0].id) ? findRoom.rows[0].sender_id : findRoom.rows[0].receiver_id

                    let _dt = new Date().toISOString()
                    let s5 = dbScript(db_sql['Q132'], { var1: mysql_real_escape_string(chatMessage), var2: checkUser.rows[0].id, var3: recieverId, var4: _dt, var5: roomId })
                    let updateRoom = await connection.query(s5)

                    if (createMessage.rowCount > 0 && updateRoom.rowCount > 0) {
                        await connection.query('COMMIT')
                        return {
                            status: 200,
                            success: true,
                            message: "message sent",
                            data: {
                                roomId: roomId,
                                id: checkUser.rows[0].id,
                                name: checkUser.rows[0].full_name,
                                profile: checkUser.rows[0].avatar,
                                chatMessage: createMessage.rows[0].chat_message,
                                createdAt: createMessage.rows[0].created_at
                            }
                        }
                    } else {
                        await connection.query('ROLLBACK')
                        return {
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        }
                    }
                } else if (chatType == 'group') {
                    let s6 = dbScript(db_sql['Q137'], { var1: roomId })
                    let findGroup = await connection.query(s6)

                    if (findGroup.rowCount > 0) {
                        await connection.query('BEGIN')

                        let id = uuid.v4()
                        let s7 = dbScript(db_sql['Q131'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: mysql_real_escape_string(chatMessage) })
                        let createMessage = await connection.query(s7)

                        let _dt = new Date().toISOString()
                        let s8 = dbScript(db_sql['Q132'], { var1: mysql_real_escape_string(chatMessage), var2: checkUser.rows[0].id, var3: "", var4: _dt, var5: roomId })
                        let updateRoom = await connection.query(s8)

                        if (updateRoom.rowCount > 0 && createMessage.rowCount > 0) {
                            await connection.query('COMMIT')
                            return {
                                status: 200,
                                success: true,
                                message: "message sent",
                                data: {
                                    roomId: roomId,
                                    id: checkUser.rows[0].id,
                                    name: checkUser.rows[0].full_name,
                                    profile: checkUser.rows[0].avatar,
                                    chatMessage: createMessage.rows[0].chat_message,
                                    createdAt: createMessage.rows[0].created_at
                                }
                            }
                        } else {
                            await connection.query('ROLLBACK')
                            return {
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            }
                        }
                    } else {
                        return {
                            status: 200,
                            success: false,
                            message: "Group not found"
                        }
                    }
                }
            } else {
                return {
                    status: 400,
                    success: false,
                    message: "Admin not found",
                    data: ""
                }
            }
        } else {
            return {
                status: 401,
                success: false,
                message: "Token not found",
                data: ""
            }
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        return {
            status: 400,
            success: false,
            message: error.message,
        }
    }
}

module.exports.chatList = async (req) => {
    try {
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkUser = await connection.query(s1)
            if (checkUser.rows.length > 0) {
                let chatListArr = []
                let s4 = dbScript(db_sql['Q134'], { var1: checkUser.rows[0].id })
                let oneToOneChat = await connection.query(s4)

                for (let oneToOneData of oneToOneChat.rows) {
                    if (oneToOneData.receiver_id != '' && oneToOneData.chat_type == 'one to one') {

                        let s5 = dbScript(db_sql['Q10'], { var1: oneToOneData.sender_id })
                        let senderData = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q10'], { var1: oneToOneData.receiver_id })
                        let receiverData = await connection.query(s6)

                        chatListArr.push({
                            roomId: oneToOneData.id,
                            roomTitle: (receiverData.rowCount > 0) ? receiverData.rows[0].full_name : "",
                            roomProfile: (receiverData.rowCount > 0) ? receiverData.rows[0].avatar : process.env.DEFAULT_LOGO,
                            id: oneToOneData.sender_id,
                            name: (senderData.rowCount > 0) ? senderData.rows[0].full_name : "",
                            profile: (senderData.rowCount > 0) ? senderData.rows[0].avatar : process.env.DEFAULT_LOGO,
                            lastMessage: (oneToOneData.last_message == null) ? '' : oneToOneData.last_message,
                            messageDate: (oneToOneData.updated_at == null) ? '' : oneToOneData.updated_at,
                            chatType: oneToOneData.chat_type,
                            users: [
                                {
                                    id: oneToOneData.receiver_id,
                                    name: (receiverData.rowCount > 0) ? receiverData.rows[0].full_name : ""
                                }
                            ]
                        })
                    }
                }

                let s7 = dbScript(db_sql['Q135'], { var1: checkUser.rows[0].id })
                let groupChatMember = await connection.query(s7)
                let users = []
                for (let groupData of groupChatMember.rows) {
                    let s8 = dbScript(db_sql['Q141'], { var1: groupData.room_id })
                    let roomMembers = await connection.query(s8)
                    if (roomMembers.rowCount > 0) {
                        users.push({
                            id: (roomMembers.rowCount > 0) ? roomMembers.rows[0].user_id : "",
                            name: (roomMembers.rowCount > 0) ? roomMembers.rows[0].full_name : ""
                        })
                    }
                    let s9 = dbScript(db_sql['Q136'], { var1: groupData.room_id })
                    let groupChat = await connection.query(s9)
                    if (groupChat.rowCount > 0) {
                        if (groupChat.rows[0].sender_id != '') {
                            let s10 = dbScript(db_sql['Q10'], { var1: groupChat.rows[0].sender_id })
                            let senderData = await connection.query(s10)
                            chatListArr.push({
                                roomId: groupData.room_id,
                                roomTitle: groupData.group_name,
                                roomProfile: process.env.DEFAULT_GROUP_LOGO,
                                id: groupChat.rows[0].sender_id,
                                name: (senderData.rowCount > 0) ? senderData.rows[0].full_name : "",
                                profile: (senderData.rowCount > 0) ? senderData.rows[0].avatar : process.env.DEFAULT_LOGO,
                                lastMessage: (groupChat.rows[0].last_message == null) ? '' : groupChat.rows[0].last_message,
                                messageDate: (groupChat.rows[0].updated_at == null) ? '' : groupChat.rows[0].updated_at,
                                chatType: groupChat.rows[0].chat_type,
                                users: users
                            })
                        } else {
                            chatListArr.push({
                                roomId: groupData.room_id,
                                roomTitle: groupData.group_name,
                                roomProfile: process.env.DEFAULT_GROUP_LOGO,
                                id: "",
                                name: "",
                                profile: process.env.DEFAULT_LOGO,
                                lastMessage: "",
                                messageDate: "",
                                chatType: "group",
                                users: users
                            })
                        }
                    }
                }
                if (chatListArr.length > 0) {
                    chatListArr.sort(function (a, b) {
                        var keyA = new Date(a.messageDate),
                            keyB = new Date(b.messageDate);
                        // Compare the 2 dates
                        if (keyA < keyB) return 1;
                        if (keyA > keyB) return -1;
                        return 0;
                    })
                    return {
                        status: 200,
                        success: true,
                        message: "Chat list",
                        data: chatListArr
                    }
                } else {
                    return {
                        status: 200,
                        success: false,
                        message: "Empty chat list",
                        data: chatListArr
                    }
                }
            } else {
                return {
                    status: 400,
                    success: false,
                    message: "Admin not found",
                    data: ""
                }
            }
        } else {
            return {
                status: 401,
                success: false,
                message: "Token not found",
                data: ""
            }
        }
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: error.message
        }
    }
}

module.exports.chatHistory = async (req) => {
    try {
        let user = await verifyTokenFn(req)
        if (user) {
            let roomId = req.params.roomId
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkUser = await connection.query(s1)
            if (checkUser.rowCount > 0) {
                let chatHistoryArr = []
                let s2 = dbScript(db_sql['Q130'], { var1: roomId })
                let findHistory = await connection.query(s2)
                if (findHistory.rowCount > 0) {
                    for (historyData of findHistory.rows) {
                        let s3 = dbScript(db_sql['Q10'], { var1: historyData.sender_id })
                        let senderData = await connection.query(s3)
                        chatHistoryArr.push({
                            id: historyData.id,
                            roomId: historyData.room_id,
                            id: historyData.sender_id,
                            name: senderData.rows[0].full_name,
                            profile: senderData.rows[0].avatar,
                            chatMessage: historyData.chat_message,
                            createdAt: historyData.created_at
                        })
                    }
                    if (chatHistoryArr.length > 0) {
                        return {
                            status: 200,
                            success: true,
                            message: "Chat history",
                            data: chatHistoryArr
                        }
                    } else {
                        if (chatHistoryArr.length == 0) {
                            return {
                                status: 200,
                                success: false,
                                message: "Empty Chat history",
                                data: []
                            }
                        } else {
                            return {
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            }
                        }
                    }
                } else {
                    return {
                        status: 200,
                        success: false,
                        message: "Empty Chat history",
                        data: []
                    }
                }
            } else {
                return {
                    status: 400,
                    success: false,
                    message: "Admin not found",
                    data: ""
                }
            }
        } else {
            return {
                status: 401,
                success: false,
                message: "Token not found",
                data: ""
            }
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        return {
            status: 400,
            success: false,
            message: error.message,
        }
    }
}