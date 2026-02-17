import DialogManager from "../managers/DialogManager.js";
import MenuManager from '../managers/MenuManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import ProfileManager from '../managers/ProfileManager.js';
import DictionaryManager from '../managers/DictionaryManager.js';
import MachineManager from '../managers/MachineManager.js';
import NPC from "../entities/NPC.js";
import Player from "../entities/Player.js";
import ShopContent from "../contents/ShopContent.js";
//import Object from "../entities/Object.js";

export default class BaseScene extends Phaser.Scene{
    constructor(config){
        super(config);

        this.interactables=[];
        this.allShelves=[];
        this.inventoryData=[];
        this.readyIcon=null;
        this.readyActionType=null;
        this.actionTarget=null;
        this.isWraping=false;
        this.currentWeather='Clear';

        this.placePreview=null;
        this.canPlace=false;

        this.SERVER_URL='http://127.0.0.1:3000';
        this.isSaving=false;
        //this.WEATHER_SERVER_URL='http://localhost:3000';
    }
//----------初期化-------------------------------------------------------------------------------------------
    create(data){
        
        this.initData=data;
        this.isWraping=false;

        //await this.fetchWeather();

        this.initManagers();
        this.initInput();
        //this.initPlacementPreview();
        //this.initDecorationGrid();
        //this.initAnimations();
        //this.initPlacementPreview();

        //this.loadGameData();
        const money=this.registry.get('money');
        const inventory=this.registry.get('inventoryData');
        const playerPos=this.registry.get('playerPosition');
        const npcPos=this.registry.get('npcPositions');
        const placedItems=this.registry.get('placedItems');

        this.inventoryData=inventory||[];

        this.createEntities(playerPos,npcPos);
        
        if(data&& data.spawnPoint){
            this.setPlayerSpawnPoint(data);/*createEntitesでplayer作る前に実行するとエラーになる。
            かといって、createEntitiesの後に書くと、座標が上書きされて前回の位置からできないから、片方のみ実行*/
            data.spawnPoint=null;
        }

        /*if(placedItems&& placedItems.length>0){
            this.restorePlacedItems(placedItems);
        }*/

        this.setupCamera(this.player);//playerの座標が確定した後に呼ばないと、グインってなる

        this.events.once('shoutdown',()=>{
            this.physics.world.colliders.destroy();
        });

        this.currentWeather=this.registry.get('weather')||'Clear';

        if(this.currentWeather==='Rain'){
            this.createRain();
        }else if(this.currentWeather==='Snow'){
            this.createSnow();
        }else if(this.currentWeather==='Clouds'){
            this.createClouds();
        }
    }
    initManagers(){
        this.dialogManager=new DialogManager(this);
        this.profileManager=new ProfileManager(this); 
        this.machineManager=new MachineManager(this);
        this.dictionaryManager=new DictionaryManager(this);
        this.inventoryManager=new InventoryManager(this);   
        this.menuManager=new MenuManager(this);
        //this.shopManager=new ShopManager(this);
        //this.uiScene=new UIScene(this);勘違いしてた。Sceneはインスタンスじゃなくてscene.get('')で取得する
        const ui=this.scene.get('UIScene'); 
        this.dialogManager.setUIScene(ui);
        ui.dictionaryManager = this.dictionaryManager;
        //this.object=new Object(this);
    }
    initInput(){
        this.cursors=this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-SPACE',()=>{
            console.log('クリックされました');
            this.handleAction();//スペース押されたら、アクションを起こせるかどうかの可否と、アクションへの分岐
        })
    }
    /*initPlacementPreview(){
        this.placePreview=this.add.sprite(0,0,'')
            .setAlpha(0.5)
            .setVisible(false)
            .setDepth(1000);
    }
    initDecorationGrid(){
        this.decorationGrid=this.add.graphics();
        this.decorationGrid.setDepth(20000);
    }*/
    createEntities(playerPos,npcPos){
        if(this.villagers){
            this.villagers.destroy(true);
            this.villagers=null;
        }

        this.interactables=this.interactables.filter(item =>item.type!=='npc');

        console.log("渡されたdata:",playerPos.x,playerPos.y );
        this.player=new Player(this,playerPos.x,playerPos.y,'player'); 
        
        this.setupCollisions(this.player);

        this.villagers=this.physics.add.group();

        const currentSceneNPCs=npcPos.filter(n=>n.scene===this.scene.key);

        currentSceneNPCs.forEach(data=>{

            const newVillager=new NPC(this,data.x,data.y,data.npcId,data);
            newVillager.setDepth(100);

            this.villagers.add(newVillager);

            this.interactables.push({type:'npc',instance:newVillager});

            this.physics.add.collider(this.player,newVillager);

            this.setupCollisions(newVillager);
        });
    }
