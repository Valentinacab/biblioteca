import React, { useState } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, Plus, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BookManagement from './BookManagement';
import ReservationManagement from './ReservationManagement';

const AdminDashboard: React.FC = () => {
  const { books, reservations, detectBug } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'reservations'>('overview');

  // BUG: Cálculo incorrecto de estadísticas
  const totalBooks = books.length;
  const totalReservations = reservations.length;
  const activeReservations = reservations.filter(r => r.status === 'activa').length + 1; // BUG: +1 extra
  const availableBooks = books.reduce((sum, book) => sum + book.availableCopies, 0);

  const stats = [
    {
      title: 'Total de Libros',
      value: totalBooks,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Reservas Activas',
      value: activeReservations,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Libros Disponibles',
      value: availableBooks,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '-3%'
    },
    {
      title: 'Total Reservas',
      value: totalReservations,
      icon: Users,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  const handleBugDetection = (bugDescription: string) => {
    detectBug(bugDescription);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona libros, reservas y usuarios del sistema</p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'books', label: 'Gestión de Libros', icon: BookOpen },
            { id: 'reservations', label: 'Reservas', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (index === 1) { // Reservas Activas con bug
                      handleBugDetection('BUG_RESERVAS_ACTIVAS_CONTADOR');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas Recientes</h3>
              <div className="space-y-4">
                {reservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.bookTitle}</p>
                      <p className="text-sm text-gray-600">{reservation.userName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'activa' 
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'vencido'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Libros Más Reservados</h3>
              <div className="space-y-4">
                {books.slice(0, 5).map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {book.totalCopies - book.availableCopies} reservas
                      </p>
                      <p className="text-xs text-gray-500">{book.availableCopies} disponibles</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'books' && <BookManagement />}
      {activeTab === 'reservations' && <ReservationManagement />}
    </div>
  );
};

export default AdminDashboard;
