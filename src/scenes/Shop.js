import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';

export default class Shop extends BaseScene{
    constructor(){
        super({key:'Shop'});/*BaseSceneを経由して、このsceneをShopという名前で登録
                            BaseSceneはPhaser.Sceneを継承してるからそこで子(Shop,World)などと一緒に登録*/
    }
    create(data){
        console.log("Shopシーン開始！");
        super.create(data);//親クラス(BaseScene)のcreate()を実行。そこにはinventoryDataをjsonから取得するのがある

        this.initManagers();
        this.initInput();
        this.initPlacementPreview();
        this.initDecorationGrid();

        this.interactables=[];

        this.scene.launch('UIScene');//Sceneは基本一個づつ表示だが、ShopではShopシーンを消さずにUISceneを立ち上げるように命令。他のSceneでもね。

        const map=this.createMap('shop','Serene_Village_48x48','tileset');
  
        this.player = new Player(this, 0, 0,'player');
        //this.player = this.physics.add.sprite(0, 0, 'player').setScale(0.1);
        //どのシーンに出すかが指定できないadd.spriteは不適

        this.setPlayerSpawnPoint(data);

        this.setupSceneTransitions(map, this.player);

        this.villagers=this.physics.add.group();

        const villagerData=[
            {x:800,y:800,key:'player',startId:'greet',name:'マイク'},
            {x:1000,y:1000,key:'player',startId:'start',name:'ジェシカ'},
            {x:1200,y:1200,key:'player',startId:'daily',name:'サンドラ'},
        ];

        villagerData.forEach(data=>{
            const newVillager=new NPC(this,data.x,data.y,data.key,data);
            this.villagers.add(newVillager);

            this.interactables.push({type:'npc',instance:newVillager});
        });

        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);
        
        this.setupCamera(this.player);
    }
    update(time,delta){
        super.update(time, delta);

        this.updateInteractables(this.player);
        this.updatePlacementPreview();

        this.player.update();/*イメージしづらいが、this.playerはPlayer.jsで作ったから。
        　　　　　　　　　　　　this.player.updateってここでかいてもShop.jsのupdateは実行されない*/

        this.villagers.getChildren().forEach(v=>v.update(time,delta));
        //ここのupdateはNPC.jsのupdate。new NPCでインスタンス作ってるから。
    }
}