//----------アニメーション-------------------------------------------------------------------------------------------
    initAnimations(){
        this.anims.create({
            key:'walk-down',
            frames:this.anims.generateFrameNumbers('player-walk-down',{start:0,end:12}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'walk-up',
            frames:this.anims.generateFrameNumbers('player-walk-up',{start:0,end:11}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'walk-right',
            frames:this.anims.generateFrameNumbers('player-walk-right',{start:25,end:26}),
            frameRate:2,
            repeat:-1
        });
        this.anims.create({
            key:'walk-left',
            frames:this.anims.generateFrameNumbers('player-walk-left',{start:0,end:11}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'idle',
            frames:[{key:'player-walk-down',frame:0}],
            frameRate:20,
            //repeat:0の省略(-1は無限、0は１回)
        });
    }
//----------マップ(当たり判定、カメラ含む)-------------------------------------------------------------------------------------------
    createMap(mapKey,tilesetName,tilesetKey){
        this.map=this.make.tilemap({key:mapKey});
        this.tileset=this.map.addTilesetImage(tilesetName,tilesetKey);

        this.groundLayer=this.map.createLayer('Ground',this.tileset,0,0);
        this.onGroundLayer=this.map.createLayer('OnGround',this.tileset,0,0);
        this.houseLayer=this.map.createLayer('House',this.tileset,0,0);
        this.decorationLayer=this.map.createLayer('Decoration',this.tileset,0,0);

        [this.groundLayer,this.onGroundLayer,this.houseLayer].forEach(layer=>{
            if(layer) layer.setCollisionByProperty({collides:true});
        });//forEachとかは配列にしか使えない。{}で分割代入のようにはできない、Object.()を使うならできる

        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);

        this.readyIcon=this.add.text(0,0,'▼',//なんかいい場所がなかったからここに置いとく
            {fontSize:'24px'}
        ).setOrigin(0.5).setVisible(false).setDepth(10);

        return this.map;//SceneでcreateMap(情報をいれて);を呼ぶ形でマップは書く
    }
    setupCollisions(target){
        if(!target)return;
        
        const objectLayer=[this.groundLayer,this.onGroundLayer,this.houseLayer];

        objectLayer.forEach(layer=>{
            if(layer){
                this.physics.add.collider(target,layer);
            }
        })
    }
    setupCamera(target){
        if(!target)return;

        this.cameras.main.scrollX=target.x-this.cameras.main.width/2;
        this.cameras.main.scrollY=target.y-this.cameras.main.heigth/2;

        this.cameras.main.startFollow(target,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    }
//----------マップ移動-------------------------------------------------------------------------------------------
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
                const ui=this.scene.get('UIScene');
                const shelfId=obj.properties?.find(p=>p.name==='shelfId')?.value;

                let shelfInstance=this.allShelves.find(s=>s.shelfId===shelfId);;

                if(!shelfInstance){
                    shelfInstance=new ShopContent(ui,this.menuManager,shelfId);

                    this.allShelves.push(shelfInstance);

                    const shelfSprite=this.add.sprite(obj.x+(obj.width/2),obj.y+(obj.height/2),'shelf')
                    .setDepth(5);

                    shelfInstance.sprite=shelfSprite;
                    shelfSprite.isOccupied=false;

                    this.physics.add.existing(shelfSprite,true);
                    this.physics.add.collider(this.player,shelfSprite);

                    const savedItem=this.registry.get(`shelf_save_${shelfId}`);
                    if(savedItem)shelfInstance.shelfData.item=savedItem;
                }

                this.interactables.push({
                    type:'displayShelf',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2),
                    shelfId:shelfId,
                    shelfInstance:shelfInstance
                });
            }

            /*if(obj.name==='fishingSpot'){

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
                this.physics.add.collider(this.player,rockSprite);//NPCにもつける

                this.interactables.push({
                    type:'rock',
                    subType:subType,
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2),
                    hp:durability,
                    instance:rockSprite
                });
            }*/
        });
    }
    performTransition(nextScene,spawnPoint){
        if(this.isWraping) return;

        const ui=this.scene.get('UIScene');
        ui.setVisibleUI(false);

        /*if(ui.isDecorationMode){
            ui.toggleDecorationMode();
        }*/

        this.isWraping=true;

        this.player.body.enable=false;

        this.cameras.main.fadeOut(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
            //this.isWraping=false;
            ui.setVisibleUI(true);

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
//----------天気-------------------------------------------------------------------------------------------
    createRain(){
        this.weatherEffect=this.add.particles(0,0,'rain',{//画像のダウンロード必要、snowも
            x:{min:0,max:1280},
            y:-10,
            lifespan:2000,
            speedY:{min:400,max:600},
            quantity:5,
            scrollFactor:0
        });
    }
    createSnow(){
        this.weatherEffect=this.add.particles(0,0,'snow',{
            x:{min:0,max:1280},
            y:-20,
            lifespan:10000,
            speedX:{min:-30,max:30},
            speedY:{min:40,max:90},
            scale:{start:0.4,end:0.8},
            quantity:2,
            scrollFactor:0
        });
        this.weatherEffect.setDepth(1000);
    }
    createClouds(){
        const overlay=this.add.rectangle(0,0,1280,720,0x333344,0.4);//画面全体を曇らせる    

        overlay.setOrigin(0,0);
        overlay.setScrollFactor(0);
        overlay.setDepth(2000);      
    }
//----------データ保存-------------------------------------------------------------------------------------------
    async saveGameData(){
        if(this.isSaving){
            console.log('セーブ中なのでスキップ');
            return;
        }
        this.isSaving=true;

        try{
            //const villagersArray = this.villagers.getChildren();
            //console.log("セーブ対象のNPC数:", villagersArray.length);
            
            const allNPCPOsitions=this.registry.get('npcPositions')||[];

            const currentSceneNPCs=this.villagers.getChildren().map(npc=>({
                npcId:npc.texture.key,
                x:npc.x,
                y:npc.y,
                scene:this.scene.key,
                startId:npc.startId,
                type:'villager',
                name:npc.npcName
            }));

            const updatedNPCPositions=[
                ...allNPCPOsitions.filter(n=>n.scene!==this.scene.key),
                ...currentSceneNPCs
            ];

            this.registry.set('npcPositions',updatedNPCPositions);

            const currentGameTime=this.registry.get('gameTime');

            //const shelvesData=this.allShelves? this.allShelves.map(s=>s.shelfData):[this.shelfContent.shelfData];
            let shelvesData=this.registry.get('shelvesData')||[];

            if(this.allShelves&& this.allShelves.length>0){
                shelvesData=this.allShelves.map(s=>s.shelfData);
            }

            const payload={
                money:this.registry.get('money')||0,
                inventory:this.registry.get('inventoryData')||[],
                shelves:shelvesData,
                maxInventorySlots:this.registry.get('maxInventorySlots')||10,
                maxCustomers:this.registry.get('maxCustomers')||6,
                unlockedIds:this.registry.get('unlockedIds')||[],
                placedItems:this.interactables//消すかな
                    .filter(item=>item.isPlaced)
                    .map(item=>({
                        id:item.type,
                        x:item.x,
                        y:item.y,
                        shelfId:item.shelfId
                    })),
                
                playerPosition:{
                    x:this.player.x,
                    y:this.player.y,
                    scene:this.scene.key
                },

                npcPositions:updatedNPCPositions,
                gameTime:currentGameTime
            };

            console.log("送信データ:",payload);
        
            const response=await fetch(`${this.SERVER_URL}/save`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(payload)
            });

            const result=await response.json();

            console.log('セーブ成功',result);

        }catch(error){
            console.log('セーブ失敗',error);
        }finally{
            this.isSaving=false;
        }
    }
    /*async recordSale(saleInfo){
        try{
            const payload={
                money:this.registry.get('money'),
                newSale:{
                    itemId:saleInfo.id,
                    quality:saleInfo.quality,
                    setQuality:saleInfo.setQuality,
                    sellPrice:saleInfo.price,
                    fairPrice:saleInfo.marketPrice,
                    profit:saleInfo.price-(saleInfo.cost||0),
                    npcId:saleInfo.npcId
                }
            };

            const response=await fetch(`${this.SERVER_URL}/save`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(payload)
            });
            const result=await response.json();

            console.log('販売履歴を記録しました');
        }catch(error){
            console.error('販売履歴の記録に失敗',error);
        }
    }*/
    applySaveData(data){
        this.registry.set('money',data.money||0);
        this.registry.set('inventoryData',data.inventory||[]);

        //this.events.once('update',()=>{
            if(this.player&& data.playerPosition){
                this.player.setPosition(data.playerPosition.x,data.playerPosition.y);
            }

            //if(data.placedItems)this.restorePlacedItems(data.placedItems);
        //});
    }
//----------アクション系-------------------------------------------------------------------------------------------
    handleAction(){
        console.log("handleActionが呼ばれました");
        const ui=this.scene.get('UIScene');
        if(ui.menuManager&& ui.menuManager.isOpenMenu)return;

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

        /*if(this.placePreview&& this.placePreview.visible&& this.canPlace){
            this.placeItem();
            return;
        }

        if(ui&& ui.isDecorationMode)return;*/

        if(this.readyActionType){
            console.log("判定対象のタイプ:", this.readyActionType);
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
                case 'displayShelf'://shelfに変える
                    //店に並べる画面
                    const targetShelf=this.actionTarget.shelfInstance;

                    console.log("3. targetShelf の中身:",targetShelf);

                    if(targetShelf){
                        console.log("4. toggle 呼び出し直前。shelfDataの状態:",targetShelf.shelfData);
                        this.menuManager.toggle('shop',targetShelf);
                        console.log("5. toggle 呼び出し完了");
                    }else{
                        console.error("エラー: shelfInstance が見つかりません。");
                    }
                    break;

            }
        }                
    }
