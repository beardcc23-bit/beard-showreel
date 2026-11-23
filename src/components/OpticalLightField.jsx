import React, { useEffect, useRef, useState } from 'react';

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;
varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_pointer;
uniform float u_velocity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(1.9, 7.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  // 直向手機螢幕收束補償權重（桌機 aspect >= 1.15 時為 0.0，完全維持桌機原比例；手機直屏維持 ~60% 純黑留白）
  float portrait = smoothstep(1.15, 0.55, aspect);

  // 光源全程鎖定於左側／左下緣（絕不翻轉至右側），僅在左側垂直微幅呼吸游移
  float s1 = smoothstep(0.05, 0.40, u_scroll);
  float s2 = smoothstep(0.40, 0.75, u_scroll);
  float s3 = smoothstep(0.78, 0.98, u_scroll);

  vec2 origin = vec2(
    -0.10 * aspect,
    mix(-0.08, 0.14, s1 * (1.0 - s3))
  );

  // 滑鼠僅做極微幅折射偏角，不拉走左側光源
  origin += (vec2(u_pointer.x, u_pointer.y) - vec2(0.3, 0.3)) * 0.045;

  // 光束角度全程維持左下往右上斜射（約 40° ~ 45°），極慢速微幅呼吸
  float angle = mix(0.76, 0.70, s1) + sin(u_time * 0.07) * 0.025;
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);

  vec2 rel = p - origin;
  float along = dot(rel, dir);
  float across = dot(rel, perp) * mix(1.0, 1.22, portrait);

  // 大幅放慢色彩與光絲流動速度，營造沉穩悠長的電影慢快門流動感
  float t = u_time * 0.14;
  float flow = t + clamp(abs(u_velocity) * 0.4, 0.0, 0.45) * 0.15;

  // 慢速流體光束擺動
  float waveBend = sin(along * 1.6 - t * 0.75) * 0.075 + cos(along * 1.0 + t * 0.48) * 0.05;
  float warpedAcross = across + waveBend * smoothstep(0.0, 1.0, along);

  // 多頻率 45° 方向性拉絲
  float broadStream = fbm(vec2(along * 0.56 - flow * 0.75, warpedAcross * 4.6 + t * 0.15));
  float midStreak = fbm(vec2(along * 0.88 - flow * 1.15, warpedAcross * 10.2 - t * 0.20));
  float fineFilaments = noise(vec2(along * 1.35 - flow * 1.65, warpedAcross * 25.0 + broadStream * 1.8));

  float rawMask = broadStream * 0.50 + midStreak * 0.33 + fineFilaments * 0.17;
  // 控制明暗切割與覆蓋範圍：桌機維持 ~55% 純黑，手機直屏收斂至 ~60% 純淨深黑留白
  float streakMask = pow(smoothstep(mix(0.27, 0.30, portrait), 0.88, rawMask), 1.36);

  // 放寬延伸距離至對角中段，手機直屏收斂右上與上半部延伸量以保留 60% 深黑
  float forwardFade = smoothstep(-0.22, 0.18, along) * exp(-max(along, 0.0) * mix(0.94, 1.18, portrait));
  float stageMetric = p.x + uv.y * mix(0.30, 0.40, portrait) * aspect;
  float leftStageMask = smoothstep(mix(1.18, 1.08, portrait) * aspect, mix(0.30, 0.22, portrait) * aspect, stageMetric);

  // 錯位緩慢流動的光譜通道（上翼朱紅、中軸洋紅、下翼與底部加強深海藍與冰藍）
  float rBand = exp(-pow((warpedAcross - 0.14 - sin(t * 0.55 + along * 1.1) * 0.065) * 3.6, 2.0));
  float mBand = exp(-pow((warpedAcross - 0.01 + cos(t * 0.44 + along * 1.2) * 0.055) * 4.1, 2.0));
  float cBand = exp(-pow((warpedAcross + 0.15 - sin(t * 0.40 - along * 0.95) * 0.075) * 2.9, 2.0));

  // 畫面下方專屬深藍副光帶（呼應參考圖底部濃郁的藍色拉絲，並在滾動至頁面最下方時進一步增強）
  float bottomBlueZone = smoothstep(mix(0.58, 0.48, portrait), 0.0, uv.y) * exp(-pow((warpedAcross + 0.24) * 2.5, 2.0));
  float bottomBlueStreak = smoothstep(0.30, 0.86, midStreak * 0.65 + fineFilaments * 0.35) * bottomBlueZone * forwardFade;

  // 滾動至頁面最下方 (s3) 時大幅拉高藍色光譜比重、收斂暖紅
  float warmWeight = mix(1.15, 1.30, s1 * (1.0 - s2)) * mix(1.0, 0.58, s3);
  float coolWeight = mix(1.22, 1.48, s2) * mix(1.0, 1.45, s3);
  float archiveCalm = 1.0 - 0.26 * exp(-pow((u_scroll - 0.74) / 0.11, 2.0));

  vec3 colCrimson = vec3(0.95, 0.27, 0.16);
  vec3 colCoral   = vec3(1.00, 0.57, 0.42);
  vec3 colMagenta = vec3(0.84, 0.19, 0.46);
  vec3 colCobalt  = vec3(0.05, 0.34, 0.78);
  vec3 colCyan    = vec3(0.06, 0.52, 0.86);
  vec3 colIce     = vec3(0.42, 0.78, 1.00);

  vec3 blueMix = mix(colCobalt, mix(colCyan, colIce, fineFilaments), midStreak);

  vec3 spectral = vec3(0.0);
  spectral += mix(colCrimson, colCoral, fineFilaments) * rBand * streakMask * warmWeight * 1.42;
  spectral += colMagenta * mBand * streakMask * 1.12;
  spectral += blueMix * (cBand * streakMask * 1.58 + bottomBlueStreak * (1.15 + s3 * 0.75)) * coolWeight;

  spectral *= forwardFade * leftStageMask;

  // 左下角純白高曝光核（隨慢呼吸微幅起伏）
  float corePresence = mix(1.0, 0.48, s1) + s3 * 0.45;
  float corePulse = 0.90 + 0.10 * sin(t * 1.1);
  float coreDist = length(vec2(max(along, -0.12) * 1.25, warpedAcross * 2.15));
  float whiteBurn = exp(-coreDist * mix(3.6, 3.95, portrait)) * (0.48 + 0.65 * streakMask) * corePresence * corePulse * leftStageMask;

  // 極深純黑底色 (#030407)，確保高反差暗房光影感
  vec3 baseVoid = vec3(0.011, 0.015, 0.026);
  vec3 color = baseVoid + spectral * archiveCalm + vec3(0.98, 0.99, 1.0) * whiteBurn * 0.95 * archiveCalm;

  color = 1.0 - exp(-color * 1.22);

  // 12fps 輕量 35mm 電影底片銀鹽顆粒（雙頻類高斯分佈 + 中間調加權，零新增圖層與額外耗能）
  float grainFrame = floor(u_time * 12.0);
  vec2 grainShift = vec2(
    fract(grainFrame * 0.1373) * 197.3,
    fract(grainFrame * 0.2719) * 263.7
  );
  float gFine = hash(gl_FragCoord.xy + grainShift);
  float gOrganic = hash(gl_FragCoord.xy * 0.78 + grainShift.yx + vec2(17.3, 31.7));
  float filmGrain = (gFine + gOrganic) - 1.0;

  // 純黑暗房區壓低不發灰，中段流光區呈現細膩銀鹽質感並消色帶，極高光自然收斂
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float grainMask = mix(0.28, 1.0, smoothstep(0.015, 0.18, luma))
                  * mix(1.0, 0.45, smoothstep(0.58, 0.96, luma));
  color += filmGrain * 0.034 * grainMask;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * OpticalLightField: 高對比深黑暗房 × 左側固定 45° 流體光譜色散引擎
 * - 75%+ 畫面維持純粹深淵黑，光束緊緻集中於左側往右上流動穿梭，呈現強烈明暗光影切割感
 */
