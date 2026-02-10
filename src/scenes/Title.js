export default class Title extends Phaser.Scene{
    constructor(){
        super({key:'Title'});
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
                
                this.scene.start('World');
            });
        })

        startBtn.on('pointerdown',()=>{
            startBtn.disableInteractive();
            continueBtn.disableInteractive();

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{

                this.scene.start('World');
            });
        });
    }
}