//----------デコレーションモード-------------------------------------------------------------------------------------------
    /*setDecorationMode(active){
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

        let inventory=[...this.registry.get('inventoryData')];

        const selectedItem=inventory[ui.selectedSlotIndex];
        if(!selectedItem)return;
        //const selectedItem=this.inventoryData[ui.selectedSlotIndex];

        const x=this.placePreview.x;
        const y=this.placePreview.y;

        const newItem=this.add.sprite(x,y,selectedItem.id).setDepth(y);

        let shelfId=null;
        let shelfInstance=null;

        if(selectedItem.id.includes('shelf')){
            shelfId=`shelf_${Date.now()}`;

            shelfInstance=new ShopContent(ui,this.menuManager,shelfId);

            if(!this.allShelves)this.allShelves=[];

            this.allShelves.push(shelfInstance);
        }

        this.physics.add.existing(newItem,true);
        this.physics.add.collider(this.player,newItem);
        this.physics.add.collider(this.villagers,newItem);

        this.interactables.push({
            type: selectedItem.id.includes('shelf') ? 'displayShelf' : selectedItem.id,
            instance:newItem,
            x:x,
            y:y,
            isPlaced:true,//回収するときのフラグ
            shelfId:shelfId,
            shelfInstance:shelfInstance
        });

        selectedItem.count--;

        if(selectedItem.count<=0){
            inventory[ui.selectedSlotIndex]={id:null,count:0};

            //手に持ってるものを消す処理の追加
            if(this.player&& this.player.updateHeldItem){
                this.player.updateHeldItem(null);
            }
            this.placePreview.setVisible(false);
            this.canPlace=false;
        }

        this.registry.set('inventoryData',[...inventory]);
        console.log("地面設置後のRegistry:",this.registry.get('inventoryData'));

        this.inventoryData=[...inventory];

        ui.updateHotbar(inventory);
    }*/
