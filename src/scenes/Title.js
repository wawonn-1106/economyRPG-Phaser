export default class Title{
    constructor(){
        super({key:'Title'});
    }
    create(){
        this.add.image(400,300,'')//背景画像を決めておく

        const startBtn=document.getElementBtId('start-button');
        startBtn.classList.remove('hidden');

        startBtn.onclick=()=>{
            startBtn.classList.add('hidden');

            this.camera.main.once('camerafadeoutcomplete',()=>{
                this.scene.start('World');
            });
        };
    }
}