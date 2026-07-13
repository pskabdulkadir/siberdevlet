import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function AdminNav() {
  return (
    <Link
      to="/admin/login"
      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
      title="Admin Panel"
    >
      <Lock className="w-4 h-4" />
      Admin Panel
    </Link>
  );
}
