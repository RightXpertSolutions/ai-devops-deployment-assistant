import Sidebar from "./Sidebar";

export default function Layout({ children, theme, setTheme }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex group">
      <Sidebar theme={theme} setTheme={setTheme} />
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 transition-all duration-300 lg:ml-20 lg:px-8">
        {children}
      </main>
    </div>
  );
}
