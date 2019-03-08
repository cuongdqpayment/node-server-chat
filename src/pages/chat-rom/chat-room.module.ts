import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatRoomPage } from './chat-room';
import { ChattingPage } from '../chatting/chatting';

//room chat c3 rieng nhe
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

import { MyApp } from '../../app/app.component';
//console.log(MyApp.token); lay token de xem nhu login de vao server neu khong se khong cho
const socketIOConfigC3: SocketIoConfig = { url: 'http://localhost:9235?token='+MyApp.token, options: {} };

@NgModule({
  declarations: [
    ChatRoomPage,
    ChattingPage
  ],
  imports: [
    IonicPageModule.forChild(ChatRoomPage),
    SocketIoModule.forRoot(socketIOConfigC3)
  ],
})
export class ChatRoomPageModule {}
