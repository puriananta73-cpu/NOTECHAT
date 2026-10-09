import React, { useState } from 'react';
import { X, Download, Database, Flame, Shield, Check, UserCheck, HardDriveDownload } from 'lucide-react';
import { BaaSConfig, UserProfile } from '../../types';
import { generateProjectZip } from '../../services/zipExporter';

interface BaaSConfigModalProps {
  currentConfig: BaaSConfig;
  currentUser: UserProfile;
  onSaveConfig: (cfg: BaaSConfig) => void;
  onUpdateUser: (usr: UserProfile) => void;
  onClose: () => void;
}

export const BaaSConfigModal: React.FC<BaaSConfigModalProps> = ({
  currentConfig,
  currentUser,
  onSaveConfig,
  onUpdateUser,
  onClose,
}) => {
  const [provider, setProvider] = useState<'local-broadcast' | 'firebase' | 'supabase'>(
    currentConfig.provider || 'local-broadcast'
  );
  const [firebaseApiKey, setFirebaseApiKey] = useState(
    currentConfig.firebaseConfig?.apiKey || ''
  );
  const [firebaseProjectId, setFirebaseProjectId] = useState(
    currentConfig.firebaseConfig?.projectId || ''
  );
  const [supabaseUrl, setSupabaseUrl] = useState(
    currentConfig.supabaseConfig?.url || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    currentConfig.supabaseConfig?.anonKey || ''
  );

  const [alias, setAlias] = useState(currentUser.alias);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BaaSConfig = {
      provider,
      firebaseConfig:
        provider === 'firebase'
          ? {
              apiKey: firebaseApiKey,
              authDomain: `${firebaseProjectId}.firebaseapp.com`,
              projectId: firebaseProjectId,
              storageBucket: `${firebaseProjectId}.appspot.com`,
              messagingSenderId: '123456789',
              appId: '1:123456789:web:abcdef',
            }
          : undefined,
      supabaseConfig:
        provider === 'supabase'
          ? {
              url: supabaseUrl,
              anonKey: supabaseAnonKey,
            }
          : undefined,
    };

    onSaveConfig(updated);
    if (alias.trim() && alias !== currentUser.alias) {
      onUpdateUser({
        ...currentUser,
        alias: alias.trim(),
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NoteChat-Netlify-Deployment.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0b1222] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">Room & Deployment Control</h3>
              <p className="text-[11px] text-slate-400">Manage real-time BaaS backend & Netlify deployment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Netlify Package Download Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-500/40 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Download .ZIP for Netlify Hosting</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Export complete source code with vite configuration, ready to drop directly into Netlify.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              {zipSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded NoteChat-Netlify-Deployment.zip!</span>
                </>
              ) : isZipping ? (
                <span>Packing zip bundle...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Project .ZIP Archive</span>
                </>
              )}
            </button>
          </div>

          {/* User Alias */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Anonymous Alias</span>
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. User_x7k2"
              className="w-full px-3 py-2 bg-slate-900 border border-cyan-900/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* BaaS Provider Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              Real-time Backend Engine
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('local-broadcast')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  provider === 'local-broadcast'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Database className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <span className="text-[11px] block">Broadcast & WebRTC</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('firebase')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  provider === 'firebase'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span className="text-[11px] block">Firebase Firestore</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('supabase')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  provider === 'supabase'
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span className="text-[11px] block">Supabase Realtime</span>
              </button>
            </div>

            {provider === 'local-broadcast' && (
              <p className="text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                <span className="text-cyan-400 font-semibold">Zero-config Peer Mesh:</span> Real-time cross-tab synchronization and WebRTC data/audio rooms active right out of the box with zero third-party account requirements.
              </p>
            )}

            {provider === 'firebase' && (
              <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-amber-900/40">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Firebase Project ID</label>
                  <input
                    type="text"
                    value={firebaseProjectId}
                    onChange={(e) => setFirebaseProjectId(e.target.value)}
                    placeholder="my-secret-chat-app"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Firebase Web API Key</label>
                  <input
                    type="password"
                    value={firebaseApiKey}
                    onChange={(e) => setFirebaseApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {provider === 'supabase' && (
              <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-emerald-900/40">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0d1527] border-t border-cyan-950 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
