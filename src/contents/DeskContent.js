export default class DeskContent{
    constructor(uiScene,menuManager){
        this.uiScene=uiScene;
        this.menuManager=menuManager;

        this.container=null;
        this.contentLayer=null;
    }


    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.contentLayer=this.uiScene.add.container(0,0);
        this.container.add(this.contentLayer);

        this.renderSelectView();

        return this.container;
    }


    renderSelectView(){
        const title=this.uiScene.add.text(0,-180,'何をしますか？',{
            fontSize:'40px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.contentLayer.add(title);

        const options=[
            {id:'trade',name:'交易をする',icon:'trade',x:-220},
            {id:'work',name:'事務作業をする',icon:'work',x:200}
        ];

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        closeBtn.on('pointerdown',()=>{
            this.uiScene.menuManager.toggle('desk');
        });

        this.contentLayer.add(closeBtn);

        options.forEach(option=>{
            const buttonGroup=this.uiScene.add.container(option.x,40);

            const buttonBg=this.uiScene.add.rectangle(0,0,350,250,0x3498db,0.8)
                .setStrokeStyle(4,0xffffff)
                .setInteractive({useHandCursor:true});

            const buttonText=this.uiScene.add.text(0,80,option.name,{
                fontSize:'28px',
                color:'#fff',
                fontStyle:'bold'
            }).setOrigin(0.5);

            const buttonIcon=this.uiScene.add.image(0,30,option.icon)
                .setOrigin(0.5)
                .setDisplaySize(200,200);

            buttonGroup.add([buttonBg,buttonText,buttonIcon]);
            this.contentLayer.add(buttonGroup);

            buttonBg.on('pointerdown',()=>{
                
                this.uiScene.menuManager.toggle('desk');

                this.uiScene.menuManager.toggle(option.id);
            });
        });
    }
}