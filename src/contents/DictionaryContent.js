export default class DictionaryContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.worldScene=this.uiScene.scene.get('World');
    }
    createQuickView(termData){
        const container=this.uiScene.add.container(0,0);
        
        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);//いったんmenu-bgで代用

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

        container.add([title,description,example]);
        return container;
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);
        //const container=document.createElement('div');
        //container.classList.add('dictionary-content');//ここは変えてね


        const terms=this.worldScene.dictionaryManager.getTerms();//DictionaryManagerがjsonでデータを取る
        //↑Worldで、this.dictionaryManager=new DictionaryManager(this)をやってる前提
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
        });//改行しないとはみ出るなぁ

        detailContainer.add([wordTitle,categoryLabel,descriptionText,exampleText]);//wordTitleもいるなら

        terms.forEach((term,index)=>{//相対座標にするから毎回index使う、他の場所でも
            const y=index*45;
            const termButton=this.uiScene.add.text(0,y,`${term.word}`,{
                fontSize:'24px',
                color:'#000000'
            }).setInteractive({useHandCursor:true});//ワードクリックしたら説明が出てくる感じに。
            //見開きの本みたいなUIにしよう

            termButton.on('pointerdown',()=>{
               wordTitle.setText(term.word);
               categoryLabel.setText(`カテゴリ：${term.category}`);
               descriptionText.setText(term.description ||'説明はありません');
               exampleText.setText(term.example ||'例文はありません'); 
            });

            listContainer.add(termButton);
            /*const item=document.createElement('div');
            item.classList.add('dictionary-item');

            const word=document.createElement('div');
            word.classList.add('term-word');
            word.textContent=term.word;

            const category=document.createElement('div');
            category.classList.add('term-category');
            category.textContent=term.category;

            const description=document.createElement('div');
            description.classList.add('term-description');
            description.textContent=term.description || '説明はありません';

            const example=document.createElement('div');
            example.classList.add('term-example');
            example.textContent=term.example || '例文はありません';

            item.appendChild(word);
            item.appendChild(category);
            item.appendChild(description);
            item.appendChild(example);

            container.appendChild(item);*/
        });

        return container;
    }
}