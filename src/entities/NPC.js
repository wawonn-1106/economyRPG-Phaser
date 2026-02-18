export default class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture,config){//Baseのscenee
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
        const avaliableShelves=this.scene.allShelves.filter(
            s=>!s.isOccupied&& s.shelfData.item&& s.shelfData.item.id
        );


        if(avaliableShelves.length>0){
            const target=Phaser.Utils.Array.GetRandom(avaliableShelves);

            this.currentTarget=target;
            target.sprite.isOccupied=true;

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
        this.relaseTarget();

        /*if(this.currentTarget){
            this.currentTarget.sprite.isOccupied=false;
        }*/

        if(Math.random()<0.7){
            //if(this.currentTarget)this.currentTarget.isOccupied=false;

            this.findNextShelf();
        }else{
            this.state='leaving';
        }
    }
    handleExit(){
        const exitX=520;
        const exitY=1200;

        const distance=Phaser.Math.Distance.Between(this.x,this.y,exitX,exitY);

        if(distance<10){
            //if(this.currentTarget)this.currentTarget.isOccupied=false;
            this.relaseTarget();
            this.destroy();
        }else{
            this.scene.physics.moveTo(this,exitX,exitY,this.speed);
        }
    }
    isPurchase(){
        if(!this.currentTarget||!this.currentTarget.shelfData.item){
            this.decideNextAction();
            return;        
        }

        if(Math.random()<0.7){
            console.log('商品が購入されました');

            this.executePurchase(this.currentTarget);
        }else{
            console.log('買うのをやめました');

            this.decideNextAction();
        }
    }
    executePurchase(shelf){
        const item=shelf.shelfData.item;
        if(!item)return;

        const currentMoney=this.scene.registry.get('money')||0;
        this.scene.registry.set('money',currentMoney+item.price);

        this.scene.recordSale({
            itemId:item.id,
            sellPrice:item.price,
            marketPrice:item.marketPrice,
            npcId:this.npcName,
            realQuality:item.realQuality,
            displayQuality:item.displayQuality,
            cost:item.cost||0
        });

        shelf.shelfData.item=null;
        //shelf.sprite.isOccupied=false;

        shelf.updateDisplay();
    }
    relaseTarget(){
        if(this.currentTarget){
            this.currentTarget.isOccupied=false;
            this.currentTarget=null;
        }
    }
    updateShopLogic(time,delta){

        if((this.state==='moving'||this.state==='browsing')&& this.currentTarget){

            if(!this.currentTarget.shelfData.item){
                this.relaseTarget();

                this.decideNextAction();

                this.state='leaving';//途中で商品戻したら帰る
                return;
            }
        }

        switch(this.state){
            case 'enter':
                this.findNextShelf();
                break;
            case 'moving':
                this.handleMoving();
                break;
            case 'browsing':
                this.moveTimer-=delta;
                if(this.moveTimer<=0)this.isPurchase();
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