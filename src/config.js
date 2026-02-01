import World from './scenes/World.js';
import House from './scenes/House.js';
import Title from './scenes/Title.js';

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
    scene:[Title,World,House]//sceneの順番は表示する順番でもあるからtitleが先
}