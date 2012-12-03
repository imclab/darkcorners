var tools = {};

tools.walls = {
	"Draw walls": function() {
		currentTool = tools.walls;
		canvas.style.cursor = "default";
	},
	drawing: null,
	mousedown: function(e) {
		if (e.button == 0) tools.walls.drawing = WALL;
		else if (e.button == 2) tools.walls.drawing = OPEN;
		else return;
		putMouse(e._x, e._y, tools.walls.drawing);
	},
	mousemove: function(e) {
		if (tools.walls.drawing) putMouse(e._x, e._y, tools.walls.drawing);
	},
	mouseup: function(e) {
		tools.walls.drawing = null;
	}
};
var currentTool = tools.walls;

tools.diagonals = {
	"Place diagonal walls": function() {
		currentTool = tools.diagonals;
		canvas.style.cursor = "default";
	},
	mousedown: function(e) {
		if (e.button == 2) putMouse(e._x, e._y, OPEN);
		else if (e.button == 0) {
			var c = 0;
			if (getMouse(e._x - s, e._y) == WALL) ++c;
			if (getMouse(e._x + s, e._y) == WALL) ++c;
			if (getMouse(e._x, e._y - s) == WALL) ++c;
			if (getMouse(e._x, e._y + s) == WALL) ++c;
			if (c == 2) putMouse(e._x, e._y, DIAG);
		}
	},
};

tools.start = {
	"Place start": function() {
		currentTool = tools.start;
		canvas.style.cursor = "crosshair";
	},
	mousedown: function(e) {
		if (e.button == 0) {
			putMouse(e._x, e._y, OPEN);
			level.start[0] = e._x / s;
			level.start[1] = e._y / s;
		} else if (e.button == 2) tools.del(e);
	}
};

tools.exit = {
	"Place exit": function() {
		currentTool = tools.exit;
		canvas.style.cursor = "crosshair";
	},
	mousedown: function(e) {
		if (e.button == 0) {
			putMouse(e._x, e._y, OPEN);
			level.exit[0] = e._x / s;
			level.exit[1] = e._y / s;
		} else if (e.button == 2) tools.del(e);
	}
};

tools.light = {
	"Add light": function() {
		currentTool = tools.light;
		canvas.style.cursor = "crosshair";
	},
	mousedown: function(e) {
		if (e.button == 0) {
			level.lights.push({ position: { x: e._x / s, z: e._y / s } });
		} else if (e.button == 2) tools.del(e);
	}
};

tools.object = {
	"Add object": function() {
		currentTool = tools.object;
		canvas.style.cursor = "crosshair";
	},
	object: "", // Populated from assets.js
	objects: [], // Populated from assets.js
	angle: 0,
	mousedown: function(e) {
		if (e.button == 0) {
			var obj = {
				name: tools.object.object,
				position: { x: e._x / s, z: e._y / s }
			}
			if (tools.object.angle !== 0) obj.angle = tools.object.angle;
			level.objects.push(obj);
		} else if (e.button == 2) tools.del(e);
	}
};

tools.item = {
	"Add item": function() {
		currentTool = tools.item;
		canvas.style.cursor = "crosshair";
	},
	item: "", // Populated from assets.js
	items: [], // Populated from assets.js
	mousedown: function(e) {
		if (e.button == 0) {
			var item = {
				name: tools.item.item,
				position: { x: e._x / s, z: e._y / s }
			}
			level.items.push(item);
		} else if (e.button == 2) tools.del(e);
	}
};

tools.monster = {
	"Add monster": function() {
		currentTool = tools.monster;
		canvas.style.cursor = "crosshair";
	},
	monster: "", // Populated from assets.js
	monsters: [], // Populated from assets.js
	mousedown: function(e) {
		if (e.button == 0) {
			var monster = {
				name: tools.monster.monster,
				position: { x: e._x / s, z: e._y / s }
			}
			level.monsters.push(monster);
		} else if (e.button == 2) tools.del(e);
	}
};

tools.trigger = {
	"Add trigger": function() {
		currentTool = tools.trigger;
		canvas.style.cursor = "crosshair";
	},
	type: "message",
	types: [ "message" ],
	mousedown: function(e) {
		if (e.button == 0) {
			var trig = {
				type: tools.trigger.type,
				position: { x: e._x / s, z: e._y / s }
			}
			if (tools.trigger.type === "message") {
				var msg = prompt("Please enter the message to be triggered:");
				if (!msg) return;
				trig.message = msg;
			} else return;
			level.triggers.push(trig);
		} else if (e.button == 2) tools.del(e);
	}
};

tools.delHelper = function(e, arr) {
	for (var i = 0; i < arr.length; ++i) {
		if (Math.abs(arr[i].position.x - e._x / s) < 0.75 &&
			Math.abs(arr[i].position.z - e._y / s) < 0.75) {
				arr.splice(i, 1);
				return true;
		}
	}
	return false;
};

tools.del = function(e) {
	if (tools.delHelper(e, level.lights)) return;
	if (tools.delHelper(e, level.objects)) return;
	if (tools.delHelper(e, level.items)) return;
	if (tools.delHelper(e, level.monsters)) return;
	if (tools.delHelper(e, level.triggers)) return;
};

tools["Clear"] = function() {
	if (confirm("Are you sure you want to erase everything?")) {
		localStorage.removeItem("editor-autosave");
		window.location.reload();
	}
};

tools["Export base64"] = function() {
	prepareExport();
	var b64 = window.btoa(JSON.stringify(level));
	document.getElementById("exported").value = b64;
	document.getElementById("exported").style.display = "block";
};

tools["Export JSON"] = function() {
	prepareExport();
	document.getElementById("exported").value = JSON.stringify(level, null, '\t');
	document.getElementById("exported").style.display = "block";
};

tools["Import level"] = function(json) {
	var json = json || prompt("Paste here the level JSON (can be base64) to import:");
	if (!json || !json.length) return;
	try {
		if (json[0] !== '{') json = window.atob(json);
		json = JSON.parse(json);
	} catch (err) {
		alert("Import error: " + err);
		return;
	}
	level = json;
	level.title = level.title || "Untitled";
	level.map = new Map(level.width, level.depth, level.map);
	level.lights = level.lights || [];
	level.objects = level.objects || [];
	level.items = level.items || [];
	level.monsters = level.monsters || [];
	level.triggers = level.triggers || [];
	w = level.width; h = level.depth;
	// Discard y-coordinates
	for (var i = 0; i < level.lights.length; ++i)
		if (level.lights[i].position.y !== undefined)
			delete level.lights[i].position.y

	document.getElementById("exported").value = "";
	document.getElementById("exported").style.display = "none";
};

tools["Test"] = function() {
	var url = "../game_dev.html#level=" + window.btoa(JSON.stringify(level));
	window.open(url, "_blank");
};

tools["Preview object"] = function() {
	var url = "model-viewer.html#" + tools.object.object;
	window.open(url, "_blank");
};
