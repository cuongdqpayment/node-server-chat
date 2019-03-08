import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Events, Slides, IonicPage, NavParams, ToastController, Content } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormBuilder } from '@angular/forms';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';
import chatConfig from '../../assets/chat/chat-config';
import Log from '../../assets/log/log-debug';


var slideSelected = {
  home:0,
  chatting:1,
  create_group:2,
  setting:3,
}

@IonicPage()
@Component({
  selector: 'page-chat-home',
  templateUrl: 'chat-home.html'
})

export class ChatHomePage {
  @ViewChild(Slides) slides: Slides;

  slideIndex = 0;
  title = 'CHAT HOME';
  image_default='./assets/imgs/group.jpeg';

  nickname = '';
  message:string = '';

  user:any;
  authenticationServer:any;
  token:any;
  messages = [];
  room:any;
  session:any;
  rooms=[];
  last_time:number = new Date().getTime();
 
  //doc tu storage hoac server??
  temprooms = [
    {
      name:chatConfig.roomType+'Phong ban',
      messages:[]
    }
    ,
    {
      name:chatConfig.roomType+'Gia dinh',
      messages:[]
    }
    ,
    {
      name:chatConfig.roomType+'Ban be',
      messages:[]
    }
    ,
    {
      name:chatConfig.roomType+'Cong viec',
      messages:[]
    }
    ,
  ];

  //userRooms:any;
  
  unreadCount = 0;

  public addFromGroup: FormGroup;
  public contentMessages;

  constructor(private formBuilder: FormBuilder,
              private navParams: NavParams, 
              private navCtrl: NavController,
              private apiService: ApiAuthService,
              private socket: Socket, 
              private events: Events,
              private apiStorage: ApiStorageService) {}

