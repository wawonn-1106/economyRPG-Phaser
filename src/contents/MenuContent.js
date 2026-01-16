export default class MenuContent{
    constructor(scene,menuManager){
        this.scene=scene;
        this.menuManager=menuManager;
    }
    createElement(){
        const container=document.createElement('div');
        container.classList.add('menu-content');

        const menuItem=[
            {id:'inventory',label:'持ち物',icon:'inventory'},
            {id:'profile',label:'プロフィール',icon:'profile'},
            {id:'review',label:'口コミ',icon:'review'},
            {id:'ranking',label:'ランキング',icon:'ranking'},
            {id:'dictionary',label:'辞書',icon:'dictionary'},
            {id:'settings',label:'設定',icon:'settings'},
            {id:'returnTitle',label:'タイトルに戻る',icon:'returnTitle'}
        ];

        menuItem.forEach(item=>{
            const btn=document.createElement('div');
            btn.classList.add('menu-btn');

            const iconDiv=document.createElement('img');
            iconDiv.classList.add('menu-btn-icon');
            iconDiv.src=`assets/images/${item.icon}.png`;

            const labelDiv=document.createElement('div');
            labelDiv.classList.add('menu-btn-label');
            labelDiv.textContent=item.label;

            btn.appendChild(iconDiv);
            btn.appendChild(labelDiv);//btnの中に入れる。containerじゃない

            btn.onclick=()=>{
                /*if(item.id==='returnTitle'){
                    this.scene.cameras.main.fadeOut(1000,0,0,0);

                    this.scene.cameras.main.once('camerafadeoutcomplete',()=>{
                        const window=document.getElementById('menu-window');
                        if(window) this.window.classList.add('hidden');

                        this.scene.start('Title');
                    });
                }*/
                this.menuManager.switchTab(item.id);
                // /*このsceneはWorldのだからダメなのか、そもそもタイトル画面の遷移はManager経由でするべきなのか*/
            };

            container.appendChild(btn);
        });

        return container;
    }
}