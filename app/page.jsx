"use client";

import dynamic from "next/dynamic";

// O app depende do navegador (localStorage, voz, data local), então só renderiza no cliente.
const App = dynamic(() => import("../src/App"), { ssr: false });

export default function Page() {
  return <App />;
}
