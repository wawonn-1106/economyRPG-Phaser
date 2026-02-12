import Player from '../entities/Player.js';
//import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';

export default class World extends BaseScene{
    constructor(){
        super({key:'World'});

        this.player=null;
        this.villagers=null;
        //this.inventoryData=[];
        this.currentWeather='Clear';
        this.weatherEffect=null;
    }
    create(data){//このdataはscene.start('World')のときに渡される引数
        super.create(data);
        //this.interactables=[];

        this.scene.launch('UIScene');
//-------------------------------------------------------マップ---------------------------------------------------------------------------------
        const map=this.createMap('map','Serene_Village_48x48','tileset');
//----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,500,500,'player-walk-down');

        this.setPlayerSpawnPoint(data)

        this.setupSceneTransitions(map, this.player);

        const testData=this.cache.json.get('playerData');
        //最初の書き換えをjsonでやって、↑そのデータを受け取って個体値の決定。
        this.profileManager.initTutorialProfile(testData.name);
//----------------------------------------------------------当たり判定----------------------------------------------------------------------
        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);
//-------------------------------------------------------------カメラ--------------------------------------------------------------------------
        this.setupCamera(this.player);
    }
    update(time,delta){
        //if(!this.player)return;
        
        super.update(time, delta);
        //updateInteractables,placementPre3viewなどは、このsuper.update()でBaseSceneのものを実行

        this.player.update();
    }    
}