export const OpticalLightField = React.memo(function OpticalLightField() {
  const glCanvasRef = useRef(null);
  const [webglActive, setWebglActive] = useState(false);

  useEffect(() => {
    const canvas = glCanvasRef.current;
    if (!canvas || typeof window === 'undefined') return undefined;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const detectMobile = () =>
      Boolean(window.matchMedia?.('(max-width: 767px), (pointer: coarse)').matches);
    let isMobile = detectMobile();

    let gl = null;
    try {
      gl =
        canvas.getContext('webgl', {
          alpha: false,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }) ||
        canvas.getContext('experimental-webgl', { alpha: false, antialias: false });
    } catch {
      gl = null;
    }
    if (!gl) return undefined;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return undefined;
    }

    setWebglActive(true);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uScroll = gl.getUniformLocation(program, 'u_scroll');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uVelocity = gl.getUniformLocation(program, 'u_velocity');

    const resize = () => {
      isMobile = detectMobile();
      // 行動端微降背景畫布採樣（0.55x），大幅節省 GPU 填充率並讓底片銀鹽顆粒比例更自然
      const scale = isMobile ? 0.55 : 0.7;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      const w = Math.max(1, Math.floor(window.innerWidth * dpr));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    let targetScroll = 0;
    let currentScroll = 0;
    let lastScrollY = window.scrollY;
    let velocity = 0;
    let targetPtrX = 0.25;
    let targetPtrY = 0.25;
    let currentPtrX = 0.25;
    let currentPtrY = 0.25;
    let rafId = null;
    let lastRenderTime = 0;
    const startTime = performance.now();

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const sy = window.scrollY;
      velocity = Math.max(-2.5, Math.min(2.5, (sy - lastScrollY) * 0.02));
      lastScrollY = sy;
      targetScroll = Math.max(0, Math.min(1, sy / maxScroll));
    };

    const handlePointerMove = (e) => {
      targetPtrX = e.clientX / Math.max(1, window.innerWidth);
      targetPtrY = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    };

    handleScroll();

    const renderFrame = (now) => {
      if (document.hidden || document.body.classList.contains('modal-open')) {
        rafId = null;
        return;
      }

      // 行動端鎖定 24fps 電影標準幀率（12fps 顆粒的 2 倍整數倍，降耗約 75% 且零抖動）
      const minFrameMs = isMobile ? 1000 / 24 : 0;
      if (minFrameMs > 0 && lastRenderTime > 0 && now - lastRenderTime < minFrameMs) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }
      lastRenderTime = now;

      const scrollLerp = isMobile ? 0.12 : 0.05;
      const ptrLerp = isMobile ? 0.10 : 0.04;
      currentScroll += (targetScroll - currentScroll) * scrollLerp;
      velocity *= isMobile ? 0.82 : 0.92;
      currentPtrX += (targetPtrX - currentPtrX) * ptrLerp;
      currentPtrY += (targetPtrY - currentPtrY) * ptrLerp;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const elapsed = prefersReduced ? 2.5 : (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScroll, currentScroll);
      gl.uniform2f(uPointer, currentPtrX, currentPtrY);
      gl.uniform1f(uVelocity, velocity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReduced) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const startLoop = () => {
      if (rafId === null && !document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        startLoop();
      }
    };

    const bodyObserver = new MutationObserver(() => {
      if (!document.body.classList.contains('modal-open')) {
        startLoop();
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    startLoop();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      bodyObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  const streakSrc = `${import.meta.env.BASE_URL}optical-streak.webp`;

  return (
    <div
      aria-hidden="true"
      className="optical-field pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030407]"
    >
      {/* 主引擎：高黑佔比即時 WebGL 流體色散畫布 */}
      <canvas
        ref={glCanvasRef}
        className={`absolute inset-0 w-full h-full block transition-opacity duration-700 ${
          webglActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 無 WebGL 時的降級備援層 */}
      {!webglActive && (
        <>
          <div className="optical-blob optical-blob-warm" />
          <div className="optical-blob optical-blob-cool" />
          <div
            className="optical-reference-layer"
            style={{ backgroundImage: `url(${streakSrc})` }}
          />
        </>
      )}
    </div>
  );
});

export default OpticalLightField;
