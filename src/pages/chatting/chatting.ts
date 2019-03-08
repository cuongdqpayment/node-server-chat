import { ViewChild, Component } from '@angular/core';
import { NavController, Events, Slides, ToastController, Ion } from 'ionic-angular';

import { ApiChattingService } from '../../services/apiChattingService';

import Icons from '../../assets/icon/icons';

@Component({
  selector: 'page-chatting',
  templateUrl: 'chatting.html'
})

export class ChattingPage {
  @ViewChild(Slides) slides: Slides;
  icons=[];
  iconTypes = {
    icon:1,
    list:2,
    button:3
  }

  iconTypeList = [
    {name:'icon',value:1},
    {name:'list',value:2},
    {name:'button',value:3},
    ];
  iconType=this.iconTypes.icon;

  constructor(private navCtrl: NavController, 
              private events: Events,
              private apiChatting: ApiChattingService,
              private toastCtrl: ToastController) {}

  ngOnInit() {    
    this.icons=Icons;
  }

  getIcons(ev){

    var val = ev.target.value;
    if (val && val.trim() != '') {
      this.icons = Icons.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }else{
      this.icons = Icons;
    }
  }

  selectIcon(icon)
  {
    console.log(icon);
  }


  resetFilter(e){

  }

  goToSlide(i) {
    this.slides.slideTo(i, 500);
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    console.log('Current index is', currentIndex);
  }
}