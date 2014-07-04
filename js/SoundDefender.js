function SoundDefender(target) {
    var url='test.mp3';
    var mural = new Mural(target, false, false);
    var play = mural.addPlayArea();
    var points = 128;
    var loudScale = 400;
    var path = new Poly();
    var context, javascriptNode, analyser;
    var soundArray=[];
    var shots=[];
    var maxHeight=play.ctx.canvas.height-50;
    var alienSpeed=new Vector2D(-play.ctx.canvas.width/points,0);
    var aliens=[];
    var bullets=[];
    var audio;
    for(var s=0;s<5;s++){
        var shoot=new Sprite('img/shoot3.png',145,19,140,10);
        shoot.addAnimation("bang",[0,1,2,3]);
        shoot.setCollisionBox(-120,-5,5,5);
        play.addChild(shoot,0);
        shoot.startAnimation("bang");
        shoot.autoAnim(true);
        shoot.setSpeed(4);
        shoot.setCoords([0,-20]);
        shoot.setScale(.5);
        shots.push(shoot);
    }
    for(s=0;s<50;s++){
        var alien =new Sprite('img/joeri.png',65,75,22,36);
        alien.setRotationOffsetDegrees(-180);
        //alien.setCollisionBox(-24,-27,28,25);
        alien.setCollisionBox(-13,-29,32,33);
        play.addChild(alien,2);
        alien.setCoords([0,-20]);
        alien.setScale(.5);
        alien.active=false;
        aliens.push(alien);
    }
    for(s=0;s<50;s++){
        var bullet = new Sprite('img/bullet.png', 16, 16, 8, 8);
        bullet.setCollisionBox(-4, -4, 4, 4);
        play.addChild(bullet, 3);
        bullet.setCoords([0,-10]);
        bullet.addAnimation("pulse", [0, 1, 0, 2]);
        bullet.startAnimation("pulse");
        bullet.autoAnim(true);
        bullet.setSpeed(4);
        bullet.setScale(.5);
        bullet.active=false;
        bullets.push(bullet);
    }
    //var shoot=new Sprite('img/shoot.png',145,11,140,6);
    //shoot.setCollisionBox(-120,-5,5,5);
    var ship =new Sprite('img/00FFFF.png',155,75,87,50);
    ship.setCollisionBox(-80,-30,60,10);
    play.addChild(ship,1);
    ship.setCoords([100,100]);
    ship.setAngle(0);
    ship.setScale(.5);
    initializePath();
    function initializePath() {
        var width = play.ctx.canvas.width;
        var height = play.ctx.canvas.height;
        path.addPoint(0, height);
        for (var i = 0; i < points; i++) {
            path.addPoint(width / points * i, height / 2);
        }
        path.addPoint(width / points * i, height);
        path.addPoint(width, height);
        path.fillStyle="brown";
        path.usePattern('img/craters.png');
    }
    function loadSound() {
        if (url) {
            initFromMP3(url);
        } else {
            navigator.getUserMedia({audio: true}, initAudio, onError);
        }
    }
    function initFromMP3(url) {
        audio = new Audio();
        audio.src = url;
        audio.addEventListener('canplay', canplay, false);
        audio.addEventListener('error',onError,false);
        audio.addEventListener('abort',onError,false);
    }
    function canplay(e){
        audio.isUrl=true;
        initAudio(audio);
        audio.play();
    }
    function initAudio(audio) {
        context = new AudioContext();
        javascriptNode = context.createScriptProcessor(256, 1, 1);
        javascriptNode.connect(context.destination);
        analyser = context.createAnalyser();
        var mediaStreamSource = audio.isUrl?context.createMediaElementSource(audio):context.createMediaStreamSource(audio);
        mediaStreamSource.connect(analyser);
        analyser.connect(context.destination);
        javascriptNode.onaudioprocess = function () {
            soundArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(soundArray);
        }
    }
    // log if an error occurs
    function onError(e) {
        console.log(e.type);
        console.error(e);
    }
    loadSound();
    path.strokeStyle("#df4b26");
    path.lineWidth(3);
    play.addChild(path);
    path.setCoords([0, 0]);
    ship.simpleAngle=0;

    function shipControls(game){
        if (game.isKey(16, true)) { // shoot
            fireShot();
        }
        if (game.isKey(40)) { // down
            ship.simpleAngle+=game.ticks;
            if (ship.simpleAngle > 15)ship.simpleAngle = 15;
            ship.setAngleDegrees(ship.simpleAngle);

        } else if (game.isKey(38)) { // up
            ship.simpleAngle-=game.ticks;
            if (ship.simpleAngle < -15)ship.simpleAngle = -15;
            ship.setAngleDegrees(ship.simpleAngle);

        } else { // straight
            if (ship.simpleAngle !== 0) {
                if (ship.simpleAngle < 0) {
                    ship.simpleAngle+=game.ticks;
                    ship.setAngleDegrees(ship.simpleAngle);
                } else {
                    ship.simpleAngle-=game.ticks;
                    ship.setAngleDegrees(ship.simpleAngle);
                }

            }
        }
    }
    function killShot(shoot){
        shoot.move = null;
        shoot.setCoords([0, -200]);
    }
    function killAlien(alien){
        alien.active = false;
        alien.setCoords([0, -20]);
    }
    function killShip(){
        ship.kill();
        ship=null;
    }
    function killBullet(bullet){
        bullet.active=false;
        bullet.setCoords([0,-20]);
    }

    function fireShot(){
        for (var s = 0; s < shots.length; s++) {
            if (!shots[s].move) {
                var shoot = shots[s];
                shoot.setCoords(ship.getCoordObj());
                shoot.setAngle(ship.getAngle());
                shoot.move = shoot.rotation.cloneVector();
                shoot.move.setLength(20);
                shoot.addCoords(shoot.move);
                shoot.addCoords(shoot.move);
                break;
            }
        }
    }
    function createAliens(value){
        var newAlien=Math.rnd(-48,12);
        if(newAlien>0){
            for(var s=0;s<aliens.length;s++){
                var alien=aliens[s];
                if(!alien.active){
                    var y=value/13*(newAlien-1);
                    var x=play.ctx.canvas.width+40;
                    alien.setAngleDegrees(180);
                    alien.setCoords([x,y]);
                    alien.rotspeed=Math.rnd(-20,20)/10;
                    alien.active=true;
                    break;
                }
            }
        }
    }

    function fireBullet(alien){
        for(s=0;s<bullets.length;s++){
            var bullet=bullets[s];
            if(!bullet.active){
                bullet.position = alien.position.cloneVector();
                bullet.move = alien.rotation.cloneVector();
                bullet.move.setAngle(alien.getAbsoluteAngle());
                bullet.move.setLength(10);
                bullet.active=true;
                break;
            }
        }
    }

    function moveShip(game){
        var pos = ship.getCoordObj();
        pos.y += (ship.simpleAngle / 2)*game.ticks;
        if (pos.y < 30)pos.y = 30;
        if (pos.y > maxHeight)pos.y = maxHeight;
        ship.setCoords(pos);
    }

    function moveShots(game){
        for(var s=0;s<shots.length;s++) {
            shoot=shots[s];
            if (shoot.move) {
                shoot.addCoords(shoot.move.cloneVector().multiply(game.ticks));
                var sx = shoot.position.getX();
                if (sx > mural.canvas.width + 50) {
                    killShot(shoot);
                } else {
                    var p = mural.canvas.width / (points - 2);
                    var index = Math.floor(sx / p);
                    var ppoint = path.getPoint(index);
                    try {
                        if (ppoint[1] < shoot.position.getY()) {
                            killShot(shoot);
                        }
                    } catch (e) {
                        //console.log(sx, index);
                    }
                }
            }
        }
    }

    function moveLandscape(game){
        var value=play.ctx.canvas.height;
        if (soundArray) {
            var loudness = 0;
            //var numba = 0;
            //var varue = 0;
            /*for (var i = 0; i < soundArray.length; i++) {
             var vallie = soundArray[i];//*((i+1)/soundArray.length);
             if (vallie > varue) {
             varue = vallie;
             numba = i;
             }

             }*/
            for (var j = 0; j < soundArray.length; j++) {
                loudness += soundArray[j];
            }

            //var value ;//= play.ctx.canvas.height - numba * 4;
            value = play.ctx.canvas.height - loudness / loudScale;

            for (var i = 1; i < (path.points.length - 1 - game.ticks); i++) {
                var point = path.getPoint(i);
                path.changePoint(i, point[0], path.getPoint(i + game.ticks)[1]);
            }
            for(j=0;j<game.ticks;j++){
                path.changePoint(i+j, path.getPoint(i+j)[0], value);

            }
            path.relativePatternTranslate(alienSpeed.getX()*game.ticks);

        }
        return value;
    }

    function moveBullets(game){
        for(var b=0;b<bullets.length;b++){
            var bull=bullets[b];
            if(bull.active) {
                for (var i = 0; i < game.ticks; i++) {
                    bull.addCoords(bull.move);
                }
                if (bull.position.getX() < 0 || bull.position.getX() > play.ctx.canvas.width || bull.position.getY() < 0 || bull.position.getY() > play.ctx.canvas.height) {
                    killBullet(bull);
                } else if (ship && ship.collidesWith(bull)) {
                    killBullet(bull);
                    killShip(ship);
                }
            }
        }
    }

    function moveAliens(game){
        for(var a=0;a<aliens.length;a++) {
            var al = aliens[a];
            if(al.active) {
                for (var i = 0; i < game.ticks; i++) {
                    al.addCoords(alienSpeed);
                    al.setAngleDegrees(al.getAngleDegrees() + al.rotspeed);
                }
                if (ship && al.position.getX() > 300 && al.isPointingAt(ship, 10)) {
                    fireBullet(al);
                }
                if (al.position._x < -10) {
                    killAlien(al);
                } else {
                    if(!alienShotCollision(al)){
                        if (ship && ship.collidesWith(al)) {
                            killAlien(al);
                            killShip(ship);
                        }
                    }
                }
            }
        }
    }

    function alienShotCollision(alien){
        for (var sa = 0; sa < shots.length; sa++) {
            shoot = shots[sa];
            if (shoot.move) {
                if (shoot.collidesWith(alien)) {
                    killShot(shoot);
                    killAlien(alien);
                    return true;
                }

            }
        }
        return false;
    }

    var loop = function (game) {
        if(ship) {
            shipControls(game);
            moveShip(game);
        }
        var value=moveLandscape(game);

        moveShots(game);

        createAliens(value);
        moveAliens(game);
        moveBullets(game);
    };

    var game = new ScarletEngine(mural, loop);
    game.registerKeys([16,40,38]);
    game.start();
}
