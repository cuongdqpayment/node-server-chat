import { Component } from '@angular/core';
import { NavController, Events, IonicPage, NavParams, ToastController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { LoginPage } from '../login/login';
 
@IonicPage()
@Component({
  selector: 'page-chat-room',
  templateUrl: 'chat-room.html',
})
export class ChatRoomPage {
  messages = [];
  nickname = '';
  message = '';

  user:any;
  token:any;
 
  //doc tu storage hoac server??
  rooms = [
    {
      room_name:'Phong ban',
      lasttime:0,
      friends:['A','B'],
    }
    ,
    {
      room_name:'Gia dinh',
      lasttime:0,
      friends:['A','C'],
    }
    ,
    {
      room_name:'Ban be',
      lasttime:0,
      friends:['A','D'],
    }
    ,
    {
      room_name:'Cong viec',
      lasttime:0,
      friends:['A'],
    }
    ,
  ];


  unreadCount = 0;

  constructor(private navCtrl: NavController, 
              private navParams: NavParams, 
              private socket: Socket, 
              private events: Events,
              private toastCtrl: ToastController) {}

  ngOnInit() {
      
      this.user = this.navParams.get('user'); //dung de view nguoi dung len 
      this.token = this.navParams.get('token'); //dung bao mat du lieu kenh truyen
 
      if (!this.token){
        this.navCtrl.setRoot(LoginPage);
        return;
      }
      
      this.openRoom();

      this.getRoomChating().subscribe(data=>{
        console.log(data);
        this.events.publish('listenChatGroup',data);
      })

      this.getMessages().subscribe(message => {
        this.messages.push(message);
      });
  
      this.getUsers().subscribe(data => {
        let user = data['user'];
        if (data['event'] === 'left') {
          this.showToast('User left: ' + user);
        } else {
          this.showToast('User joined: ' + user);
        }
      });


  }
 

  openRoom(){
    //ket noi lai session
    this.socket.connect();
    //gui token de xac thuc gan voi id
    this.socket.emit('verify-user-room-token',{ rooms: this.rooms,
                                                token: this.token
                                              });
  }

  getRoomChating() {
    let observable = new Observable(observer => {
      this.socket.on('server-send-room-chating', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  listUnread(){
    
  }


  sendMessage() {
    this.socket.emit('add-message', { text: this.message });
    this.message = '';
  }
 
  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
 
  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
 
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}