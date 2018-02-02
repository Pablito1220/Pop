var widthFactor = 1.25;
var balloon = new Bezier(
    {x: 0, y: -innerHeight / 2},
    {x: innerHeight * widthFactor * 0.7, y: -innerHeight / 2},
    {x: innerHeight * widthFactor, y: innerHeight},
    {x: 0, y: innerHeight + innerHeight / 2});
var complete = new Bezier(
    {x: 0, y: innerHeight + innerHeight / 2},
    {x: -(innerHeight * widthFactor), y: innerHeight},
    {x: -(innerHeight * widthFactor * 0.7), y: -innerHeight / 2},
    {x: 0, y: -innerHeight / 2});
var point;
var mySound, popSound;
var posNeedle;
var isTouching = false;
var splitPoint;
var explode = false;
var count = 0;
var poping = false;
var finishInflate = false;
var loopMoment = false;
var verts;
var scaleBallon;
var breakingPoint;
var speed;
var currentMouse;
var lastMouse;
var mouseDelta;
var centerOfBalloon;
var vid;
var startPosNeedle;

var STATE = {START: 'start', ZOOMED: 'zoomed', EXPLODED: 'exploded'};
var state = STATE.START;

function preload() {
  mySound = loadSound('data/Sound_1.wav');
  popSound = loadSound('data/Pop_Sound.mp3');
  inflateSound = loadSound('data/InflateSound.wav');
}

function setup() {
  createCanvas(innerWidth, innerHeight);
  noCursor();
  myFont = loadFont('data/Graphik-Medium.otf');
  posNeedle = createVector(mouseX, mouseY);
  lastMouse = createVector(0, 0);
  currentMouse = createVector(0, 0);
  mouseDelta = createVector(0, 0);
  splitPoint = createVector(0, 0);
  breakingPoint = createVector(width / 4, height / 2);
  index = 0;
  scaleBallon = true;
  startPosNeedle = createVector(width, height / 2);
  //  posNeedle = startPosNeedle;
}

function drawBezier(c) {
  if (!c || c.points == undefined) return;
  bezier(
      c.points[0].x, c.points[0].y, c.points[1].x, c.points[1].y, c.points[2].x,
      c.points[2].y, c.points[3].x, c.points[3].y);
}

function zoom() {
  var mouseTemp;
  if (posNeedle.x < width / 4) {
    mouseTemp = width / 4;
  }
  if (posNeedle.x >= width / 4 && posNeedle.x < width * 0.8) {
    mouseTemp = posNeedle.x;
  }
  if (posNeedle.x >= width * 0.8) {
    mouseTemp = width * 0.8;
  }

  var startPoint = createVector(width * .5, height * .5);
  var balloonSize = createVector(-(width / widthFactor * .7), height * 2);
  var sc = 1;
  switch (state) {
    case STATE.START:
      //  console.log('start');

      explode = false;
      mySound.pause();
      sc = .2;
      loopMoment = true;
      break;
    case STATE.ZOOMED:
      // console.log('zoomed');
      sc = 1;
      if (mySound.isPlaying() == false) {
        mySound.play();
      }

      break;
    case STATE.EXPLODED:
      // console.log('exploded');
      sc = 0.2;
      break;
  }
  translate(startPoint.x, startPoint.y);
  scale(sc, sc);
  translate(balloonSize.x * 1.25, -balloonSize.y / 4);
  // translate(balloonSize.x, -balloonSize.y / 4);
  var vol = map(mouseTemp, width / 4, width * 0.8, 0.7, 0.0)
  speed = map(vol, 0.7, 0.0, 3, 0);

  if (explode == false) {
    mySound.rate(speed);
  } else {
    mySound.rate(0.0);
  }
}

