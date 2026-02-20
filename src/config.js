import World from './scenes/World.js';
import House from './scenes/House.js';
import Title from './scenes/Title.js';
import Shop from './scenes/Shop.js';
import UIScene from './scenes/UIScene.js';
import Trade from './scenes/Trade.js';
import PreloadScene from './scenes/PreloadScene.js';
import BaseScene from './scenes/BaseScene.js';

export const config={
    type:Phaser.AUTO,
    width:1280,
    height:720,
    physics:{
        default:'arcade',
        arcade:{
            gravity:{y:0},
            debug:true
        }
    },
    plugins:{
        global:[{
            key:'rexBBCodeTextPlugin',
            plugin:window.rexbbcodetextplugin,
            start:true
        }]
    },
    parent:'game-container',
    dom:{
        createContainer:true
    },
    scale:{
        mode:Phaser.Scale.FIT,
        autoCenter:Phaser.Scale.CENTER_BOTH
    },
    zoom:1,
    backgroundColor:'#000000',
    pixelArt:true,
    scene:[PreloadScene,BaseScene,Title,World,House,Shop,Trade,UIScene]//UISceneの順番Baseの後でいいかも
    //↑この配列の順番は読み込みの順番。Preload→Baseで準備をしてからTitleシーン
}