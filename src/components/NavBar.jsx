// Breadcrumb bar (copy direct link) and the tab navigation.

import { TAB_INFO } from "../config";

export function NavBar({ ctx }) {
  const { activeTab, copiedBreadcrumb, navigateToTab, copyCurrentBreadcrumbLink } = ctx;

  return (
    <>
      <div className="flex items-center justify-between py-2 px-3 mb-4 rounded-xl bg-slate-950/60 border border-cyan-950 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-cyan-400">❄ Frozen JR</span>
          <span>/</span>
          <span className="text-slate-300 font-semibold">{TAB_INFO[activeTab]?.icon} {TAB_INFO[activeTab]?.label}</span>
          <span className="hidden sm:inline font-mono text-[11px] text-cyan-500/70">#{activeTab}</span>
        </div>

        <button
          onClick={copyCurrentBreadcrumbLink}
          className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-cyan-900 transition"
          title="Copy direct link to this page"
        >
          <span>{copiedBreadcrumb ? '✓ Copied Link!' : '🔗 Copy Direct Link'}</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="flex flex-wrap items-center gap-2 mb-8 bg-slate-900/60 p-1.5 rounded-2xl border border-cyan-900/50 backdrop-blur-md">
        {Object.keys(TAB_INFO).map(key => {
          const tab = TAB_INFO[key];
          return (
            <button
              key={key}
              onClick={() => navigateToTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 flex-1 md:flex-initial text-center justify-center ${
                activeTab === key
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
