export default class SettingsContent{
    constructor(uiScene){
        this.uiScene=uiScene;
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);

        const title=this.uiScene.add.text(0,-250,'設定',{
            fontSize:'32px',
                //
        });
        container.add(title);

        const bgmSlider=this.createSlider(-200,-100,'BGM音量',(vol)=>{
            this.uiScene.sound.volume=vol;//まだ作ってない
            //sound.bgmの名前.volumeにしてね。
        });
        container.add(bgmSlider);

        const returnBtn=this.uiScene.add.text(0,150,'タイトルに戻る',{
            fontSize:'28px',
            padding:{x:10},
            color:'#000'
        }).setOrigin(0.5).setInteractive({usaHandCursor:true});

        returnBtn.on('pointerdown',()=>{
            const activeScene=this.uiScene.scene.manager.getScenes(true).find(s=>s.scene.key!=='UIScene');

            if(activeScene){
                activeScene.cameras.main.fadeOut(1000,0,0,0);
                this.uiScene.cameras.main.fadeOut(1000,0,0,0);

                activeScene.cameras.main.once('camerafadeoutcomplete',()=>{
                    activeScene.scene.start('Title');
                });
            }
        });
        container.add(returnBtn);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        const backBtn=this.uiScene.add.text(440,-285,'←',{//なんかデフォルトが低い
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());
        backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('menu'));

        container.add([closeBtn,backBtn]);

        return container;
    }
    createSlider(x,y,labelText,callback){
        const sliderGroup=this.uiScene.add.container(x,y);

        const track=this.uiScene.add.image(0,0,'slider-track');//まだ
        const trackWidth=track.displayWidth;

        const label=this.uiScene.add.text(-trackWidth,-40,labelText,{
            fontSize:'24px',
            color:'#000000'
        });

        const currentVol=this.uiScene.sound.volume;//同様に名前もね

        const initialX=(currentVol*trackWidth)-(trackWidth/2);

        const handle=this.uiScene.add.image(initialX,0,'slider-handle')
            .setInteractive({draggable:true,useHandCursor:true});
        
        handle.on('drag',(pointer,dragX)=>{
            const minX=-trackWidth/2;
            const maxX=trackWidth/2;

            handle.x=Phaser.Math.Clamp(dragX,minX,maxX);

            const volume=(handle.x-minX)/trackWidth;

            callback(volume);
        });

        sliderGroup.add([track,label,handle]);

        return sliderGroup;
        //return sliderContainer;
    }
}