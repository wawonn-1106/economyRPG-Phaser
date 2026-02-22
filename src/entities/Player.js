export default class Player extends Phaser.Physics.Arcade.Sprite{
    /*thisは常にそのSceneクラス(親)、もしくはSpriteクラス(子)を表す。このファイルのthisはSprite自身を表すもの。
    WorldSceneではPlayerクラスをthis.playerと呼んでいるが、Playerは自分のことをthisと呼ぶ
    例）自分を呼ぶとき僕、親が自分を呼ぶときは名前で呼ぶ、この違い*/
    constructor(scene,x,y,texture,frame){
        super(scene,x,y,texture,frame);//frameはBase→World→Playerの順で渡される

        scene.physics.world.enable(this);//当たり判定の準備、this.bodyが使えるようになる
        scene.add.existing(this);//sceneにthis(this.player)を追加する。このsceneはWorld,House,Shopとか

        this.setScale(0.04).refreshBody();
        this.setCollideWorldBounds(true);
        this.setPushable(false);

        this.speed=80;
        //this.jump_speed=-330;

        this.heldItem=scene.add.image(x,y,null).setVisible(false);
        this.heldItem.setScale(0.5);
        this.heldItem.setDepth(this.depth+1);//setDepth = z-index

        this.uiScene = scene.scene.get('UIScene');

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
        if(!this.active) return;

        const ui=this.scene.scene.get('UIScene');
        const isMenuOpen=ui.menuManager.isOpenMenu;
        const isTalking=this.scene.dialogManager.isTalking;

        if(isMenuOpen||isTalking){
            this.setVelocity(0);
            return;
        }

        let moving=false;

        const isRightDown=this.cursors.right.isDown;
        const isLeftDown=this.cursors.left.isDown;
        const isUpDown=this.cursors.up.isDown;
        const isDownDown=this.cursors.down.isDown;

        if(isRightDown){
            this.setVelocityX(this.speed);
            //this.anims.play('walk-right',true);
            moving=true;
        }
        else if(isLeftDown){
            this.setVelocityX(-this.speed);
            //this.anims.play('walk-left',true);
            moving=true;
        }

        if(isUpDown){
            this.setVelocityY(-this.speed);
            //this.anims.play('walk-up',true);
            moving=true;
        }
        else if(isDownDown){
            this.setVelocityY(this.speed);
            //this.anims.play('walk-down',true);
            moving=true;
        }

        if(!moving){
            this.setVelocity(0);
            //this.anims.play('idle',true);
        }

        if(this.heldItem){
            const isDecorating=this.uiScene.isDecorationMode;
            const hasItem=this.heldItem.texture.key&& this.heldItem.texture.key!=='__MISSING';

            this.heldItem.setVisible(isDecorating &&hasItem);

            this.heldItem.setPosition(this.x+25,this.y+15);
        }
        
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }/*normalize()→方向はそのままで速さを１に固定。そこにscale(this.speed)をかけて
        斜めに進んでも加速しなくなる*/
    }
}