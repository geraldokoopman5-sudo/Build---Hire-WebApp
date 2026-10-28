import { useEffect, useRef } from 'react';
import {
  createShaderAnimeFire, DARK_FALLBACK, LIGHT_FALLBACK,
  type ShaderAnimeFireOptions,
} from './engine';
import styles from './ShaderAnimeFire.module.css';

type Props = Omit<ShaderAnimeFireOptions, 'onThemeChange'>;

/** 23rd.dev's WebGL flame engine, wrapped for this app's CSS modules. */
export function ShaderAnimeFire({
  colors, speed = 0.6, intensity = 1, height = 0.45,
  interactive = true, dither = false, pixelSize = 1, theme = 'dark',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ReturnType<typeof createShaderAnimeFire>>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    instanceRef.current = createShaderAnimeFire(canvas);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setOptions({ colors, speed, intensity, height, interactive, dither, pixelSize, theme });
  }, [colors, speed, intensity, height, interactive, dither, pixelSize, theme]);

  return (
    <div className={styles.fire} aria-hidden="true" data-slot="shader-anime-fire"
      style={theme === 'light' ? LIGHT_FALLBACK : DARK_FALLBACK}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
