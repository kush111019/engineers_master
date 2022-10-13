const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
// const { mysql_real_escape_string } = require('../utils/helper')
// const jsonwebtoken = require("jsonwebtoken");

// module.exports.createGroupRoom = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         let { chatType, groupName, salesId } = req.body
//         let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let checkUser = await connection.query(s1)
//         if (checkUser.rows.length > 0) {
//             let receiverIds = []
//             let s2 = dbScript(db_sql['Q135'], { var1: salesId })
//             let salesDetails = await connection.query(s2)
//             receiverIds.push(salesDetails.rows[0].closer_id)

//             let s3 = dbScript(db_sql['Q136'], { var1: salesId })
//             let supporters = await connection.query(s3)
//             for (let supporterData of supporters.rows) {
//                 receiverIds.push(supporterData.supporter_id)
//             }

//             let s4 = dbScript(db_sql['Q140'], { var1: salesId, var2: chatType })
//             let findRoom = await connection.query(s4)

//             if (findRoom.rowCount == 0) {
//                 await connection.query('BEGIN')
//                 let id = uuid.v4()
//                 let s5 = dbScript(db_sql['Q129'], { var1: id, var2: '', var3: '', var4: chatType, var5: salesId })
//                 let createRoom = await connection.query(s5)
//                 if (createRoom.rowCount > 0) {
//                     for (let i = 0; i < receiverIds.length; i++) {
//                         let id = uuid.v4()
//                         let s6 = dbScript(db_sql['Q131'], { var1: id, var2: createRoom.rows[0].id, var3: receiverIds[i], var4: groupName })
//                         let addGroupMember = await connection.query(s6)
//                     }
//                     await connection.query('COMMIT')
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Chat group created successfully",
//                         data: {
//                             roomId: createRoom.rows[0].id,
//                             senderId: checkUser.rows[0].id,
//                             senderName: groupName,
//                             senderProfile: process.env.DEFAULT_GROUP_LOGO,
//                             lastMessage: '',
//                             messageDate: '',
//                             receiverId: '',
//                             chatType: chatType
//                         }
//                     })
//                 } else {
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "Something went wrong"
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 200,
//                     success: true,
//                     message: "Chat group already innitiated ",
//                     data: {
//                         roomId: findRoom.rows[0].id,
//                         senderId: findRoom.rows[0].sender_id,
//                         senderName: groupName,
//                         senderProfile: process.env.DEFAULT_GROUP_LOGO,
//                         lastMessage: findRoom.rows[0].last_message,
//                         messageDate: findRoom.rows[0].updated_at,
//                         receiverId: '',
//                         chatType: chatType
//                     }
//                 })
//             }

//         } else {
//             res.json({
//                 status: 400,
//                 success: false,
//                 message: "Admin not found",
//                 data: ""
//             })
//         }
//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

