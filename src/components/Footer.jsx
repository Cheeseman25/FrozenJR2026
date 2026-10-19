// TTS Players logo and MTI licensing line.

import { TTS_PLAYERS_LOGO_URL } from "../config";

export function Footer({ ctx }) {
  return (
    <>
      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-8 pb-4 flex flex-col items-center justify-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-cyan-500/25 to-sky-500/25 opacity-50 blur-md group-hover:opacity-100 transition duration-300"></div>
          <img 
            src={TTS_PLAYERS_LOGO_URL} 
            alt="TTS Players Haverhill Bradford" 
            className="relative h-28 md:h-32 w-auto object-contain bg-slate-950/60 p-2.5 rounded-2xl border border-cyan-500/30 shadow-xl"
          />
        </div>
        <div>
          <p className="font-bold text-slate-300 text-sm tracking-wide">
            Disney's Frozen JR. • TTS Players • Haverhill / Bradford, MA
          </p>
          <p className="mt-1 text-slate-500 text-[11px]">
            Authorized Performance Materials Supplied by Music Theatre International (MTI)
          </p>
        </div>
      </footer>
    </>
  );
}
