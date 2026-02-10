export default class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture,config){
        super(scene,x,y,texture);

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.npcName=config.name;
        this.startId=config.startId;

        this.setScale(0.1).refreshBody();
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.setPushable(false);

        this.moveTimer=0;
        this.currentDir=new Phaser.Math.Vector2(0,0);
    }
    update(time,delta){
        if(this.scene.dialogManager.isTalking){
            this.setVelocity(0);
            return;
        }

        this.moveTimer-=delta;
        if(this.moveTimer<=0){
            this.decideNextAction();
        }
    }
    decideNextAction(){
        if(Math.random()<0.5){
            this.setVelocity(0);
            this.moveTimer=Phaser.Math.Between(1000,3000);
        }else{
            const dir=[[100,0],[-100,0],[0,100],[0,-100]];
            const selected=dir[Phaser.Math.Between(0,3)];

            this.setVelocity(selected[0],selected[1]);
            this.currentDir.set(selected[0],selected[1]);
            this.moveTimer=Phaser.Math.Between(500,1500);
        }
    }
}