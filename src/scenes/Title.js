export default class Title extends Phaser.Scene{
    constructor(){
        super({key:'Title'});
    }
    preload(){
        this.load.image('title','assets/images/title-image.png');
        this.load.image('start-btn','assets/images/start-btn.png');//その場しのぎの画像
        this.load.image('continue-btn','assets/images/continue-btn.png');
    }
    create(){
        if (this.scene.isActive('UIScene')) {
            this.scene.stop('UIScene');
        }//これがないとタイトルに戻れない。returnTitleでUiSceneもfadeoutしたから

        this.add.image(640,360,'title');

        const continueBtn=this.add.image(640,300,'continue-btn').setInteractive({useHandCursor:true});
        const startBtn=this.add.image(640,550,'start-btn').setInteractive({useHandCursor:true});

        continueBtn.on('pointerdown',()=>{
            startBtn.disableInteractive();
            continueBtn.disableInteractive();

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{

                /*if (this.scene.isActive('UIScene')) {
                    this.scene.stop('UIScene');
                }*/

                this.scene.start('World');
            });
        })

        startBtn.on('pointerdown',()=>{
            startBtn.disableInteractive();
            continueBtn.disableInteractive();

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{

                /*if (this.scene.isActive('UIScene')) {
                    this.scene.stop('UIScene');
                }*/

                this.scene.start('World');
            });
        });
    }
}