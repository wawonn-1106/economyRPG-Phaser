import MenuContent from '../contents/MenuContent.js';
import ProfileContent from '../contents/ProfileContent.js';
import SettingsContent from '../contents/SettingsContent.js';
import InventoryContent from '../contents/InventoryContent.js';
import RankingContent from '../contents/RankingContent.js';
import ReviewContent from '../contents/ReviewContent.js';
import DictionaryContent from '../contents/DictionaryContent.js';
import GuideContent from '../contents/GuideContent.js';
import MachineContent from '../contents/MachineContent.js';

export default class MenuManager{
    constructor(uiScene,worldScene){
        this.uiScene=uiScene;
        this.worldScene=worldScene;
        this.isOpenMenu=false;
        this.currentTab='menu';
        this.currentView=null;

        this.contents={
            'menu':new MenuContent(uiScene,this),
            'inventory':new InventoryContent(uiScene),
            'profile':new ProfileContent(uiScene,0,0),
            'review':new ReviewContent(uiScene),
            'ranking':new RankingContent(uiScene),
            'settings':new SettingsContent(uiScene),
            'dictionary':new DictionaryContent(uiScene),
            'guide':new GuideContent(uiScene),
            'machine':new MachineContent(uiScene)
        };
    }
    toggle(tabId='menu'){
        if(this.worldScene.dialogManager.inputMode||this.worldScene.dialogManager.isTalking)return;

        if(!this.isOpenMenu){
            this.openMenu(tabId);
            return;
        }
        if(this.currentTab===tabId){
            this.closeMenu();
        }else{
            this.switchTab(tabId);
        }
    }
    openMenu(tabId){
        if(this.worldScene.dialogManager.inputMode||this.worldScene.dialogManager.isTalking)return;

        this.isOpenMenu=true;
        this.switchTab(tabId);
    }
    closeMenu(){
        this.isOpenMenu=false;

        if(this.currentView){
            this.currentView.destroy();
            this.currentView=null;
        }

    }
    switchTab(tabId){
        this.currentTab=tabId;
        if(this.currentTab==='returnTitle'){
                this.closeMenu();
                
                this.worldScene.cameras.main.fadeOut(1000,0,0,0);
                this.uiScene.cameras.main.fadeOut(1000,0,0,0);

                this.worldScene.cameras.main.once('camerafadeoutcomplete',()=>{

                    this.worldScene.scene.start('Title');//scene.sceneでconfigの配列に登録してるのは何でも表示できる！！！
                    //uiSceneの方がいいのかな
                });
                return;
        }

        this.currentTab=tabId;
        if(this.currentView) this.currentView.destroy();

        const content=this.contents[tabId];
        if(content){
            this.currentView=content.createView();

            this.currentView.setPosition(
                this.uiScene.scale.width/2,
                this.uiScene.scale.height/2,
            );
        }
    }
}