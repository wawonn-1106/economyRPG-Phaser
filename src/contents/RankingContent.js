export default class RankingContent{
    constructor(scene){
        this.scene=scene;
    }
    createElement(){
        const container=document.createElement('div');
        container.classList.add('menu-content');
        return container;
    }
}