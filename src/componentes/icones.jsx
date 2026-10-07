import React from "react";
import { T } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Ícones                                                              */
/* ------------------------------------------------------------------ */
const Icon = ({ children, size = 20, color = T.ink, strokeWidth = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const BackIcon = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;

const ChevronIcon = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;

const HouseIcon = (p) => <Icon {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" /></Icon>;

const SparkleIcon = (p) => <Icon {...p}><path d="M12 2 13.5 9 21 12 13.5 15 12 22 10.5 15 3 12 10.5 9Z" /></Icon>;

const BuildingIcon = (p) => <Icon {...p}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /><path d="M9 21v-3h6v3" /></Icon>;

const PersonIcon = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></Icon>;

const FolderIcon = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></Icon>;

const LockIcon = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;

const FlagIcon = (p) => <Icon {...p}><path d="M5 3v18" /><path d="M5 4h11l-2 4 2 4H5" /></Icon>;

const SendIcon = ({ color = T.brass, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M3 11l18-8-8 18-2-8-8-2Z" /></svg>
);

const PinIcon = (p) => <Icon {...p}><path d="M12 17v5M8 13l4-9 4 9M5 13h14l-1.5 3h-11Z" /></Icon>;

const CheckIcon = (p) => <Icon {...p}><path d="M5 12l5 5 9-11" /></Icon>;

const StarIcon = ({ filled, size = 18, color = T.brass }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color}
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Tela: Busca global                                                  */
/* ------------------------------------------------------------------ */
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;

/* ------------------------------------------------------------------ */
/* Notificações                                                        */
/* ------------------------------------------------------------------ */
const BellIcon = (p) => <Icon {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>;

const ChartIcon = (p) => <Icon {...p}><rect x="4" y="12" width="4" height="8" rx="0.5" /><rect x="10" y="7" width="4" height="13" rx="0.5" /><rect x="16" y="3" width="4" height="17" rx="0.5" /></Icon>;

const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;

function IconeSem({ tipo, cor, size = 15 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: cor, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (tipo === "alerta") return <svg {...p}><path d="M12 3 2 20h20Z" /><path d="M12 10v4M12 17h.01" /></svg>;
  if (tipo === "relogio") return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (tipo === "seta") return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  if (tipo === "check") return <svg {...p}><path d="M5 12l5 5 9-11" /></svg>;
  return <svg {...p}><path d="M9 5v14M15 5v14" /></svg>;
}

export { BackIcon, BellIcon, BuildingIcon, ChartIcon, CheckIcon, ChevronIcon, FlagIcon, FolderIcon, HouseIcon, Icon, IconeSem, LockIcon, PersonIcon, PinIcon, SearchIcon, SendIcon, SparkleIcon, StarIcon, SunIcon };
