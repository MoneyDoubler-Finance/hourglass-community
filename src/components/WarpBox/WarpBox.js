// src/components/WarpBox/WarpBox.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import bgImg from '../../images/gape.png';
import './WarpBox.scss';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_background;
  uniform vec2      u_boxRes;
  uniform float     u_radius;
  uniform float     u_strength;

  void main() {
    // 1) Get pixel coords inside this box
    vec2 pix = vUv * u_boxRes;

    // 2) Compute distance to the nearest edge
    float dx = min(pix.x, u_boxRes.x - pix.x);
    float dy = min(pix.y, u_boxRes.y - pix.y);
    float norm = clamp(min(dx, dy) / u_radius, 0.0, 1.0);

    // 3) Strength falloff
    float f = 1.0 + u_strength * pow(1.0 - norm, 2.0);

    // 4) Warp around the box-center in UV-space
    vec2 centered = vUv - 0.5;
    vec2 warpedUv = 0.5 + centered * f;

    // 5) Sample the offscreen‐drawn background
    gl_FragColor = texture2D(u_background, warpedUv);
  }
`;

export default function WarpBox({
  radius   = 150,    // controls how far into the box the warp extends
  strength = -0.4,    // warp intensity; negative = pinch, positive = bulge
  children
}) {
  const wrapper   = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = wrapper.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    // 1) Create offscreen canvas to capture the correct BG slice
    const width  = container.clientWidth;
    const height = container.clientHeight;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width  = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext('2d');

    // 2) Load your static background image
    const image = new Image();
    image.src   = bgImg;

    // 3) Three.js initialization
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene  = new THREE.Scene();

    // 4) Create a dynamic texture from our offscreen canvas
    const dynamicTexture = new THREE.Texture(offscreenCanvas);
    dynamicTexture.minFilter = THREE.LinearFilter;
    dynamicTexture.magFilter = THREE.LinearFilter;

    // 5) Shader uniforms
    const uniforms = {
      u_background: { value: dynamicTexture },
      u_boxRes:     { value: new THREE.Vector2(width, height) },
      u_radius:     { value: radius },
      u_strength:   { value: strength }
    };

    // 6) Build the mesh
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // 7) Animation loop
    let frameId;
    const animate = () => {
      if (image.complete) {
        // Figure out how CSS 'cover' is drawing the BG
        const scale = Math.max(
          window.innerWidth  / image.width,
          window.innerHeight / image.height
        );
        const drawW = image.width  * scale;
        const drawH = image.height * scale;
        const offX  = (drawW - window.innerWidth) / 2;
        const offY  = (drawH - window.innerHeight) / 2;

        // Grab the exact viewport rect of our box
        const rect = container.getBoundingClientRect();

        // Draw that slice into the offscreen canvas
        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(
          image,
          rect.left + offX,
          rect.top  + offY,
          width,
          height,
          0, 0,
          width,
          height
        );
        dynamicTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // 8) Clean up
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      material.dispose();
    };
  }, [radius, strength]);

  return (
    <div
      ref={wrapper}
      className="warp-box"
      style={{ '--warp-radius': `${radius}px` }}
    >
      <canvas ref={canvasRef} className="warp-box-canvas" />
      <div className="warp-box-content">{children}</div>
    </div>
  );
}