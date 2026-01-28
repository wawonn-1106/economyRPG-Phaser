export default class GuideContent{
    constructor(scene){
        this.scene=scene;
        
    }
    createElement(){
        const container=document.createElement('div');
        container.classList.add('guide-container');

        const title=document.createElement('h2');
        title.classList.add('guide-title');
        title.textContent='遊び方';
        container.appendChild(title);

        const list=document.createElement('ul');

        const controls=[
            {key:'矢印キー',action:'プレイヤーの移動'},
            {key:'SPACE',action:'会話 / 決定'},
            {key:'Mキー',action:'メニューを開く'},
        ];

        controls.forEach(control=>{
            const listItem=document.createElement('li');
            listItem.classList.add('guide-item');

            const keySpan=document.createElement('span');
            keySpan.classList.add('guide-key');
            keySpan.textContent=control.key;

            const actionSpan=document.createElement('span');
            actionSpan.classList.add('guide-action');
            actionSpan.textContent=`：${control.action}`;

            listItem.appendChild(keySpan);
            listItem.appendChild(actionSpan);
            list.appendChild(listItem);
        });
        container.appendChild(list);

        return container;

    }
}