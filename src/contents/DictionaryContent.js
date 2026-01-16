export default class DictionaryContent{
    constructor(scene){
        this.scene=scene;
    }
    createElement(){
        const container=document.createElement('div');
        container.classList.add('menu-content');//ここは変えてね
        return container;
    }
}