// module.exports.createSingleRoom = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         let { receiverId, chatType } = req.body
//         let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let checkUser = await connection.query(s1)
//         if (checkUser.rows.length > 0) {
//             let s2 = dbScript(db_sql['Q128'], { var1: checkUser.rows[0].id, var2: receiverId })
//             let findRoom = await connection.query(s2)
//             if (findRoom.rowCount == 0) {
//                 await connection.query('BEGIN')
//                 let id = uuid.v4()
//                 let s3 = dbScript(db_sql['Q129'], { var1: id, var2: checkUser.rows[0].id, var3: receiverId, var4: chatType, var5: '' })
//                 let createRoom = await connection.query(s3)
//                 if (createRoom.rowCount > 0) {
//                     await connection.query('COMMIT')
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Chat room initiated",
//                         data: {
//                             roomId: createRoom.rows[0].id,
//                             senderId: checkUser.rows[0].id,
//                             senderName: checkUser.rows[0].full_name,
//                             senderProfile: checkUser.rows[0].avatar,
//                             lastMessage: '',
//                             messageDate: '',
//                             receiverId: receiverId,
//                             chatType: chatType
//                         }
//                     })
//                 } else {
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "Something went wrong"
//                     })
//                 }
//             } else {
//                 let s4 = dbScript(db_sql['Q130'], { var1: findRoom.rows[0].id })
//                 let findChat = await connection.query(s4)
//                 if (findChat.rowCount > 0) {
//                     let s5 = dbScript(db_sql['Q10'], { var1: findChat.rows[findChat.rows.length - 1].sender_id })
//                     let findSender = await connection.query(s5)
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Chat already initiated",
//                         data: {
//                             roomId: findChat.rows[0].room_id,
//                             senderId: findSender.rows[0].id,
//                             senderName: findSender.rows[0].full_name,
//                             senderProfile: findSender.rows[0].avatar,
//                             lastMessage: findChat.rows[findChat.rows.length - 1].chat_message,
//                             messageDate: findChat.rows[findChat.rows.length - 1].created_at,
//                             receiverId: findRoom.rows[0].receiver_id,
//                             chatType: findRoom.rows[0].chat_type
//                         }
//                     })
//                 } else {
//                     if (findChat.rows.length == 0) {
//                         res.json({
//                             status: 200,
//                             success: true,
//                             message: "Chat already initiated",
//                             data: {
//                                 roomId: findRoom.rows[0].id,
//                                 senderId: "",
//                                 senderName: "",
//                                 senderProfile: "",
//                                 lastMessage: "",
//                                 messageDate: "",
//                                 receiverId: "",
//                                 chatType: findRoom.rows[0].chat_type
//                             }
//                         })
//                     } else {
//                         res.json({
//                             status: 400,
//                             success: false,
//                             message: "Something Went wrong"
//                         })
//                     }

//                 }
//             }
//         } else {
//             res.json({
//                 status: 400,
//                 success: false,
//                 message: "Admin not found",
//                 data: ""
//             })
//         }
//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }

// }

// let verifyTokenFn = async (req) => {
//     let token = req.headers.authorization
//     let user = await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
//         if (err) {
//             return 0
//         } else {
//             var decoded = {
//                 id: decoded.id,
//                 email: decoded.email,
//             };
//             return decoded;
//         }
//     });
//     return user
// }

// module.exports.sendMessage = async (req) => {
//     try {
//         let user = await verifyTokenFn(req)
//         if (user) {
//             let { chatType, roomId, chatMessage } = req.body;

//             let s1 = dbScript(db_sql['Q4'], { var1: user.email })
//             let checkUser = await connection.query(s1)

//             if (checkUser.rows.length > 0) {
//                 if (chatType == 'one to one') {

//                     await connection.query('BEGIN')

//                     let s2 = dbScript(db_sql['Q133'], { var1: roomId })
//                     let findRoom = await connection.query(s2)

//                     let id = uuid.v4()
//                     let s3 = dbScript(db_sql['Q129'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: mysql_real_escape_string(chatMessage) })
//                     let createMessage = await connection.query(s3)

//                     let recieverId = (findRoom.rows[0].receiver_id == checkUser.rows[0].id) ? findRoom.rows[0].sender_id : findRoom.rows[0].receiver_id

//                     let _dt = new Date().toISOString()
//                     let s5 = dbScript(db_sql['Q130'], { var1: mysql_real_escape_string(chatMessage), var2: checkUser.rows[0].id, var3: recieverId, var4: _dt, var5: roomId })
//                     let updateRoom = await connection.query(s5)

