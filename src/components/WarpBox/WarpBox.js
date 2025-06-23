// src/components/WarpBox/WarpBox.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import bgImg from '../../images/gape.png';
import './WarpBox.scss';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix
                * modelViewMatrix
                * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_background;
  uniform vec2 u_bgRes;
  uniform vec2 u_boxRes;
  uniform vec2 u_boxOffset;
  uniform float u_radius;
  uniform float u_strength;

  void main() {
    vec2 pix = vUv * u_boxRes;
    float normX = min(pix.x, u_boxRes.x - pix.x);
    float normY = min(pix.y, u_boxRes.y - pix.y);
    float norm  = clamp(min(normX, normY) / u_radius, 0.0, 1.0);
    float f     = 1.0 + u_strength * pow(1.0 - norm, 2.0);

    vec2 center = u_boxOffset + u_boxRes * 0.5;
    vec2 offset = gl_FragCoord.xy - center;
    vec2 refr  = offset * f;
    vec2 src    = (center + refr) / u_bgRes;

    gl_FragColor = texture2D(u_background, src);
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

    // Measure container once
    const width  = container.clientWidth;
    const height = container.clientHeight;

    // Three.js basic setup
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene    = new THREE.Scene();

    // Load the background texture
    const bgTex = new THREE.TextureLoader().load(bgImg);

    // Uniforms, including dynamic u_boxOffset
    const uniforms = {
      u_background: { value: bgTex },
      u_bgRes:       { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_boxRes:      { value: new THREE.Vector2(width, height) },
      u_boxOffset:   { value: new THREE.Vector2(0, 0) },
      u_radius:      { value: radius },
      u_strength:    { value: strength }
    };

    // Plane covering clip space
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // Function to recalc offset on scroll/resize/each frame
    const updateOffset = () => {
      const rect = container.getBoundingClientRect();
      // y is inverted from DOM to WebGL space
      const y = window.innerHeight - (rect.top + rect.height);
      uniforms.u_boxOffset.value.set(rect.left, y);
      uniforms.u_boxOffset.needsUpdate = true;
    };

    // Initial offset
    updateOffset();

    // Add listeners
    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset);

    // Animation loop
    let frameId;
    const animate = () => {
      updateOffset();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateOffset);
      window.removeEventListener('resize', updateOffset);
      renderer.dispose();
      material.dispose();
      quad.geometry.dispose();
    };
  }, [radius, strength]);

  return (
    <div ref={wrapper} className="warp-box">
      <canvas ref={canvasRef} className="warp-box-canvas" />
      <div className="warp-box-content">{children}</div>
    </div>
  );
}