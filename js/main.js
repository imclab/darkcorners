"use strict";
var pl, controls, scene, skyScene, renderer, composer;
var renderTargetParametersRGBA, renderTargetParametersRGB;
var colorTarget, depthTarget, depthPassPlugin;
var lightManager, animationManager, soundManager, aiManager, dungeon;
var projector = new THREE.Projector();
var clock = new THREE.Clock();
var cache = new DC.Cache();
var passes = {};

function init() {
	scene = new Physijs.Scene({ fixedTimeStep: 1 / CONFIG.physicsFPS });
	scene.setGravity(new THREE.Vector3(0, -10, 0));
	scene.fog = new THREE.FogExp2(0x000000, 0.05);
	scene.addEventListener('update', function() {
		if (CONFIG.showStats) DC.physicsStats.update();
	});
	skyScene = new THREE.Scene();

	pl = new Physijs.CapsuleMesh(
		new THREE.CylinderGeometry(0.8, 0.8, 2.0),
		Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0xff00ff }), 0.5, 0.0),
		100
	);
	pl.visible = false;
	pl.geometry.dynamic = false;
	pl.addEventListener('collision', function(other, vel, rot) {
		if (this.dead) return;
		if (other.items) {
			for (var i in other.items) {
				if (pl[i] !== undefined) {
					if (typeof(other.items[i]) === "number") pl[i] += other.items[i];
					else pl[i] = other.items[i];
				}
			}
			soundManager.play("pick-up");
			displayMinorMessage("Picked up " + other.itemName);
			updateHUD();
			other.items = undefined;
			other.visible = false;
			other.parent.remove(other);
		}
		if (other.damage && other.position.y > 0.3 && pl.faction != other.faction) {
			this.hp -= other.damage;
			updateHUD();
			// Death is checked in render loop
			// TODO: Hit sound?
			// TODO: Screen effect?
		}
	});
	// Add pl later to the scene

	// Player stats
	var loadedStats = {};
	if (DC.hashParams.level && localStorage.getItem("campaingState-" + DC.hashParams.level)) {
		loadedStats = JSON.parse(localStorage.getItem("campaingState-" + DC.hashParams.level));
		pl.hp = loadedStats.hp;
		pl.bulletsPerClip = loadedStats.bulletsPerClip;
		pl.bullets = loadedStats.bullets;
		pl.clips = loadedStats.clips;
		pl.ammoType = loadedStats.ammoType || "plain";
	} else {
		pl.hp = 100;
		pl.bulletsPerClip = 15;
		pl.bullets = pl.bulletsPerClip;
		pl.clips = 5;
		pl.ammoType = "plain";
	}
	pl.reloading = false;
	pl.faction = 0;
	updateHUD();

	pl.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 25);
	pl.skyCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 150);

	controls = new DC.Controls(pl.camera, { mouse: mouseHandler });
	controls.movementSpeed = 10;
	controls.lookSpeed = 0.5;
	controls.lookVertical = true;
	controls.constrainVerticalLook = true;
	controls.verticalMin = 1.1;
	controls.verticalMax = 2.2;

	renderer = new THREE.WebGLRenderer({
		antialias: CONFIG.antialias,
		preserveDrawingBuffer: true
	});
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapDebug = false;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.autoClear = false;
	if (!CONFIG.anisotropy) CONFIG.anisotropy = renderer.getMaxAnisotropy();

	renderTargetParametersRGB  = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	renderTargetParametersRGBA = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
	depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParametersRGBA);
	colorTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParametersRGB);

	// Postprocessing effects
	passes.ssao = new THREE.ShaderPass(THREE.ShaderExtras.ssao);
	passes.ssao.uniforms.tDepth.value = depthTarget;
	passes.ssao.uniforms.size.value.set(window.innerWidth, window.innerHeight);
	passes.ssao.uniforms.cameraNear.value = pl.camera.near;
	passes.ssao.uniforms.cameraFar.value = pl.camera.far;
	passes.ssao.uniforms.fogNear.value = scene.fog.near;
	passes.ssao.uniforms.fogFar.value = scene.fog.far;
	passes.ssao.uniforms.fogEnabled.value = 0;
	passes.ssao.uniforms.aoClamp.value = 0.4;
	passes.ssao.uniforms.onlyAO.value = 0;
	passes.fxaa = new THREE.ShaderPass(THREE.ShaderExtras.fxaa);
	passes.fxaa.uniforms.resolution.value.set(1/window.innerWidth, 1/window.innerHeight);
	passes.bloom = new THREE.BloomPass(0.5);
	passes.adjust = new THREE.ShaderPass(THREE.ShaderExtras.hueSaturation);
	passes.adjust.uniforms.saturation.value = 0.2;

	composer = new THREE.EffectComposer(renderer, colorTarget);
	composer.addPass(passes.ssao);
	composer.addPass(passes.fxaa);
	composer.addPass(passes.bloom);
	composer.addPass(passes.adjust);
	composer.passes[composer.passes.length - 1].renderToScreen = true;

	// Depth pass
	depthPassPlugin = new THREE.DepthPassPlugin();
	depthPassPlugin.renderTarget = depthTarget;
	renderer.addPrePlugin(depthPassPlugin);

	if (CONFIG.resolution != 1.0) DC.onWindowResize();

	resetLevel();
	DC.updateConfig();
	DC.dumpInfo();
	DC.initUI();
}

function resetLevel(levelName) {
	if (levelName == "[credits]") {
		window.location = "credits.html";
		return;
	}
	// TODO: Reloadless reset?
	if (dungeon) {
		if (levelName) window.location.hash = "#level=" + levelName;
		window.location.reload(true);
	}
	lightManager = new DC.LightManager({ maxLights: CONFIG.maxLights, maxShadows: CONFIG.maxShadows });
	animationManager = new DC.AnimationManager();
	soundManager = new DC.SoundManager();
	aiManager = new DC.AIManager();
	dungeon = new DC.Dungeon(scene, pl, levelName);
}

function savePlayerState(levelName) {
	if (!levelName || levelName == "[credits]") return;
	var state = {
		hp: pl.hp,
		bulletsPerClip: pl.bulletsPerClip,
		bullets: pl.bullets,
		clips: pl.clips,
		ammoType: pl.ammoType
	};
	localStorage.setItem("campaingState-" + levelName, JSON.stringify(state));
}


var shootVector = new THREE.Vector3();
/*function shoot(obj, type, faction, off, flip) {
	var bullet = dungeon.forks[dungeon.forkIndex];
	dungeon.forkIndex = (dungeon.forkIndex + 1) % dungeon.forks.length;
	bullet.position.copy(obj.matrixWorld.getPosition());
	// Play sounds as early as possible
	soundManager.playSpatial("shoot", bullet.position, 20);
	// Figure out the direction
	bullet.matrixRotationWorld.extractRotation(obj.matrixWorld);
	if (flip) bullet.matrixRotationWorld.rotateY(Math.PI);
	bullet.rotation.setEulerFromRotationMatrix(bullet.matrixRotationWorld);
	bullet.updateMatrix();
	shootVector.set(0, 0, 1).applyMatrix3(matrixRotationWorld); // FIXME: API changed
	// Offset launch point
	bullet.translateX(off.x);
	bullet.translateY(off.y);
	bullet.translateZ(off.z);
	// Physics
	bullet.__dirtyPosition = true;
	bullet.__dirtyRotation = true;
	var velObj = obj.parent instanceof THREE.Scene ? obj : obj.parent;
	bullet.setLinearVelocity(shootVector.multiplyScalar(25.0).add(velObj.getLinearVelocity()));
	// Gameplay properties
	bullet.damage = dungeon.forkTypes[type].damage;
	bullet.material = dungeon.forkTypes[type].material;
	bullet.faction = faction;
	bullet.visible = true;
}

function reload() {
	if (pl.reloading || pl.bullets >= pl.bulletsPerClip) return;
	if (pl.clips <= 0) {
		displayMinorMessage("Out of ammo");
		return;
	}
	pl.reloading = true;
	window.setTimeout(function() {
		pl.bullets = pl.bulletsPerClip;
		--pl.clips;
		updateHUD();
		pl.reloading = false;
		pl.rhand.material.materials[2] = pl.rhand.ammoGood;
		pl.rhand.materialNeedsUpdate = true;
	}, 2000);
	soundManager.play("reload");
}*/

function mouseHandler(button) {
	/*if (button == 0 && pl.rhand && pl.bullets <= 0 && !pl.reloading) {
		// Clip empty, force reload if there is more
		soundManager.play("shoot-dry");
		reload();
	} else if (button == 0 && pl.rhand && pl.bullets > 0 && !pl.reloading) {
		// Shoot!
		--pl.bullets;
		if (pl.bullets <= 0) {
			pl.rhand.material.materials[2] = pl.rhand.ammoOut;
			pl.rhand.materialNeedsUpdate = true;
		}
		shoot(pl.rhand, pl.ammoType, pl.faction, { x: 0.0, y: 0.11, z: 1.0 }, true);
		updateHUD();
	} else*/ if (button == 2) {
		// Punch/push
		shootVector.set(0, 0, 1);
		projector.unprojectVector(shootVector, pl.camera);
		var raycaster = new THREE.Raycaster(
			pl.camera.position, shootVector.sub(pl.camera.position).normalize(),
			0, 2); // near, far
		var intersections = raycaster.intersectObjects(dungeon.objects);
		if (intersections.length > 0) {
			intersections[0].object.applyCentralImpulse(shootVector.multiplyScalar(10000));
		}
	}
}

function animate(dt) {
	function getAnim(time) { return Math.abs(time - (time|0) - 0.5) * 2.0; }
	function fract(num) { return num - (num|0); }
	var i, v = new THREE.Vector3();

	// Update object animations
	animationManager.update(dt);

	// Lights
	var timeNow = new Date().getTime();
	for (i = 0; i < lightManager.lights.length; ++i) {
		var light = lightManager.lights[i];
		//var anim = timeNow / (1000.0 + i);
		//light.intensity = 0.5 + 0.5 * getAnim(anim);
		if (light.visible && light.emitter)
			light.emitter.update(dt).render();
	}
	if (dungeon.exitParticles) dungeon.exitParticles.update(dt).render();

	// Player light
	//pl.light.intensity = 0.5 + 0.5 * getAnim(timeNow / 1000.0);
	pl.light.position.set(pl.position.x, pl.position.y + 0.2, pl.position.z);
	pl.shadow.position.copy(pl.light.position);
	pl.shadow.target.position.copy(controls.target);
}

$(document).ready(function() {
	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();

	function formatRenderInfo(info) {
		var report = [
			"Prog:", info.memory.programs,
			"Geom:", info.memory.geometries,
			"Tex:", info.memory.textures,
			"Calls:", info.render.calls,
			"Verts:", info.render.vertices,
			"Faces:", info.render.faces,
			"Pts:", info.render.points
		];
		return report.join(' ');
	}

	function render() {
		requestAnimationFrame(render);
		if (pl.dead) return;

		var dt = clock.getDelta();
		if (dt > 0.05) dt = 0.05; // Limit delta to 20 FPS

		// Player movement & controls
		controls.update(dt);
		pl.applyCentralImpulse(controls.movement);
		// Brake force to limit speed
		v0 = pl.getLinearVelocity();
		v1.set(-v0.x, 0, -v0.z);
		pl.applyCentralImpulse(v1.multiplyScalar(controls.brakeForce));
		// Simulate physics
		scene.simulate();
		// Put the camera to the real, simulated position
		// FIXME: 0.5 below is magic number to rise camera
		controls.object.position.set(pl.position.x, pl.position.y + 0.5, pl.position.z);
		pl.rotation.y = pl.camera.rotation.y;
		pl.__dirtyRotation = true;
		pl.skyCamera.rotation.copy(pl.camera.rotation);

		animate(dt);

		renderer.clear();
		if (CONFIG.postprocessing) {
			renderer.render(skyScene, pl.skyCamera, composer.renderTarget2, true);
			renderer.shadowMapEnabled = CONFIG.shadows;
			depthPassPlugin.enabled = true;
			renderer.render(scene, pl.camera, composer.renderTarget2, false);
			if (CONFIG.showStats) DC.rendererInfo.innerHTML = formatRenderInfo(renderer.info);
			renderer.shadowMapEnabled = false;
			depthPassPlugin.enabled = false;
			composer.render(dt);
		} else {
			renderer.render(skyScene, pl.skyCamera);
			renderer.render(scene, pl.camera);
			if (CONFIG.showStats) DC.rendererInfo.innerHTML = formatRenderInfo(renderer.info);
		}

		if (CONFIG.showStats) DC.renderStats.update();
	}

	init();

	dungeon.ready(function() {
		window.setInterval(function() { lightManager.update(pl); }, 690);
		window.setInterval(function() { if (!pl.dead) aiManager.process(); }, 100);
		// Main game logic updater
		window.setInterval(function() {
			if (!pl.dead && pl.hp <= 0) {
				// Oh noes, death!
				pl.dead = true;
				controls.active = false;
				if (!$("#deathscreen").is(':visible'))
					$("#deathscreen").fadeIn(500);
				$("#instructions").hide();
			}

			// Trigger?
			var trigger = dungeon.getTriggerAt(pl.position);
			if (trigger) {
				if (trigger.type == "message") displayMessage(trigger.message);
			}

			// Exit?
			if (dungeon.isAtExit(pl.position)) {
				savePlayerState(dungeon.level.next);
				resetLevel(dungeon.level.next);
			}
		}, 45);

		if (dungeon.level.music) soundManager.currentMusic = dungeon.level.music;
		if (CONFIG.music) soundManager.playMusic();

		render();
	});
});
