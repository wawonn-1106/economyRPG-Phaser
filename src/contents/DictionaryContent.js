export default class DictionaryContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        //this.worldScene=this.uiScene.scene.get('World');
        this.quickViewContainer=null;
    }
    createQuickView(termData){

        if(this.quickViewContainer){
            this.quickViewContainer.destroy();
        }

        this.quickViewContainer=this.uiScene.add.container(640,360).setDepth(10000);
        //相対座標にする予定

        const overlay=this.uiScene.add.rectangle(0,0,1280,720,0x000000,0.3)
            .setDepth(500)//コンテナの中をクリックしてもとじなくしたい→できた
            .setInteractive();
        
        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(600,300);
        bg.setInteractive();
        //container.add(bg);//いったんmenu-bgで代用

        const title=this.uiScene.add.text(-180,-110,`[${termData.word}]`,{
            fontSize:'24px',
            color:'#000000',
            fontStyle:'bold'
        });

        const description=this.uiScene.add.text(-180,-60,`${termData.description}`,{
            fontSize:'24px',
            color:'#000000',
            wordWrap:{width:360}
        });

        const example=this.uiScene.add.text(-180,40,`${termData.example}`,{
            fontSize:'24px',
            color:'#000000',
            wordWrap:{width:360}
        });

        this.quickViewContainer.add([overlay,bg,title,description,example]);

        overlay.once('pointerdown',()=>{
            this.quickViewContainer.destroy();
        });

        return this.quickViewContainer;
    }
    createView(){
        /*用語はあらかじめダウンロードしておいて、unlockedのjsonデータで表示するか否かを決めてる。
        用語はこのファイルでダウンロードしてる*/
        
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'dictionary-bg').setDisplaySize(1000,600);
        container.add(bg);

        const unlockedIds=this.uiScene.registry.get('unlockedIds')||[];

        const listX=-300;
        const listY=-200;
        const listWidth=420;
        const listHeight=450;

        const scrollContent=this.uiScene.add.container(listX,listY);
        container.add(scrollContent);

        const maskShape=this.uiScene.make.graphics();
        
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(640+listX,360+listY,listWidth,listHeight);

        const mask=maskShape.createGeometryMask();
        scrollContent.setMask(mask);


        const data=this.uiScene.cache.json.get('termsData');
        const terms=data? data.terms:[];

        const listContainer=this.uiScene.add.container(-450,-200);
        container.add(listContainer);

        const detailContainer=this.uiScene.add.container(50,-200);
        container.add(detailContainer);

        const wordTitle=this.uiScene.add.text(0,0,'単語を選択してください',{
            fontSize:'32px',
            color:'#000000',
            fontStyle:'bold'
        });

        const categoryLabel=this.uiScene.add.text(0,50,'',{
            fontSize:'18px'
        });

        const descriptionText=this.uiScene.add.text(0,100,'',{
            fontSize:'22px',
            color:'#000000',
            wordWrap:{width:400}
        });

        const exampleText=this.uiScene.add.text(0,200,'',{
            fontSize:'22px',
            color:'#000000',
            wordWrap:{width:400}
        });

        detailContainer.add([wordTitle,categoryLabel,descriptionText,exampleText]);//wordTitleもいるなら

        terms.forEach((term,index)=>{//相対座標にするから毎回index使う、他の場所でも
            const y=index*55;
            const isUnlocked=unlockedIds.includes(term.id);
            const displayText=isUnlocked? term.word:'？？？？？';

            const termButton=this.uiScene.add.text(0,y,displayText,{
                fontSize:'24px',
                color:isUnlocked?'#000':'#999'
            }).setInteractive({useHandCursor:true});//ワードクリックしたら説明が出てくる感じに。
            //見開きの本みたいなUIにしよう

            if(isUnlocked){
                termButton.on('pointerdown',()=>{
                    wordTitle.setText(term.word);
                    categoryLabel.setText(`カテゴリ：${term.category}`);
                    descriptionText.setText(term.description ||'説明はありません');
                    exampleText.setText(term.example ||'例文はありません'); 
                });

                termButton.on('pointerover',()=>termButton.setColor('#000000'));
                termButton.on('pointerout',()=>termButton.setColor('#00FFFF'));
            }else{
                termButton.setAlpha(0.7);
            }
            
            scrollContent.add(termButton);
        });

        const contentHeight=terms.length*55;
        const scrollLimit=contentHeight>listHeight?contentHeight-listHeight:0;

        bg.setInteractive();
        bg.on('wheel',(pointer,deltaX,deltaY)=>{

            scrollContent.y-=deltaY;

            scrollContent.y=Phaser.Math.Clamp(scrollContent.y,listY-scrollLimit,listY);
        });

        return container;
    }
    hide(){
        if(this.quickViewContainer){
            this.quickViewContainer.destroy();
            this.quickViewContainer=null;
            this.currentWord=null;
        }
    }
}