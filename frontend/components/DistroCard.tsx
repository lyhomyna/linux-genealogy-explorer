import React from 'react';
import { DistroDetails } from '../types';
import { ExternalLink, Cpu, Box, GitFork } from 'lucide-react';

interface DistroCardProps {
  distro: DistroDetails | null;
  loading: boolean;
}

const DistroCard: React.FC<DistroCardProps> = ({ distro, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 animate-pulse h-64">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
      </div>
    );
  }

  if (!distro) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700 text-center text-slate-400">
        <p>Select a distribution to see details.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center p-2 overflow-hidden shrink-0">
          {distro.logo ? (
            <img src={distro.logo} alt={distro.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl font-bold text-slate-500">{distro.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{distro.name}</h2>
          {distro.website && (
            <a
              href={distro.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
            >
              Official Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-2">
        {/* Package Manager */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-1">
            <Box className="w-3 h-3" /> Package Manager
          </div>
          <div className="text-slate-200 font-medium">
            {distro.packageManager || "Unknown"}
          </div>
        </div>
      </div>

      {/* Based On */}
      {distro.basedOn && distro.basedOn.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
            <GitFork className="w-3 h-3" /> Based On
          </div>
          <div className="flex flex-wrap gap-2">
            {distro.basedOn.map((parent, idx) => (
              <span key={idx} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-sm border border-blue-800/50">
                {parent.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistroCard;