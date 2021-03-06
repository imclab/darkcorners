var assets = {
	objects: {
		"fern-01": { randScale: 0.3, noShadows: true },
		"fern-02": { randScale: 0.3, noShadows: true },
		"plant-01": { randScale: 0.3, noShadows: true },
		"plant-02": { randScale: 0.3, noShadows: true },
		"plant-03": { randScale: 0.3, noShadows: true },
		"plant-04": { randScale: 0.3, noShadows: true },
		"plant-05": { randScale: 0.3, noShadows: true },
		"rock-01": { collision: "sphere", mass: 400, randScale: 0.4 },
		"rock-02": { collision: "box", mass: 400, randScale: 0.4 },
		"rock-03": { collision: "box", mass: 400, randScale: 0.4 },
		"rock-04": { collision: "box", mass: 500, randScale: 0.4 },
		"barrel": { collision: "cylinder", mass: 250 },
		"box": { collision: "box", mass: 150 },
		"crate-long": { collision: "box", mass: 200 },
		"bucket-broken": { collision: "cylinder", mass: 50 },
		"netted-jar": { collision: "cylinder", mass: 100 },
		"vase-01": { collision: "cylinder", mass: 75 },
		"table-big": { collision: "box", mass: 1000 },
		"table-old": { collision: "box", mass: 800 },
		"chair-01": { collision: "box", mass: 200 },
		"bench-church": { collision: "box", mass: 1000 },
		"torch-standing": { collision: "cylinder", mass: 150 },
		"mine-cart": { collision: "box", mass: 900 },
		"obelisk-01": { collision: "box", mass: 0 },
		"obelisk-02": { collision: "box", mass: 0 },
		"pillar-broken-01": { collision: "cylinder", mass: 0 },
		"pillar-broken-02": { collision: "cylinder", mass: 0 },
		"pillar-greek": { collision: "cylinder", mass: 0 },
		"forge": { collision: "concave", mass: 0 },
		"door-barred": { collision: "box", mass: 400, door: true },
		"teleporter": { collision: "cylinder", mass: 0 }
	},
	items: {
		"key": {},
		"knife": {},
		"health-potion": {},
		"mana-potion": {}
	},
	lights: {
		"torch-hanging-01": {
			type: "ceiling", color: "#ffff00", offset: { x: 0, y: -0.4, z: 0 }, particles: { type: "flame" }
		},
		"torch-hanging-02": {
			type: "ceiling", color: "#ffff00", offset: { x: 0, y: -0.4, z: 0 }, particles: { type: "flame" }
		},
		"torch": {
			type: "wall", color: "#ffff00", offset: { x: 0, y: 0.25, z: 0.06 }, particles: { type: "flame" }
		}
	},
	sounds: { },
	materials: {
		"grass-01": {},
		"grass-02": {},
		"grass-03": {},
		"grass-04": {},
		"metal-01": { repeat: 4 },
		"metal-02": {},
		"metal-03": {},
		"metal-bumps-01": { repeat: 2 },
		"metal-bumps-02": {},
		"metal-bumps-03": {},
		"metal-colored-01": {},
		"metal-colored-02": { repeat: 2 },
		"metal-colored-03": {},
		"metal-colored-04": {},
		"metal-colored-05": {},
		"metal-colored-06": {},
		"metal-colored-07": {},
		"metal-colored-08": { repeat: 2 },
		"metal-colored-09": {},
		"metal-corrugated-01": { repeat: 2 },
		"metal-corrugated-02": {},
		"metal-worn-01": {},
		"metal-worn-02": {},
		"moss-01": {},
		"moss-02": {},
		"rock-01": { roughness: 0.15 },
		"rock-02": { roughness: 0.15 },
		"rock-03": { roughness: 0.15 },
		"rock-04": { roughness: 0.15 },
		"rock-05": {},
		"sand-01": {},
		"sand-02": {},
		"sand-03": {},
		"sand-04": {},
		"stone-01": {},
		"stone-02": {},
		"stone-03": {},
		"stone-floor-01": {},
		"stone-floor-02": {},
		"stone-floor-03": {},
		"stone-floor-04": {},
		"stone-floor-05": {},
		"stone-floor-06": {},
		"tiles-01": {},
		"tiles-02": {},
		"wood-floor-01": {}
	},
	monsters: {
		"cerberus": { collision: "box", character: { speed: 4, hp: 50 }, animation: { type: "morph", duration: 750 } },
		"spider": { collision: "box", character: { speed: 4, hp: 50 }, animation: { type: "morph", duration: 750 } },
		"golem": { collision: "box", character: { speed: 4, hp: 100 }, animation: { type: "morph", duration: 750 } },
		"minotaur": { collision: "box", character: { speed: 10, hp: 50 }, animation: { type: "morph", duration: 750 } }
	},
	environments: {
		"cave": {
			wall: [ "rock-01", "rock-02", "rock-03", "rock-04" ],
			floor: [ "sand-01", "sand-02", "sand-03", "sand-04" ],
			ceiling: [ "rock-01", "rock-02", "rock-03", "rock-04" ],
			objects: [ "rock-01", "rock-02", "rock-03", "rock-04" ]
		},
		"mine": {
			wall: [ "rock-01", "rock-02", "rock-03", "rock-04" ],
			floor: [ "rock-01", "rock-02", "rock-03", "rock-04" ],
			ceiling: [ "rock-01", "rock-02", "rock-03", "rock-04" ],
			objects: [ "mine-cart", "rock-01", "rock-02", "rock-03", "rock-04", "barrel", "box", "netted-jar", "table-old" ]
		},
		"dungeon": {
			wall: [ "stone-01", "stone-02", "stone-03" ],
			floor: [ "stone-floor-02", "stone-floor-05" ],
			ceiling: [ "stone-01" ],
			objects: [ "barrel", "box", "netted-jar", "table-old", "chair-01" ]
		},
		"castle": {
			wall: [ "stone-01", "tiles-01", "tiles-02" ],
			floor: [ "stone-floor-01", "stone-floor-03", "stone-floor-04", "stone-floor-06", "wood-floor-01" ],
			ceiling: [ "stone-01" ],
			objects: [ "barrel", "netted-jar", "table-big", "chair-01" ]
		},
		"temple": {
			wall: [ "stone-01", "tiles-01", "tiles-02" ],
			floor: [ "stone-floor-01", "stone-floor-03", "stone-floor-04", "stone-floor-06", "wood-floor-01" ],
			ceiling: [ "stone-01" ],
			objects: [ "pillar-greek", "pillar-greek", "netted-jar", "table-old", "chair-01" ]
		}
	}
};
