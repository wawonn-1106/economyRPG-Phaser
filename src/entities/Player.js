export default class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture,frame){
        super(scene,x,y,texture,frame);

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setScale(0.1).refreshBody();
        this.setCollideWorldBounds(true);
        this.setPushable(false);

        this.speed=200;
        this.jump_speed=-330;

        this.heldItem=scene.add.image(x,y,null).setVisible(false);
        this.heldItem.setScale(0.5);
        this.heldItem.setDepth(this.depth+1);

        this.cursors=scene.cursors;
    }
    updateHeldItem(textureKey){
        if(!textureKey){
            this.heldItem.setVisible(false);
        }else{
            this.heldItem.setTexture(textureKey);
            this.heldItem.setVisible(true);
        }
    }
    update(){
        if(!this.active) return;//体力があるかどうか？？
        let moving=false;//アニメーションを再生するかのブーリアン

        const isRightDown=this.cursors.right.isDown;
        const isLeftDown=this.cursors.left.isDown;
        const isUpDown=this.cursors.up.isDown;
        const isDownDown=this.cursors.down.isDown;
        
        //会話中、インベントリを開いてる間は動けなくする
        /*if(this.scene.dialogManager.isTalking){
            this.setVelocity(0);
            this.anims.play('idle',true);
            return;
        }
        if(this.scene.menuManager.isOpenMenu){
            this.setVelocity(0);
            this.anims.play('idle',true);
            return;
        }
        /*if(this.scene.inventoryManager.isOpenInv){
            this.setVelocity(0);
            return;
        }*/

        if(isRightDown){
            this.setVelocityX(this.speed);
            //this.anims.play('walking-right',true);
            moving=true;
        }
        else if(isLeftDown){
            this.setVelocityX(-this.speed);
            //this.anims.play('walking-left',true);
            moving=true;
        }

        if(isUpDown){
            this.setVelocityY(-this.speed);
            //this.anims.play('walking-up',true);
            moving=true;
        }
        else if(isDownDown){
            this.setVelocityY(this.speed);
            //this.anims.play('walking-down',true);
            moving=true;
        }

        if(!moving){
            this.setVelocity(0);
            //this.anims.play('idle',true);
        }

        if(this.heldItem.visible){
            this.heldItem.setPosition(this.x+25,this.y+15).setDisplaySize(30,30);
            //this.x,yがプレイヤーのいる位置
        }
        
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }
    }
}