import * as THREE from 'three';

// Raycast helper for pointer interaction (spec §3, §10.3). Given a click in NDC,
// return the world point on the ground plane and/or the nearest interactable hit.

export class Picker {
  private ray = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  /** World point where the click ray meets a horizontal plane at height y. */
  groundPoint(ndc: THREE.Vector2, camera: THREE.Camera, y = 0): THREE.Vector3 | null {
    this.ray.setFromCamera(ndc, camera);
    this.groundPlane.constant = -y;
    const hit = new THREE.Vector3();
    return this.ray.ray.intersectPlane(this.groundPlane, hit) ? hit : null;
  }

  /** First intersected object among candidates (recursive). */
  pick(ndc: THREE.Vector2, camera: THREE.Camera, objects: THREE.Object3D[]): THREE.Intersection | null {
    this.ray.setFromCamera(ndc, camera);
    const hits = this.ray.intersectObjects(objects, true);
    return hits.length ? hits[0] : null;
  }
}
