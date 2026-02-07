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
import UIScene from "./UIScene.js";

export default class BaseScene extends Phaser.Scene{
    constructor(config){
        super(config);

        this.interactables=[];
        this.readyIcon=null;
        this.readyActionType=null;
        this.actionTarget=null;
        this.isWraping=false;
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

    }
    initInput(){
        this.cursors=this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-SPACE',()=>{
            this.handleAction();//スペース押されたら、アクションを起こせるかどうかの可否と、アクションへの分岐
        })
    }
    createMap(mapKey,tilesetName,tilesetKey){
        this.map=this.make.tilemap({key:mapKey});
        this.tileset=this.map.addTilesetImage(tilesetName,tilesetKey);

        this.groundLayer=this.map.createLayer('Ground',this.tileset,0,0);
        this.onGroundLayer=this.map.createLayer('OnGround',this.tileset,0,0);
        this.houseLayer=this.map.createLayer('House',this.tileset,0,0);
        this.decorationLayer=this.map.createLayer('Decoration',this.tileset,0,0);

        [this.groundLayer,this.onGroundLayer,this.houseLayer].forEach(layer=>{
            if(layer) layer.setCollision({colloides:true});
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

        if(this.readyActionType){
            switch(this.readyActionType){
                case 'npc':
                    const npc=this.actionTarget.instance;
                    this.dialogManager.start('chapter1',npc.startId,npc.npcName);
                    //chapter1(独占市場)は変える予定あり、chapter2(寡占市場),chapter3(完全競争市場)
                    break;
                    
                case 'door':
                    //入る処理
                    if (this.isWraping) return;
                    this.isWraping = true;

                    const targetValue=this.actionTarget.data.properties.find(p=>p.name==='target')?.value;

                    //const doorName=this.actionTarget.data.name;

                    this.player.body.enable=false;
                    this.cameras.main.fadeOut(1000,0,0,0);

                    this.cameras.main.once('camerafadeoutcomplete',()=>{

                        const data={fromDoor:targetValue};

                        switch(targetValue){
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
                        }
                    });
                }
            }                
    }
    setupSceneTransitions(map,player){
        const objectLayer=map.getObjectLayer('Object');
        if(!objectLayer) return;

        objectLayer.objects.forEach(obj=>{
            if(obj.name==='exit' || obj.name==='wrap'){
                const zone=this.add.zone(obj.x+obj.width/2,obj.y+obj.height/2,obj.width,obj.height);
                this.physics.add.existing(zone,true);

                const targetScene=obj.properties?.find(p=>p.name==='targetScene')?.val;
                const targetDoor=obj.properties?.find(p=>p.name==='targetDoor')?.val;

                this.physics.add.overlap(player,zone,()=>{
                    this.performTransition(targetScene,{from:targetDoor});
                    //行く場所と入る前のシーンは記憶しておく
                });
            }

            if(obj.name==='door'){
                this.interactables.push({
                    type:'door',
                    data:obj,
                    x:obj.x+(obj.width/2),
                    y:obj.y+(obj.height/2)
                });
            }
        });
    }
    performTransition(nextScene,data){
        if(this.isWraping) return;
        this.isWraping=true;

        this.player.body.enable=false;

        this.cameras.main.fadeOut(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
            this.isWraping=false;

            this.scene.start(nextScene,data);
        });
    }
    /*wrapToScene(targetKey){
        this.player.body.enable=false;

        this.cameras.main.fadeOut(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete',()=>{
            this.scene.start(targetKey,{fromDoor:targetKey});
        })

    }*/
    setupCamera(target){
        this.cameras.main.startFollow(target,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    }
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
}