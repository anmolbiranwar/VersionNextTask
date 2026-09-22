import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback = ({ message = 'Loading microfrontend...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-600">{message}</p>
      <span className="text-xs text-slate-400 mt-1">Webpack Module Federation Handshake</span>
    </div>
  );
};

export default LoadingFallback;
