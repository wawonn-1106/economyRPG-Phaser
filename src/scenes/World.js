import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
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

        this.initManagers();
        this.initInput();
        this.initPlacementPreview();
        this.initDecorationGrid();

        this.interactables=[];
    //-------------------------------------------------------マップ---------------------------------------------------------------------------------
        const map=this.createMap('map','Serene_Village_48x48','tileset');
    
        this.scene.launch('UIScene');
    //----------------------------------------------------------操作説明ボタン------------------------------------------------------------------------------
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createGuideBtn();
    //----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,500,500,'player');

        this.setPlayerSpawnPoint(data)

        this.setupSceneTransitions(map, this.player);

        const testData=this.cache.json.get('playerData');
        //最初の書き換えをjsonでやって、↑そのデータを受け取って個体値の決定。
        this.profileManager.initTutorialProfile(testData.name);
    //--------------------------------------------------------NPC-------------------------------------------------------------
        this.villagers=this.physics.add.group();

        const villagerData=[
            {x:800,y:800,key:'player',startId:'greet',name:'マイク'},
            {x:1000,y:1000,key:'player',startId:'start',name:'ジェシカ'},
            {x:1200,y:1200,key:'player',startId:'daily',name:'サンドラ'},
        ];

        villagerData.forEach(data=>{
            //第五引数のdataはNPC.jsでconfigとして受け取る。必要に応じてconfig.startIdで取得できる。第六まで増やす必要もない。
            const newVillager=new NPC(this,data.x,data.y,data.key,data);
            this.villagers.add(newVillager);

            this.interactables.push({type:'npc',instance:newVillager});
        });
    //----------------------------------------------------------当たり判定----------------------------------------------------------------------
        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);
    //-------------------------------------------------------------カメラ--------------------------------------------------------------------------
        this.setupCamera(this.player);
    }
    update(time,delta){
        super.update(time, delta);

        this.updateInteractables(this.player);
        this.updatePlacementPreview();

        this.player.update();
        this.villagers.getChildren().forEach(v=>v.update(time,delta));

    }    
}