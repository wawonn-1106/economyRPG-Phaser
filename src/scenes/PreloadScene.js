export default class PreloadScene extends Phaser.Scene{
    constructor(){
        super({key:'PreloadScene'});
        
    }
    preload(){
//--------------------------------画像------------------------------------------------------
        this.load.image('player','assets/images/player.png');
        this.load.image('heart','assets/images/heart.png');
        this.load.image('dictionary-bg','assets/images/dictionary-bg.png');
        this.load.image('apple','assets/images/apple.png');
        this.load.image('seed','assets/images/seed.png');
        this.load.image('axe','assets/images/axe.png');
        this.load.image('pickaxe','assets/images/pickaxe.png');
        this.load.image('fishing-rod','assets/images/fishing-rod.png');
        this.load.image('shelf','assets/images/shelf.png');
        this.load.image('rock','assets/private_assets/rock.png');
        this.load.image('wood','assets/private_assets/wood.png');
        this.load.image('bread','assets/private_assets/bread.png');
        this.load.image('curry','assets/private_assets/curry.png');
        this.load.image('rice','assets/private_assets/rice.png');
        this.load.image('pizza','assets/private_assets/pizza.png');
        this.load.image('ham','assets/private_assets/ham.png');
        this.load.image('hamburger','assets/private_assets/hamburger.png');
//--------------------------------スプライトシート------------------------------------------------------
        this.load.spritesheet('cozyFood','assets/private_assets/CozyFood-Sheet.png',{
                frameWidth:16,
                frameHeight:16,
                margin:0,
                spacing:0
        });
//--------------------------------tilemap------------------------------------------------------
        //this.load.tilemapTiledJSON('map','assets/tilemaps/economyRPG.json');
        this.load.tilemapTiledJSON('house','assets/tilemaps/House.json');
        this.load.tilemapTiledJSON('shop','assets/tilemaps/Shop.json');
        this.load.tilemapTiledJSON('trade','assets/tilemaps/Trade.json');
        this.load.tilemapTiledJSON('map','assets/tilemaps/world.json');
//--------------------------------tileset-----------------------------------------------------
        //this.load.image('tileset','assets/tilesets/Serene_Village_48x48.png');
        this.load.image('barn','assets/private_assets/Pixel 16 Village PNGs/barn.png',{frameWidth:16,frameHeight:16});
        this.load.image('blacksmith_forge','assets/private_assets/Pixel 16 Village PNGs/blacksmith_forge.png',{frameWidth:16,frameHeight:16});
        this.load.image('houses','assets/private_assets/Pixel 16 Village PNGs/houses.png',{frameWidth:16,frameHeight:16});
        this.load.image('market','assets/private_assets/Pixel 16 Village PNGs/market.png',{frameWidth:16,frameHeight:16});
        this.load.image('tavern','assets/private_assets/Pixel 16 Village PNGs/tavern.png',{frameWidth:16,frameHeight:16});
        this.load.image('tiles_and_exterior_items','assets/private_assets/Pixel 16 Village PNGs/tiles_and_exterior_items.png',{frameWidth:16,frameHeight:16});

        this.load.image('cliff_high','assets/private_assets/pixel 16 woods v2/cliff_high.png',{frameWidth:16,frameHeight:16});
        this.load.image('Color_trees','assets/private_assets/pixel 16 woods v2/Color_trees.png',{frameWidth:16,frameHeight:16});
        this.load.image('newTree_tiles','assets/private_assets/pixel 16 woods v2/newTree_tiles.png',{frameWidth:16,frameHeight:16});
        this.load.image('tileset','assets/private_assets/pixel 16 woods v2/tileset.png',{frameWidth:16,frameHeight:16});
        this.load.image('trees_stuff','assets/private_assets/pixel 16 woods v2/trees_stuff.png',{frameWidth:16,frameHeight:16});
        this.load.image('waterfall_watertiles','assets/private_assets/pixel 16 woods v2/waterfall_watertiles.png',{frameWidth:16,frameHeight:16});

//--------------------------------animation----------------------------------------------------
        /*this.load.spritesheet('player-walk-down','assets/images/16x32 All Animations.png',{
                frameWidth:16,
                frameHeight:32,
                margin:0,
                spacing:0
        });
        this.load.spritesheet('player-walk-up','assets/images/16x32 All Animations.png',{
                frameWidth:16,
                frameHeight:32,
                margin:0,
                spacing:0
        });
        this.load.spritesheet('player-walk-right','assets/images/16x32 All Animations.png',{
                frameWidth:16,
                frameHeight:32,
                margin:0,
                spacing:0
        });
        this.load.spritesheet('player-walk-left','assets/images/16x32 All Animations.png',{
                frameWidth:16,
                frameHeight:32,
                margin:0,
                spacing:0
        });*/
//--------------------------------天気------------------------------------------------------
        this.load.image('rain','assets/images/rain.png');
        this.load.image('snow','assets/images/snow.png');
//--------------------------------json------------------------------------------------------
        this.load.json('chapter1','assets/data/dialog1.json');
        this.load.json('termsData','assets/data/dictionary.json');
        this.load.json('recipesData','assets/data/recipes.json');
        this.load.json('playerData','assets/data/playerData.json');
        this.load.json('inventoryData','assets/data/inventory.json');
        this.load.json('NPCData','assets/data/NPC.json');
        this.load.json('customerData','assets/data/Customer.json');
        this.load.json('traderData','assets/data/Trader.json');

        //this.load.json('saveData',`${this.SERVER_URL}/load`);
//--------------------------------タイトル------------------------------------------------------       
        this.load.image('title','assets/images/title-image.png');
        this.load.image('start-btn','assets/images/start-btn.png');//その場しのぎの画像
        this.load.image('continue-btn','assets/images/continue-btn.png');
//--------------------------------UI------------------------------------------------------
        this.load.image('hotbar','assets/images/hotbar.png');
        this.load.image('slot-selected','assets/images/hotbar.png');//用意してね
        this.load.image('time-bg','assets/images/time-bg.png');//まだ
        this.load.image('submit-btn','assets/images/submit-btn.png');
        this.load.image('input-bg','assets/images/choice-btn.png');//まだ
        this.load.image('choice-btn','assets/images/choice-btn.png');
        this.load.image('decoration-btn','assets/images/decoration-btn.png');
        this.load.image('menu-btn','assets/images/menu-btn.png');
        this.load.image('profile-front-bg','assets/images/profile-front-bg.png');
        this.load.image('profile-back-bg','assets/images/profile-back-bg.png');

        this.load.image('menu-bg','assets/images/menu-bg.png');
        this.load.image('dialog-bg','assets/images/machine-bg.png');//dialog-bg用意する
        this.load.image('portrait-container','assets/images/portrait-container.png');
        this.load.image('machine-bg','assets/images/machine-bg.png');
        this.load.image('review','assets/images/review.png');
        this.load.image('settings','assets/images/settings.png');
        this.load.image('ranking','assets/images/ranking.png');
        this.load.image('profile','assets/images/profile.png');
        //this.load.image('returnTitle','assets/images/returnTitle.png');
        this.load.image('inventory','assets/images/inventory.png');
        this.load.image('dictionary','assets/images/dictionary.png');
        this.load.image('guide','assets/images/guide.png');
        this.load.image('save','assets/images/save.png');
        this.load.image('statistics','assets/images/statistics.png');
        this.load.image('study','assets/images/study.png');
        this.load.image('work','assets/images/work.png');

        
    }
    create(){
        this.scene.start('Title');//全部ダウンロードしたら、Titleに飛ばす
    }
}