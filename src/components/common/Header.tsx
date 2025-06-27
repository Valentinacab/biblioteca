import React from 'react';
import { LogOut, BookOpen, Bug } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Header: React.FC = () => {
  const { currentUser, logout, bugsDetected } = useApp();

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sistema BiblioTech</h1>
              <p className="text-sm text-gray-500">Gestión Bibliotecaria</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
              <Bug className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Bugs Detectados: {bugsDetected}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;