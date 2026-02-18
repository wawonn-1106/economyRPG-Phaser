export default class ProfileContent{
    constructor(uiScene,x,y){
        this.uiScene=uiScene;
        this.worldScene=this.uiScene.scene.get('World');
        //this.graphics=null;

        //this.statLabels=[];

        this.playerData={
            name:'尾道太郎',
            shopName:'おのみち屋さん',
            startDate:"2026年 2月 13日",
            totalAssets:'1,500,000G'
        };
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const frontSide=this.uiScene.add.container(0,0);

        const frontBg=this.uiScene.add.image(0,0,'profile-front-bg').setDisplaySize(1000,600);

        const headerRect=this.uiScene.add.rectangle(0,-240,950,80,0x1e88e5);
        const headerText=this.uiScene.add.text(0,-240,'PLAYER ID CARD',{
            fontSize:'40px',
            color:'#ffffff',
            fontStyle:'bold'
        }).setOrigin(0.5);

        const photo=this.uiScene.add.rectangle(-300,0,200,250,0xcccccc).setStrokeStyle(2,0x888888);;
        
        const infoX=-80;
        const labelStyle={fontSize:'24px',color:'#666666'};
        const valueStyle={fontSize:'24px',color:'#666666',fontStyle:'bold'};

        const namelabel=this.uiScene.add.text(infoX,-140,'氏　名',labelStyle);
        const nameVal=this.uiScene.add.text(infoX+100,-145,this.playerData.name,valueStyle);

        const shopLabel=this.uiScene.add.text(infoX,-60,'店　名',labelStyle);
        const shopVal=this.uiScene.add.text(infoX+100,-65,this.playerData.shopName,valueStyle);

        const dateLabel=this.uiScene.add.text(infoX,20,'開始日',labelStyle);
        const dateVal=this.uiScene.add.text(infoX+100,15,this.playerData.startDate,valueStyle);

        const assetLabel=this.uiScene.add.text(infoX,100,'総資産',labelStyle);
        const assetVal=this.uiScene.add.text(infoX+100,95,this.playerData.totalAssets,valueStyle);

        const lines=[];

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5000);

        const backBtn=this.uiScene.add.text(440,-285,'←',{//なんかデフォルトが低い
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5000);

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());
        backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('menu'));

        //frontSide.add([closeBtn,backBtn]);裏面のみ

        for(let i=0;i<4;i++){
            const lineY=-100+(i*80);
            const line=this.uiScene.add.line(0,0,infoX,lineY,infoX+500,lineY,0xaaaaaa).setOrigin(0);

            lines.push(line);
        }

        const footerText=this.uiScene.add.text(0,260,'ONOMICHI MANAGEMENT UNIVERCITY',{
            fontSize:'24px',
            color:'#1e88e5',
            fontStyle:'bold'
        }).setOrigin(0.5);


        frontSide.add([
            frontBg,headerRect,headerText,photo,namelabel,nameVal,
            shopLabel,shopVal,dateLabel,dateVal,
            assetLabel,assetVal,...lines,footerText
        ]);


        const backSide=this.uiScene.add.container(0,0);
        const backBg=this.uiScene.add.image(0,0,'profile-back-bg').setDisplaySize(1000,600);

        backSide.add(backBg);

        backSide.scaleX=0;

        container.add([backSide,frontSide]);

        let isFront=true;

        frontBg.setInteractive({useHandCursor:true});
        backBg.setInteractive({useHandCursor:true});

        const flipCard=()=>{
            const outTarget=isFront? frontSide: backSide;
            const inTarget=isFront? backSide: frontSide;

            this.uiScene.tweens.add({
                targets:outTarget,
                scaleX:0,
                duration:200,
                onComplete:()=>{
                    isFront=!isFront;
                    this.uiScene.tweens.add({
                        targets:inTarget,
                        scaleX:1,
                        duration:200
                    });
                }
            });    
        }

        backSide.add([closeBtn,backBtn]);


        frontBg.on('pointerdown',flipCard);
        backBg.on('pointerdown',flipCard);

        return container;

    }
}