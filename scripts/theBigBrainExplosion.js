let settings = {
  seed: "none",
  color: "random",
  padding: 250,
  minSpeed: 0,
  maxSpeed: 0.007,
  minAgents: 10,
  maxAgents: 500,
  maxTime: 60 * 45,
}


function randomPoint( p, padding=settings.padding ) {
  let pos = p.createVector(
    p.random( 0 - padding, p.width + padding ),
    p.random( 0 - padding, p.height + padding )
  );
  return pos;
}

class Agent {
  constructor( p ) {
    this.p = p;
    this.pos = p.createVector( p.width/2, p.height/2 );
    // this.pos = randomPoint( p );
    this.targetPos = randomPoint( p );

    this.size = 5;

    this.speed = p.random( 0, settings.maxSpeed );

    this.acceleration = p.createVector( 0, 0 );
    // this.velocity = p.createVector( p.random(), p.random() );
    this.velocity = p.createVector( 0, 0 );

    // this.colorFill = p.color( "green" );
    // this.colorStroke = p.color( "rgba( 0,255,0,0.01 )" );
    if ( settings.color == "random" ) {
      this.colorAngle = p.random( 0, 100 );
    } else {
      this.colorAngle = settings.color;
    }
    this.colorStroke = p.color( this.colorAngle, 100, 100, 20 );
  }

  moveTo( newPos ) {
    this.pos = newPos;
  }

  applyForce( force ) {
    this.acceleration.add( force );
  }

  draw() {
    /* 
      this.p.fill( this.colorFill );
      this.p.strokeWeight( 2 );
      this.p.circle( this.pos.x, this.pos.y, this.size );
    */
    this.p.strokeWeight( 2 );
    this.p.stroke( this.colorStroke );
  }

  loop() {
    this.velocity.add( this.acceleration );
    this.pos.add( this.velocity );
    this.acceleration.mult( 0 );

    if ( this.pos.dist( this.targetPos ) <= this.size ) {
      this.targetPos = randomPoint( this.p );

      // Change color
      /*
        this.colorAngle += this.p.random( settings.maxColorChange/2, settings.maxColorChange );
        if ( this.colorAngle > 100 ) { this.colorAngle =- 100 } ;
        if ( this.colorAngle < 0 ) { this.colorAngle =+ 100 } ;
      */
    }

    newPos = p5.Vector.lerp( this.pos, this.targetPos, this.speed );
    this.moveTo( newPos );
    /*
      newVel = p5.Vector.lerp( this.pos, this.targetPos, this.speed );
      console.log( newVel );
      this.applyForce( newVel );
    */

    this.draw();
  }
}


let agentAmount;
let agents = [];
let targetPos, newPos, newVel;
let printNum = 0;
let counter;

const script = ( p ) => {
  p.setup = function() {
    counter = 0;
    printNum++;

    if ( settings.seed != "none" ) { p.randomSeed( settings.seed ) }
    p.colorMode( p.HSB, 100 );
    settings.color = p.random( 0, 100 );
    // p.background( 0, 0, 0, 1 );

    let container = document.getElementById( "myContainer" );
    let canvas = p.createCanvas( container.offsetWidth, container.offsetHeight );
    canvas.parent( "myContainer" );

    agents = [];
    agentAmount = p.random( settings.minAgents, settings.maxAgents );
    // Noise based
    /*
    agentAmount = p.map(
      p.noise( printNum ),
      0, 1,
      settings.minAgents, settings.maxAgents
    );
    */
    agentAmount = Math.round( agentAmount );
    console.log( agentAmount );
    for ( let i = 0; i <= agentAmount; i++ ) {
      agents.push( new Agent( p ) );
    }
  };

  p.draw = function() {
    p.background( 0, 0, 100, 0.7 );
    counter++
    if ( counter >= settings.maxTime ) {
      p.setup();
    }

    for ( let i = 0; i < agents.length; i++ ) {
      agents[i].loop();
      if ( i+1 == agents.length ) {
        p.line( agents[ i ].pos.x, agents[ i ].pos.y, agents[ 0 ].pos.x, agents[ 0 ].pos.y );
      } else {
        p.line( agents[ i ].pos.x, agents[ i ].pos.y, agents[ i+1 ].pos.x, agents[ i+1 ].pos.y );
      }
    }
  }

  p.mouseClicked = function() {
    console.log( printNum );
    p.setup();
  }
}

let myp5 = new p5( script, "myContainer" );