  ngOnInit() {
    
     Log.put('ngOnInit() - chat-home.ts!', this.session);
     //Log.print(); //kiem tra log
     //Log.put('dd: ',object) //ghi vao log
     //Log.get()); //lay log gui cho may chu xem
     //Log.reset(); //xoa log
     this.slides.lockSwipes(true);

    this.addFromGroup = this.formBuilder.group({
      room_name:'',
      
    });
    
    //lay thong tin login ghi vao menu va token de gui len server khi can thiet
    let user = this.navParams.get('user'); 
    let token = ApiStorageService.token;
    this.authenticationServer = ApiStorageService.authenticationServer;
    
    if (user&&token){
        this.user = user;
        this.token = token;
        //this.apiStorage.deleteUserRooms(this.user); //de reset moi
        this.rooms = this.apiStorage.getUserRooms(this.user);
        this.last_time = this.apiStorage.getUserLastTime(this.user)==0?new Date().getTime():this.apiStorage.getUserLastTime(this.user);
        if (this.rooms&&this.rooms.length>0){
          this.rooms.forEach((room,index)=>{
            room.messages = this.apiStorage.getUserRoomMessages(this.user,room);
          });
        }else{
          this.rooms = this.temprooms;
        }
    }else{
      location.href= '/';
    }
  
      //ghi vao menu chatroom tu server gui xuong
      //new session & user joining
      this.getRoomChating().subscribe(userRooms=>{
        //Log.put(userRooms);
        let newSession;
        /**
           {
          user: socket.user, //verify tao ra chua {username,nickname,image,ip,device}
          id: socket.id, //= socket.id moi khoi tao cua socket
          time: new Date().getTime(), //thoi gian connect
          last_time: data.last_time, //thoi gian nhan tin nhan cuoi cung cua user bao cho cac user khac
          users: userIDs, //[{id:socket.id,username}] -->tap tu dien username<-->socket.id
          rooms: rooms //[{name,length,[{id:socket.id,username}]}]
          }
          */

        newSession = userRooms;
        if (this.session){
          let newRooms = this.session.rooms;
          this.session.rooms.forEach((room,index)=>{
            //update thong tin room moi voi room cua nguoi broashcasd
            let sameRoomNew = newSession.rooms.find(r=>r.name===room.name);
            if (sameRoomNew){
              room.length = sameRoomNew.length;
              room.users = sameRoomNew.users;
              let oldMsgs = room.messages.filter(m=>(m.user.username===this.session.user.username
                                                    &&m.user.socket_id===this.session.id
                                                    &&m.created<=newSession.time
                                                    &&m.created>=newSession.last_time));
              if (oldMsgs&&oldMsgs.length>0){
                Log.put('Old Message send to new user:? ', oldMsgs);
                this.sendOldMessageToNewUser(sameRoomNew, oldMsgs, newSession.id);
              }
            }
          });
          //if (newSession.users) {
            let sessionUserOld = this.session.users.find(u=>u.id===newSession.id); //{id:socket.id,username}
            if (sessionUserOld) {
              Log.put('New session Users IN OLD SESSION??? ** KHONG BAO GIO XAY RA: ',sessionUserOld);
            }else{
              Log.put('New session Users: ',newSession.users);
              //chuyen doi this.session.users [{id,username}]-->[{id,username,ip,device,time}] 
              let sessionUser= newSession.users.find(u=>u.id===newSession.id); //{id:socket.id,username}
              if (sessionUser) {
                sessionUser.ip = newSession.user.ip;
                sessionUser.device = newSession.user.device;
                sessionUser.time = newSession.time;
              }
              //them vao ds user moi gia nhap
              this.session.users.push(sessionUser);
              //gui tin nhan bao toan mang biet user moi dang nhap vao
              //truoc mat bao cho this.session nay 
              Log.put('My session Users PUSH new user: ',this.session.users);
              //bao cho user moi biet ds users da login truoc do tu thiet bi nao???
              //gui session cua minh cho new user
              this.sendMySessionIdToNewUser(newSession.id);
            }
            //}
          Log.put('My Session users list from other session: ',this.session.users);
          this.events.publish(chatConfig.event_register_room,newRooms);
        }else{
          this.session = userRooms;
          //chuyen doi this.session.users [{id,username}]-->[{id,username,ip,device,time}] 
          //if (newSession.users) {
          let sessionUser = this.session.users.find(u=>u.id===newSession.id); //{id:socket.id,username}
          
          Log.put('sessionUser First: ', sessionUser);
          
          if (sessionUser) {
            sessionUser.ip = newSession.user.ip;
            sessionUser.device = newSession.user.device;
            sessionUser.time = newSession.time;
          }
          //}
          Log.put('My Session users list first: ',this.session.users);
          if (this.session.rooms) this.events.publish(chatConfig.event_register_room,this.session.rooms);
        }
        
        //luu thong tin vao storage theo user
        let rooms = [];
        this.session.rooms.forEach((room,index)=>{
          rooms.push({
            name: room.name,
            length: room.length,
            users: room.users
          })
        });
        this.apiStorage.saveUserRooms(this.session.user,rooms);
      })
      

      /**
       * {
        id: socket.id, //= socket.id vua moi disconnect
        time: new Date().getTime(), //thoi gian disconnect
        users: userIDs, //ds user con lai: [{id:socket.id,username}] -->tap tu dien username<-->socket.id
        rooms: rooms //ds room con lai: [{name,length,[{id:socket.id,username}]}]
        }
       */
      this.getRoomUserLeft().subscribe(userRooms=>{
        let oldSession;
        oldSession = userRooms;
        if (this.session){
          let newRooms = this.session.rooms;
          
          let oldUserWithSocketLeft = this.session.users.find(u=>u.id===oldSession.id);
          if (oldUserWithSocketLeft){
            Log.put('User socket Left:', oldUserWithSocketLeft);
          }

          this.session.rooms.forEach((room,index)=>{
            let sameRoomNew = oldSession.rooms.find(r=>r.name===room.name);
            if (sameRoomNew){
              room.length = sameRoomNew.length;
              room.users = sameRoomNew.users;
            }
          });
          //thay doi vi tri room moi cho session nay
          this.events.publish(chatConfig.event_register_room,newRooms);
        }
      })

      //chuyen slide khi su kien click group
      this.events.subscribe(chatConfig.event_change_room, ((room) => {
        this.room = this.session.rooms.find(x => x.name === room.name);
        this.messages = this.room.messages;
        this.title= "CHAT WITH: " + this.room&&this.room.name?this.room.name.substring(3):'...';
        this.goToSlide(slideSelected.chatting);

        if (this.room&&this.room.name){ //mo cua so slide 2
          this.contentMessages = document.getElementById("contentMessages");
          setTimeout(()=>{ //doi cho form update message moi di chuyen scroll
            //element.scrollTop = 0; //neu muon scroll ve dau
            this.contentMessages.scrollTop = this.contentMessages.scrollHeight;
          },300);
        }

      }));      
      
      this.events.subscribe(chatConfig.event_chat_setting, (() => {
        this.goToSlide(slideSelected.setting);
      }));      
      

      this.getMessages().subscribe(roomMessage => {
        let msg; 
        msg = roomMessage;
        let msgRoom = this.session.rooms.find(x => x.name === msg.room_name);
        if (msgRoom){
          msg.user.socket_id = msg.id; //gan them session_id cho user nhan tin        
          msgRoom.messages.push(//FIFO unshift===push shift===pop //push( //LIFO pop
            { user: msg.user,
              created: msg.created,
              text: msg.text
            });
            //luu xuong dia
            this.apiStorage.saveUserRoomMessages(this.session.user,msgRoom);

            if (this.room&&msg.room_name===this.room.name){ //mo cua so slide 2
              this.contentMessages = document.getElementById("contentMessages");
              //element.scrollTop = 0;
              setTimeout(()=>{ //doi cho form update message moi di chuyen scroll
                this.contentMessages.scrollTop = this.contentMessages.scrollHeight;
              },300);
            }
            //neu message trong room hien dang view thi scroll no 
          }      
        });
        
        this.getOldMessages().subscribe(userMsgs => {
          let uMsgs;
          uMsgs = userMsgs;
          //Log.put(uMsgs);
          let newRoom = this.session.rooms.find(x => x.name === uMsgs.room_name)
          Log.put('getOld message for new session: ', newRoom);
          if (newRoom){
            let oldMsgs = uMsgs.messages// -- user name and session filter thoi.filter(m=>);
            newRoom.messages = newRoom.messages.concat(oldMsgs);
            this.apiStorage.saveUserRoomMessages(this.session.user,newRoom); 
          }
        });
        
        //lay user cu ghi vao lsu user
        /**
         * {
          user: socket.user,
          id: socket.id,
          created: data.created,
          old_user: data.old_user = {id,username,device,time}
        }
         */
        this.getOldUser().subscribe(oldUser => {
          let oldU;
          oldU = oldUser;
          Log.put('oldU',oldU);
          Log.put('Users',this.session.users);
          //chuyen doi this.session.users [{id,username}]-->[{id,username,ip,device,time}] 
          //if (newSession.users) {
            let sessionUser = this.session.users.find(u=>u.id===oldU.id); //{id:socket.id,username}
            if (sessionUser) {
              sessionUser.ip = oldU.user.ip;
              sessionUser.device = oldU.user.device;
              sessionUser.time = oldU.old_user.time;
            }
            //}
            Log.put('My Session users list after: ',this.session.users);
        });

  }
 
