import React, { useState } from 'react';
import { Search, Calendar, User, BookOpen, Filter, Eye, Download, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const ReservationManagement: React.FC = () => {
  const { reservations, detectBug, exportReservations } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const itemsPerPage = 5;

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todas' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // BUG: Paginación incorrecta
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex + 1); // BUG: +1 extra

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page > totalPages) {
      detectBug('La paginación permite navegar a páginas inexistentes');
    }
  };

  const handleViewDetails = (reservationId: string) => {
    // BUG: Solo funciona para reservas con ID par
    if (parseInt(reservationId) % 2 !== 0) {
      detectBug('BUG_VER_DETALLES_ID_IMPAR');
      return;
    }
    
    setShowDetails(reservationId);
  };

  const handleExport = () => {
    const data = exportReservations();
    // BUG: Exportación genera datos incompletos
    if (!data.includes('status') && !data.includes('dueDate')) {
      detectBug('La exportación de reservas está incompleta - faltan campos importantes');
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas.json';
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'devuelto':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Reservas</h2>
          <p className="text-gray-600">Administra todas las reservas del sistema</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por libro o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="todas">Todas las reservas</option>
              <option value="activa">Activas</option>
              <option value="devuelto">Devueltas</option>
              <option value="vencido">Vencidas</option>
              <option value="cancelado">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Libro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha Reserva</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha Vencimiento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Renovaciones</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{reservation.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{reservation.bookTitle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{reservation.reservationDate.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{reservation.dueDate.toLocaleDateString()}</span>
                      {reservation.status === 'activa' && new Date() > reservation.dueDate && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {reservation.renewalCount || 0}/2
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleViewDetails(reservation.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredReservations.length)} de {filteredReservations.length} reservas
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {[...Array(totalPages + 1)].map((_, index) => { // BUG: +1 extra en el array
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetails && (
        <ReservationDetailsModal
          reservationId={showDetails}
          onClose={() => setShowDetails(null)}
        />
      )}
    </div>
  );
};

const ReservationDetailsModal: React.FC<{
  reservationId: string;
  onClose: () => void;
}> = ({ reservationId, onClose }) => {
  const { reservations, fines } = useApp();
  
  const reservation = reservations.find(r => r.id === reservationId);
  const reservationFines = fines.filter(f => f.reservationId === reservationId);

  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Reserva</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <p className="text-gray-900">{reservation.userName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Libro</label>
            <p className="text-gray-900">{reservation.bookTitle}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Reserva</label>
              <p className="text-gray-900">{reservation.reservationDate.toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
              <p className="text-gray-900">{reservation.dueDate.toLocaleDateString()}</p>
            </div>
          </div>
          
          {reservation.returnDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Devolución</label>
              <p className="text-gray-900">{reservation.returnDate.toLocaleDateString()}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
              reservation.status === 'activa' 
                ? 'bg-green-100 text-green-800'
                : reservation.status === 'vencido'
                ? 'bg-red-100 text-red-800'
                : reservation.status === 'cancelado'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {reservation.status}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Renovaciones</label>
            <p className="text-gray-900">{reservation.renewalCount || 0}/2</p>
          </div>
          
          {reservationFines.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Multas</label>
              <div className="space-y-2">
                {reservationFines.map(fine => (
                  <div key={fine.id} className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      €{fine.amount.toFixed(2)} - {fine.reason}
                    </p>
                    <p className="text-xs text-red-600">
                      {fine.paid ? 'Pagada' : 'Pendiente'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;

export default ReservationManagement
