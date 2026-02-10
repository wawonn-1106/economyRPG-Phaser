import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';

export default class House extends BaseScene{
    constructor(){
        super({key:'House'});
    }
    create(data){
        super.create(data);

        this.initManagers();
        this.initInput();
        this.initPlacementPreview();
        this.initDecorationGrid();

        this.interactables=[];

        this.scene.launch('UIScene');

        const map=this.createMap('house','Serene_Village_48x48','tileset');

        this.player=new Player(this,0,0,'player');

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

        this.player.update();

        this.villagers.getChildren().forEach(v=>v.update(time,delta));
    }
}