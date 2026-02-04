export default class House extends Phaser.Scene{
    constructor(){
        super({key:'House'});
        this.isWraping=false;
        this.fromDoor=null;
    }
    init(data){
        this.fromDoor=data.fromDoor;
    }
    create(){
        const map = this.make.tilemap({ key: 'house' });
    
        const tileset = map.addTilesetImage('Serene_Village_48x48','tileset');
        
        this.GroundLayer = map.createLayer('Ground', tileset, 0, 0); 
        this.HouseLayer = map.createLayer('House', tileset, 0, 0);
        this.OnGroundLayer = map.createLayer('OnGround', tileset, 0, 0);

        this.HouseLayer.setCollisionByProperty({ collides: true });
        this.OnGroundLayer.setCollisionByProperty({ collides: true });
        this.GroundLayer.setCollisionByProperty({ collides: true });


        this.player = this.physics.add.sprite(500, 400, 'player').setScale(0.1);

        this.physics.add.collider(this.player, this.HouseLayer);
        this.physics.add.collider(this.player, this.OnGroundLayer);
        this.physics.add.collider(this.player, this.GroundLayer);

        this.physics.world.setBounds(0,0,map.widthInPixels,map.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.isWraping = false;
        /*scene.startは戻った時、constructorの初期化は行われないらしいから、ここでfalseにする*/

        const objectLayer=map.getObjectLayer('Object');
        if(objectLayer){
            objectLayer.objects.forEach(obj=>{
                if(obj.name==='exit'){
                    const exitRegion=this.add.zone(obj.x+obj.width/2,obj.y+obj.height/2,200,50);
                    this.physics.add.existing(exitRegion,true);

                    this.physics.add.overlap(this.player,exitRegion,()=>{
                        if(!this.isWraping){
                            this.isWraping=true;
                            this.player.body.enable=false;

                            this.cameras.main.fadeOut(1000,0,0,0);
                            this.cameras.main.once('camerafadeoutcomplete',()=>{
                                this.scene.start('World',{returnTo:this.fromDoor});
                            });
                        }
                    })
                }
            })
        }

        this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels);

    }
    update(){
        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }
}