const BG = "#101010"
const FG = "#50ff50"
const POINT_SIZE = 20

// cylinder (y−z)^2+(z−x)^2+(x−y)^2=3R^2
// sphere (x-x0)^2 + (y-y0)^2 + (z-z0)^2 = r^2

/*

(x, y, z)
x` = x / z
y` = y / z

3d point projected to a screen 

*/

game.width = 600
game.height = 600

const ctx = game.getContext("2d")

console.log(game)
console.log(ctx)

clear()



function clear(){
	ctx.fillStyle = BG
	ctx.fillRect(0, 0, game.width, game.height)
}

function point({x, y}){	
	ctx.fillStyle = FG
	ctx.fillRect(x - POINT_SIZE / 2, y - POINT_SIZE / 2, POINT_SIZE, POINT_SIZE)
}

function screen(p){
	// -1..1 => 0..2 => 0..1 => 0..w
	
	return{
		x: (p.x + 1)/2 * game.width,
		y: (1 - (p.y + 1)/2) * game.height, 	// flip y bc +1 bellow zero 
	}
}


function project({x ,y, z}){ // formula assumes that ur eye is at z = 0
	return {
		x: x / z,
		y: y / z,
	}
}

function line(p1, p2){
	ctx.strokeStyle =  FG
	ctx.beginPath()
	ctx.moveTo(p1.x, p1.y)
	ctx.lineTo(p2.x, p2.y)
	ctx.stroke()
}

function translate_x({x, y, z}, dx){
	return {x: x + dx, y, z}
}

function translate_y({x, y, z}, dy){
	return {x, y: y + dy, z}
}

function translate_z({x, y, z}, dz){
	return {x, y, z: z + dz}
}

function rotate_xz({x, y, z}, angle){ // rotate around y, positive for counterclockwise, negative for clockwise
	/*
	|x`| = |cos(a)  -sin(a) | * |x|
	|y`| = |sin(a)    cos(a)| * |y|
	
	z` = z remains unchanged idk
	*/
	/*
	return {
		x: Math.cos(angle) * x - Math.sin(angle) * y,
		y: Math.sin(angle) * x + Math.cos(angle) * y,
		z: z,
	} // for xy
	*/
	
	return {
		x: Math.cos(angle) * x - Math.sin(angle) * z,
		y: y,
		z: Math.sin(angle) * x + Math.cos(angle) * z,
	} // for xz
}

function rotate_xy({x,y,z}, angle){ // around z
	return {
		x: Math.cos(angle) * x - Math.sin(angle) * y,
		y: Math.sin(angle) * x + Math.cos(angle) * y,
		z: z,
	}
}

function rotate_yz({x,y,z}, angle){ // around x
	return {
		x: x,
		y: Math.cos(angle) * y - Math.sin(angle) * z,
		z: Math.sin(angle) * y + Math.cos(angle) * z,
	}
}

function circle({x, y, z}, radius, divisions){
	const points = []
	for(let i = 0; i < divisions; i++){
		const a = i * (2*Math.PI / divisions)
		// x = center.x + r * cos(a)
		// y = center.y + r * sin(a)
		// a = 360 / divisions
		points.push(
			{
				x: x + radius * Math.cos(a),
				y: y + radius * Math.sin(a),
				z: z,
			}
		)
	}
	return points
}

function sphere({x, y, z}, radius){
	// 0 < a < pi;  0 < b < 2pi
	// x = x0 + r*sin(a)*cos(b)
	// y = y0 + r*sin(a)*sin(b)
	// z = z0 + r*cos(a)
	const points = []
	let a = 0, b = 0
	for(let a = 0; a < Math.PI; a += 0.3){
		for(let b = 0; b < 2 * Math.PI; b += 0.3){
			points.push({
					x: x + radius * Math.sin(a) * Math.cos(b),
					y: y + radius * Math.sin(a) * Math.sin(b),
					z: z + radius * Math.cos(a)
			})
		}
	}
	return points
}
	/*
	for(let i = 0; i < divisions; i++){
		const a = i * (Math.PI / divisions)
		const b = i * (2 * Math.PI / divisions)
		points.push(
			{
				x: x + radius * Math.sin(a) * Math.cos(b),
				y: y + radius * Math.sin(a) * Math.cos(b),
				z: z + radius * Math.cos(a)
			}
		)
	}*/

function extrude(){ // TODO
	
}

const FPS = 67
let dz = 0

const vs = [
	{x: 0.5, y: 0.5, z: 0.5},
	{x: -0.5, y: 0.5, z: 0.5},
	{x: -0.5, y: -0.5, z: 0.5},
	{x: 0.5, y: -0.5, z: 0.5},
	
	{x: 0.5, y: 0.5, z: -0.5},
	{x: -0.5, y: 0.5, z: -0.5},
	{x: -0.5, y: -0.5, z: -0.5},
	{x: 0.5, y: -0.5, z: -0.5},
]

const fs = [
	[0,1,2,3],
	[4,5,6,7],
	[0,4],
	[1,5],
	[2,6],
	[3,7],
]

let angle = 0

function frame(){
	const dt = 1 / FPS
	dz += 1*dt
	angle += 2 * Math.PI * dt
	clear()/*
	for(const v of vs){
		point(screen(project(translate_z(rotate_yz(v, angle), dz))))
	}*/
	for(const f  of fs){
		for(let i = 0; i < f.length; i++){
			const a = vs[f[i]]
			const b = vs[f[(i + 1)%f.length]] // if index is last, wrap around to 0
			line(
				screen(project(translate_z(rotate_yz(a, angle), dz))),
				screen(project(translate_z(rotate_yz(b, angle), dz)))
			)
		}
	}
	setTimeout(frame, 1000 / FPS)
}

//setTimeout(frame, 1000 / FPS)

function drawCircle(){
	clear()
	const center = {x:0, y:0, z:1}
	for(p of circle(center, 0.7, 8)){
		point(screen(project(p)))
	}
}

function drawSphere(){
	clear()
	const center = {x: 0, y: 0, z: 1}
	for(p of sphere(center, 0.7)){
		point(screen(project(p)))
	}
}

const center = {x: 0, y: 0, z: 1}
const sp = sphere(center, 0.7)

function sphereFrame(){
	const dt = 1 / FPS
	dz += 1*dt
	angle += 2 * Math.PI * dt
	clear()
	for(const v of sp){
		point(screen(project(translate_z(rotate_yz(v, angle), dz))))
	}
	setTimeout(sphereFrame, 1000 / FPS)
}

setTimeout(sphereFrame, 1000 / FPS)