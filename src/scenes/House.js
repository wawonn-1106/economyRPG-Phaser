//import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';
//import Player from '../entities/Player.js';

export default class House extends BaseScene{
    constructor(){
        super({key:'House'});
    }
    create(data){
        const map=this.createMap('house','Serene_Village_48x48','tileset');

        super.create(data);

        //this.interactables=[];NPCもBaseでインスタンス化するようにしたのでこれも不要
        //これがあったら親でインスタンス化してもらったNPCのデータも空にしてしまう

        this.scene.launch('UIScene');

        //this.player=new Player(this,0,0,'player');

        //this.setPlayerSpawnPoint(data);

        this.setupSceneTransitions(map, this.player);
    }
    update(time,delta){
        super.update(time, delta);

        this.player.update();

        const uiScene=this.scene.get('UIScene');

        if(uiScene&& uiScene.menuManager&& uiScene.menuManager.isOpenMenu){
        
            const currentTab=uiScene.menuManager.currentTab;
            const content=uiScene.menuManager.contents[currentTab];

            if(content&& content.update){
                content.update(time, delta); 
            }
        }
    }
}