//                     if (createMessage.rowCount > 0 && updateRoom.rowCount > 0) {
//                         await connection.query('COMMIT')
//                         return {
//                             status: 200,
//                             success: true,
//                             message: "message sent",
//                             data: {
//                                 roomId: roomId,
//                                 id: checkUser.rows[0].id,
//                                 name: checkUser.rows[0].full_name,
//                                 profile: checkUser.rows[0].avatar,
//                                 chatMessage: createMessage.rows[0].chat_message,
//                                 receiverId : recieverId,
//                                 createdAt: createMessage.rows[0].created_at,
//                                 chatType : chatType
//                             }
//                         }
//                     } else {
//                         await connection.query('ROLLBACK')
//                         return {
//                             status: 400,
//                             success: false,
//                             message: "Something went wrong"
//                         }
//                     }
//                 } else if (chatType == 'group') {
//                     let s6 = dbScript(db_sql['Q134'], { var1: roomId })
//                     let findGroup = await connection.query(s6)
//                     let users = []
//                     for(groupData of findGroup.rows){
//                         users.push({
//                             id : groupData.user_id
//                         })
//                     }
//                     if (findGroup.rowCount > 0) {
//                         await connection.query('BEGIN')

//                         let id = uuid.v4()
//                         let s7 = dbScript(db_sql['Q129'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: mysql_real_escape_string(chatMessage) })
//                         let createMessage = await connection.query(s7)

//                         let _dt = new Date().toISOString()
//                         let s8 = dbScript(db_sql['Q130'], { var1: mysql_real_escape_string(chatMessage), var2: checkUser.rows[0].id, var3: "", var4: _dt, var5: roomId })
//                         let updateRoom = await connection.query(s8)

