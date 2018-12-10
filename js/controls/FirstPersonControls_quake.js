/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( camera, domElement ) {
	this.camera = camera;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.pointerLocking;
	this.pointerLocked = false;

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.25;
	// this.lookSpeed = 10.0;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {
		this.domElement.setAttribute( 'tabindex', - 1 );
	}

	//

	this.forwardVector = function() {
		var negativeZ = new THREE.Vector3(0, 0, -1.0);

		return negativeZ.applyQuaternion( this.camera.quaternion );
	};

	this.upVector = function() {
		return this.camera.up;
	};

	this.rightVector = function() {
		return this.forwardVector().clone().cross(this.upVector());
	};

	this.handleResize = function () {
		if ( this.domElement === document ) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
		} else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
	};

	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}

		this.mouseDragOn = true;
	};

	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}

		this.mouseDragOn = false;
	};

	this.pointerLockChange = function ( event ) {
		this.pointerLocked = this.pointerLocking;

		this.pointerLocking = false;
	};

	this.pointerLockError = function ( event ) {
		console.log('pointer lock error!');
	};

	this.onMouseMove = function ( event ) {
		if (!this.pointerLocked) return;

		let pageX;
		let pageY;

		this.mouseX = event.movementX;
		this.mouseY = event.movementY;
	};

	this.onKeyDown = function ( event ) {
		// event.preventDefault();

		switch ( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;
		}
	};

	this.onKeyUp = function ( event ) {
		switch ( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;
		}
	};

	this.update = function ( delta ) {
		if ( this.enabled === false ) return;

		var forwardSpeed = 0;
		var strafeSpeed  = 0;
		var upSpeed      = 0;

		if ( this.moveForward  ) forwardSpeed  =  this.movementSpeed;
		if ( this.moveBackward ) forwardSpeed  = -this.movementSpeed;

		if ( this.moveRight ) strafeSpeed =  this.movementSpeed;
		if ( this.moveLeft  ) strafeSpeed = -this.movementSpeed;

		if ( this.moveUp   ) upSpeed =  this.movementSpeed;
		if ( this.moveDown ) upSpeed = -this.movementSpeed;

		var forward = this.forwardVector().clone();
		var strafe  = this.rightVector().clone();
		var up      = this.upVector().clone();

		forward.multiplyScalar(forwardSpeed * delta);
		strafe.multiplyScalar(strafeSpeed * delta);
		up.multiplyScalar(upSpeed * delta);

		this.camera.position.add(forward).add(strafe).add(up);

		var yawScale = -this.mouseX * (delta * this.lookSpeed);

		var yaw = (new THREE.Quaternion());
		yaw.setFromAxisAngle(this.upVector(), yawScale);
		camera.applyQuaternion(yaw);

		var pitchScale = -this.mouseY * (delta * this.lookSpeed);

		var pitch = (new THREE.Quaternion());
		pitch.setFromAxisAngle(this.rightVector(), pitchScale);
		camera.applyQuaternion(pitch);

		// TODO pretty sure diagonal movement gets you going faster this way.

		this.mouseX = 0;
		this.mouseY = 0;

		return;

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward  ) this.camera.translateZ( - actualMoveSpeed );
		if ( this.moveBackward ) this.camera.translateZ(   actualMoveSpeed );

		if ( this.moveLeft  ) this.camera.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.camera.translateX(   actualMoveSpeed );

		if ( this.moveUp   ) this.camera.translateY(   actualMoveSpeed );
		if ( this.moveDown ) this.camera.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {
			actualLookSpeed = 0;
		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {
			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
		}

		this.lon += this.mouseX * actualLookSpeed;
		if ( this.lookVertical )
			this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {
			this.phi = THREE.Math.mapLinear(
				this.phi,
				0,
				Math.PI,
				this.verticalMin,
				this.verticalMax
			);
		}

		var targetPosition = this.target;
		var position = this.camera.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.camera.lookAt( targetPosition );

		this.mouseX = 0;
		this.mouseY = 0;
	};

	function contextmenu( event ) {
		event.preventDefault();
	}

	this.dispose = function () {
		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		// this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
		this.domElement.removeEventListener( 'pointermove', _onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );
	};

	var _pointerLockChange = bind( this, this.pointerLockChange );
	var _pointerLockError  = bind( this, this.pointerLockError );
	var _onMouseMove       = bind( this, this.onMouseMove );
	var _onMouseDown       = bind( this, this.onMouseDown );
	var _onMouseUp         = bind( this, this.onMouseUp );
	var _onKeyDown         = bind( this, this.onKeyDown );
	var _onKeyUp           = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'pointerlockchange', _pointerLockChange, false);
	this.domElement.addEventListener( 'pointerlockerror', _pointerLockError, false);
	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	// this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this.domElement.addEventListener( 'pointermove', _onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

	this.domElement.onpointerdown = bind(this, function (event) {
		this.pointerLocking = true;

		event.target.requestPointerLock();
	});

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}

	this.handleResize();
};
