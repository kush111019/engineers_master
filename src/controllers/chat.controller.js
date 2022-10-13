const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
// const { mysql_real_escape_string } = require('../utils/helper')
// const jsonwebtoken = require("jsonwebtoken");

module.exports.accessChat = async (req, res) => {
    try {
        const { userId } = req.body;
        let id = req.user.id
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            if (!userId) {
                console.log("UserId param not sent with request");
                return res.sendStatus(400);
            }
            let chatData = []
            let s1 = dbScript(db_sql['Q128'], { var1: id, var2: userId })
            let findChat = await connection.query(s1)

            if (findChat.rowCount > 0) {
                if (findChat.rows[0].last_message != null) {
                    let s2 = dbScript(db_sql['Q139'], { var1: findChat.rows[0].last_message })
                    let lastMessage = await connection.query(s2)
                    chatData.push({
                        lastMessage: {
                            messageId: lastMessage.rows[0].id,
                            sender: {
                                id: lastMessage.rows[0].sender_id,
                                name: lastMessage.rows[0].full_name,
                                avatar: lastMessage.rows[0].avatar
                            },
                            content: lastMessage.rows[0].content,
                            chatId: lastMessage.rows[0].chat_id,
                            readBy: lastMessage.rows[0].read_by,
                        },
                    })
                }
                let s3 = dbScript(db_sql['Q10'], { var1: findChat.rows[0].user_a })
                let userA = await connection.query(s3)

                let s4 = dbScript(db_sql['Q10'], { var1: findChat.rows[0].user_b })
                let userB = await connection.query(s4)

                chatData.push({
                    id: findChat.rows[0].id,
                    chatName: findChat.rows[0].chat_name,
                    isGroupChat: findChat.rows[0].is_group_chat,
                    groupAdmin: findChat.rows[0].group_admin,
                    users: [userA.rows[0], userB.rows[0]]
                })
                if (chatData.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "chat data",
                        data: chatData
                    });
                }
            }
            else {
                let chatId = uuid.v4()
                let chatName = "sender"
                let isGroupChat = false
                await connection.query('BEGIN')
                let s1 = dbScript(db_sql['Q137'], { var1: chatId, var2: chatName, var3: isGroupChat, var4: id, var5: userId, var6: '', var7 : '' })
                let createdChat = await connection.query(s1)
                if (createdChat.rowCount > 0) {

                    await connection.query('COMMIT')
                    let userData = []
                    let s3 = dbScript(db_sql['Q10'], { var1: createdChat.row[0].user_a })
                    let userA = await connection.query(s3)
                    userData.push(userA.rows[0])

                    let s4 = dbScript(db_sql['Q10'], { var1: createdChat.row[0].user_b })
                    let userB = await connection.query(s4)
                    userData.push(userB.rows[0])

                    createdChat.rows[0].users = userData

                    res.json({
                        status: 200,
                        success: true,
                        message: "chat initiated",
                        data: createdChat.rows
                    });
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    });
                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
    }

}