//                         if (updateRoom.rowCount > 0 && createMessage.rowCount > 0) {
//                             await connection.query('COMMIT')
//                             return {
//                                 status: 200,
//                                 success: true,
//                                 message: "message sent",
//                                 data: {
//                                     roomId: roomId,
//                                     id: checkUser.rows[0].id,
//                                     name: checkUser.rows[0].full_name,
//                                     profile: checkUser.rows[0].avatar,
//                                     chatMessage: createMessage.rows[0].chat_message,
//                                     createdAt: createMessage.rows[0].created_at,
//                                     receiverId : users,
//                                     chatType : chatType 
//                                 }
//                             }
//                         } else {
//                             await connection.query('ROLLBACK')
//                             return {
//                                 status: 400,
//                                 success: false,
//                                 message: "Something went wrong"
//                             }
//                         }
//                     } else {
//                         return {
//                             status: 200,
//                             success: false,
//                             message: "Group not found"
//                         }
//                     }
//                 }
//             } else {
//                 return {
//                     status: 400,
//                     success: false,
//                     message: "Admin not found",
//                     data: ""
//                 }
//             }
//         } else {
//             return {
//                 status: 401,
//                 success: false,
//                 message: "Token not found",
//                 data: ""
//             }
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         return {
//             status: 400,
//             success: false,
//             message: error.message,
//         }
//     }
// }

// module.exports.chatList = async (req) => {
//     try {
//         let user = await verifyTokenFn(req)
//         if (user) {
//             let s1 = dbScript(db_sql['Q4'], { var1: user.email })
//             let checkUser = await connection.query(s1)
//             if (checkUser.rows.length > 0) {
//                 let chatListArr = []
//                 let s4 = dbScript(db_sql['Q132'], { var1: checkUser.rows[0].id })
//                 let oneToOneChat = await connection.query(s4)
//                 for (let oneToOneData of oneToOneChat.rows) {
//                     if (oneToOneData.receiver_id != '' && oneToOneData.chat_type == 'one to one') {

//                         let s5 = dbScript(db_sql['Q10'], { var1: oneToOneData.sender_id })
//                         let senderData = await connection.query(s5)

//                         let s6 = dbScript(db_sql['Q10'], { var1: oneToOneData.receiver_id })
//                         let receiverData = await connection.query(s6)

//                         chatListArr.push({
//                             roomId: oneToOneData.id,
//                             roomTitle: (receiverData.rowCount > 0) ? receiverData.rows[0].full_name : "",
//                             roomProfile: (receiverData.rowCount > 0) ? receiverData.rows[0].avatar : process.env.DEFAULT_LOGO,
//                             id: oneToOneData.sender_id,
//                             name: (senderData.rowCount > 0) ? senderData.rows[0].full_name : "",
//                             profile: (senderData.rowCount > 0) ? senderData.rows[0].avatar : process.env.DEFAULT_LOGO,
//                             lastMessage: (oneToOneData.last_message == null) ? '' : oneToOneData.last_message,
//                             messageDate: (oneToOneData.updated_at == null) ? '' : oneToOneData.updated_at,
//                             chatType: oneToOneData.chat_type,
//                             users: [
//                                 {
//                                     id: oneToOneData.receiver_id,
//                                     name: (receiverData.rowCount > 0) ? receiverData.rows[0].full_name : ""
//                                 }
//                             ]
//                         })
//                     }
//                 }

//                 let s7 = dbScript(db_sql['Q135'], { var1: checkUser.rows[0].id })
//                 let groupChatMember = await connection.query(s7)
//                 for (let groupData of groupChatMember.rows) {
//                     let s8 = dbScript(db_sql['Q141'], { var1: groupData.room_id })
//                     let roomMembers = await connection.query(s8)
//                     let users = []
//                     if (roomMembers.rowCount > 0) {
//                         for (let roomMemeberData of roomMembers.rows) {
//                             users.push({
//                                 id: roomMemeberData.user_id,
//                                 name: roomMemeberData.full_name
//                             })
//                         }
//                     }
//                     let s9 = dbScript(db_sql['Q133'], { var1: groupData.room_id })
//                     let groupChat = await connection.query(s9)
//                     if (groupChat.rowCount > 0) {
//                         if (groupChat.rows[0].sender_id != '') {
//                             let s10 = dbScript(db_sql['Q10'], { var1: groupChat.rows[0].sender_id })
//                             let senderData = await connection.query(s10)
//                             chatListArr.push({
//                                 roomId: groupData.room_id,
//                                 roomTitle: groupData.group_name,
//                                 roomProfile: process.env.DEFAULT_GROUP_LOGO,
//                                 id: groupChat.rows[0].sender_id,
//                                 name: (senderData.rowCount > 0) ? senderData.rows[0].full_name : "",
//                                 profile: (senderData.rowCount > 0) ? senderData.rows[0].avatar : process.env.DEFAULT_LOGO,
//                                 lastMessage: (groupChat.rows[0].last_message == null) ? '' : groupChat.rows[0].last_message,
//                                 messageDate: (groupChat.rows[0].updated_at == null) ? '' : groupChat.rows[0].updated_at,
//                                 chatType: groupChat.rows[0].chat_type,
//                                 users: users
//                             })
//                         } else {
//                             chatListArr.push({
//                                 roomId: groupData.room_id,
//                                 roomTitle: groupData.group_name,
//                                 roomProfile: process.env.DEFAULT_GROUP_LOGO,
//                                 id: "",
//                                 name: "",
//                                 profile: process.env.DEFAULT_LOGO,
//                                 lastMessage: "",
//                                 messageDate: "",
//                                 chatType: "group",
//                                 users: users
//                             })
//                         }
//                     }
//                 }
//                 if (chatListArr.length > 0) {
//                     chatListArr.sort(function (a, b) {
//                         var keyA = new Date(a.messageDate),
//                             keyB = new Date(b.messageDate);
//                         // Compare the 2 dates
//                         if (keyA < keyB) return 1;
//                         if (keyA > keyB) return -1;
//                         return 0;
//                     })
//                     return {
//                         status: 200,
//                         success: true,
//                         message: "Chat list",
//                         data: chatListArr
//                     }
//                 } else {
//                     return {
//                         status: 200,
//                         success: false,
//                         message: "Empty chat list",
//                         data: chatListArr
//                     }
//                 }
//             } else {
//                 return {
//                     status: 400,
//                     success: false,
//                     message: "Admin not found",
//                     data: ""
//                 }
//             }
//         } else {
//             return {
//                 status: 401,
//                 success: false,
//                 message: "Token not found",
//                 data: ""
//             }
//         }
//     } catch (error) {
//         return {
//             status: 400,
//             success: false,
//             message: error.message
//         }
//     }
// }

// module.exports.chatHistory = async (req) => {
//     try {
//         let user = await verifyTokenFn(req)
//         if (user) {
//             let roomId = req.params.roomId
//             let s1 = dbScript(db_sql['Q4'], { var1: user.email })
//             let checkUser = await connection.query(s1)
//             if (checkUser.rowCount > 0) {
//                 let chatHistoryArr = []
//                 let s2 = dbScript(db_sql['Q130'], { var1: roomId })
//                 let findHistory = await connection.query(s2)
//                 if (findHistory.rowCount > 0) {
//                     for (historyData of findHistory.rows) {
//                         let s3 = dbScript(db_sql['Q10'], { var1: historyData.sender_id })
//                         let senderData = await connection.query(s3)
//                         chatHistoryArr.push({
//                             id: historyData.id,
//                             roomId: historyData.room_id,
//                             id: historyData.sender_id,
//                             name: senderData.rows[0].full_name,
//                             profile: senderData.rows[0].avatar,
//                             chatMessage: historyData.chat_message,
//                             createdAt: historyData.created_at
//                         })
//                     }
//                     if (chatHistoryArr.length > 0) {
//                         return {
//                             status: 200,
//                             success: true,
//                             message: "Chat history",
//                             data: chatHistoryArr
//                         }
//                     } else {
//                         if (chatHistoryArr.length == 0) {
//                             return {
//                                 status: 200,
//                                 success: false,
//                                 message: "Empty Chat history",
//                                 data: []
//                             }
//                         } else {
//                             return {
//                                 status: 400,
//                                 success: false,
//                                 message: "Something went wrong"
//                             }
//                         }
//                     }
//                 } else {
//                     return {
//                         status: 200,
//                         success: false,
//                         message: "Empty Chat history",
//                         data: []
//                     }
//                 }
//             } else {
//                 return {
//                     status: 400,
//                     success: false,
//                     message: "Admin not found",
//                     data: ""
//                 }
//             }
//         } else {
//             return {
//                 status: 401,
//                 success: false,
//                 message: "Token not found",
//                 data: ""
//             }
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         return {
//             status: 400,
//             success: false,
//             message: error.message,
//         }
//     }
// }


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
                            if (chat.last_message != null) {
                                let s3 = dbScript(db_sql['Q139'], { var1: chat.last_message })
                                let lastMessage = await connection.query(s3)
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
                        }

                        let s4 = dbScript(db_sql['Q10'], { var1: findChat.rows[0].user_a })
                        let userA = await connection.query(s4)

                        let s5 = dbScript(db_sql['Q10'], { var1: findChat.rows[0].user_b })
                        let userB = await connection.query(s5)

                        chatData.push({
                            id: findChat.rows[0].id,
                            chatName: findChat.rows[0].chat_name,
                            isGroupChat: findChat.rows[0].is_group_chat,
                            groupAdmin: findChat.rows[0].group_admin,
                            users: [userA.rows[0], userB.rows[0]]
                        })
                    } else if (chatsData.is_group_chat == true) {

                        if (chatsData.last_message != null) {
                            let s6 = dbScript(db_sql['Q139'], { var1: chatsData.last_message })
                            let lastMessage = await connection.query(s6)
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

                        chatData.push({
                            id: findGroupChat.rows[0].id,
                            chatName: findGroupChat.rows[0].chat_name,
                            isGroupChat: findGroupChat.rows[0].is_group_chat,
                            groupAdmin: findGroupChat.rows[0].group_admin,
                            users: userArr
                        })
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
            
            let users = []
            users.push(id)

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


            let s1 = dbScript(db_sql['Q137'], { var1: chatId, var2: name, var3: isGroupChat, var4: '', var5: '', var6: id, var7: salesId })
            let createGroup = await connection.query(s1)

            let usersArr = []
            for (userId of users) {
                let memberId = uuid.v4()
                let s2 = dbScript(db_sql['Q131'], { var1: memberId, var2: createGroup.rows[0].id, var3: userId, var4: name })
                let createMembers = await connection.query(s2)

                let s3 = dbScript(db_sql['Q10'], { var1: userId })
                let userDetails = await connection.query(s3)
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
                res.json({
                    status: 200,
                    success: true,
                    message: "Group created",
                    data: groupChatData
                });
            } else {
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
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.renameGroup = async (req, res) => {
    // const { chatId, chatName } = req.body;

    // const updatedChat = await Chat.findByIdAndUpdate(
    //     chatId,
    //     {
    //         chatName: chatName,
    //     },
    //     {
    //         new: true,
    //     }
    // )
    //     .populate("users", "-password")
    //     .populate("groupAdmin", "-password");

    // if (!updatedChat) {
    //     res.status(404);
    //     throw new Error("Chat Not Found");
    // } else {
    //     res.json(updatedChat);
    // }

    try {
        let { chatId, chatName } = req.body;
        let id = req.user.id
        let s1 = dbScript(db_sql['Q138'], {})
        let chats = await connection.query(s1)
        if (chats.rowCount > 0) {
            let usersArr = []
            let groupChatData = []
            let s2 = dbScript(db_sql['Q140'], { var1: chatName, var2: chatId })
            let updateGroupName = await connection.query(s2)

            let s3 = dbScript(db_sql['Q10'], { var1: updateGroupName.rows[0].group_admin })
            let groupAdmin = await connection.query(s3)

            let s4 = dbScript(db_sql['Q141'], { var1: chatName, var2: chatId })
            let updateMembers = await connection.query(s4)
            for (let members of updateMembers.rows) {
                let s5 = dbScript(db_sql['Q10'], { var1: members.userId })
                let userDetails = await connection.query(s5)
                usersArr.push(userDetails.rows[0])
            }

            if (updateGroupName.rowCount > 0 && updateMembers.rowCount > 0) {
                groupChatData.push({
                    id: updateGroupName.rows[0].id,
                    chatName: updateGroupName.rows[0].chat_name,
                    isGroupChat: updateGroupName.rows[0].is_group_chat,
                    groupAdmin: groupAdmin.rows[0],
                    users: usersArr
                })
                if (groupChatData.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Group name updated",
                        data: groupChatData
                    });
                }
            } else {
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
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
}

module.exports.addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
}

module.exports.allMessages = async (req, res) => {
    try {
        // const messages = await Message.find({ chat: req.params.chatId })
        //   .populate("sender", "name pic email")
        //   .populate("chat");
        // res.json(messages);

        let { chatId } = req.params
        let id = req.user.id
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {

            let s1 = dbScript(db_sql['Q143'], { var1: chatId })
            let chatMessage = await connection.query(s1)

            if (chatMessage.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Chat messages",
                    data: chatMessage.rows
                });
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Chat messages",
                    data: []
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
            let messageArr = []
            let messageId = uuid.v4()
            let s1 = dbScript(db_sql['Q129'], {var1 : messageId, var2: chatId, var3: id, var4: content})
            let message = await connection.query(s1)

            let s2 = dbScript(db_sql['Q130'], {var1 : message.rows[0].id, var2 : chatId})
            let updateLastMessage = await connection.query(s2)
            if(message.rowCount > 0 && updateLastMessage.rowCount > 0){
                let s3 = dbScript(db_sql['Q142'], {var1 : chatId})
                let messageDetails = await connection.query(s3)
                if(messageDetails.rowCount > 0){


                    res.json({
                        status: 200,
                        success: true,
                        message: "Message sent",
                        data: messageDetails.rows
                    });
                }
            }else{
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
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }

}