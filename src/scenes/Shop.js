import NPC from '../entities/NPC.js';
import DialogManager from '../managers/DialogManager.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';

export default class Shop extends BaseScene{
    constructor(){
        super({key:'Shop'});

    }
    /*init(data){
        this.fromDoor=data.fromDoor;
    }*/
    create(data){
        //console.log("Shopシーン開始！");
        super.create(data);

        this.initManagers();
        this.initInput();

        this.interactables=[];

        this.scene.launch('UIScene');

        const map=this.createMap('shop','Serene_Village_48x48','tileset');

        //this.player = this.physics.add.sprite(0, 0, 'player').setScale(0.1);
        this.player = new Player(this, 0, 0,'player');

        this.setPlayerSpawnPoint(data);

        this.setupSceneTransitions(map, this.player);


        this.villagers=this.physics.add.group();

        const villagerData=[
            {x:800,y:800,key:'player',startId:'greet',name:'マイク'},
            {x:1000,y:1000,key:'player',startId:'start',name:'ジェシカ'},
            {x:1200,y:1200,key:'player',startId:'daily',name:'サンドラ'},
        ];

        villagerData.forEach(data=>{
            //第五引数のdataはNPC.jsでconfigとして受け取る。必要に応じてconfig.startIdで取得できる。第六まで増やす必要もない。
            const newVillager=new NPC(this,data.x,data.y,data.key,data);//this忘れ、どこに書けばいいかわからなかったことによるエラー。
            this.villagers.add(newVillager);

            this.interactables.push({type:'npc',instance:newVillager});
        });

        /*this.villagers.getChildren().forEach(v=>{
            this.interactables.push({type:'npc',instance:v,x:v.x,y:v.y});
        });*///なんで同じことやってた？

        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);
        

        this.setupCamera(this.player);
        /*this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels);*/

    }
    update(time,delta){
        this.updateInteractables(this.player);

        this.player.update();

        /*const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);*/

        this.villagers.getChildren().forEach(v=>v.update(time,delta));
    }
}