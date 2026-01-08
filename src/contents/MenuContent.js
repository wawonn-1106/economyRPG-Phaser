export default class MenuContent{
    constructor(scene,menuManager){
        this.scene=scene;
        this.menuManager=menuManager;
    }
    createElement(){
        const container=document.createElement('div');
        container.classList.add('menu-content');

        const menuItem=[
            {id:'inventory',label:'持ち物',icon:'〇'},
            {id:'profile',label:'プロフィール',icon:'◇'},
            {id:'review',label:'口コミ',icon:'△'},
            {id:'ranking',label:'ランキング',icon:'✖'},
            {id:'settings',label:'設定',icon:'☆'},
        ];

        menuItem.forEach(item=>{
            const btn=document.createElement('div');
            btn.classList.add('menu-btn');
            btn.textContent=item.label;

            const iconDiv=document.createElement('div');
            iconDiv.classList.add('menu-btn-icon');
            iconDiv.textContent=item.icon;

            const labelDiv=document.createElement('div');
            iconDiv.classList.add('menu-btn-label');
            labelDiv.textContent=item.icon;

            btn.appendChild(iconDiv);
            btn.appendChild(labelDiv);//btnの中に入れる。containerじゃない

            btn.onclick=()=>{
                this.menuManager.switchTab(item.id);
            };

            container.appendChild(btn);
        });

        return container;
    }
}