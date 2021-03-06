import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import {TimeAgoPipe} from 'time-ago-pipe';
import { SocketIoModule } from 'ng-socket-io';

import { StorageServiceModule } from 'angular-webstorage-service';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiAuthService } from '../services/apiAuthService';
import { ApiImageService } from '../services/apiImageService';
import { ApiResourceService } from '../services/apiResourceServices';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from '../interceptors/requestInterceptor';
import { ResponseInterceptor } from '../interceptors/responseInterceptor';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { DynamicFormWebPage } from '../pages/dynamic-form-web/dynamic-form-web';
import { DynamicListPage } from '../pages/dynamic-list/dynamic-list';
import { DynamicFormMobilePage } from '../pages/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicCardSocialPage } from '../pages/dynamic-card-social/dynamic-card-social';
import { DynamicMediasPage } from '../pages/dynamic-medias/dynamic-medias';
import { DynamicListOrderPage } from '../pages/dynamic-list-order/dynamic-list-order';
import { SignaturePage } from '../pages/signature/signature';

import { ApiHttpPublicService } from '../services/apiHttpPublicServices';
import { TreeView } from '../components/tree-view/tree-view';
import { ResultsPage } from '../pages/results/results';
import { SpeedTestPage } from '../pages/speed-test/speed-test';
import { OwnerImagesPage } from '../pages/owner-images/owner-images';
import { DynamicRangePage } from '../pages/dynamic-range/dynamic-range';
import { HomeMenuPage } from '../pages/home-menu/home-menu';
import { DynamicTreePage } from '../pages/dynamic-tree/dynamic-tree';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { Geolocation } from '@ionic-native/geolocation';
import { SQLite } from '@ionic-native/sqlite';
import { ApiGraphService } from '../services/apiMeterGraphService';
import { ApiSqliteService } from '../services/apiSqliteService';
import { ApiSpeedTestService } from '../services/apiSpeedTestService';
import { ApiMediaService } from '../services/apiMediaService';
import { ApiLocationService } from '../services/apiLocationService';
import { ApiMapService } from '../services/apiMapService';
import { HomeChatPage } from '../pages/home-chat/home-chat';

@NgModule({
  declarations: [
    MyApp,
    TreeView,
    LoginPage,
    ResultsPage,
    TabsPage,
    SpeedTestPage,
    OwnerImagesPage,
    DynamicFormWebPage,
    DynamicFormMobilePage,
    DynamicRangePage,
    HomeMenuPage,
    DynamicTreePage,
    DynamicListPage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    GoogleMapPage,
    SignaturePage,
    HomeChatPage,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StorageServiceModule,
    SocketIoModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TreeView,
    LoginPage,
    ResultsPage,
    TabsPage,
    SpeedTestPage,
    OwnerImagesPage,
    DynamicFormWebPage,
    DynamicFormMobilePage,
    DynamicRangePage,
    HomeMenuPage,
    DynamicTreePage,
    DynamicListPage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    GoogleMapPage,
    HomeChatPage,
    SignaturePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    SQLite,
    ApiGraphService,
    ApiImageService,
    ApiAuthService,
    ApiStorageService,
    ApiSqliteService,
    ApiSpeedTestService,
    ApiHttpPublicService,
    ApiMediaService,
    ApiResourceService,
    ApiLocationService,
    ApiMapService,
    RequestInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler, 
      useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