var halfBalloon;
var otherHalf;
function drawingBalloon() {
  drawBezier(complete);

  strokeWeight(5);
  stroke(0, 0, 0);

  drawBezier(halfBalloon);
  drawBezier(otherHalf);
  line(
      otherHalf.points[3].x, otherHalf.points[3].y, otherHalf.points[3].x,
      (otherHalf.points[3].y) + 2000);

  verts = complete.getLUT(100);
  if (halfBalloon.points) {
    verts = verts.concat(halfBalloon.getLUT(100));
  }
  verts = verts.concat(otherHalf.getLUT(100));
  var rougeStay = map(speed, 3, 2, 100, 255)
  fill(255, 30, 0);
  beginShape();

  verts.forEach(function(p, i) {
    vertex(p.x, p.y);
  });
  endShape();
}
function draw() {
  // console.log(posNeedle.x);
  zoom();
  console.log(isTouching);
  point = balloon.project({x: mouseX, y: mouseY});
  halfBalloon = balloon.split(0, point.t);
  otherHalf = balloon.split(point.t, 1);

  if (halfBalloon.points) {
    splitPoint.x = halfBalloon.points[3].x;
    splitPoint.y = halfBalloon.points[3].y;
  }
  var indicateBalloon = undefined;
  if (halfBalloon.points && halfBalloon.points.length > 3) {
    indicateBalloon = halfBalloon.points[3];
  }

  var touchingTop = indicateBalloon && posNeedle.x <= indicateBalloon.x;
  if (touchingTop) {
    halfBalloon.points[3].x = posNeedle.x;
    halfBalloon.points[3].y = posNeedle.y;
  }
  var touchingBottom = indicateBalloon && posNeedle.x <= indicateBalloon.x;
  if (touchingBottom) {
    otherHalf.points[0].x = posNeedle.x;
    otherHalf.points[0].y = posNeedle.y;
  }
  isTouching = touchingBottom || touchingTop;
  currentMouse.x = mouseX;
  currentMouse.y = mouseY;
  // console.log(currentMouse.x);
  var mouseStatic = p5.Vector.dist(currentMouse, lastMouse) < 1;
  if (isTouching) {
    if (mouseStatic) {
      //ça bug pour  l'instant, repousse
      // posNeedle.add(mouseDelta);
    } else {
      //  mouseDelta = p5.Vector.sub(splitPoint,
      //  currentMouse).normalize().mult(10);
      posNeedle.x = currentMouse.x;
      posNeedle.y = currentMouse.y;
    }
  } else if (!isTouching && splitPoint && currentMouse.x < splitPoint.x) {
    posNeedle.x = splitPoint.x;
    posNeedle.y = splitPoint.y;
  } else {
    posNeedle.x = map(currentMouse.x, splitPoint.x, width, splitPoint.x, 3000);
    // posNeedle.y = map(currentMouse.y, 0, height, -100, height + 100);
    posNeedle.y = currentMouse.y;
    // console.log(currentMouse.x);
    // console.log(currentMouse.y);
  }
  lastMouse.x = currentMouse.x;
  lastMouse.y = currentMouse.y;

  if (posNeedle.x < width / 4) {
    explode = true;
  }
  switch (state) {
    case STATE.START:
      if (isTouching) state = STATE.ZOOMED;
      break;
    case STATE.ZOOMED:
      if (posNeedle.x > splitPoint.x) state = STATE.START;
      if (explode == true) {
        state = STATE.EXPLODED;
        popSound.play();
      }
      break;
    case STATE.EXPLODED:

      if (index < 100 && explode == true) {
        index++;
        mouseDelta =
            p5.Vector.sub(splitPoint, currentMouse).normalize().mult(100);
        posNeedle.add(mouseDelta);
      }
      if (index >= 100) {
        finishInflate = true;
        index = 0;
        explode = false;
      }
      if (index == 0) state = STATE.START;
      break;
  }

  background(0, 200, 255);
  noFill();
  finishInflate == false;
  drawingBalloon();
  if (indicateBalloon)
    if (explode == true) {
      popMoment();
    }
  drawNeedle();
  fill(0);
  noStroke();
  textFont(myFont);
  textSize(500);
  // text('POP', width * 2, -height);
}
function drawNeedle() {
  strokeWeight(5);
  stroke(0, 0, 0);
  var d = 200;
  var nv = balloon.normal(point.t);
  line(
      posNeedle.x, posNeedle.y, posNeedle.x - nv.x * d, posNeedle.y - nv.y * d);
  fill(0, 0, 255);
  ellipseMode(CENTER);
  ellipse(posNeedle.x - nv.x * d, posNeedle.y - nv.y * d, 40, 40);
}
function popMoment() {
  background(0, 200, 255);
  var gonfle = map(index, 0, 100, 0.0, 1.0);
  var moveAnchor = map(index, 0, 99, balloon.points[3].y * 3, 0)
  if (index < 100) {
    inflateBalloon(gonfle, moveAnchor);
  }
  var startPopSound = false;
  if (index == 1) {
    startPopSound = true;
  }
  if (startPopSound == true) {
    inflateSound.play();

    startPopSound = false;
  }
}
function inflateBalloon(scaleFactor, translateFactor) {
  verts = complete.getLUT(100);
  if (halfBalloon.points) {
    verts = verts.concat(balloon.getLUT(100));
  }
  push();
  scale(scaleFactor, scaleFactor);
  translate(0, translateFactor);
  var rouge = map(index, 0, 99, 0, 255);
  fill(255, 30, 0);
  beginShape();

  verts.forEach(function(p, i) {
    vertex(p.x, p.y);
  });
  endShape();
  line(
      balloon.points[3].x, balloon.points[3].y, balloon.points[3].x,
      balloon.points[3].y + 100000)
  pop();
}

document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
})
document.ontouchmove = function(e) {
  document.documentElement.requestFullscreen();
  e.preventDefault();
}
