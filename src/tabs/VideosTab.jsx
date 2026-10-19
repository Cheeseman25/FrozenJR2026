// #videos: placeholder for choreography and blocking videos.

export function VideosTab({ ctx }) {
  const { activeTab, rehearsals } = ctx;

  return (
    <>
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                Video Staging Vault
              </span>
              <h3 className="text-xl font-bold font-cinzel text-white mt-1.5">Choreography & Blocking Videos</h3>
              <p className="text-xs text-slate-300">
                Instructional dance videos, stage blocking, and combinations recorded during rehearsals.
              </p>
            </div>
          </div>

          <div className="glass-card p-12 text-center rounded-3xl border border-cyan-500/20">
            <div className="w-16 h-16 bg-cyan-950 border border-cyan-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎬
            </div>
            <h3 className="text-xl font-bold font-cinzel text-white">Choreography Videos Coming Soon</h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              As our choreographers and directors stage numbers like <em>Fixer Upper</em>, <em>Hygge</em>, and <em>In Summer</em>, rehearsal breakdown videos will be linked here for home practice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
