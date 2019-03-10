
const chatConfig = require('./chat-config');

  /**
   * Lay toan bo user
   * @param {*} adapterRooms 
   */
  var getUserChatList = (adapterRooms)=>{
    let users=[];
    for (room in adapterRooms){
      if (room.indexOf(chatConfig.userType)==0){
        for (socket in adapterRooms[room].sockets){
          users.push({id:socket, username:room})
        }
      }
    }
    return users;
  }

  /**
   * Lay toan bo room 
   * @param {*} adapterRooms 
   * @param {*} userIDs 
   */
  var getAllRoomChatList = (adapterRooms,userIDs)=>{
    let rooms=[];
    for (room in adapterRooms){
      if (room.indexOf(chatConfig.roomType)==0){
        let users = [];
        let length = adapterRooms[room].length;
        for (socket in adapterRooms[room].sockets){
          let username = userIDs.find(x => x.id === socket).username;//tim id trong array
          users.push({id:socket, username:username})
        }
        rooms.push({name:room,length:length,users:users});
      }
    }
    return rooms;
  }

  /**
   * chi lay room cua user dang log vao co tham gia thoi
   * @param {*} adapterRooms 
   * @param {*} userIDs 
   */
  var getRoomChatList = (adapterRooms,userIDs,mySocketId)=>{
    let rooms=[];
    for (room in adapterRooms){
      if (room.indexOf(chatConfig.roomType)==0){
        let users = [];
        let length = adapterRooms[room].length;
        for (socket in adapterRooms[room].sockets){
          if (socket==mySocketId){
            let username = userIDs.find(x => x.id === socket).username;//tim id trong array
            users.push({id:socket, username:username})
          }
        }
        if (users.length>0) rooms.push({name:room,length:length,users:users});
      }
    }
    return rooms;
  }

/**
 * Dang ky user vao chat
 * 
 * @param {*} io 
 * @param {*} socket 
 * @param {*} data 
 * 
 * NOTE RULE:
 * Room for user: $U#
 * Room for room: $R#
 * Room for sub room default by sys: /<dir>#id
 * Room for session default by sys: id
 * 
 * @output:
 * user + id
 * room in id
 * socket.emit : emit to just one socket
 * io.sockets.emit : emit to all sockets
 */
var registerUserRoom = (io,socket,data)=>{

      if (socket.user&&socket.user.username){
        console.log('Join room owner: ' + socket.user.username + ' container for ' + socket.id);
        socket.join(chatConfig.userType + socket.user.username);
      }

      if (data.rooms){
        //join rooms belong
        data.rooms.forEach(room => {
          console.log('Join room belong: ' + room.name);
          socket.join(room.name);
        });
      }
      
      let userIDs = getUserChatList(socket.adapter.rooms); //[{id:socket, username:username}]
      let rooms = getRoomChatList(socket.adapter.rooms, userIDs, socket.id);

      //chuoi nay nhan tu client cac phien va ghi lai tra cho user login sau
      rooms.forEach(room=>{
        room.messages = data.rooms.find(x => x.name==room.name).messages
      })
   
      //gui cho tat ca cac session dang online tren server
      io.sockets
      .emit('server-reply-room',{
            user: socket.user, //verify tao ra chua {username,nickname,image,ip,device}
            id: socket.id, //= socket.id moi khoi tao cua socket
            time: new Date().getTime(), //thoi gian connect
            last_time: data.last_time, //thoi gian nhan tin nhan cuoi cung cua user bao cho cac user khac
            users: userIDs, //[{id:socket.id,username}] -->tap tu dien username<-->socket.id
            rooms: rooms //[{name,length,[{id:socket.id,username}]}]
        });

    //io.sockets.in(room).emit('new non-fan');
    //io.to(socket.id).emit()
    
  }

var userSocketLeftRoom = (io,socket)=>{

      console.log('rooms:',socket.adapter.rooms);
      
      let userIDs = getUserChatList(socket.adapter.rooms);
      
      console.log('userIds:',userIDs);

      let rooms = getAllRoomChatList(socket.adapter.rooms,userIDs);

      console.log('socketId:',socket.id, socket.adapter.rooms);

      //gui cho tat ca cac session dang online tren server
      io.sockets
      .emit('server-send-user-left',{
            id: socket.id, //= socket.id vua moi disconnect
            time: new Date().getTime(), //thoi gian disconnect
            users: userIDs, //ds user con lai: [{id:socket.id,username}] -->tap tu dien username<-->socket.id
            rooms: rooms //ds room con lai: [{name,length,[{id:socket.id,username}]}]
        });
}

var sendMessage = (io,socket,data)=>{
    io.to(data.room.name)
    .emit('server-emit-message',
          {
            user: socket.user,
            id: socket.id,
            created: data.created,
            room_name: data.room.name,
            text: data.text
          }
      );
}

var sendOldMessage = (io,socket,data)=>{
    io.to(data.id)
    .emit('server-emit-old-message-to-new-user',
          {
            user: socket.user,
            id: socket.id,
            created: data.created,
            room_name: data.room_name,
            messages: data.messages
          }
      );
}

var sendOldUser = (io,socket,data)=>{
    io.to(data.id)
    .emit('server-emit-old-user-to-new-user',
        {
          user: socket.user,
          id: socket.id,
          created: data.created,
          old_user: data.old_user
        }
      );
}

module.exports = {
  registerUserRoom: registerUserRoom,
  sendMessage: sendMessage,
  sendOldMessage: sendOldMessage,
  userSocketLeftRoom: userSocketLeftRoom,
  sendOldUser: sendOldUser
};