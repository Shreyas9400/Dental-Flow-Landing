import React, { useEffect, useRef } from 'react';

// WebGL hero scene: a breathing particle globe wrapped in orbit rings, reacting to the pointer.
// three.js is fetched only after the page has loaded and the browser is idle, so it never
// competes with the first paint. Data-saver visitors get the static background only.
const Hero3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => { };

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const start = () => import('./three-subset').then((THREE) => {
      if (disposed) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const small = window.innerWidth < 768;

      const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
      renderer.domElement.style.opacity = '0';
      renderer.domElement.style.transition = 'opacity 1.2s ease-out';
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 7);

      const group = new THREE.Group();
      scene.add(group);

      // Globe of points on a Fibonacci sphere, displaced by a travelling wave in the shader.
      const count = small ? 1800 : 4200;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        positions.set([Math.cos(theta) * r * 2, y * 2, Math.sin(theta) * r * 2], i * 3);
        seeds[i] = Math.random();
      }
      const globeGeo = new THREE.BufferGeometry();
      globeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      globeGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uPixelRatio: { value: renderer.getPixelRatio() },
      };
      const globeMat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          uniform float uTime;
          uniform vec2 uPointer;
          uniform float uPixelRatio;
          attribute float aSeed;
          varying float vGlow;
          void main() {
            vec3 p = position;
            float wave = sin(p.y * 3.0 + uTime * 1.2) * cos(p.x * 2.5 - uTime * 0.8);
            float pulse = 0.12 * wave + 0.04 * sin(uTime * 2.0 + aSeed * 6.28);
            p += normalize(p) * pulse;
            p.xy += uPointer * 0.15 * (p.z + 2.0) * 0.25;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vGlow = 0.45 + 0.55 * smoothstep(-0.1, 0.16, pulse);
            gl_PointSize = (2.0 + aSeed * 2.2) * uPixelRatio * (6.0 / -mv.z);
          }
        `,
        fragmentShader: `
          varying float vGlow;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d);
            vec3 cyan = vec3(0.13, 0.83, 0.93);
            vec3 mint = vec3(0.37, 0.98, 0.76);
            gl_FragColor = vec4(mix(cyan, mint, vGlow - 0.45), a * vGlow);
          }
        `,
      });
      group.add(new THREE.Points(globeGeo, globeMat));

      // Wireframe core.
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15, 1),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.18 })
      );
      group.add(core);

      // Orbit rings of small points, each tilted differently.
      const rings: InstanceType<typeof THREE.Points>[] = [];
      [[2.9, 0.4, 0x22d3ee], [3.4, -0.9, 0x818cf8], [3.9, 1.3, 0x5eead4]].forEach(([radius, tilt, color]) => {
        const n = 220;
        const pts = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          pts.set([Math.cos(a) * radius, (Math.random() - 0.5) * 0.06, Math.sin(a) * radius], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const ring = new THREE.Points(geo, new THREE.PointsMaterial({
          color, size: 0.035, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        ring.rotation.x = Math.PI / 2 + tilt;
        ring.rotation.z = tilt * 0.6;
        rings.push(ring);
        group.add(ring);
      });

      // Floating satellites.
      const satellites = Array.from({ length: 6 }, (_, i) => {
        const m = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.09 + (i % 3) * 0.03),
          new THREE.MeshBasicMaterial({ color: i % 2 ? 0x5eead4 : 0x60a5fa, wireframe: true })
        );
        group.add(m);
        return { m, r: 2.6 + i * 0.25, speed: 0.15 + i * 0.04, phase: i * 1.1 };
      });

      const pointer = new THREE.Vector2();
      const onPointer = (e: PointerEvent) => {
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      };
      window.addEventListener('pointermove', onPointer);

      const onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(mount);

      // Pause rendering while off-screen.
      let visible = true;
      const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      io.observe(mount);

      const clock = new THREE.Clock();
      let frame = 0;
      const render = () => {
        frame = requestAnimationFrame(render);
        if (!visible) return;
        const t = reduceMotion ? 0 : clock.getElapsedTime();
        uniforms.uTime.value = t;
        uniforms.uPointer.value.lerp(pointer, 0.05);
        group.rotation.y = t * 0.12 + uniforms.uPointer.value.x * 0.35;
        group.rotation.x = -uniforms.uPointer.value.y * 0.25;
        core.rotation.set(t * 0.2, t * 0.3, 0);
        rings.forEach((r, i) => { r.rotation.y = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1); });
        satellites.forEach(({ m, r, speed, phase }) => {
          const a = t * speed + phase;
          m.position.set(Math.cos(a) * r, Math.sin(a * 1.7) * 0.8, Math.sin(a) * r);
          m.rotation.set(t, t * 0.7, 0);
        });
        renderer.render(scene, camera);
      };
      render();
      requestAnimationFrame(() => { renderer.domElement.style.opacity = '1'; });

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('pointermove', onPointer);
        resizeObserver.disconnect();
        io.disconnect();
        scene.traverse((obj) => {
          const o = obj as InstanceType<typeof THREE.Mesh>;
          o.geometry?.dispose();
          (o.material as InstanceType<typeof THREE.Material> | undefined)?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    // Wait for the page to finish loading, then for an idle moment.
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 300);
    const schedule = () => idle(() => { if (!disposed) start(); });
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', schedule);
      cleanup();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
};

export default Hero3D;
