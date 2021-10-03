let settings = {
  maxTime: 60 * 24,
  opacity: 0.05,
  capital: {
    amount: 150,
    jitterRange: 30,
    acceleration: 0.01,
    //TODO: Impliment color mode, so it picks a single color or randomly picks from the array.
    color: "rgba( 255, 0, 0, 0.05 )",
    opacity: 0.05,
  },
  gift: {
    amount: 30,
    jitterRange: 30,
    acceleration: 0.01,
    color: "rgba( 0, 255, 0, 0.05 )",
    opacity: 0.05,
  },
  source: {
    amount: 50,
  },
  behavior: {
    seemless: false,
  },
  // seed: 1,
};

class Clock {
  constructor( p ) {
    this.currentSecond = 0;
  }
  
  every(seconds, unit, callback) {
    let _unit;
    if (unit == "seconds") {
      _unit = 1000;
    } else if (unit == "minutes") {
      _unit = 60000;
    } else {
      console.log("No unit called: " + unit);
    }
    
    if ( p.millis() >= this.currentSecond + (seconds*_unit)) {
      this.currentSecond += (seconds*_unit);
      callback();
    }
  }
}

// Source = Planet
class Source {
  constructor( p, position ) {
    this.p = p;
    this.pos = {
      x: position.x,
      y: position.y,
    }
  }
}

function drawSources( p ) {
  sources.forEach( item => {
    p.fill( "rgba( 255, 255, 255, 0.20 )" );
    p.circle( item.pos.x, item.pos.y, 5 );
  });
}

// AGENTS
class Agent {
  constructor( p, position, settings ) {
    this.p = p;

    this.pos = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.accelration = {
      x: 0,
      y: 0,
    };
    
    this.max_acceleration = settings.acceleration;
    
    // let colorNum = Math.floor( p.random( 2 ) );
    // this.color = settings.colors[colorNum];
    // this.color = this.p.color( "white" );
    // this.color = this.p.color( "rbga( 255, 0, 0, "+settings.opacity+" )" );
    this.color = settings.color;
    /*
      this.color = new p5.Color();
      console.log( this.color );
      this.color.setAlpha( settings.opacity );
    */
    
    this._sources = sources.sort((a, b) => {
      return ( this.p.dist(this.pos.x, this.pos.y, a.pos.x, a.pos.y) - this.p.dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y));
    });
    this.nearest = this._sources[0];
  }
  
  loop() {
    this.updateNearest();
    this.move();
    this.draw();
  }
  
  //TODO: Optomize this so I can add 300+ sources and not have it sort them everytime.
  updateNearest() {
    this._sources = this._sources.sort((a, b) => {
      return ( this.p.dist(this.pos.x, this.pos.y, a.pos.x, a.pos.y) - this.p.dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y));
    });
    
    if (this.nearest != this._sources[0]) {
      this.nearest = this._sources[0];
    }
  }
  
  wallBehavior() {
    if (settings.behavior.seemless) {
      if (this.pos.x < 0) {this.pos.x = width}
      else if (this.pos.x > width) {this.pos.x = 0}
      if (this.pos.y < 0) {this.pos.y = width}
      else if (this.pos.y > width) {this.pos.y = 0}
    }
  }
  
  move() {
    this.wallBehavior();
    
    if ((this.nearest.pos.x - this.pos.x) > 0) {
      this.accelration.x = this.max_acceleration;
    } else {
      this.accelration.x = -1*this.max_acceleration;
    }
    if ((this.nearest.pos.y - this.pos.y) > 0) {
      this.accelration.y = this.max_acceleration;
    } else {
      this.accelration.y = -1*this.max_acceleration;
    }
    
    this.pos.x += this.velocity.x;
    this.velocity.x += this.accelration.x;
    
    this.pos.y += this.velocity.y;
    this.velocity.y += this.accelration.y;
  }
  
  draw() {
    // this.p.stroke( this.color );
    this.p.stroke( "rgba( 255, 255, 255, 0.05 )" );
    this.p.fill( this.color );
    this.p.square(this.pos.x, this.pos.y, 3, 3);

    this.p.stroke( this.color );
    this.p.line(this.pos.x, this.pos.y, this.nearest.pos.x, this.nearest.pos.y);
  }
}


class Demon {
  constructor( p, _settings ) {
    this.p = p;

    this.agents = [];
    this.origin = {
      x: p.random( 0, p.width ),
      y: p.random( 0, p.height ),
    };
    
    this.settings = _settings;
    this.amount = _settings.amount;
    this.jitterRange = _settings.jitterRange;
    this.color = _settings.color;
  }
  
  setup() {
    this.agents = [];
    this.origin = {
      x: this.p.random( 0, this.p.width ),
      y: this.p.random( 0, this.p.height ),
    };
    
    for ( let i=0; i<this.amount; i++ ) {
      this.agents.push( new Agent(
        this.p,
        {
          x: this.origin.x + this.p.random( -1*this.jitterRange, this.jitterRange ), 
          y: this.origin.y + this.p.random( -1*this.jitterRange, this.jitterRange )
        },
        this.settings
      ));
    }
  }
  
  loop() {
    for (let i=0; i<this.agents.length; i++) {
      this.agents[i].loop();
    }
  }
}

/* 
  function startNew() {
    clock.every(60, "seconds", () => {
      setup()
    });
  }
*/



let counter;
let sourceAmount;
let capital, gifts;

const script = ( p ) => {
  p.setup = function() {
    p.colorMode( p.RGB, 100 );

    // SETUP
    let clock = new Clock( p );
    counter = 0;
    // startNew();

    // CANVAS
    let container = document.getElementById( "myContainer" );
    let canvas = p.createCanvas( container.offsetWidth, container.offsetHeight );
    canvas.parent( "myContainer" );
    p.background( 0, 0, 0 );

    // SOURCES
    sourceAmount = settings.source.amount;
    sources = [];
    for ( i=0; i<settings.source.amount; i++ ) {
      sources.push( new Source( p, { x: p.random( 0, p.width ), y: p.random( 0, p.height ) } ) );
    }
    drawSources( p );

    // AGENTS
    capital = new Demon( p, settings.capital );
    gifts = new Demon( p, settings.gift );
    capital.setup();
    gifts.setup();
  },

  p.draw = function() {
    // RESET TIMER
    counter++
    console.log( p.frameRate() );
    if ( counter >= settings.maxTime ) {
      p.setup();
    }

    // LOOP
    p.background( 0, 0, 0, 0.2 );
    capital.loop();
    gifts.loop();
  },

  p.mouseClicked = function() {
    p.setup();
  }
}

let myp5 = new p5( script, "myContainer" );
