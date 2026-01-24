export default class Title extends Phaser.Scene{
    constructor(){
        super({key:'Title'});
    }
    preload(){
        this.load.image('title','assets/images/title-image.png');
    }
    create(){
        const titleScreen=document.getElementById('title-screen');
        if(titleScreen){
            titleScreen.classList.remove('hidden');
        }
        //↑再表示した時、前回消したとしても毎回表示してくれる

        this.add.image(640,360,'title')//背景画像を決めておく

        const startBtn=document.getElementById('start-button');
        if(startBtn){
            startBtn.classList.remove('hidden');
        }

        startBtn.onclick=()=>{
            startBtn.classList.add('hidden');

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{
                titleScreen.classList.add('hidden');

                this.scene.start('World');
            });
        };
    }
}