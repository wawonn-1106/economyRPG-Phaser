import BaseScene from './BaseScene.js';

export default class World extends BaseScene{
    constructor(){
        super({key:'World'});

        this.player=null;
    }
    create(data){//このdataはscene.start('World')のときに渡される引数
        const map=this.createMap('map');
        
        super.create(data);

        this.scene.launch('UIScene');

        this.setupSceneTransitions(map, this.player);

        const testData=this.cache.json.get('playerData');
        this.profileManager.initTutorialProfile(testData.name);//←何か忘れたから怖くて消せないやつ

    }
    update(time,delta){
        //if(!this.player)return;
        
        super.update(time, delta);
        //updateInteractables,placementPre3viewなどは、このsuper.update()でBaseSceneのものを実行

        this.player.update();
    }    
}