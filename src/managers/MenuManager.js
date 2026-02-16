import MenuContent from '../contents/MenuContent.js';
import ProfileContent from '../contents/ProfileContent.js';
import SettingsContent from '../contents/SettingsContent.js';
import InventoryContent from '../contents/InventoryContent.js';
import RankingContent from '../contents/RankingContent.js';
import ReviewContent from '../contents/ReviewContent.js';
import DictionaryContent from '../contents/DictionaryContent.js';
import GuideContent from '../contents/GuideContent.js';
import MachineContent from '../contents/MachineContent.js';
import SaveContent from '../contents/SaveContent.js';
import StatisticsContent from '../contents/StatisticsContent.js';
import ShopContent from '../contents/ShopContent.js';

export default class MenuManager{
    constructor(uiScene){
        this.uiScene=uiScene;
        //this.worldScene=worldScene;
        this.isOpenMenu=false;
        this.currentTab='menu';
        this.currentView=null;

        this.contents={
        //--------------------メニュー------------------------------
            'menu':new MenuContent(uiScene,this),
            'inventory':new InventoryContent(uiScene),
            'profile':new ProfileContent(uiScene,0,0),
            'review':new ReviewContent(uiScene),
            'ranking':new RankingContent(uiScene),
            'settings':new SettingsContent(uiScene),
            'dictionary':new DictionaryContent(uiScene),
            'guide':new GuideContent(uiScene),
            'machine':new MachineContent(uiScene),
            'save':new SaveContent(uiScene),
            'statistics':new StatisticsContent(uiScene),
        //----------------------店-----------------------------------
            'shop':new ShopContent(uiScene,this)
        };
    }
    get activeScene(){
        return this.uiScene.scene.manager.getScenes(true).find(s=>s.scene.key!=='UIScene');
    }
    toggle(tabId,data=null){
        const activeScene=this.activeScene;
        if(activeScene.dialogManager.inputMode||activeScene.dialogManager.isTalking)return;

        if(!this.isOpenMenu){
            this.openMenu(tabId,data);
            return;
        }
        if(this.currentTab===tabId){
            this.closeMenu();
        }else{
            this.switchTab(tabId,data);//どのshelfを開くか。他のcontentでも使える共通。
        }
    }
    openMenu(tabId,data=null){
        const activeScene=this.activeScene;
        if(activeScene.dialogManager.inputMode||activeScene.dialogManager.isTalking)return;

        /*if(this.uiScene.isDecorationMode){
            this.uiScene.toggleDecorationMode();
        }*/

        this.isOpenMenu=true;
        this.switchTab(tabId,data);
    }
    closeMenu(){
        this.isOpenMenu=false;

        if(this.currentView){
            this.currentView.destroy();
            this.currentView=null;
        }

    }
    switchTab(tabId,data=null){
        this.currentTab=tabId;
        if(this.currentTab==='returnTitle'){
                this.closeMenu();

                const activeScene=this.activeScene;//ゲッターは関数じゃないから()は不要
                
                activeScene.cameras.main.fadeOut(1000,0,0,0);
                this.uiScene.cameras.main.fadeOut(1000,0,0,0);

                activeScene.cameras.main.once('camerafadeoutcomplete',()=>{

                    activeScene.scene.start('Title');//scene.sceneでconfigの配列に登録してるのは何でも表示できる！！！
                });
                return;
        }

        this.currentTab=tabId;
        if(this.currentView) this.currentView.destroy();

        const content=this.contents[tabId];
        if(content){
            this.currentView=content.createView(data);

            this.currentView.setPosition(
                this.uiScene.scale.width/2,
                this.uiScene.scale.height/2,
            );

            if (this.currentView.setScrollFactor) this.currentView.setScrollFactor(0);
            if (this.currentView.setDepth) this.currentView.setDepth(4000);
        }
    }
}