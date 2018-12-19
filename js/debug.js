

function drawDebugSphere([x, y, z], color = 0xFFAABB) {
  let geo = new THREE.SphereGeometry(5, 32, 32)
  let mat = new THREE.MeshBasicMaterial({color: color});
  var sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere)
  sphere.position.z = z
  sphere.position.x = x
  sphere.position.y = y // note this is 'up'
}
