import { useSettingsStore } from '../state/useSettingsStore';

/** Hemisphere + one shadow-casting key light (spec §17.4). */
export default function Lighting() {
  const quality = useSettingsStore((s) => s.quality);
  const shadows = quality !== 'low';
  const mapSize = quality === 'high' ? 2048 : 1024;

  return (
    <>
      <hemisphereLight args={['#b8d0ff', '#3a2f28', 0.8]} />
      <directionalLight
        position={[-10, 16, 8]}
        intensity={1.5}
        color="#fff2d8"
        castShadow={shadows}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
      />
      <ambientLight intensity={0.15} />
    </>
  );
}
