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
  uniform vec2 u_bgRes;
  uniform vec2 u_boxRes;
  uniform vec2 u_boxOffset;
  uniform float u_radius;
  uniform float u_strength;

  void main() {
    vec2 pix = vUv * u_boxRes;
    float normX = min(pix.x, u_boxRes.x - pix.x);
    float normY = min(pix.y, u_boxRes.y - pix.y);
    float norm = clamp(min(normX, normY) / u_radius, 0.0, 1.0);
    float f = 1.0 + u_strength * pow(1.0 - norm, 2.0);

    vec2 centerScreen = u_boxOffset + u_boxRes * 0.5;
    vec2 fromCenter = gl_FragCoord.xy - centerScreen;
    vec2 refracted = fromCenter * f;
    vec2 src = (centerScreen + refracted) / u_bgRes;
    gl_FragColor = texture2D(u_background, src);
  }
`;

export default function WarpBox({ radius = 150, strength = 0.4, children }) {
  const wrapper = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = wrapper.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Get initial dimensions of WarpBox
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialize Three.js renderer and camera
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    // Create an offscreen canvas that will serve as a dynamic texture.
    // (We use it to draw the static background image with a 'cover' style.)
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext('2d');

    // Load the background image.
    const image = new Image();
    image.src = bgImg;

    // Create a Three.js texture from the offscreen canvas.
    const dynamicTexture = new THREE.Texture(offscreenCanvas);
    dynamicTexture.minFilter = THREE.LinearFilter;
    dynamicTexture.magFilter = THREE.LinearFilter;

    // Define shader uniforms, using the dynamic texture.
    const uniforms = {
      u_background: { value: dynamicTexture },
      u_bgRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_boxRes: { value: new THREE.Vector2(width, height) },
      u_boxOffset: { value: new THREE.Vector2(0, 0) },
      u_radius: { value: radius },
      u_strength: { value: strength }
    };

    // Create the shader material and a quad mesh covering the clip space.
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // Function to compute the WarpBox’s viewport position and update the offset uniform.
    const updateOffset = () => {
      const rect = container.getBoundingClientRect();
      // Convert from DOM coordinates (origin at top-left) to WebGL (origin at bottom-left)
      const y = window.innerHeight - (rect.top + rect.height);
      uniforms.u_boxOffset.value.set(rect.left, y);
      uniforms.u_boxOffset.needsUpdate = true;
    };

    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset);

    // The animation loop:
    let frameId;
    const animate = () => {
      updateOffset();

      if (image.complete) {
        // Assume the static background image is drawn with background-size: cover.
        // Compute the scale needed for the image to cover the viewport.
        const scale = Math.max(window.innerWidth / image.width, window.innerHeight / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        // Calculate offsets to center the image in the viewport.
        const offsetX = (drawWidth - window.innerWidth) / 2;
        const offsetY = (drawHeight - window.innerHeight) / 2;

        // Get the container's bounding rectangle.
        const rect = container.getBoundingClientRect();

        // Clear the offscreen canvas.
        offCtx.clearRect(0, 0, width, height);
        // Draw the portion of the image that CSS would display under your WarpBox.
        offCtx.drawImage(
          image,
          rect.left + offsetX, // source x: container's x in viewport plus centering offset
          rect.top + offsetY,  // source y
          width,               // source width (matches container width)
          height,              // source height (matches container height)
          0,                   // destination x on offscreen canvas
          0,                   // destination y
          width,               // destination width
          height               // destination height
        );
        dynamicTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateOffset);
      window.removeEventListener('resize', updateOffset);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [radius, strength]);

  return (
    <div ref={wrapper} className="warp-box" style={{ '--warp-radius': `${radius}px` }}>
      <canvas ref={canvasRef} className="warp-box-canvas" />
      <div className="warp-box-content">{children}</div>
    </div>
  );
}
