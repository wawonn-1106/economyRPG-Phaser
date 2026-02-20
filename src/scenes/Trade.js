import NPC from '../entities/NPC.js';
//import Player from '../entities/Player.js';
import BaseScene from './BaseScene.js';

export default class Trade extends BaseScene{
    constructor(){
        super({key:'Trade'});
    }
    create(data){
        const map=this.createMap('trade','Serene_Village_48x48','tileset');//いったんhouseで代用

        super.create(data); 

        this.scene.launch('UIScene');

        this.setupSceneTransitions(map, this.player);

        this.spawnInitialTrader();
    }
    spawnInitialTrader(){
            const rawData=this.cache.json.get('traderData');//いったん直で

            const traderData=rawData.traderList;
            
            const objectLayer=this.map.getObjectLayer('Object');
            const spawnPoints=objectLayer.objects.filter(obj=>obj.name==='trader_spawn');

            if(spawnPoints.length===0){
                console.log('スポーン地点が0です');
                return;
            }

            const randomTraders=Phaser.Utils.Array.Shuffle([...traderData]);
            const randomSpawnPoints=Phaser.Utils.Array.Shuffle([...spawnPoints]);

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
            }

            

    
            //const targetShelf=Phaser.Utils.Array.GetRandom(avaliableShelves);
    
            //targetShelf.sprite.isOccupied=true;
    
            //const config={...customer,isGuest:true,state:'browsing'};
            //const guest=new NPC(this,targetShelf.sprite.x,targetShelf.sprite.y+48,customer.npcId,config);
            //guest.currentTarget=targetShelf;

            
    }
    update(time,delta){
        super.update(time, delta);

        this.player.update();
    }}