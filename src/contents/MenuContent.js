export default class MenuContent{
    constructor(scene,menuManager){//MenuManagerを経由してUISceneとMenuManagerのsceneを受け取る
        this.scene=scene;//このsceneはUIScene
        this.menuManager=menuManager;
    }
    createView(){
        const container=this.scene.add.container(0,0);

        const bg=this.scene.add.image(0,0,'menu-bg');
        bg.setDisplaySize(1000,600);
        container.add(bg);

        const menuItem=[
            {id:'inventory',label:'持ち物',icon:'inventory'},
            {id:'profile',label:'プロフィール',icon:'profile'},
            {id:'review',label:'口コミ',icon:'review'},
            {id:'ranking',label:'ランキング',icon:'ranking'},
            {id:'dictionary',label:'辞書',icon:'dictionary'},
            {id:'settings',label:'設定',icon:'settings'},
            {id:'save',label:'日記',icon:'save'},
            {id:'statistics',label:'統計',icon:'statistics'},
            //{id:'returnTitle',label:'タイトルに戻る',icon:'returnTitle'}
        ];

        const columns=4;
        const spacingX=220;
        const spacingY=200;

        menuItem.forEach((item,index)=>{
            const col=index%columns;
            const row=Math.floor(index/columns);

            const x=-330+(col*spacingX);
            const y=-100+(row*spacingY);

            const icon=this.scene.add.image(x,y,item.icon).setOrigin(0.5).setInteractive({ useHandCursor: true });

            icon.on('pointerdown',()=>{
                this.menuManager.switchTab(item.id);
            });

            const label=this.scene.add.text(x,y+80,item.label,{
                fontSize:'20px',
                fill:'#000000'
            }).setOrigin(0.5);

            container.add([icon,label]);
        });

        return container;
    }
}