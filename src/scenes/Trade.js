import NPC from '../entities/NPC.js';
//import Player from '../entities/Player.js';
import BaseScene from './BaseScene.js';

export default class Trade extends BaseScene{
    constructor(){
        super({key:'Trade'});

        this.activeTraders=[];

    }
    create(data){
        const map=this.createMap('trade','Serene_Village_48x48','tileset');//いったんhouseで代用

        super.create(data); 

        this.spawnInitialTrader();


        /*const uiScene=this.scene.get('UIScene');
        if(uiScene){
            uiScene.tradeScene=this;
            if(uiScene.tradeContent){
                uiScene.tradeContent.tradeScene=this;
            }
        }*/

        this.scene.launch('UIScene');

        this.setupSceneTransitions(map, this.player);

    }
    spawnInitialTrader(){
        if(this.activeTraders){

            this.activeTraders.forEach(trader=>{
                if(trader.destroy)trader.destroy();
            });
        }

        this.activeTraders=[];

        const uiScene=this.scene.get('UIScene');
        const gameDay=uiScene.gameTime.day||1;

        const rawData=this.cache.json.get('traderData');//いったん直で

        const traderData=rawData.traderList;
            
        const objectLayer=this.map.getObjectLayer('Object');
        const spawnPoints=objectLayer.objects.filter(obj=>obj.name==='trader_spawn');

        if(spawnPoints.length===0){
            console.log('スポーン地点が0です');
            return;
        }

        const r=new Phaser.Math.RandomDataGenerator([gameDay.toString()]);

        const randomTraders=r.shuffle([...traderData]);
        const randomSpawnPoints=r.shuffle([...spawnPoints]);

        const traderCount=5;

            

        for(let i=0;i<traderCount;i++){
            if(!randomSpawnPoints[i]||!randomTraders[i])break;

            const spawnPoint=randomSpawnPoints[i];
            const trader=randomTraders[i];

            const guest=new NPC(
                this,spawnPoint.x,spawnPoint.y,trader.npcId,{...trader,isGuest:true}
            );

            this.villagers.add(guest);
            this.setupCollisions(guest);

            this.interactables.push({type:'npc',instance:guest});

            this.activeTraders.push(guest);
        }
    }
    update(time,delta){
        super.update(time, delta);

        this.player.update();

        const uiScene=this.scene.get('UIScene');

        if(uiScene&& uiScene.menuManager&& uiScene.menuManager.isOpenMenu){
            if(uiScene.menuManager.currentTab==='trade'){
                const content=uiScene.menuManager.contents['trade'];
                if(content){
                    content.update(); 
                }
            }
        }
    }
}