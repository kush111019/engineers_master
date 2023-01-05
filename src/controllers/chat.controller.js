const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')

module.exports.accessChat = async (req, res) => {
    try {
        const { userId } = req.body;
        let id = req.user.id
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            if (userId == id) {
                res.json({
                    status: 200,
                    success: false,
                    message: "Can not create chat with yourself",
                    data: ""
                });
            } else {
                let chatData = []
                let s1 = dbScript(db_sql['Q119'], { var1: id, var2: userId })
                let findChat = await connection.query(s1)
                if (findChat.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "chat already initiated",
                        data: {
                            id : findChat.rows[0].id
                        }
                    });
                }
                else {
                    let chatId = uuid.v4()
                    let chatName = "sender"
                    let isGroupChat = false
                    await connection.query('BEGIN')
                    let s1 = dbScript(db_sql['Q128'], { var1: chatId, var2: chatName, var3: isGroupChat, var4: id, var5: userId, var6: '', var7: '', var8: checkAdmin.rows[0].company_id })
                    let createdChat = await connection.query(s1)

                    if (createdChat.rowCount > 0) {
                        let s2 = dbScript(db_sql['Q144'], { var1 : createdChat.rows[0].user_a, var2 : createdChat.rows[0].user_b } )
                        let users = await connection.query(s2)
                        let userData = [users.rows[0], users.rows[1]]
                        let profile = (createdChat.rows[0].user_a == id) ? users.rows[1].avatar : users.rows[0].avatar

                        chatData = {
                            id: createdChat.rows[0].id,
                            chatName: createdChat.rows[0].chat_name,
                            isGroupChat: createdChat.rows[0].is_group_chat,
                            profile: profile,
                            groupAdmin: createdChat.rows[0].group_admin,
                            users: userData,
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
                            },
                        }

                        if (chatData) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 201,
                                success: true,
                                message: "chat initiated",
                                data: chatData
                            });
                        } else {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            });
                        }
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        });
                    }
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
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            if (checkAdmin.rows[0].is_main_admin == false) {
                let s1 = dbScript(db_sql['Q134'], { var1: id })
                let member = await connection.query(s1)
                if (member.rowCount > 0) {
                    for (let user of member.rows) {
                        let s2 = dbScript(db_sql['Q129'], { var1: user.room_id, var2: checkAdmin.rows[0].company_id, var3: true })
                        let chats = await connection.query(s2)

                        if (chats.rowCount > 0) {

                            let s3 = dbScript(db_sql['Q125'], { var1: chats.rows[0].id })
                            let findGroupMembers = await connection.query(s3)

                            if (chats.rows[0].last_message != null) {
                                let s4 = dbScript(db_sql['Q130'], { var1: chats.rows[0].last_message })
                                let lastMessage = await connection.query(s4)
                                chatData.push({
                                    id: chats.rows[0].id,
                                    chatName: chats.rows[0].chat_name,
                                    profile: process.env.DEFAULT_GROUP_LOGO,
                                    isGroupChat: chats.rows[0].is_group_chat,
                                    groupAdmin: chats.rows[0].group_admin,
                                    users: findGroupMembers.rows,
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
                            } else {
                                chatData.push({
                                    id: chats.rows[0].id,
                                    chatName: chats.rows[0].chat_name,
                                    profile: process.env.DEFAULT_GROUP_LOGO,
                                    isGroupChat: chats.rows[0].is_group_chat,
                                    groupAdmin: chats.rows[0].group_admin,
                                    users: findGroupMembers.rows,
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
                }

            } else {
                let s5 = dbScript(db_sql['Q188'], { var1: checkAdmin.rows[0].company_id })
                let groupChat = await connection.query(s5)
                if (groupChat.rowCount > 0) {
                    for (let gChat of groupChat.rows) {
                        let s6 = dbScript(db_sql['Q189'],{var1 : gChat.id})
                        let chatroom = await connection.query(s6)
                        let count = 0;
                        for(let item of chatroom.rows){
                            if(item.user_id == id){
                                count = 1;
                            }
                        }
                        if(count == 0){
                            let rId = uuid.v4()
                            let s7 = dbScript(db_sql['Q122'], {var1 : rId, var2 : gChat.id, var3 : id, var4 : gChat.chat_name})
                            let addAdminToGchat = await connection.query(s7)
                        }
                        let s8 = dbScript(db_sql['Q125'], { var1: gChat.id })
                        let chatMembers = await connection.query(s8)
                        if (gChat.last_message != null) {
                            let s9 = dbScript(db_sql['Q130'], { var1: gChat.last_message })
                            let lastMessage = await connection.query(s9)
                            chatData.push({
                                id: gChat.id,
                                chatName: gChat.chat_name,
                                profile: process.env.DEFAULT_GROUP_LOGO,
                                isGroupChat: gChat.is_group_chat,
                                groupAdmin: gChat.group_admin,
                                users: chatMembers.rows,
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
                        } else {
                            chatData.push({
                                id: gChat.id,
                                chatName: gChat.chat_name,
                                profile: process.env.DEFAULT_GROUP_LOGO,
                                isGroupChat: gChat.is_group_chat,
                                groupAdmin: gChat.group_admin,
                                users: chatMembers.rows,
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
            }
            let s10 = dbScript(db_sql['Q123'], { var1: id, var2: checkAdmin.rows[0].company_id, var3: false })
            let findChat = await connection.query(s10)
            if (findChat.rowCount > 0) {
                for (let chat of findChat.rows) {
                    let s11 = dbScript(db_sql['Q144'], { var1: chat.user_a, var2: chat.user_b })
                    let users = await connection.query(s11)
                    let profile = (chat.user_a == id) ? users.rows[1].avatar : users.rows[0].avatar

                    if (chat.last_message != null) {
                        let s12 = dbScript(db_sql['Q130'], { var1: chat.last_message })
                        let lastMessage = await connection.query(s12)
                        chatData.push({
                            id: chat.id,
                            chatName: chat.chat_name,
                            profile: profile,
                            isGroupChat: chat.is_group_chat,
                            groupAdmin: chat.group_admin,
                            users: [users.rows[0], users.rows[1]],
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
                    } else {
                        chatData.push({
                            id: chat.id,
                            chatName: chat.chat_name,
                            profile: profile,
                            isGroupChat: chat.is_group_chat,
                            groupAdmin: chat.group_admin,
                            users: [users.rows[0], users.rows[1]],
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
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty chat data ",
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
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q133'], { var1: salesId, var2: checkAdmin.rows[0].company_id })
            let findChat = await connection.query(s1)
            if (findChat.rowCount == 0) {
                let users = []
                let chatId = uuid.v4()
                let isGroupChat = true

                let s2 = dbScript(db_sql['Q126'], { var1: salesId })
                let salesDetails = await connection.query(s2)
                users.push(salesDetails.rows[0].closer_id)
                users.push(salesDetails.rows[0].creator_id)
                
                let s3 = dbScript(db_sql['Q127'], { var1: salesId })
                let supporters = await connection.query(s3)
                for (let supporterData of supporters.rows) {
                    users.push(supporterData.supporter_id)
                }

                if(users.includes(id) == false){
                    users.push(id)
                }
                
                let s4 = dbScript(db_sql['Q128'], { var1: chatId, var2: name, var3: isGroupChat, var4: '', var5: '', var6: id, var7: salesId, var8: checkAdmin.rows[0].company_id })
                let createGroup = await connection.query(s4)

                users = users.filter((item,
                    index) => users.indexOf(item) === index);

                let usersArr = []
                for (userId of users) {
                    await connection.query('BEGIN')
                    let memberId = uuid.v4()
                    let s5 = dbScript(db_sql['Q122'], { var1: memberId, var2: createGroup.rows[0].id, var3: userId, var4: name })
                    let createMembers = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q8'], { var1: userId })
                    let userDetails = await connection.query(s6)
                    usersArr.push(userDetails.rows[0])
                }

                let groupChatData = {
                    id: createGroup.rows[0].id,
                    chatName: createGroup.rows[0].chat_name,
                    profile: process.env.DEFAULT_GROUP_LOGO,
                    isGroupChat: isGroupChat,
                    groupAdmin: checkAdmin.rows[0],
                    users: usersArr
                }

                if (groupChatData) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
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
                    data: {
                        id : findChat.rows[0].id
                    }
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
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let chatArr = []
            let s1 = dbScript(db_sql['Q124'], { var1: chatId })
            let chatDetails = await connection.query(s1)

            let s2 = dbScript(db_sql['Q132'], { var1: chatId })
            let chatMessage = await connection.query(s2)
            for (messageData of chatMessage.rows) {
                chatArr.push({
                    sender: {
                        full_name: messageData.full_name,
                        id: messageData.senderid,
                        avatar: messageData.avatar
                    },
                    content: messageData.content,
                    id: chatDetails.rows[0].id,
                    chatName: chatDetails.rows[0].chat_name,
                    isGroupChat: chatDetails.rows[0].is_group_chat,
                    createdAt: messageData.created_at
                })
            }
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
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            await connection.query('BEGIN')
            let messageId = uuid.v4()
            let s1 = dbScript(db_sql['Q120'], { var1: messageId, var2: chatId, var3: id, var4: mysql_real_escape_string(content) })
            let message = await connection.query(s1)
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q121'], { var1: message.rows[0].id, var2: chatId, var3: _dt })
            let updateLastMessage = await connection.query(s2)
            if (message.rowCount > 0 && updateLastMessage.rowCount > 0) {
                await connection.query('COMMIT')
                let s3 = dbScript(db_sql['Q131'], { var1: chatId })
                let messageDetails = await connection.query(s3)
                let messageObj = {}
                if (messageDetails.rowCount > 0) {
                    let userArr = []
                    if (messageDetails.rows[0].is_group_chat == true) {
                        let s8 = dbScript(db_sql['Q125'], { var1: chatId })
                        let findGroupMembers = await connection.query(s8)
                        for (let members of findGroupMembers.rows) {
                            userArr.push(members)
                        }
                    } else {
                        let s2 = dbScript(db_sql['Q144'], { var1 : messageDetails.rows[0].user_a, var2 :messageDetails.rows[0].user_b } )
                        let users = await connection.query(s2)
                        userArr = [users.rows[0], users.rows[1]]
                    }
                    messageObj = {
                        sender: {
                            id: messageDetails.rows[0].senderid,
                            full_name: messageDetails.rows[0].full_name,
                            avatar: messageDetails.rows[0].avatar
                        },
                        content: messageDetails.rows[0].content,
                        id: messageDetails.rows[0].messageid,
                        chatId: messageDetails.rows[0].chat_id,
                        chatName: messageDetails.rows[0].chat_name,
                        isGroupChat: messageDetails.rows[0].is_group_chat,
                        createdAt: messageDetails.rows[0].created_at,
                        users: userArr
                    }
                    if(messageObj){
                        res.json({
                            status: 200,
                            success: true,
                            message: "Message sent",
                            data: messageObj
                        });
                    }else{
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong",
                        });
                    } 
                }else{
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Message not sent",
                    }); 
                }
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