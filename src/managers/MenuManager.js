import MenuContent from '../contents/MenuContent.js';
import ProfileContent from '../contents/ProfileContent.js';
import SettingsContent from '../contents/SettingsContent.js';
import InventoryContent from '../contents/InventoryContent.js';
import RankingContent from '../contents/RankingContent.js';
import ReviewContent from '../contents/ReviewContent.js';

export default class MenuManager{
    constructor(scene){
        this.scene=scene;
        this.isOpenMenu=false;
        this.currentTab='menu';

        this.window=document.getElementById('menu-window');
        this.contentArea=document.getElementById('menu-content');

        //インスタンスは作っておく
        this.contents={
            'menu':new MenuContent(scene,this),//thisはMenuManager自身、MenuContentは仲介をするので、アクセスできるようにしておく
            'inventory':new InventoryContent(scene),//scene渡さなくてもよさそうだけど
            'profile':new ProfileContent(scene),
            'review':new ReviewContent(scene),
            'ranking':new RankingContent(scene),
            'settings':new SettingsContent(scene)
        };
    }
    toggle(tabId='menu'){
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
        this.isOpenMenu=true;
        this.window.classList.remove('hidden');
        this.switchTab(tabId);
    }
    closeMenu(){
        this.isOpenMenu=false;
        this.window.classList.add('hidden');
    }
    switchTab(tabId){
        this.currentTab=tabId;
        if(this.currentTab==='returnTitle'){
            this.scene.cameras.main.fadeOut(1000,0,0,0);

                this.scene.cameras.main.once('camerafadeoutcomplete',()=>{
                    //this.window.classList.add('hidden');
                    this.closeMenu();

                    this.scene.scene.start('Title');//scene.sceneでconfigの配列に登録してるのは何でも表示できる！！！
                });
                return;
        }

        while(this.contentArea.firstChild){
            this.contentArea.removeChild(this.contentArea.firstChild);
            /*removeChildでfirstChildを取り出すのを繰り返す→結果的に全部取り出す(張替のため)
            appendChildで毎回一つしか追加されないけど中身の要素は多いからwhileは必須。
            */
        }
        const content=this.contents[tabId];//★contents['menu']=contents.menuは同じ
        if(content){
            const element=content.createElement();//ここでcontainerを受け取る

            this.contentArea.appendChild(element);
        }


    }
}