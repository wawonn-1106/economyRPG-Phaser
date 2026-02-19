export default class DeskContent{
    constructor(uiScene,menuManager){
        this.uiScene=uiScene;
        this.menuManager=menuManager;

        this.currentView='select';
        this.container=null;
        this.contentLayer=null;
    }
    createView(){

        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);
        
        this.refresh();
        return this.container;
    }
    refresh(){
        if(this.contentLayer)this.contentLayer.destroy();

        this.contentLayer=this.uiScene.add.container(0,0);
        this.container.add(this.contentLayer);

        switch(this.currentView){
            case 'select':
                this.renderSelectView();
                break;
            case 'study':
                this.renderStudyView();
                break;
            case 'work':
                this.renderWorkView();
                break;
        }
    }
    renderSelectView(){
        const title=this.uiScene.add.text(0,-180,'何をしますか？',{
            fontSize:'40px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.contentLayer.add(title);

        const options=[
            {id:'study',name:'勉強をする',icon:'study',x:-220},
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
                fontSty:'bold'
            }).setOrigin(0.5);

            const buttonIcon=this.uiScene.add.image(0,30,option.icon)
                .setOrigin(0.5)
                .setDisplaySize(200,200);

            buttonGroup.add([buttonBg,buttonText,buttonIcon]);

            this.contentLayer.add(buttonGroup);

            buttonBg.on('pointerdown',()=>{
                this.currentView=option.id;

                this.refresh();
            });
        });
    }
    renderStudyView(){
        const studyTitle=this.uiScene.add.text(0,-180,'勉強します',{
            fontSize:'40px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.contentLayer.add(studyTitle);

        const backBtn=this.uiScene.add.text(480,-280,'←',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        backBtn.on('pointerdown',()=>{
            this.currentView='select';
            this.refresh();

        });

        this.contentLayer.add(backBtn);
    }
    renderWorkView(){
        const workTitle=this.uiScene.add.text(0,-180,'事務作業します',{
            fontSize:'40px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.contentLayer.add(workTitle);

        const backBtn=this.uiScene.add.text(480,-280,'←',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        backBtn.on('pointerdown',()=>{
            this.currentView='select';
            this.refresh();

        });

        this.contentLayer.add(backBtn);
    }
    /*get currentInventory(){
        const data=this.uiScene.registry.get('inventoryData')||[];

        console.log('ゲッターのデータ',JSON.parse(JSON.stringify(data)));
        return data;
        
    }*/
}