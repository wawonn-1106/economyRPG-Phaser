import NPC from '../entities/NPC.js';
import Player from '../entities/Player.js';
import BaseScene from './BaseScene.js';

export default class Forest extends BaseScene{
    constructor(){
        super({key:'Forest'});
    }
    create(data){
        super.create(data); 

        this.scene.launch('UIScene');

        const map=this.createMap('house','Serene_Village_48x48','tileset');//いったんhouseで代用
        //TiledでspwanPointとspawnHolder設定してないから0,0に飛ぶ。また今度マップも作る

        this.player = new Player(this, 0, 0,'player');
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