  ionViewDidLoad() {
    if (this.token){
      this.socket.connect();
      this.joinRoom(); //gui dang ky room cua user minh
    }
  }

  ionViewWillLeave() {
    this.socket.disconnect();
    Log.put('this.socket.disconnect()', this.session);
    //Log.print();
    //Log.reset();
  }

  /**
   * doc tu disk ds room - user - gui len server
   * server ktra token cho phep join va tra ds room ve
   */
  joinRoom(){
    //gui token de xac thuc gan voi id
    this.socket.emit(chatConfig.client_join_room,{ rooms: this.rooms,
                                                   last_time: this.last_time, //luu trong cac room
                                                   token: this.token
                                                  });
  }

  getRoomChating() {
    let observable = new Observable(observer => {
      this.socket.on(chatConfig.server_reply_room, (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getRoomUserLeft() {
    let observable = new Observable(observer => {
      this.socket.on(chatConfig.server_send_user_left, (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  sendMessage() {
    if (this.message.length>0){
      this.socket.emit(chatConfig.client_send_message, 
        { 
          text: this.message,
          room: this.room,
          created: new Date().getTime(),
          token: this.token
       });
      this.message = '';
    }
  }

  /**
   * gui tin nhan cu den new session
   * @param messages 
   * @param socketId 
   */
  sendOldMessageToNewUser(room,messages,socketId) {
    this.socket.emit(chatConfig.client_send_old_message_to_new_user, 
      { 
        room_name: room.name,
        messages: messages,
        id: socketId,
        created: new Date().getTime(),
        token: this.token
     });
  }
  /**
   * gui {id,username,ip,device} cho user moi login
   * @param socketId 
   * @param mySession 
   */
  sendMySessionIdToNewUser(socketId) {
    this.socket.emit(chatConfig.client_send_session_to_new_user, 
      {
        id:socketId,
        created: new Date().getTime(),
        token: this.token,
        old_user: 
        {
          id: this.session.id,
          username: this.session.user.username,
          time: this.session.time,
          ip: this.session.user.ip,
          device: this.session.user.device
        }
      });
  }
 
  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on(chatConfig.server_emit_message, (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
  
  getOldMessages() {
    let observable = new Observable(observer => {
      this.socket.on(chatConfig.server_emit_old_message_to_new_user, (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
  
  getOldUser() {
    let observable = new Observable(observer => {
      this.socket.on(chatConfig.server_emit_old_user_to_new_user, (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  /**
   * Dieu khien slide
   * @param i 
   */
  goToSlide(i) {
    this.slides.lockSwipes(false);
    this.slides.slideTo(i, 500);
    this.slides.lockSwipes(true);
  }

  /**
   * xac dinh slide
   */
  slideChanged() {
    this.slideIndex = this.slides.getActiveIndex();
  }

  formAddRoom(){
    this.goToSlide(2);
  }

  addRoom(){
    //mo slide ten nhom, 
    //anh dai dien
    //thanh vien cua nhom

    /* this.session.rooms.push({
      name:chatConfig.roomType+'Nhóm mới thêm',
      image:this.image_default,
      messages:[]
    }) */
  }
  
  listUnread(){
    
  }

  reset(){
    location.href= '/';
  }

  selectIcon(){
    //this.navCtrl.push(SampleIconsPage);
  }

  callSendLog(){
    Log.print();
    //Log.get(); -->for send
    Log.reset();
  }

  callLogout() {
    this.apiService.logout()
    .then(d=>{
      this.reset();
    })
    .catch(e=>{});
  }

}