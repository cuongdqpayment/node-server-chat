import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatHomePage } from './chat-home';

import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

const configSocketIo: SocketIoConfig = { url: 'http://localhost:8888/chat'
                                          , options: {  path:'/chat/socket.io'
                                                      , pingInterval: 5000
                                                      , wsEngine: 'ws'
                                          } };

@NgModule({
  declarations: [
    ChatHomePage
  ],
  imports: [
    IonicPageModule.forChild(ChatHomePage),
    SocketIoModule.forRoot(configSocketIo)
  ],
})
export class ChatHomePageModule {}
