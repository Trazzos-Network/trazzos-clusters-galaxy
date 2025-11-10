import * as THREE from "three";
import { MAP_BOUNDS } from "../data/locations";

/**
 * Convert latitude/longitude to 3D Cartesian coordinates
 * Maps geographic coordinates to the 3D plane that matches the map texture
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param elevation Elevation in meters (default: 0)
 * @returns [x, y, z] tuple in 3D space
 */
export function latLonTo3D(
  lat: number,
  lon: number,
  elevation = 0
): [number, number, number] {
  const MAP_SIZE = 50; // 3D plane size in units (50x50 surface)

  // Convert longitude to x (east-west)
  // Longitude increases from west to east
  // In 3D space, x increases from west to east
  const x =
    ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * MAP_SIZE -
    MAP_SIZE / 2;

  // Convert latitude to z (north-south)
  // In 3D, z increases as we go north (positive lat)
  const z =
    ((lat - MAP_BOUNDS.south) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) *
      MAP_SIZE -
    MAP_SIZE / 2;

  // Elevation scaled appropriately
  const y = elevation / 100;

  return [x, y, z];
}

/**
 * Convert 3D coordinates back to lat/lon (for debugging)
 */
export function threeDToLatLon(
  x: number,
  z: number
): { lat: number; lon: number } {
  const MAP_SIZE = 50;

  const lon =
    ((x + MAP_SIZE / 2) / MAP_SIZE) * (MAP_BOUNDS.east - MAP_BOUNDS.west) +
    MAP_BOUNDS.west;

  const lat =
    ((z + MAP_SIZE / 2) / MAP_SIZE) * (MAP_BOUNDS.north - MAP_BOUNDS.south) +
    MAP_BOUNDS.south;

  return { lat, lon };
}

/**
 * Create a Vector3 from lat/lon coordinates
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  elevation = 0
): THREE.Vector3 {
  const [x, y, z] = latLonTo3D(lat, lon, elevation);
  return new THREE.Vector3(x, y, z);
}
