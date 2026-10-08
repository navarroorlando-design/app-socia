import React from "react";

const GlobalStyle = () => (
  <style>{`
    :root{ --ease: cubic-bezier(0.2,0,0,1); --ease-out: cubic-bezier(.2,.7,.2,1); --ease-in: cubic-bezier(.4,0,1,1); }
    .font-serif-legal{ font-family:'Lexend', -apple-system, sans-serif; font-weight:600; letter-spacing:-0.015em; }
    .font-sans-ui{ font-family:'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    /* Escala .97 ao tocar em itens tocáveis (redesenho v3, seção D). */
    .pressable{ transition: transform .18s var(--ease), background-color .18s var(--ease), opacity .18s var(--ease); }
    .pressable:active{ transform: scale(.97); }
    /* Troca de aba (seção B.2): o conteúdo entra com um fade curto. */
    .troca-aba{ animation: tabfade .18s var(--ease); }
    @keyframes tabfade{ from{ opacity:0; } to{ opacity:1; } }
    @media (prefers-reduced-motion: reduce){
      .pressable{ transition:none !important; }
      .pressable:active{ transform:none !important; opacity:.75; }
      .troca-aba{ animation:none !important; }
    }
    .no-scrollbar::-webkit-scrollbar{ display:none; }
    .app-stage{ min-height:100vh; width:100%; display:flex; align-items:center; justify-content:center; padding:40px 16px; background:#CFC9BD; }
    .app-phone{ width:390px; height:844px; border-radius:3rem; box-shadow:0 25px 50px -12px rgba(0,0,0,.25); }
    @media (max-width: 480px){
      .app-stage{ padding:0; min-height:0; height:100vh; height:100dvh; }
      .app-phone{ width:100%; height:100%; border-radius:0; box-shadow:none; }
      .app-island{ display:none; }
    }
    :focus-visible{ outline:2px solid #1A1916; outline-offset:2px; }
    .busca-campo:focus-within{ box-shadow:0 0 0 2px #1A1916 !important; }
    .busca-campo input:focus-visible{ outline:none; }
    .guia-btn:active:not(:disabled){ transform: scale(.97); }
    .guia-btn:disabled{ cursor:not-allowed; }
    .guia-spin{ width:16px; height:16px; border-radius:50%; border:2px solid; animation: gspin .8s linear infinite; }
    @keyframes gspin{ to{ transform: rotate(360deg); } }
    .guia-skel{ border-radius:8px; background: linear-gradient(90deg, #EAE6DD 0%, #F6F3EC 50%, #EAE6DD 100%); background-size: 200% 100%; animation: gshim 1.3s ease-in-out infinite; }
    @keyframes gshim{ from{ background-position: 200% 0; } to{ background-position: -200% 0; } }
    .guia-toast{ animation: gup .22s ease-out; }
    .guia-sheet{ animation: gsheet .26s cubic-bezier(.2,.8,.2,1); }
    @keyframes gup{ from{ opacity:0; transform: translateY(8px); } to{ opacity:1; transform:none; } }
    @keyframes gsheet{ from{ transform: translateY(100%); } to{ transform:none; } }
    @media (prefers-reduced-motion: reduce){ .guia-spin,.guia-skel,.guia-toast,.guia-sheet{ animation:none !important; } .guia-btn{ transition:none !important; } }
  `}</style>
);

export { GlobalStyle };
