import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/sobre", label: "Sobre" },
  { to: "/solucao", label: "Solução" },
  { to: "/avatar", label: "Avatar" },
  { to: "/cadastro", label: "Conta" },
  { to: "/perfil", label: "Perfil" },
  { to: "/grupos", label: "Grupos" },
  { to: "/grupos/novo", label: "Cadastrar grupo" },
  { to: "/desafios", label: "Desafios" },
  { to: "/integrantes", label: "Integrantes" },
  { to: "/pitch", label: "PITCH" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
  { to: "/acesso-funcionario", label: "Acesso Funcionário" },
];

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false);
            menuButton.current?.focus();
          }
        }}
        className="sticky top-0 z-20 border-b border-white/10 bg-forest/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <NavLink
            to="/"
            aria-label="Soul Up - página inicial"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 text-xl font-black tracking-tight text-white"
          >
            <img
              className="h-10 w-10 object-contain"
              src="/icon/souldup.png"
              alt=""
            />
            Soul <span className="text-leaf">Up</span>
          </NavLink>

          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-mint transition hover:border-leaf/60 hover:text-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
          >
            Menu
          </button>

          <nav
            id="main-navigation"
            aria-label="Navegação principal"
            className={`${menuOpen ? "grid" : "hidden"} max-h-[calc(100dvh-6rem)] w-full gap-1 overflow-y-auto border-t border-white/10 pt-3 sm:grid-cols-2 lg:grid-cols-3`}
          >
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/solucao" || to === "/grupos"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-leaf/10 text-leaf"
                      : "text-mint hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-white/10 bg-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© 2026 — Nexus Elite · Soul Up</p>
          <p>Sustentabilidade, comunidade e ação coletiva.</p>
        </div>
      </footer>
    </div>
  );
}
