/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 * @author Carl-Maxwell / http://carlmaxwell.ninja/
 */

class FirstPersonControls {
	constructor( camera, domElement ) {
		this.camera = camera;
		this.target = new THREE.Vector3( 0, 0, 0 );

		this.domElement = ( domElement !== undefined ) ? domElement : document;

		this.pointerLocking;
		this.pointerLocked = false;

		this.enabled = true;

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.25;

		this.mouseX = 0;
		this.mouseY = 0;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		if ( this.domElement !== document ) {
			this.domElement.setAttribute( 'tabindex', - 1 );
		}
		
		//
		
		this.domElement.addEventListener('pointerlockchange', (evt) => this.pointerLockChange(evt), false);
		this.domElement.addEventListener('pointerlockerror', (evt) => this.pointerLockError(evt), false);
		this.domElement.addEventListener('pointermove', (evt) => this.onMouseMove(evt), false);

		this.domElement.onpointerdown = (event) => {
			this.pointerLocking = true;

			event.target.requestPointerLock();
		};
	}

	//

	forwardVector() {
		var negativeZ = new THREE.Vector3(0, 0, -1.0);

		return negativeZ.applyQuaternion( this.camera.quaternion );
	}

	upVector() {
		return this.camera.up;
	}

	rightVector() {
		return this.forwardVector().clone().cross(this.upVector());
	}

	pointerLockChange( event ) {
		this.pointerLocked = this.pointerLocking;

		this.pointerLocking = false;
	}

	pointerLockError( event ) {
		console.log('pointer lock error!');
	}

	onMouseMove( event ) {
		if (!this.pointerLocked) return;

		let pageX;
		let pageY;

		this.mouseX = event.movementX;
		this.mouseY = event.movementY;
	}

	update( delta ) {
		if ( this.enabled === false ) return;

		var forwardSpeed = 0;
		var strafeSpeed  = 0;
		var upSpeed      = 0;

		if ( Input.forward()  ) forwardSpeed  =  this.movementSpeed;
		if ( Input.backward() ) forwardSpeed  = -this.movementSpeed;

		if ( Input.right() ) strafeSpeed =  this.movementSpeed;
		if ( Input.left()  ) strafeSpeed = -this.movementSpeed;

		if ( Input.up()   ) upSpeed =  this.movementSpeed;
		if ( Input.down() ) upSpeed = -this.movementSpeed;

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
	}

	dispose () {
		// TODO dispose of event listeners
	}


}
 