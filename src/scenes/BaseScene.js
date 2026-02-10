import DialogManager from "../managers/DialogManager.js";
import Player from '../entities/Player.js';
//import DialogManager from '../managers/DialogManager.js';
import NPC from '../entities/NPC.js';
//import House from './House.js';
import MenuManager from '../managers/MenuManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import ProfileManager from '../managers/ProfileManager.js';
import DictionaryManager from '../managers/DictionaryManager.js';
//import ProfileContent from '../contents/ProfileContent.js';
import MachineManager from '../managers/MachineManager.js';
//import UIScene from "./UIScene.js";

export default class BaseScene extends Phaser.Scene{
    constructor(config){
        super(config);

        this.interactables=[];
        this.inventoryData = [];
        this.readyIcon=null;
        this.readyActionType=null;
        this.actionTarget=null;
        this.isWraping=false;

        this.placePreview=null;
        this.canPlace=false;
    }
    create(data){
        this.initData = data;
        this.isWraping = false;

        let inventory=this.registry.get('inventoryData');
        if(!inventory){
            const json=this.cache.json.get('inventoryData');
            inventory=[...json.items];
            //これでSceneで毎回jsonを取得しなくてよくなる
            this.registry.set('inventoryData',inventory);
        }

        this.inventoryData=inventory;

        this.initPlacementPreview();
    }
    initManagers(){
        this.dialogManager=new DialogManager(this);
        this.profileManager=new ProfileManager(this); 
        //this.dialogManager=new DialogManager(this);
        this.machineManager=new MachineManager(this);
        this.dictionaryManager=new DictionaryManager(this);
        this.inventoryManager=new InventoryManager(this);   
        this.menuManager=new MenuManager(this);
        //this.uiScene=new UIScene(this);勘違いしてた。Sceneはインスタンスじゃなくてscene.get('')で取得する
        const ui = this.scene.get('UIScene'); 
        this.dialogManager.setUIScene(ui);
    }
    initInput(){
        this.cursors=this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-SPACE',()=>{
            console.log('クリックされました');
            this.handleAction();//スペース押されたら、アクションを起こせるかどうかの可否と、アクションへの分岐
        })
    }
    initPlacementPreview(){
        this.placePreview=this.add.sprite(0,0,'')
            .setAlpha(0.5)
            .setVisible(false)
            .setDepth(1000);
    }
    initDecorationGrid(){
        this.decorationGrid=this.add.graphics();
        this.decorationGrid.setDepth(20000);
    }
    createMap(mapKey,tilesetName,tilesetKey){
        this.map=this.make.tilemap({key:mapKey});
        this.tileset=this.map.addTilesetImage(tilesetName,tilesetKey);

        this.groundLayer=this.map.createLayer('Ground',this.tileset,0,0);
        this.onGroundLayer=this.map.createLayer('OnGround',this.tileset,0,0);
        this.houseLayer=this.map.createLayer('House',this.tileset,0,0);
        this.decorationLayer=this.map.createLayer('Decoration',this.tileset,0,0);

        [this.groundLayer,this.onGroundLayer,this.houseLayer].forEach(layer=>{
            if(layer) layer.setCollisionByProperty({collides:true});
        });//forEachとかは配列にしか使えない。{}で分割代入はできないよ、Object.()を使うならできる

        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);

        this.readyIcon=this.add.text(0,0,'▼',//なんかいい場所がなかったからここに置いとく
            {fontSize:'24px'}
        ).setOrigin(0.5).setVisible(false).setDepth(10);

        return this.map;//SceneでcreateMap(情報をいれて);を呼ぶ形でマップは書く
    }
    setupCollisions(target){
        const objectLayer=[this.groundLayer,this.onGroundLayer,this.houseLayer];

        objectLayer.forEach(layer=>{
            if(layer){
                this.physics.add.collider(target,layer);
            }
        })
    }
    handleAction(){
        if (this.dialogManager.inputMode) return;

        if(this.dialogManager.isTalking){
            const currentLine=this.dialogManager.currentSequence[this.dialogManager.currentIndex];
            if(currentLine && currentLine.next){
                this.dialogManager.jumpTo(currentLine.next);
            }else{
                this.dialogManager.end();
            }
            return;
        }

        if(this.placePreview&& this.placePreview.visible&& this.canPlace){
            this.placeItem();
            return;
        }

        if(this.readyActionType){
            switch(this.readyActionType){
                case 'npc':
                    const npc=this.actionTarget.instance;
                    this.dialogManager?.start('chapter1',npc.startId,npc.npcName);
                    //chapter1(独占市場)は変える予定あり、chapter2(寡占市場),chapter3(完全競争市場)
                    break;
                    
                case 'door':
                case 'exit':
                    //入る処理
                    if (this.isWraping) return;
                    //this.isWraping = true;

                    const targetScene=this.actionTarget.data.properties.find(p=>p.name==='target')?.value;
                    const spawnPointName=this.actionTarget.data.properties.find(p=>p.name==='spawnPoint')?.value;

                    if(targetScene){
                        this.performTransition(targetScene,spawnPointName);
                    }
                    break;
                
                case 'machine':
                    this.menuManager.toggle('machine');
                    break;
                case 'displayShelf':
                    //店に並べる画面
                    console.log('クリックされた');
                    break;
                case 'fishingSpot':
                    //console.log('釣りの開始');
                    const spot=this.actionTarget;

                    if(spot.isAvailable){
                        this.player.setVelocity(0);
                        this.player.body.enable=false;

                        spot.isAvailable=false;//ここでfalseに
                        if(spot.markerIcon) spot.markerIcon.setVisible(false);

                        const ui=this.scene.get('UIScene');
                        ui.startFishing((success)=>{
                            if(success){
                                console.log('成功');

                                this.time.delayedCall(30000,()=>{
                                    spot.isAvailable=true;
                                    if(spot.markerIcon) spot.markerIcon.setVisible(true);
                                });
                            }
                            this.player.body.enable=true;
                        });
                    }
                    break;
                case 'rock':
                case 'wood':
                case 'fence':
                case 'equipment'://machineがいいなぁ、被る。
                case 'chest':
                case 'furniture':
                case 'tile':

                console.log('ダメージを受けてる');
                const target=this.interactables.find(i=>i.instance===this.actionTarget);
                if(!target) return;

                const ui=this.scene.get('UIScene');
                const inventory=this.registry.get('inventoryData');
                const selectedItem=inventory[ui.selectedSlotIndex];
                const toolId=selectedItem? selectedItem.id:'hand';

                let canBreak=false;

                switch(target.type){
                    case 'rock':
                        if(toolId==='pickaxe') canBreak=true;
                        break;
                    case 'wood':
                    case 'chest':
                        if(toolId==='axe')canBreak=true;
                        break;
                    case 'equipment':
                        if(toolId==='pickaxe')canBreak=true;
                        break;
                    case 'fence':
                    case 'tile':
                    case 'furniture':
                        canBreak=true;
                        break;
                }

                if(canBreak){
                    this.damageInteractable(target);
                }else{
                    //ここで惚れない時の音とか
                }
                break;
                    //const rock=this.actionTarget;
                    /*const rock=this.interactables.find(i=>i.instance===this.actionTarget.instance);

                    rock.hp--;
                    console.log(rock.hp);

                    if(rock.hp<=0){
                        rock.instance.destroy();

                        this.interactables=this.interactables.filter(i=>i!==rock);
                        this.readyIcon.setVisible(false);//ない方がいいかも
                    }
                    break;*/

                    //const doorName=this.actionTarget.data.name;

                    /*this.player.body.enable=false;
                    this.cameras.main.fadeOut(1000,0,0,0);

                    this.cameras.main.once('camerafadeoutcomplete',()=>{*/
                    //const data={fromDoor:targetValue};

                        /*switch(targetValue){
                            case 'house':
                                this.scene.start('House',data);
                                break;
                            case 'shop':
                                this.scene.start('Shop',data);
                                break;
                            case 'machine':
                                //加工画面を開く
                                this.menuManager.toggle('machine');
                                break;
                            case 'displayShelf':
                                //店に並べる画面
                                console.log('クリックされた');
                                break;
                        }*/
                    //});
                }
            }                
    }
    setupSceneTransitions(map,player){
        const objectLayer=map.getObjectLayer('Object');
        if(!objectLayer) return;

        objectLayer.objects.forEach(obj=>{
            if(obj.name==='wrap'){
                const zone=this.add.zone(obj.x+obj.width/2,obj.y+obj.height/2,obj.width,obj.height);
                this.physics.add.existing(zone,true);

                const targetScene=obj.properties?.find(p=>p.name==='target')?.value;
                const spawnPointName=obj.properties?.find(p=>p.name==='spawnPoint')?.value;

                this.physics.add.overlap(player,zone,()=>{
                    if(targetScene&& !this.isWraping){
                        this.performTransition(targetScene,spawnPointName);
                    }
                });
            }

            if(obj.name==='door' || obj.name==='exit'){
                this.interactables.push({
                    type:'door',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2)
                });
            }

            if(obj.name==='machine'){
                this.interactables.push({
                    type:'machine',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2)
                });
            }

            if(obj.name==='displayShelf'){
                this.interactables.push({
                    type:'displayShelf',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2)
                });
            }

            if(obj.name==='fishingSpot'){

                const fishIcon=this.add.image(obj.x+(obj.width/2),obj.y+(obj.height/2),'fishIcon')
                    .setDepth(5)
                    .setVisible(true);

                this.interactables.push({
                    type:'fishingSpot',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2),
                    isAvailable:true,
                    markerIcon:fishIcon
                });
            }

            if(obj.name==='rock'){
                const durability=obj.properties?.find(p=>p.name==='durability')?.value;
                const subType=obj.type || 'stone';

                const rockSprite=this.add.sprite(obj.x+(obj.width/2),obj.y+(obj.height/2),subType)
                    .setDepth(5);

                this.physics.add.existing(rockSprite,true);
                this.physics.add.collider(player,rockSprite);//NPCにもつける

                this.interactables.push({
                    type:'rock',
                    subType:subType,
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2),
                    hp:durability,
                    instance:rockSprite
                });
            }
        });
    }
    performTransition(nextScene,spawnPoint){
        if(this.isWraping) return;
        //this.isWraping=true;

        this.player.body.enable=false;

        this.cameras.main.fadeOut(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
            //this.isWraping=false;

            this.scene.start(nextScene,{spawnPoint:spawnPoint});
           // this.scene.start(nextScene,spawnPoint);
        });
    }
    setPlayerSpawnPoint(data){
        if(!data) return;

        const objectLayer=this.map.getObjectLayer('Object');
        
        const spawnHolder=objectLayer.objects.find(obj=>{
            const prop=obj.properties?.find(p=>p.name==='spawnHolder');
            return prop?.value===data.spawnPoint;
        })

        if(spawnHolder){
            const x=spawnHolder.x+(spawnHolder.width/2);
            const y=spawnHolder.y+(spawnHolder.height/2);

            this.player.setPosition(x,y);
        }
    }
    spawnItemNearPlayer(itemData){
        if(!itemData) return;

        let offsetX=0;
        let offsetY=0;
        const distance=45;

        const dir=this.player.direction;//まだ定義してない

        switch(dir){
            case 'left':
                offsetX=-distance;
                break;
            case 'right':
                offsetX=distance;
                break;
            case 'up':
                offsetY=-distance;
                break;
            case 'down':
                offsetY=distance;
                break;
            default:
                offsetY=10; 
        }

        const dropX=this.player.x+offsetX;
        const dropY=this.player.y+offsetY;

        const item=this.physics.add.sprite(dropX,dropY,itemData.id);

        item.setScale(0.8).setDepth(dropY);

        item.setData('info',JSON.parse(JSON.stringify(itemData)));

        /*if(this.groundItems){
            this.groundItems.add(item);
        }*///後で作る用
    }
    damageInteractable(target){
        console.log('ダメージを受けてる');
        if(!target.hp&& target.hp!==0){
            target.hp=2;
            target.maxHp=2;
        }

        target.hp--;

        this.showItemHealthBar(target);

        if(target.healthbar)target.healthbar.destroy();

        //----------------------画像orグラフで耐久値の表示↓

        if(target.hp<=0){
            if(target.healthbar)target.healthbar.destroy();

            this.destroyAndDrop(target);
        }
    }
    showItemHealthBar(target){
        if(!target.healthbarContainer){
            const x=target.instance.x;
            const y=target.instance.y;

            const container=this.add.container(x,y);

            const bg=this.add.image(0,0,'bar-bg').setOrigin(0.5);

            const fill=this.add.image(-(bg.displayWidth/2),0,'bar-fill').setOrigin(0,0.5);

            container.add([bg,fill]);
            container.setDepth(10000);

            target.healthbarContainer=container;
            target.healthbarFill=fill;
            target.barFullWidth=bg.displayWidth;
        }else{
            target.healthbarContainer.setAlpha(1);
        }

        const barPercent=target.hp/target.maxHp;

        const targetScaleX=(target.barFullWidth*barPercent)/target.healthbarFill.displayWidth;

        this.tweens.add({
            targets:target.healthbarFill,
            scaleX:targetScaleX,
            duration:150,
            ease:'Cubic easeOut'
        });

        if(target.barTimer)target.barTimer.remove();

        target.barTimer=this.time.delayedCall(2000,()=>{
            if(target.healthbarContainer){

                this.tweens.add({
                    targets:target.healthbarContainer,
                    alpha:0,
                    duration:400,
                    onComplete:()=>{
                        target.healthbarContainer?.destroy();
                        target.healthbarContainer=null;
                    }
                });
            }
        });
    }
    destroyAndDrop(target){
        const itemData=target.data|| {id:target.type};

        const x=target.instance.x;
        const y=target.instance.y;

        target.instance.destroy();
        this.interactables=this.interactables.filter(item=>item!==target);

        this.spawnItemAtPoint(x,y,itemData);
    }
    spawnItemAtPoint(x,y,itemData){
        const item=this.physics.add.sprite(x,y,itemData.id);

        item.setScale(0.8).setDepth(y+10);
        item.setData('info',itemData);
        item.setData('canPickup',false);

        this.time.delayedCall(1000,()=>{
            if(item.active) item.setData('canPickup',true);
        });

        if(this.groundItems)this.groundItems.add(item);
    }
    /*wrapToScene(targetKey){
        this.player.body.enable=false;

        this.cameras.main.fadeOut(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
            this.scene.start(targetKey,{fromDoor:targetKey});
        })

    }*/
   setDecorationMode(active){
        this.isDecorationMode=active;
        this.decorationGrid.clear();

        console.log('setDecorationModeです');

        if(this.isDecorationMode){
            this.decorationGrid.lineStyle(1,0xffffff,0.2);

            const gridSize=48;

            const width=this.map.widthInPixels;
            const height=this.map.heightInPixels;

            console.log(`絵画開始、${width}${height}`);
            
            this.decorationGrid.beginPath();

            for(let x=0;x<=width;x+=gridSize){
                this.decorationGrid.moveTo(x,0);

                this.decorationGrid.lineTo(x,height);
            }

            for(let y=0;y<=height;y+=gridSize){
                this.decorationGrid.moveTo(0,y);

                this.decorationGrid.lineTo(width,y);
            }
        
        this.decorationGrid.closePath();
        this.decorationGrid.strokePath();

        console.log('五目');
    }
   }
    updatePlacementPreview(){
        if(!this.isDecorationMode)return;
        
        const ui=this.scene.get('UIScene');
        if(!this.inventoryData)return;

        const inventory=this.registry.get('inventoryData');
        if(!inventory)return;

        const selectedItem=inventory[ui.selectedSlotIndex];

        if(selectedItem&& selectedItem.isPlaceable){//placeableは後で付ける
            this.placePreview.setVisible(true);
            this.placePreview.setTexture(selectedItem.id);

            const offset=48;
            const gridSize=48;
            let targetX=this.player.x+(this.player.flipX ?-gridSize:gridSize);
            //let targetX=this.player.x;
            let targetY=this.player.y;

            if(this.player.flipX){
                targetX-=offset;
            }else{
                targetX+=offset;
            }

            
            const gridX=Math.floor(targetX/gridSize)*gridSize+(gridSize/2);
            const gridY=Math.floor(targetY/gridSize)*gridSize+(gridSize/2);

            this.placePreview.setPosition(gridX,gridY);

            if(this.canPlaceAt(gridX,gridY)){
                this.placePreview.clearTint();
                this.canPlace=true;
            }else{
                this.placePreview.setTint(0xff0000)//赤
                this.canPlace=false;
            }
        }else{
            this.placePreview.setVisible(false);
            this.canPlace=false;
        }
    }
    canPlaceAt(x,y){
        const isOverlapping=this.interactables.some(item=>{
            return item.x===x && item.y===y;
        });

        if(isOverlapping)return false;

        //const tile=this.onGroundLayer.getTileAtWorld(x,y);
        const checkLayers=[this.onGroundLayer,this.houseLayer];

        for(const layer of checkLayers){//for(const A of B){}
            //if (layer && typeof layer.getTileAtWorld=== 'function'){
                //↑getTileAtWorldは関数であると定義、getTileAtWorldはJSの機能じゃないから必要
                if(layer){
                    const tile=layer.getTileAtWorldXY(x,y);

                    if(tile&& tile.collides){
                    return false;
                }
                }  
            //}
        }
        return true;
    }
    placeItem(){
        const ui=this.scene.get('UIScene');

        const inventory=this.registry.get('inventoryData');

        const selectedItem=inventory[ui.selectedSlotIndex];
        if(!selectedItem)return;
        //const selectedItem=this.inventoryData[ui.selectedSlotIndex];

        const x=this.placePreview.x;
        const y=this.placePreview.y;

        const newItem=this.add.sprite(x,y,selectedItem.id).setDepth(y);

        this.physics.add.existing(newItem,true);
        this.physics.add.collider(this.player,newItem);
        this.physics.add.collider(this.villagers,newItem);

        this.interactables.push({
            type:selectedItem.id,
            instance:newItem,
            x:x,
            y:y,
            isPlaced:true//回収するときのフラグ
        });

        selectedItem.count--;

        if(selectedItem.count<=0){
            inventory[ui.selectedSlotIndex]=null;
        }

        this.registry.set('inventoryData',inventory);

        ui.updateHotbar(inventory);
    }
    setupCamera(target){
        this.cameras.main.startFollow(target,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    }
    updateInteractables(player){
        let minDistance=100;
        let closestItem=null;//機械、ドア、NPCで近いものに▼マークを付ける
        let bestPriority=999;

        this.interactables.forEach(item=>{

            if(item.type==='fishingSpot'){//釣り竿持ってるときだけ、釣り可能
                const ui=this.scene.get('UIScene'); 
                //const inventory=this.inventoryData;//Worldから持ってきてるけど今日json形式に変える
                const inventory=this.registry.get('inventoryData');

                const selectedId=inventory[ui.selectedSlotIndex]?.id;

                if(selectedId!=='fishing-rod'){
                    return;
                }
            }

            if(item.type==='rock'){//釣り竿持ってるときだけ、釣り可能
                const ui=this.scene.get('UIScene');
                //const inventory=this.inventoryData;//Worldから持ってきてるけど今日json形式に変える
                const inventory=this.registry.get('inventoryData');

                const selectedId=inventory[ui.selectedSlotIndex]?.id;

                if(selectedId!=='pickaxe'){
                    return;
                }
            }

            let targetX=item.type==='npc' ? item.instance.x:item.x;
            let targetY=item.type==='npc' ? item.instance.y:item.y;

            const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,targetX,targetY);

            if(dist<minDistance){
                let priority=3;
                if(item.type==='npc') priority=0;
                else if(item.type=='machine') priority=1;
                else if(item.type=='door') priority=2;
                else if(item.type=='exit') priority=2;//ここ

                if(priority<bestPriority || (priority===bestPriority&& dist<minDistance)){
                    minDistance=dist;
                    bestPriority=priority;

                    closestItem={
                        ...item,
                        currentX:targetX,
                        currentY:targetY
                    };
                }
            }
        });

        const isMenuOpen=this.menuManager?.isOpenMenu || false;
        const isBusy=this.dialogManager?.isTalking || isMenuOpen;

        if(closestItem && !isBusy){
            this.readyActionType=closestItem.type;
            this.actionTarget=closestItem;
            this.readyIcon.setVisible(true);
            this.readyIcon.setPosition(closestItem.currentX,closestItem.currentY-50);

        }else{
            this.readyActionType=null;
            this.actionTarget=null;
            this.readyIcon.setVisible(false);
        }
    }
    update(){
        if(this.isDecorationMode){
            this.updatePlacementPreview();
        }else{
            this.placePreview.setVisible(false);
        }
    }
}