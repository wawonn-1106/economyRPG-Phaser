export default class GuideContent{
    constructor(uiScene){
        this.uiScene=uiScene;     
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);
       
        const controls=[
            {key:'矢印キー',action:'プレイヤーの移動'},
            {key:'SPACE',action:'会話 / 決定'},
            {key:'Mキー',action:'メニューを開く'},
        ];

        controls.forEach((control,index)=>{
            const yOffset=-120+(index*50);

            const keyLabel=this.uiScene.add.text(-250,yOffset,`[${control.key}]`,{
                fontSize:'24px',
                color:'#000000',
                fontFamily:'sans-serif'
            }).setOrigin(0,0.5);

            const actionLabel=this.uiScene.add.text(0,yOffset,control.action,{
                fontSize:'24px',
                color:'#000000',
                fontFamily:'sans-serif'
            }).setOrigin(0,0.5);

            container.add([keyLabel,actionLabel]);
        });

        return container;
    }
}