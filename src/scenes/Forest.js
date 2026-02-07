import NPC from '../entities/NPC.js';
import DialogManager from '../managers/DialogManager.js';
import BaseScene from './BaseScene.js';

export default class Forest extends BaseScene{
    constructor(){
        super({key:'Forest'});

        //this.isWraping=false;
        //this.fromDoor=null;
        //this.interactables=[];
        //this.nearstTarget=null;
        //this.readyIcon=null;
        //this.readyActionType=null;
        //this.actionTarget=null;
        //this.fromDoor=null;
        //this.isWraping=false;
    }
    /*init(data){
        this.fromDoor=data.fromDoor;
    }*/
    create(){
        this.initManagers();
        this.initInput();

        this.interactables=[];

        this.scene.launch('UIScene');

        const map=this.createMap('house','Serene_Village_48x48','tileset');//いったんhouseで代用

        this.player = this.physics.add.sprite(500, 400, 'player').setScale(0.1);
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
        });*/

        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);
        /*this.dialogManager = new DialogManager(this);

        const map = this.make.tilemap({ key: 'shop' });
    
        const tileset = map.addTilesetImage('Serene_Village_48x48','tileset');
        
        this.GroundLayer = map.createLayer('Ground', tileset, 0, 0); 
        //this.HouseLayer = map.createLayer('House', tileset, 0, 0);
        this.OnGroundLayer = map.createLayer('OnGround', tileset, 0, 0);

        //this.HouseLayer.setCollisionByProperty({ collides: true });
        this.OnGroundLayer.setCollisionByProperty({ collides: true });*/

        /*this.physics.add.collider(this.player, this.HouseLayer);
        this.physics.add.collider(this.player, this.OnGroundLayer);

        this.physics.world.setBounds(0,0,map.widthInPixels,map.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();*/

        /*const objectLayer=map.getObjectLayer('Object');
        
        //this.isWraping = false;

        //const objectLayer=map.getObjectLayer('Object');
        if(objectLayer){//家に入る、機械を開いたり、▼が出るアクション
            objectLayer.objects.forEach(object=>{
                if(object.name==='door' || object.name==='machine'){
                    this.interactables.push({
                        type:object.name,
                        data:object,
                        x:object.x+(object.width/2||0),
                        y:object.y+(object.height/2||0),
                    });
                }
            });
        }

        this.readyIcon=this.add.text(0,0,'▼',
            {fontSize:'24px'}
        ).setOrigin(0.5).setVisible(false).setDepth(10);
        if(objectLayer){
            objectLayer.objects.forEach(obj=>{
                if(obj.name==='exit'){
                    const exitRegion=this.add.zone(obj.x+obj.width/2,obj.y+obj.height/2,200,50);
                    this.physics.add.existing(exitRegion,true);

                    this.physics.add.overlap(this.player,exitRegion,()=>{
                        if(!this.isWraping){
                            this.isWraping=true;
                            this.player.body.enable=false;

                            this.cameras.main.fadeOut(1000,0,0,0);
                            this.cameras.main.once('camerafadeoutcomplete',()=>{
                                this.scene.start('World',{returnTo:this.fromDoor});
                            });
                        }
                    })
                }
            })
        }*/

        this.setupCamera(this.player);
        /*this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels);*/

    }
    update(time,delta){
        this.updateInteractables(this.player);

        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        this.villagers.getChildren().forEach(v=>v.update(time,delta));
    }
}