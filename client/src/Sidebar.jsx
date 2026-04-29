import { Link } from "react-router-dom";
import { useState } from "react";
import { Boxes, FileText, History, Home, Menu, Monitor, Moon, Sun, X } from "lucide-react";

export default function Sidebar({ theme, setTheme }) {
  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded bg-[var(--accent)] p-2 text-white shadow lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`group fixed left-0 top-0 z-40 h-full border-r border-[var(--border)] bg-[var(--bg)] shadow-lg transition-all duration-300 ${
          open ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
        } lg:w-20 lg:hover:w-64`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-[var(--text-h)] lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div className="flex h-full flex-col space-y-8 px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[var(--accent)] text-white">
              <Boxes size={22} />
            </div>
            <span className="whitespace-nowrap text-lg font-semibold text-[var(--text-h)] opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
              DevOps Assistant
            </span>
          </div>

          <nav className="flex flex-col gap-3 text-[var(--text-h)]">
            <SidebarItem icon={<Home size={22} />} label="Home" to="/" onClick={() => setOpen(false)} />
            <SidebarItem icon={<FileText size={22} />} label="App" to="/app" onClick={() => setOpen(false)} />
            <SidebarItem icon={<History size={22} />} label="History" to="/app#history" onClick={() => setOpen(false)} />
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded p-3 transition hover:bg-[var(--accent-bg)]"
            >
              {theme === "light" && <Sun size={22} />}
              {theme === "dark" && <Moon size={22} />}
              {theme === "system" && <Monitor size={22} />}

              <span className="whitespace-nowrap opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                {theme === "light" && "Light"}
                {theme === "dark" && "Dark"}
                {theme === "system" && "System"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded p-3 transition hover:bg-[var(--accent-bg)]"
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}
