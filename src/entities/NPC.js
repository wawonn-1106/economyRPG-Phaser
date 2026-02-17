export default class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture,config){
        super(scene,x,y,texture);

        this.state=config.state;
        this.currentTarget=null;
        this.speed=100;

        //this.npcId=texture;

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.npcName=config.name;
        this.startId=config.startId;

        this.setScale(0.1).refreshBody();
        this.setCollideWorldBounds(true);
        
        //↓この2つはセット、押されても動かない
        this.setImmovable(true);
        this.setPushable(false);

        this.moveTimer=0;
        this.currentDir=new Phaser.Math.Vector2(0,0);
        /*向いている方向の情報を保持。(1,0)→右、(-1,0)→左、(0,1)→下、(0,-1)→上　※左上が原点*/
    }
    update(time,delta){
        if(this.scene.dialogManager.isTalking){
            this.setVelocity(0);
            return;
        }

        const activeScene=this.scene.scene.manager.getScenes(true);
        const currentScene=activeScene.find(s=>s.scene.key!=='UIScene');

        if(!currentScene)return;

        if(currentScene.scene.key==='Shop'){
            this.updateShopLogic(time,delta);
        }else{
            this.updateOutsideLogic(time,delta);
        }

        
    }
    findNextShelf(){
        const avaliableShelves=this.scene.allShelves.filter(s=>!s.isOccupied);

        if(avaliableShelves.length>0){
            const target=Phaser.Utils.Array.GetRandom(avaliableShelves);

            this.currentTarget=target;
            target.isOccupied=true;

            this.targetX=target.sprite.x;
            this.targetY=target.sprite.y+48;

            this.state='moving';
        }else{
            this.state='leaving';

        }
    }
    handleMoving(){
        const distance=Phaser.Math.Distance.Between(this.x,this.y,this.targetX,this.targetY);

        if(distance<5){
            this.setVelocity(0);

            this.state='browsing';

            this.moveTimer=Phaser.Math.Between(2000,5000);
        }else{
            this.scene.physics.moveTo(this,this.targetX,this.targetY,this.speed);

            this.currentDir.set(this.body.velocity.x,this.body.velocity.y);
        }
    }
    decideNextAction(){
        if(Math.random()<0.7){
            if(this.currentTarget)this.currentTarget.isOccupied=false;

            this.findNextShelf();
        }else{
            this.state='leaving';
        }
    }
    handleExit(){
        const exitX=400;
        const exitY=850;

        const distance=Phaser.Math.Distance.Between(this.x,this.y,exitX,exitY);

        if(distance<10){
            if(this.currentTarget)this.currentTarget.isOccupied=false;
            this.destroy();
        }else{
            this.scene.physics.moveTo(this,exitX,exitY,this.speed);
        }
    }
    updateShopLogic(time,delta){
        switch(this.state){
            case 'enter':
                this.findNextShelf();
                break;
            case 'moving':
                this.handleMoving();
                break;
            case 'browsing':
                this.moveTimer-=delta;
                if(this.moveTimer<=0)this.decideNextAction();
                break;
            case 'leaving':
                this.handleExit();
                break;
        }
    }
    updateOutsideLogic(time,delta){
        this.moveTimer-=delta;

        if(this.moveTimer<=0){
            if(Math.random()<0.5){//Math.random()→0以上1未満からランダムに選ぶ
                this.setVelocity(0);
                this.moveTimer=Phaser.Math.Between(1000,3000);//1000以上3000以下の整数をランダムに選ぶ
            }else{
                const dir=[[100,0],[-100,0],[0,100],[0,-100]];
                const selected=dir[Phaser.Math.Between(0,3)];//方向を決める

                this.setVelocity(selected[0],selected[1]);//選んだ方向の要素をセット
                this.currentDir.set(selected[0],selected[1]);//選んだ方向(向き)を記憶(アニメーション用)
                this.moveTimer=Phaser.Math.Between(500,1500);//0.5~1.5秒動く
            }
        }

        
    }
}