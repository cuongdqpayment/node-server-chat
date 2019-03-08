import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatHomePage } from './chat-home';

//room chat c3 rieng nhe
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

import { ApiStorageService } from '../../services/apiStorageService';
//console.log(ApiStorageService.token); //lay token de xem nhu login de vao server neu khong se khong cho
const socketIOConfigC3: SocketIoConfig = { url: ApiStorageService.apiServer+'?token='+ApiStorageService.token, options: {} };

@NgModule({
  declarations: [
    ChatHomePage
  ],
  imports: [
    IonicPageModule.forChild(ChatHomePage),
    SocketIoModule.forRoot(socketIOConfigC3)
  ],
})
export class ChatHomePageModule {}
