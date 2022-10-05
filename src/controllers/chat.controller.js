const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const {mysql_real_escape_string} = require('../utils/helper')
const jsonwebtoken = require("jsonwebtoken");

module.exports.createRoom = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { receiverIds, chatType, groupName } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            if (chatType == 'one to one') {
                let s2 = dbScript(db_sql['Q128'], { var1: checkUser.rows[0].id, var2: receiverIds[0] })
                console.log(s2, "query");
                let findRoom = await connection.query(s2)
                if (findRoom.rowCount == 0) {
                    await connection.query('BEGIN')
                    let id = uuid.v4()
                    let s3 = dbScript(db_sql['Q129'], { var1: id, var2: checkUser.rows[0].id, var3: receiverIds[0], var4: chatType })
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
                                profile: checkUser.rows[0].avatar,
                                lastMessage: '',
                                messageDate: '',
                                receiverId: receiverIds[0]
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
                        let s5 = dbScript(db_sql['Q10'], { var1: findChat.rows[0].sender_id })
                        let findSender = await connection.query(s5)
                        res.json({
                            status: 200,
                            success: true,
                            message: "Chat already initiated",
                            data: {
                                roomId: findChat.rows[0].room_id,
                                senderId: checkUser.rows[0].id,
                                senderName: findSender.rows[0].full_name,
                                profile: findSender.rows[0].avatar,
                                lastMessage: findChat.rows[0].chat_message,
                                messageDate: findChat.rows[0].created_at,
                                receiverId: receiverIds[0]
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
                                    senderId: checkUser.rows[0].id,
                                    senderName: checkUser.rows[0].full_name,
                                    profile: checkUser.rows[0].avatar,
                                    lastMessage: '',
                                    messageDate: '',
                                    receiverId: receiverIds[0]
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
                receiverIds.push(checkUser.rows[0].id)
                await connection.query('BEGIN')
                let id = uuid.v4()
                let s2 = dbScript(db_sql['Q129'], { var1: id, var2: '', var3: '', var4: chatType })
                let createRoom = await connection.query(s2)
                if (createRoom.rowCount > 0) {
                    for (let i = 0; i < receiverIds.length; i++) {
                        let id = uuid.v4()
                        let s3 = dbScript(db_sql['Q133'], { var1: id, var2: createRoom.rows[0].id, var3: receiverIds[i], var4: groupName })
                        let addGroupMember = await connection.query(s3)
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
                            profile: process.env.DEFAULT_LOGO,
                            lastMessage: '',
                            messageDate: '',
                            receiverId: receiverIds
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

// module.exports.createGroupRoom = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         let { receiverIds, groupName } = req.body
//         let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let checkUser = await connection.query(s1)
//         if (checkUser.rows.length > 0) {
//             receiverIds.push(checkUser.rows[0].id)
//             await connection.query('BEGIN')
//             let id = uuid.v4()
//             let s2 = dbScript(db_sql['Q129'], { var1: id, var2: '', var3: '' })
//             let createRoom = await connection.query(s2)
//             console.log(createRoom.rows, "room");
//             if (createRoom.rowCount > 0) {
//                 for (let i = 0; i < receiverIds.length; i++) {
//                     let id = uuid.v4()
//                     let s3 = dbScript(db_sql['Q133'], { var1: id, var2: createRoom.rows[0].id, var3: receiverIds[i], var4: groupName })
//                     let addGroupMember = await connection.query(s3)
//                 }
//                 await connection.query('COMMIT')
//                 res.json({
//                     status : 201,
//                     success : true,
//                     message : "Chat group created successfully", 
//                     data : {
//                         roomId : createRoom.rows[0].id,
//                         users : receiverIds 
//                     }
//                 })
//             } else {
//                 await connection.query('ROLLBACK')
//                 res.json({
//                     status: 400,
//                     success: false,
//                     message: "Something went wrong"
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
//         await connection.query('ROLLBACK')
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

let verifyTokenFn = async (req) => {
    let  token  = req.headers.authorization
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

module.exports.createMessage = async (req) => {
    try {
        let user = await verifyTokenFn(req)
        let { receiverId, roomId, chatMessage } = req.body;
        console.log(req.body,"body data");
        let s1 = dbScript(db_sql['Q4'], { var1: user.email })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            if (receiverId != '') {

                await connection.query('BEGIN')
                let id = uuid.v4()
                let s2 = dbScript(db_sql['Q131'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: receiverId, var5: mysql_real_escape_string(chatMessage) })
                let createMessage = await connection.query(s2)

                let s4 = dbScript(db_sql['Q10'], { var1: receiverId })
                let receiverData = await connection.query(s4)

                let _dt = new Date().toISOString()
                let s3 = dbScript(db_sql['Q132'], { var1: mysql_real_escape_string          (chatMessage),var2 : checkUser.rows[0].id,var3: receiverId, var4: _dt, var5: roomId })
                let updateRoom = await connection.query(s3)
                console.log(updateRoom,"updateRoom11111111111111111111111");
                if (createMessage.rowCount > 0 && updateRoom.rowCount > 0) {
                    await connection.query('COMMIT')
                    return {
                        status: 200,
                        success: true,
                        message: "message sent",
                        data: {
                            roomId: roomId,
                            senderId: checkUser.rows[0].id,
                            senderName: checkUser.rows[0].full_name,
                            receiverId: receiverId,
                            receiverName: receiverData.rows[0].full_name,
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
                console.log("inside else");
                let s5 = dbScript(db_sql['Q136'], {var1 : roomId })
                let findGroup = await connection.query(s5)
                console.log(findGroup.rows,"group");
                if(findGroup.rowCount >0){
                    await connection.query('BEGIN')
                    let createdAt;
                    for(let groupData of findGroup.rows){
                        let id = uuid.v4()
                        let s6 = dbScript(db_sql['Q131'], { var1: id, var2: roomId, var3: checkUser.rows[0].id, var4: groupData.user_id, var5: mysql_real_escape_string(chatMessage) })
                        let createMessage = await connection.query(s6) 
                        createdAt = createMessage.rows[0].created_at
                    }
                    let _dt = new Date().toISOString()
                    let s7 = dbScript(db_sql['Q132'], { var1: mysql_real_escape_string          (chatMessage),var2 : checkUser.rows[0].id,var3: receiverId, var4: _dt, var5: roomId })
                    let updateRoom = await connection.query(s7)

                    if(updateRoom.rowCount > 0){
                        await connection.query('COMMIT')
                        return {
                            status: 200,
                            success: true,
                            message: "message sent",
                            data: {
                                roomId: roomId,
                                senderId: checkUser.rows[0].id,
                                senderName: checkUser.rows[0].full_name,
                                receiverId: receiverId,
                                receiverName: "",
                                chatMessage: chatMessage,
                                createdAt: createdAt
                            }
                        }
                    }else{
                        await connection.query('ROLLBACK')
                        return {
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        }
                    }
                }else{
                    return {
                        status: 400,
                        success: false,
                        message: "Something went wrong"
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
        let s1 = dbScript(db_sql['Q4'], { var1: user.email })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let chatListArr = []
            let s2 = dbScript(db_sql['Q134'], { var1: checkUser.rows[0].id })
            let oneToOneChat = await connection.query(s2)
            for (let oneToOneData of oneToOneChat.rows) {
                let s4 = dbScript(db_sql['Q10'], { var1: oneToOneData.sender_id })
                let senderData = await connection.query(s4)
                chatListArr.push({
                    roomId: oneToOneData.id,
                    senderId: oneToOneData.sender_id,
                    senderName: senderData.rows[0].full_name,
                    senderProfile: senderData.rows[0].avatar,
                    lastMessage: oneToOneData.last_message,
                    messageDate: oneToOneData.updated_at
                })
            }
            let s3 = dbScript(db_sql['Q135'], { var1: checkUser.rows[0].id })
            let groupChatMember = await connection.query(s3)
            for (let groupData of groupChatMember.rows) {
                let s4 = dbScript(db_sql['Q136'], { var1: groupData.room_id })
                let groupChat = await connection.query(s4)
                let s5 = dbScript(db_sql['Q10'], { var1: groupChat.rows[0].sender_id })
                let senderData = await connection.query(s5)
                chatListArr.push({
                    roomId: groupData.room_id,
                    senderId: groupChat.rows[0].sender_id,
                    senderName: (senderData.rowCount > 0) ? senderData.rows[0].full_name : "",
                    senderProfile: (senderData.rowCount > 0) ? senderData.rows[0].avatar : "",
                    lastMessage: groupChat.rows[0].last_message,
                    messageDate: groupChat.rows[0].updated_at
                })
            }
            chatListArr.sort(function(a, b) {
                var keyA = new Date(a.messageDate),
                    keyB = new Date(b.messageDate);
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              })
            if (chatListArr.length > 0) {
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
    } catch (error) {
        return {
            status: 400,
            success: false,
            message: error
        }
    }
}

module.exports.chatHistory = async(req, res) => {
    try {
        let userEmail = req.user.email
        let { roomId } = req.params
        console.log(req.params);
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let s2 = dbScript(db_sql['Q130'], {var1 : roomId})
            let findHistory = await connection.query(s2)
            if(findHistory.rowCount > 0){
                res.json({
                    status: 200,
                    success: true,
                    message: "Chat history",
                    data : findHistory.rows
                })
            }else{
                if(findHistory.rows == 0){
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Chat history",
                        data : []
                    })
                }else{
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}