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
    // pixel coords inside the box
    vec2 pix = vUv * u_boxRes;

    // distance from nearest vertical/horizontal edge
    float distX = min(pix.x, u_boxRes.x - pix.x);
    float distY = min(pix.y, u_boxRes.y - pix.y);
    float norm  = clamp(min(distX, distY) / u_radius, 0.0, 1.0);

    // funnel factor
    float f = 1.0 + u_strength * pow(1.0 - norm, 2.0);

    // warp around center in UV space
    vec2 centered   = vUv - 0.5;
    vec2 warpedUv   = 0.5 + centered * f;

    gl_FragColor = texture2D(u_background, warpedUv);
  }
`;

export default function WarpBox({
  radius   = 150,
  strength = 0.4,
  children
}) {
  const wrapper   = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = wrapper.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    // offscreen canvas for drawing the correct bg slice
    const width  = container.clientWidth;
    const height = container.clientHeight;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width  = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext('2d');

    // load bg image
    const image = new Image();
    image.src   = bgImg;

    // three.js setup
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);
    const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const scene  = new THREE.Scene();

    // dynamic texture from offscreen canvas
    const dynamicTexture = new THREE.Texture(offscreenCanvas);
    dynamicTexture.minFilter = THREE.LinearFilter;
    dynamicTexture.magFilter = THREE.LinearFilter;

    // uniforms: note u_boxRes only
    const uniforms = {
      u_background: { value: dynamicTexture },
      u_boxRes:     { value: new THREE.Vector2(width, height) },
      u_radius:     { value: radius },
      u_strength:   { value: strength }
    };

    // quad + material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
    scene.add(quad);

    // animation loop
    let frameId;
    const animate = () => {
      if (image.complete) {
        // compute CSS 'cover' draw parameters
        const scale = Math.max(
          window.innerWidth  / image.width,
          window.innerHeight / image.height
        );
        const drawW = image.width  * scale;
        const drawH = image.height * scale;
        const offX  = (drawW - window.innerWidth) / 2;
        const offY  = (drawH - window.innerHeight) / 2;

        // where does this box sit in the viewport?
        const rect = container.getBoundingClientRect();

        // draw that exact slice into offscreen canvas
        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(
          image,
          rect.left + offX,
          rect.top  + offY,
          width,
          height,
          0,0,
          width,
          height
        );
        dynamicTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

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
