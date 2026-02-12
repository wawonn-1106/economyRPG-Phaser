import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';

export default class House extends BaseScene{
    constructor(){
        super({key:'House'});
    }
    create(data){
        super.create(data);

        //this.interactables=[];NPCもBaseでインスタンス化するようにしたのでこれも不要
        //これがあったら親でインスタンス化してもらったNPCのデータも空にしてしまう

        this.scene.launch('UIScene');

        const map=this.createMap('house','Serene_Village_48x48','tileset');

        this.player=new Player(this,0,0,'player');

        this.setPlayerSpawnPoint(data);

        this.setupSceneTransitions(map, this.player);

        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);

        this.setupCamera(this.player);
    }
    update(time,delta){
        super.update(time, delta);

        this.player.update();
    }
}