module.exports.fetchChats = async (req, res) => {
    try {
        let id = req.user.id
        let chatData = []
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {

            let s1 = dbScript(db_sql['Q138'], {})
            let chats = await connection.query(s1)
            if (chats.rowCount > 0) {
                for (let chatsData of chats.rows) {
                    if (chatsData.is_group_chat == false) {
                        let s2 = dbScript(db_sql['Q132'], { var1: id })
                        let findChat = await connection.query(s2)

                        for (let chat of findChat.rows) {
                            let s4 = dbScript(db_sql['Q10'], { var1:chat.user_a })
                            let userA = await connection.query(s4)

                            let s5 = dbScript(db_sql['Q10'], { var1:chat.user_b })
                            let userB = await connection.query(s5)
                            
                            if (chat.last_message != null) {
                                let s3 = dbScript(db_sql['Q139'], { var1: chat.last_message })
                                let lastMessage = await connection.query(s3) 
                                chatData.push({
                                    id: chat.id,
                                    chatName: chat.chat_name,
                                    isGroupChat: chat.is_group_chat,
                                    groupAdmin: chat.group_admin,
                                    users: [userA.rows[0], userB.rows[0]],
                                    lastMessage: {
                                        messageId: lastMessage.rows[0].id,
                                        sender: {
                                            id: lastMessage.rows[0].sender_id,
                                            name: lastMessage.rows[0].full_name,
                                            avatar: lastMessage.rows[0].avatar
                                        },
                                        content: lastMessage.rows[0].content,
                                        chatId: lastMessage.rows[0].chat_id,
                                        readBy: lastMessage.rows[0].read_by,
                                    },
                                })
                            }else{
                                chatData.push({
                                    id: chat.id,
                                    chatName: chat.chat_name,
                                    isGroupChat: chat.is_group_chat,
                                    groupAdmin: chat.group_admin,
                                    users: [userA.rows[0], userB.rows[0]],
                                    lastMessage: {
                                        messageId: "",
                                        sender: {
                                            id: "",
                                            name: "",
                                            avatar: ""
                                        },
                                        content: "",
                                        chatId: "",
                                        readBy: "",
                                    }
                                })
                            } 
                        }
                    } else if (chatsData.is_group_chat == true) {

                        let s7 = dbScript(db_sql['Q133'], { var1: chatsData.id })
                        let findGroupChat = await connection.query(s7)

                        let s8 = dbScript(db_sql['Q134'], { var1: chatsData.id })
                        let findGroupMembers = await connection.query(s8)
                        let userArr = []
                        for (let members of findGroupMembers.rows) {
                            let s9 = dbScript(db_sql['Q10'], { var1: members.user_id })
                            let users = await connection.query(s9)
                            userArr.push(users.rows[0])
                        }

                        if (chatsData.last_message != null) {
                            let s6 = dbScript(db_sql['Q139'], { var1: chatsData.last_message })
                            let lastMessage = await connection.query(s6)
                            chatData.push({
                                id: findGroupChat.rows[0].id,
                                chatName: findGroupChat.rows[0].chat_name,
                                isGroupChat: findGroupChat.rows[0].is_group_chat,
                                groupAdmin: findGroupChat.rows[0].group_admin,
                                users: userArr,
                                lastMessage: {
                                    messageId: lastMessage.rows[0].id,
                                    sender: {
                                        id: lastMessage.rows[0].sender_id,
                                        name: lastMessage.rows[0].full_name,
                                        avatar: lastMessage.rows[0].avatar
                                    },
                                    content: lastMessage.rows[0].content,
                                    chatId: lastMessage.rows[0].chat_id,
                                    readBy: lastMessage.rows[0].read_by,
                                },
                            })
                        }else{
                            chatData.push({
                                id: findGroupChat.rows[0].id,
                                chatName: findGroupChat.rows[0].chat_name,
                                isGroupChat: findGroupChat.rows[0].is_group_chat,
                                groupAdmin: findGroupChat.rows[0].group_admin,
                                users: userArr,
                                lastMessage: {
                                    messageId: "",
                                    sender: {
                                        id: "",
                                        name: "",
                                        avatar: ""
                                    },
                                    content: "",
                                    chatId: "",
                                    readBy: "",
                                }
                            })
                        }
                    }
                }
                if (chatData.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "chat data",
                        data: chatData
                    });
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty chat list",
                    data: chatData
                });
            }
    } else {
        res.json({
            status: 400,
            success: false,
            message: 'Admin not found'
        })
    }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.createGroupChat = async (req, res) => {
    try {
        let id = req.user.id
        let { name, salesId } = req.body
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q144'], {var1 : salesId})
            let findChat = await connection.query(s1)
            if (findChat.rowCount == 0) {
                let users = []
                let groupChatData = []
                let chatId = uuid.v4()
                let isGroupChat = true

                let s2 = dbScript(db_sql['Q135'], { var1: salesId })
                let salesDetails = await connection.query(s2)
                users.push(salesDetails.rows[0].closer_id)

                let s3 = dbScript(db_sql['Q136'], { var1: salesId })
                let supporters = await connection.query(s3)
                for (let supporterData of supporters.rows) {
                    users.push(supporterData.supporter_id)
                }

                let s4 = dbScript(db_sql['Q137'], { var1: chatId, var2: name, var3: isGroupChat, var4: '', var5: '', var6: id, var7: salesId })
                let createGroup = await connection.query(s4)

                let usersArr = []
                for (userId of users) {
                    await connection.query('BEGIN')
                    let memberId = uuid.v4()
                    let s5 = dbScript(db_sql['Q131'], { var1: memberId, var2: createGroup.rows[0].id, var3: userId, var4: name })
                    let createMembers = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q10'], { var1: userId })
                    let userDetails = await connection.query(s6)
                    usersArr.push(userDetails.rows[0])
                }

                groupChatData.push({
                    id: createGroup.rows[0].id,
                    chatName: createGroup.rows[0].chat_name,
                    isGroupChat: isGroupChat,
                    groupAdmin: checkAdmin.rows[0],
                    users: usersArr
                })

                if (groupChatData.length > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Group created",
                        data: groupChatData
                    });
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                    });
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Group already created",
                });
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.allMessages = async (req, res) => {
    try {
        let { chatId } = req.params
        let id = req.user.id
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let chatArr = []
            let s1 = dbScript(db_sql['Q133'], { var1: chatId })
            let chatDetails = await connection.query(s1)
            // chatObj = {
            //     id: chatDetails.rows[0].id,
            //     chatName: chatDetails.rows[0].chat_name,
            //     isGroupChat: chatDetails.rows[0].is_group_chat
            // }
            let s2 = dbScript(db_sql['Q143'], { var1: chatId })
            let chatMessage = await connection.query(s2)
            // let messagesArr = []
            for (messageData of chatMessage.rows) {
                chatArr.push({
                    sender : {
                        full_name : messageData.full_name,
                        id : messageData.senderid,
                        avatar : messageData.avatar
                    },
                    content : messageData.content,
                    id : chatDetails.rows[0].id,
                    chatName: chatDetails.rows[0].chat_name,
                    isGroupChat: chatDetails.rows[0].is_group_chat,
                    createdAt : messageData.created_at
                })
            }
            // chatObj.sender = messagesArr

            // if (chatDetails.rows[0].is_group_chat == true) {
            //     let s8 = dbScript(db_sql['Q134'], { var1: chatId })
            //     let findGroupMembers = await connection.query(s8)
            //     let userArr = []
            //     for (let members of findGroupMembers.rows) {
            //         let s9 = dbScript(db_sql['Q10'], { var1: members.user_id })
            //         let users = await connection.query(s9)
            //         userArr.push(users.rows[0])
            //     }
            //     chatObj.users = userArr
            // } else {
            //     userId = chatDetails.rows[0].user_a == id ? chatDetails.rows[0].user_b : chatDetails.rows[0].user_a
            //     let s9 = dbScript(db_sql['Q10'], { var1: userId })
            //     let users = await connection.query(s9)
            //     userArr.push(users.rows[0])
            //     chatObj.users = userArr
            // }
            if (chatArr.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Chat messages",
                    data: chatArr
                });
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty chat messages",
                    data: chatArr
                });
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.sendMessage = async (req, res) => {
    try {
        let { content, chatId } = req.body;
        let id = req.user.id
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            await connection.query('BEGIN')
            // let messageArr = []
            let messageId = uuid.v4()
            let s1 = dbScript(db_sql['Q129'], {var1 : messageId, var2: chatId, var3: id, var4: content})
            let message = await connection.query(s1)
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q130'], {var1 : message.rows[0].id, var2 : chatId, var3 : _dt})
            let updateLastMessage = await connection.query(s2)
            if(message.rowCount > 0 && updateLastMessage.rowCount > 0){
                await connection.query('COMMIT')
                let s3 = dbScript(db_sql['Q142'], {var1 : chatId})
                let messageDetails = await connection.query(s3)
                let messageObj = {}
                if(messageDetails.rowCount > 0){
                    let userArr = []
                    if (messageDetails.rows[0].is_group_chat == true) {
                        let s8 = dbScript(db_sql['Q134'], { var1: chatId })
                        let findGroupMembers = await connection.query(s8)
                        for (let members of findGroupMembers.rows) {
                            let s9 = dbScript(db_sql['Q10'], { var1: members.user_id })
                            let users = await connection.query(s9)
                            userArr.push(users.rows[0])
                        }
                    } else {
                        let s9 = dbScript(db_sql['Q10'], { var1: messageDetails.rows[0].user_a })
                        let usersA = await connection.query(s9)

                        let s10 = dbScript(db_sql['Q10'], { var1: messageDetails.rows[0].user_b })
                        let usersB = await connection.query(s10)
                        userArr = [usersA.rows[0],usersB.rows[0]]
                    }
                    messageObj = {
                        sender: {
                            id: messageDetails.rows[0].senderid,
                            full_name: messageDetails.rows[0].full_name,
                            avatar: messageDetails.rows[0].avatar
                        },
                        content: messageDetails.rows[0].content,
                        id: messageDetails.rows[0].messageid,
                        chatName : messageDetails.rows[0].chat_name,
                        isGroupChat : messageDetails.rows[0].is_group_chat,
                        createdAt : messageDetails.rows[0].created_at,
                        users : userArr
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Message sent",
                        data: messageObj
                    });
                }
            }else{
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong",
                });
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}