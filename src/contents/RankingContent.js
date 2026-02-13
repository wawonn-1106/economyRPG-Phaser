export default class RankingContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.rankings={
            sales:[
                {name:'ポール',value:'50,000G'},
                {name:'マリア',value:'40,000G'},
                {name:'クリス',value:'34,000G'},
                {name:'フランク',value:'22,000G'},
                {name:'ピュー',value:'1,000G'},
                {name:'マーニー',value:'300G'},
            ],
            margin:[
                {name:'ショーン',value:'90%'},
                {name:'モーガン',value:'87%'},
                {name:'クリス',value:'80%'},
                {name:'プランク',value:'70%'},
                {name:'トーマス',value:'60%'},
                {name:'ビル',value:'20%'},
            ],
            reviews:[
                {name:'ジェシカ',value:'★4.9'},
                {name:'サンドラ',value:'★4.7'},
                {name:'ゲイル',value:'★4.3'},
                {name:'フランク',value:'★4'},
                {name:'マイク',value:'★3.5'},
                {name:'トール',value:'★2'},
            ]
        };

        this.currentTab='sales';
        this.tabButtons=[];
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);

        const title=this.uiScene.add.text(0,-260,'部門別ランキング🏆',{
            fontSize:'32px',
            color:'#000000',
            fontStyle:'bold',
            padding: { top: 10 }
        }).setOrigin(0.5);

        container.add(title);

        const tabs=[
            {id:'sales',label:'売上'},
            {id:'margin',label:'利益率'},
            {id:'reviews',label:'口コミ'},
        ];

        tabs.forEach((tabInfo,index)=>{
            const x=-200+(index*200);
            const isSelected=this.currentTab===tabInfo.id;

            const tabText=this.uiScene.add.text(x,-200,tabInfo.label,{
                fontSize:'24px',
                color:isSelected? '#000000': '#666666',
                fontStyle:'bold'
            }).setOrigin(0.5).setInteractive({useHandCursor:true});

            const line=this.uiScene.add.rectangle(x,-180,100,4,0x0000ff).setVisible(isSelected);

            this.tabButtons.push({id:tabInfo.id,text:tabText,line:line});

            tabText.on('pointerdown',()=>{
                this.currentTab=tabInfo.id;

                

                this.tabButtons.forEach(btn=>{
                    const active=(btn.id===this.currentTab);

                    btn.text.setColor(active? '#0000ff':'#666666');
                    btn.line.setVisible(active);

                    this.refreshRanking(scrollContainer);
                });                
            });
            container.add([tabText,line]);
        });

        const viewWidth=900;
        const viewHeight=330;
        const viewY=-140;

        const scrollContainer=this.uiScene.add.container(0,0);
        container.add(scrollContainer);

        this.refreshRanking(scrollContainer);

        const shape=this.uiScene.make.graphics();
        shape.fillStyle(0xffffff);

        shape.fillRect(
            (this.uiScene.scale.width/2)-(viewWidth/2),
            (this.uiScene.scale.height/2)+viewY,
            viewWidth,
            viewHeight
        );

        const mask=shape.createGeometryMask();
        scrollContainer.setMask(mask);

        const contentHeight=this.rankings[this.currentTab].length*80;
        const minScroll=contentHeight>viewHeight? -(contentHeight-viewHeight): 0;
        const maxScroll=0;

        const onWheel=(pointer,gameObjects,deltaX,deltaY)=>{
            if(!container.visible)return;

            scrollContainer.y-=deltaY;

            scrollContainer.y=Phaser.Math.Clamp(scrollContainer.y,minScroll,maxScroll);
        }

        this.uiScene.input.on('wheel',onWheel);

        container.on('destroy',()=>{
            this.uiScene.input.off('wheel',onWheel);

            shape.destroy();
        });

        return container;
    }
    refreshRanking(scrollContainer){
        scrollContainer.removeAll(true);

        scrollContainer.y=0;

        const data=this.rankings[this.currentTab];
        const startY=-100;

        data.forEach((item,index)=>{
            const row=this.createRankingRow(0,startY+(index*80),item,index);

            scrollContainer.add(row);
        })
    }
    createRankingRow(x,y,data,index){
        const row=this.uiScene.add.container(x,y);

        const bg=this.uiScene.add.rectangle(0,0,850,70,0x000000,(index%2===0? 0.05:0.1));

        const rankText=this.uiScene.add.text(-400,0,`${index+1}`,{
            fontSize:'28px',
            color:index<3? '#e67e22':'#555555',
            fontStyle:'bold'
        }).setOrigin(0,0.5);

        const nameText=this.uiScene.add.text(-320,0,data.name,{
            fontSize:'22px',
            color:'#000000'
        }).setOrigin(0,0.5);

        const valueText=this.uiScene.add.text(400,0,data.value,{
            fontSize:'24px',
            color:'#000000'
        }).setOrigin(1,0.5);

        row.add([bg,rankText,nameText,valueText]);

        return row;
    }
}