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

		this.velocity = new THREE.Vector3(0, 0, 0);

		this.onGround = true;
		this.canJump = false;

		this.mouseX = 0;
		this.mouseY = 0;

		if ( this.domElement !== document ) {
			this.domElement.setAttribute( 'tabindex', - 1 );
		}

		Keyboard.on(' ', (evt) => this.jump(evt));

		//

		this.domElement.addEventListener('pointerlockchange', (evt) => this.pointerLockChange(evt), false);
		this.domElement.addEventListener('pointerlockerror' , (evt) => this.pointerLockError(evt) , false);
		// this.domElement.addEventListener('pointermove'      , (evt) => this.onMouseMove(evt)      , false);
		this.domElement.addEventListener('pointermove'      , (evt) => this.onMouseMove(evt)      , false);

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

	jump( event ) {
		if (!this.canJump) { return; }
		this.velocity.y += 400
		this.canJump = false;
	}

	floorCheck( offset = new THREE.Vector3(0, 0, 0) ) {
		// TODO swich from getY to doing a linetrace/collision check

		let position = this.camera.position.clone().add(offset);

		let playerHalfWidth = 50.0;

		// TODO rotate plane with the camera

		// TODO this just doesn't work reliably, not sure what's going on.

		let z1 = getY(
			Math.floor((position.x-playerHalfWidth)/100) + worldHalfWidth,
			Math.floor((position.z-playerHalfWidth)/100) + worldHalfDepth
		);
		let z2 = getY(
			Math.floor((position.x-playerHalfWidth)/100) + worldHalfWidth,
			Math.floor((position.z+playerHalfWidth)/100) + worldHalfDepth
		);
		let z3 = getY(
			Math.floor((position.x+playerHalfWidth)/100) + worldHalfWidth,
			Math.floor((position.z+playerHalfWidth)/100) + worldHalfDepth
		);
		let z4 = getY(
			Math.floor((position.x+playerHalfWidth)/100) + worldHalfWidth,
			Math.floor((position.z-playerHalfWidth)/100) + worldHalfDepth
		);

		let playerHeight = 100;

		return playerHeight + 100*Math.max(z1, z2, z3, z4);
	}

	land() {
		this.canJump = true;

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

		var forward = this.forwardVector().clone().setComponent(1, 0).normalize();
		var strafe  = this.rightVector().clone().setComponent(1, 0).normalize();
		var up      = this.upVector().clone();

		forward.multiplyScalar(forwardSpeed * delta);
		strafe.multiplyScalar(strafeSpeed * delta);
		up.multiplyScalar(upSpeed * delta);

		let ledgeMargin = 20

		let check = this.floorCheck((new THREE.Vector3(0, 0, 0)).add(forward).add(strafe));
		if (check-ledgeMargin < this.camera.position.y) {
			this.camera.position.add(forward).add(strafe).add(up);
		}

		this.camera.position.add(this.velocity.clone().multiplyScalar(delta));

		//
		// check if you're on the floor, apply gravity
		//

		let z = this.floorCheck();

		if (this.camera.position.y > z) {
			this.velocity.y -= 10;
			this.onGround = false;
			this.canJump = false;
		} else {
			this.camera.position.setComponent(1, z);
			this.velocity.y = 0;
			if (!this.onGround) {
				this.land();
				this.onGround = true
			}
		}

		//

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
