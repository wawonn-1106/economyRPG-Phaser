import NPC from '../entities/NPC.js';
import BaseScene from './BaseScene.js';
//import Player from '../entities/Player.js';

export default class Shop extends BaseScene{
    constructor(){
        super({key:'Shop'});/*BaseSceneを経由して、このsceneをShopという名前で登録
                            BaseSceneはPhaser.Sceneを継承してるからそこで子(Shop,World)などと一緒に登録*/
    }
    create(data){
        const map=this.createMap('shop','Serene_Village_48x48','tileset');

        if(!this.scene.isActive('UIScene')){
            this.scene.launch('UIScene');//Sceneは基本一個づつ表示だが、ShopではShopシーンを消さずにUISceneを立ち上げるように命令。他のSceneでもね。
        }
        
        console.log("Shopシーン開始！");
        super.create(data);//親クラス(BaseScene)のcreate()を実行。そこにはinventoryDataをjsonから取得するのがある
        
        
        
  
        //this.player = new Player(this, 0, 0,'player');
        //this.player = this.physics.add.sprite(0, 0, 'player').setScale(0.1);
        //どのシーンに出すかが指定できないadd.spriteは不適

        //this.setPlayerSpawnPoint(data);

        this.setupSceneTransitions(map, this.player);

        const maxCust=this.registry.get('maxCustomers')||6;

        const initialCount=Phaser.Math.Between(1,Math.floor(maxCust/2));

        for(let i=0;i<initialCount;i++){
            this.spawnInitialCustomer();
        }

        this.time.addEvent({
            delay:10000,
            callback:this.spawnCustomer,
            callbackScope:this,
            loop:true
        });

    }
    getPresentCustomerNames(){
        return this.villagers.getChildren().filter(v=>v.isGuest).map(v=>v.npcName);
    }
    spawnInitialCustomer(){
        const customerData=this.cache.json.get('customerData');//いったん直で
        //mongoにも送るようにすること。registryを使うこと
        const presentNames=this.getPresentCustomerNames();

        const avaliableCustomers=customerData.customerList.filter(c=>!presentNames.includes(c.name));

        const avaliableShelves=this.allShelves.filter(
            s=>!s.sprite.isOccupied&& s.shelfData.item&& s.shelfData.item.id
        );

        if(avaliableCustomers.length>0 &&avaliableShelves.length>0){
            const customer=Phaser.Utils.Array.GetRandom(avaliableCustomers);

            const targetShelf=Phaser.Utils.Array.GetRandom(avaliableShelves);

            targetShelf.sprite.isOccupied=true;

            const config={...customer,isGuest:true,state:'browsing'};
            const guest=new NPC(this,targetShelf.sprite.x,targetShelf.sprite.y+48,customer.npcId,config);
            guest.currentTarget=targetShelf;

            this.villagers.add(guest);
            this.setupCollisions(guest);

            this.interactables.push({type:'npc',instance:guest});
        }
    }
    spawnCustomer(){
        const maxCust=this.registry.get('maxCustomers')||6;
        const currentGuests=this.villagers.getChildren().filter(v=>v.isGuest);

        if(currentGuests.length>=maxCust)return;

        const customerData=this.cache.json.get('customerData');//いったん直で
        const presentNames=this.getPresentCustomerNames();

        const avaliableCustomers=customerData.customerList.filter(c=>!presentNames.includes(c.name));

        //const emptyShelves=this.allShelves.filter(s=>!s.sprite.isOccupied);
        const avaliableShelves=this.allShelves.filter(
            s=>!s.sprite.isOccupied&& s.shelfData.item&& s.shelfData.item.id
        );

        if(avaliableCustomers.length>0 &&avaliableShelves.length>0){
            const customer=Phaser.Utils.Array.GetRandom(avaliableCustomers);

            const targetShelf=Phaser.Utils.Array.GetRandom(avaliableShelves);

            targetShelf.sprite.isOccupied=true;

            const config={...customer,isGuest:true,state:'enter'};
            const guest=new NPC(this,520,1200,customer.npcId,config);
            guest.currentTarget=targetShelf;

            this.villagers.add(guest);
            this.setupCollisions(guest);
        }

        
    }
    update(time,delta){
        super.update(time, delta);

        this.player.update();/*イメージしづらいが、this.playerはPlayer.jsで作ったから。
        　　　　　　　　　　　　this.player.updateってここでかいてもShop.jsのupdateは実行されない*/

        //this.villagers.getChildren().forEach(v=>v.update(time,delta));
        //ここのupdateはNPC.jsのupdate。new NPCでインスタンス作ってるから。↑Baseに移動
    }
}