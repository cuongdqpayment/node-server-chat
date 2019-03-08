const chatFunction = require('./chat-function');
const chatConfig = require('./chat-config');

var io;
var countAppOnline = 0;
var countc3Online = 0;
var countAll = 0;

var socketTransform = function (socket) {
  let agentUser = {};
  //console.log(socket.handshake);
  if (socket.handshake 
    && socket.handshake.headers 
    && socket.handshake.query
    && socket.handshake.query.token) {
    let clientIp;
    if (socket.handshake.headers["client_ip"]) {
      clientIp = socket.handshake.headers["client_ip"];
    } else if (socket.handshake.headers["x-real-ip"]) {
      clientIp = socket.handshake.headers["x-real-ip"];
    } else if (socket.handshake.headers["x-forwarded-for"]) {
      clientIp = socket.handshake.headers["x-forwarded-for"];
    } else if (socket.handshake.headers["remote_add"]) {
      clientIp = socket.handshake.headers["remote_add"];
    } else {
      clientIp = socket.handshake.address;
    }
    agentUser.token = socket.handshake.query.token;
    agentUser.id = socket.id;
    agentUser.ip = clientIp;
    agentUser.time = socket.handshake.time;
    agentUser.local_time = (new Date()).toLocaleTimeString();
    agentUser.issued = socket.handshake.issued;
    agentUser.device_info = socket.handshake.headers['user-agent'];
    agentUser.origin = socket.handshake.headers.origin;
    socket.agentUser = agentUser; //gan lai cho socket de lay thong tin sau
  }
  //console.log(socket.agentUser);
  return socket;

}

class ChatHandler {

  /**
   * Gan bien io de xu ly trong handler
   * @param {*} mainIO 
   */
  setIO(mainIO) {
    io = mainIO;
  }

  //chuyen doi mot so thong tin request sang socket truoc khi xu ly tiep
  /**
   * truoc khi cho xu ly tiep thi hay kiem tra quyen truy cap nay
   * @param {*} socket 
   * @param {*} next 
   */
  verify(socket, next) {
    console.log('### Socket IO verify: ' + socket.id);
    socket = socketTransform(socket);

    if (!socket.agentUser||!socket.agentUser.token){
      console.log('#-->No agent User & token for chat');
      next(new Error('No agent User & token for chat'));
      //no se khong vao duoc on.connect
    }else if (!chatFunction.tokenVerify(socket,socket.agentUser.token)) {
      console.log('#-->Token for chat invalid!');
      next(new Error('Token for chat invalid!'));
    }else{
      next(); //khi hop le no moi vao duoc connect tiep theo
    }
  }

  /**
   * khi gui vao / no se goi vao day sau khi verify
   * @param {*} socket 
   */
  rootChat(socket) {
    console.log('### Socket IO root (' + ++countAll + ') on Connect: ' + socket.id);
    //xem co bao nhieu rooms

    socket.on('disconnect', ()=>{
      console.log('### disconnect (' + countAll-- + ')  on Root: ' + socket.id);
      chatFunction.userSocketLeftRoom(io, socket);
    });

    socket.on('error',()=>{
      console.log('error: ' + socket.id);
    });

    //-----------client communicate-------------//
    socket = socketTransform(socket);
    
    socket.on(chatConfig.client_join_room, (data) => {
      console.log('### Client register ROOMS and token ROOT: ' + socket.id);
      chatFunction.registerUserRoom(io, socket, data);
    });


    socket.on(chatConfig.client_send_message, (data) => {
      console.log('### Client send message, ROOM and token ROOT: ' + socket.id);
      chatFunction.sendMessage(io, socket, data);
    });
    
    socket.on(chatConfig.client_send_old_message_to_new_user, (data) => {
      console.log('### Client send old message to id: ' + socket.id);
      chatFunction.sendOldMessage(io, socket, data);
    });

    socket.on(chatConfig.client_send_session_to_new_user, (data) => {
      console.log('### Client send old user to id: ' + socket.id);
      chatFunction.sendOldUser(io, socket, data);
    });

    //------------end client communicate ----------//

  }


  //neu query boi duong dan thi no se goi vao day
  //vi du: /test thi se goi vao day
  appOnline(socket) {
    console.log('### appOnline (' + ++countAppOnline + ') socket IO ROOM Connect #: ' + socket.id);
    socket.on('disconnect', function () {
      console.log('### disconnect (' + countAppOnline-- + ') in appOnline #: ' + socket.id);
    });

    socket.on('set-user-token', (data) => {

      console.log('#############################',
        'client gui du lieu Trong ID ne ');

      //chatFunction.registerUserRoom(io,socket,data);
    });
  }

  /**
   * room chat cho c3
   * @param {*} socket 
   */
  c3Online(socket) {
    console.log('### c3Online (' + ++countc3Online + ') socket IO ROOM Connect #: ' + socket.id);
    
    
    socket.on('disconnect', function () {
      console.log('### disconnect (' + countc3Online-- + ') in c3Online #: ' + socket.id);
    });
    
    socket = socketTransform(socket);
    
    socket.on('verify-user-room-token', (data) => {
      console.log('### Client register ROOMS and token Online: ' + socket.id);
      chatFunction.registerUserRoom(io, socket, data);
    });
  }

  //tra ve so luong session dang connect
  getOnlineCount() {
    return {
      count_app_online: countAppOnline,
      total: countAll
    }
  }

}

module.exports = {
  ChatHandler: new ChatHandler()
};