//-----------------Interactablesの更新------------------------------------------------------------------------------------
    updateInteractables(player){
        let minDistance=100;
        let closestItem=null;//機械、ドア、NPCで近いものに▼マークを付ける
        let bestPriority=999;

        this.interactables.forEach(item=>{

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
    restorePlacedItems(items){
        if(!items)return;

        items.forEach(item=>{
            const newItem=this.add.sprite(item.x,item.y,item.id).setDepth(item.y);

            this.physics.add.existing(newItem,true);
            this.physics.add.collider(this.player,newItem);

            if(this.villagers){
                this.physics.add.collider(this.villagers,newItem);
            }

            let shelfInstance=null;

            if(item.shelfId){
                const ui=this.scene.get('UIScene');
                shelfInstance=new ShopContent(ui,this.menuManager,item.shelfId);

                if(!this.allShelves)this.allShelves=[];

                this.allShelves.push(shelfInstance);
            }

            this.interactables.push({
                type:item.id,
                instance:newItem,
                x:item.x,
                y:item.y,
                isPlaced:true,
                shelfId:item.shelfId
            });
        });
    }
    update(time,delta){
        if (!this.player||!this.player.body)return;

        /*if(this.isDecorationMode){
            this.updatePlacementPreview();
        }else{
            this.placePreview.setVisible(false);
        }*/

        if(this.player){
            this.updateInteractables(this.player);
        }

        if(this.villagers){
            this.villagers.getChildren().forEach(v=>v.update(time,delta));
        }
    }
}