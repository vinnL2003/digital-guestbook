import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{i as t,l as n,n as r,r as i}from"./app-DYLsrU19.js";import{t as a}from"./createLucideIcon-CsnJ2cqg.js";import{t as o}from"./layout-dashboard-BMhzflq5.js";import{t as s}from"./log-in-IID8m70I.js";import{t as c}from"./pen-tool-DlWI5SpY.js";import{t as l}from"./shield-check-C3O5v6xK.js";import{t as u}from"./zap-Dx45CNfr.js";import{t as d}from"./PlnBrandHeader-DS6MvFVB.js";var f={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]};f.node;var p=a(f),m=e(n(),1),h=r(),g=`
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,_=`
  precision highp float;

  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_scale;
  uniform float u_noise;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  float grain(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // centered coordinates, y in [-0.5, 0.5], x stretched by the aspect ratio
  vec2 centered(vec2 uv) {
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / max(u_resolution.y, 1.0);
    return p;
  }

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  // panes of glass folded over each other. Each pane has one creased edge
  // that catches the light and thins out to nothing behind it; panes screen
  // over one another, so overlaps get brighter instead of darker.
  vec3 shade(vec2 uv, float time) {
    vec2 q = rot(0.6) * centered(uv) * 2.0 * u_scale;
    float t = time * 0.6;
    float pixel = 2.0 * u_scale / max(u_resolution.y, 1.0);

    vec3 color = mix(u_color2, u_color2 * 0.45, clamp(length(centered(uv)) * 1.3, 0.0, 1.0));

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float bend = mod(fi, 2.0) * 2.0 - 1.0;

      float crease = (fi - 2.5) * 0.4
                   + 0.26 * sin(q.x * (1.05 + 0.12 * fi) + fi * 1.9 + t * (0.25 + 0.05 * fi))
                   + 0.1 * bend * q.x * q.x;
      float s = q.y - crease;
      float pane = smoothstep(-pixel, pixel, s);
      float back = max(s, 0.0);

      // thick near the crease, clear further in
      float body = exp(-back * 1.7);
      float fresnel = exp(-back * 8.0);
      // the lit edge, and a fainter line just inside it for the glass's thickness
      float rim = exp(-back * 80.0);
      float inner = exp(-pow((back - 0.045) / 0.014, 2.0));
      float bloom = exp(-abs(s) * 20.0);

      vec3 tint = mix(u_color1, u_color3, clamp(fresnel * 0.6 + 0.08 + 0.14 * sin(fi * 2.1 + q.x * 0.8 + t * 0.2), 0.0, 1.0));
      vec3 light = tint * pane * (body * 0.42 + fresnel * 0.4)
                 + u_color3 * (pane * (rim * 0.6 + inner * 0.12) + bloom * 0.1);

      // screen blend
      color += light * (1.0 - color);
    }

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    vec3 color = shade(vUv, u_time);
    if (u_noise > 0.001) {
      float g = grain(vUv * 200.0 + u_time * 0.1);
      color *= 1.0 - u_noise * 0.4 + u_noise * g * 0.4;
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;function v(e){let t=e.replace(`#`,``),n=t.length===3?t.split(``).map(e=>e+e).join(``):t,r=parseInt(n,16);return[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255]}function y(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}function b({color1:e=`#1e3cc8`,color2:t=`#06081e`,color3:n=`#96d7ff`,speed:r=.5,scale:i=1,noise:a=.12,className:o}){let s=(0,m.useRef)(null),c=(0,m.useRef)({color1:e,color2:t,color3:n,speed:r,scale:i,noise:a});return c.current={color1:e,color2:t,color3:n,speed:r,scale:i,noise:a},(0,m.useEffect)(()=>{let e=s.current;if(!e)return;let t=e.getContext(`webgl`,{antialias:!1,alpha:!1});if(!t)return;let n=t.createProgram();t.attachShader(n,y(t,t.VERTEX_SHADER,g)),t.attachShader(n,y(t,t.FRAGMENT_SHADER,_)),t.linkProgram(n),t.useProgram(n);let r=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);let i=t.getAttribLocation(n,`position`);t.enableVertexAttribArray(i),t.vertexAttribPointer(i,2,t.FLOAT,!1,0,0);let a=e=>t.getUniformLocation(n,e),o={time:a(`u_time`),color1:a(`u_color1`),color2:a(`u_color2`),color3:a(`u_color3`),scale:a(`u_scale`),noise:a(`u_noise`),resolution:a(`u_resolution`)},l=()=>{let n=Math.min(window.devicePixelRatio||1,2),r=Math.max(1,Math.round(e.clientWidth*n)),i=Math.max(1,Math.round(e.clientHeight*n));(e.width!==r||e.height!==i)&&(e.width=r,e.height=i),t.viewport(0,0,r,i)},u=0,d=null,f=0,p=n=>{let r=c.current;d!==null&&(u+=Math.min((n-d)/1e3,.1)*r.speed),d=n,l(),t.uniform1f(o.time,u),t.uniform3fv(o.color1,v(r.color1)),t.uniform3fv(o.color2,v(r.color2)),t.uniform3fv(o.color3,v(r.color3)),t.uniform1f(o.scale,r.scale),t.uniform1f(o.noise,r.noise),t.uniform2f(o.resolution,e.width,e.height),t.drawArrays(t.TRIANGLES,0,6)},m=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,h=e=>{p(e),m||(f=requestAnimationFrame(h))};f=requestAnimationFrame(h);let b=new ResizeObserver(()=>{m&&p(performance.now())});return b.observe(e),()=>{cancelAnimationFrame(f),b.disconnect(),t.deleteBuffer(r),t.deleteProgram(n)}},[]),(0,h.jsx)(`canvas`,{ref:s,"aria-hidden":`true`,className:o,style:{display:`block`,width:`100%`,height:`100%`}})}function x({auth:e,setting:n}){let[r,a]=(0,m.useState)(``),[f,g]=(0,m.useState)(``);return(0,m.useEffect)(()=>{let e=()=>{let e=new Date;a(e.toLocaleTimeString(`id-ID`,{timeZone:`Asia/Makassar`,hour:`2-digit`,minute:`2-digit`,second:`2-digit`})+` WITA`),g(e.toLocaleDateString(`id-ID`,{timeZone:`Asia/Makassar`,weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}))};e();let t=setInterval(e,1e3);return()=>clearInterval(t)},[]),(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{title:`Selamat Datang - PT PLN (Persero) UPT Manado`}),(0,h.jsxs)(`div`,{className:`min-h-screen bg-[#061423] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-brand-500 selection:text-white`,children:[(0,h.jsx)(`div`,{className:`absolute inset-0 opacity-40 pointer-events-none`,children:(0,h.jsx)(b,{className:`w-full h-full`,speed:.25,scale:1.2,color1:`#0099D8`,color2:`#071526`,color3:`#FFD500`})}),(0,h.jsx)(`div`,{className:`absolute inset-0 opacity-15 pointer-events-none`,style:{backgroundImage:`radial-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,backgroundSize:`24px 24px`}}),(0,h.jsx)(`div`,{className:`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-sky-500/15 blur-[160px] pointer-events-none`}),(0,h.jsx)(`div`,{className:`absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none`}),(0,h.jsx)(`div`,{className:`absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none`}),(0,h.jsx)(`header`,{className:`relative z-10 border-b border-sky-900/40 bg-[#061423]/80 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3.5`,children:(0,h.jsxs)(`div`,{className:`max-w-7xl mx-auto flex items-center justify-between gap-4`,children:[(0,h.jsx)(d,{size:`md`,showTitle:!0,subtitle:`Unit Pelaksana Transmisi Manado`,variant:`dark`}),(0,h.jsxs)(`div`,{className:`flex items-center gap-4 sm:gap-6`,children:[(0,h.jsxs)(`div`,{className:`hidden sm:flex flex-col items-end border-r border-sky-900/60 pr-5 text-right`,children:[(0,h.jsxs)(`span`,{className:`text-sm font-bold tracking-wider text-sky-200 tabular-nums font-mono flex items-center gap-1.5`,children:[(0,h.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`}),r||`00:00:00 WITA`]}),(0,h.jsx)(`span`,{className:`text-[11px] text-zinc-400`,children:f})]}),e.user?(0,h.jsxs)(t,{href:route(`dashboard`),className:`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-950/80 hover:bg-sky-900/90 text-sky-200 border border-sky-700/60 transition-all hover:scale-[1.02] shadow-sm`,children:[(0,h.jsx)(o,{className:`w-4 h-4 text-brand-400`}),(0,h.jsx)(`span`,{children:`Buka Dasbor`})]}):(0,h.jsxs)(t,{href:route(`login`),className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-sky-200 hover:text-white bg-sky-950/60 hover:bg-sky-900/70 border border-sky-800/60 transition-all`,children:[(0,h.jsx)(s,{className:`w-4 h-4 text-brand-400`}),(0,h.jsx)(`span`,{children:`Masuk Petugas`})]})]})]})}),(0,h.jsx)(`main`,{className:`relative z-10 flex-1 flex items-center justify-center p-6 md:p-12`,children:(0,h.jsxs)(`div`,{className:`max-w-2xl w-full text-center space-y-8 my-auto`,children:[(0,h.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-sm shadow-sm`,children:[(0,h.jsx)(u,{className:`w-3.5 h-3.5 text-amber-400 animate-pulse`}),(0,h.jsx)(`span`,{children:`PT PLN (Persero) • Unit Pelaksana Transmisi Manado`})]}),(0,h.jsxs)(`div`,{className:`space-y-4`,children:[(0,h.jsx)(`h2`,{className:`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight`,children:n.welcome_title||`Buku Tamu Digital PT PLN (Persero) UPT Manado`}),(0,h.jsx)(`p`,{className:`text-base sm:text-lg text-sky-100/80 max-w-lg mx-auto leading-relaxed font-normal`,children:n.welcome_subtitle||`Selamat datang di Kantor PT PLN (Persero) Unit Pelaksana Transmisi Manado. Silakan lakukan pencatatan kehadiran kunjungan Anda dengan menekan tombol di bawah ini.`})]}),(0,h.jsx)(`div`,{className:`pt-2 flex flex-col items-center justify-center`,children:(0,h.jsxs)(t,{href:route(`guest.check-in`),className:`w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-600 via-brand-500 to-sky-600 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-lg sm:text-xl shadow-2xl shadow-sky-500/30 ring-4 ring-sky-400/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200`,children:[(0,h.jsx)(c,{className:`w-6 h-6 text-amber-300`}),(0,h.jsx)(`span`,{children:`Isi Buku Tamu (Check-In)`}),(0,h.jsx)(p,{className:`w-6 h-6 text-white/80`})]})}),(0,h.jsxs)(`div`,{className:`flex items-center justify-center gap-2 text-xs text-sky-300/70 pt-2`,children:[(0,h.jsx)(l,{className:`w-4 h-4 text-emerald-400`}),(0,h.jsx)(`span`,{children:`Pencatatan Tamu Resmi & Terverifikasi Tanda Tangan Digital`})]})]})}),(0,h.jsx)(`footer`,{className:`relative z-10 border-t border-sky-950 bg-[#040e1a]/90 px-6 py-4 text-center text-xs text-sky-400/70`,children:(0,h.jsxs)(`p`,{children:[`© `,new Date().getFullYear(),` PT PLN (Persero) UPT Manado — Sistem Buku Tamu Digital • Listrik untuk Kehidupan yang Lebih Baik`]})})]})]})}export{x as default};