import React, { useState } from 'react';
import { Search, Filter, BookOpen, Calendar, Clock, Star, Bell, CreditCard, RotateCcw, X, MessageSquare } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Book } from '../../types';

const ClientDashboard: React.FC = () => {
  const { 
    books, 
    reservations, 
    notifications,
    fines,
    currentUser, 
    reserveBook, 
    returnBook,
    renewReservation,
    cancelReservation,
    searchBooks, 
    filterBooksByCategory,
    detectBug,
    addReview,
    markNotificationAsRead,
    payFine,
    getBookDetails
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchResults, setSearchResults] = useState<Book[]>(books);
  const [showBookDetails, setShowBookDetails] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'reservations' | 'notifications' | 'fines'>('catalog');

  const userReservations = reservations.filter(r => r.userId === currentUser?.id);
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const userFines = fines.filter(f => f.userId === currentUser?.id && !f.paid);
  const categories = ['Todos', ...Array.from(new Set(books.map(book => book.category)))];

  const handleSearch = () => {
    const results = searchBooks(searchQuery);
    setSearchResults(results);
    
    // BUG: Detectar cuando la búsqueda case-sensitive falla pero debería encontrar resultados
    if (results.length === 0 && searchQuery.trim() !== '') {
      // Verificar si hay resultados con búsqueda case-insensitive
      const caseInsensitiveResults = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (caseInsensitiveResults.length > 0) {
        detectBug('BUG_BUSQUEDA_CASE_SENSITIVE');
      }
    }
  };

  // También detectar el bug cuando se escribe en el campo de búsqueda
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Detectar inmediatamente si escriben "gabriel" (minúscula)
    if (value.toLowerCase() === 'gabriel' && value !== 'Gabriel') {
      detectBug('BUG_BUSQUEDA_CASE_SENSITIVE');
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    const filtered = filterBooksByCategory(category);
    setSearchResults(filtered);
    
    // BUG: El filtro funciona al revés para algunas categorías
    if ((category === 'Literatura' || category === 'Clásicos') && filtered.length === 0) {
      detectBug('BUG_FILTRO_INVERTIDO');
    }
  };

  const handleReserveBook = (bookId: string) => {
    const success = reserveBook(bookId);
    if (!success) {
      alert('No se pudo realizar la reserva. El libro no está disponible.');
    } else {
      // Actualizar resultados de búsqueda
      setSearchResults(prev => prev.map(book => 
        book.id === bookId 
          ? { ...book, availableCopies: Math.max(0, book.availableCopies - 2) } // BUG: Resta 2 en lugar de 1
          : book
      ));
    }
  };

  const handleReturnBook = (reservationId: string) => {
    const success = returnBook(reservationId);
    if (success) {
      alert('Libro devuelto correctamente');
    }
  };

  const handleRenewReservation = (reservationId: string) => {
    const success = renewReservation(reservationId);
    if (success) {
      alert('Reserva renovada por 14 días más');
    } else {
      alert('No se pudo renovar la reserva');
    }
  };

  const handleCancelReservation = (reservationId: string) => {
    const success = cancelReservation(reservationId);
    if (success) {
      alert('Reserva cancelada correctamente');
    }
  };

  const handleViewBookDetails = (bookId: string) => {
    const book = getBookDetails(bookId);
    if (!book) {
      detectBug('No se pueden obtener los detalles del libro seleccionado');
      return;
    }
    setShowBookDetails(bookId);
  };

  const handleAddReview = (bookId: string, rating: number, comment: string) => {
    const success = addReview(bookId, rating, comment);
    if (success) {
      alert('Reseña agregada correctamente');
      setShowReviewModal(null);
    }
  };

  const handlePayFine = (fineId: string) => {
    const success = payFine(fineId);
    if (success) {
      alert('Multa pagada correctamente');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {currentUser?.name}
        </h1>
        <p className="text-gray-600">Explora nuestro catálogo y gestiona tus reservas</p>
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'catalog', label: 'Catálogo', icon: BookOpen },
            { id: 'reservations', label: 'Mis Reservas', icon: Calendar, badge: userReservations.filter(r => r.status === 'activa').length },
            { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: userNotifications.filter(n => !n.read).length },
            { id: 'fines', label: 'Multas', icon: CreditCard, badge: userFines.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Búsqueda y Filtros */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por título, autor o ISBN..."
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Catálogo de Libros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((book) => (
                <div key={book.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{book.title}</h3>
                    <p className="text-gray-600 mb-2">{book.author}</p>
                    <p className="text-sm text-gray-500 mb-4">{book.category} • {book.publishYear}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.availableCopies > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies > 0 
                          ? `${book.availableCopies} disponibles`
                          : 'No disponible'
                        }
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(book.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {book.rating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleReserveBook(book.id)}
                        disabled={book.availableCopies === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        {book.availableCopies > 0 ? 'Reservar' : 'No Disponible'}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBookDetails(book.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => setShowReviewModal(book.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center space-x-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Reseña</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Cuenta</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Reservas Activas</span>
                  <span className="text-lg font-bold text-blue-600">
                    {userReservations.filter(r => r.status === 'activa').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Multas Pendientes</span>
                  <span className="text-lg font-bold text-yellow-600">
                    €{userFines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Libros Devueltos</span>
                  <span className="text-lg font-bold text-green-600">
                    {userReservations.filter(r => r.status === 'devuelto').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Reservas</h3>
          
          {userReservations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes reservas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReservations.map((reservation) => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{reservation.bookTitle}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Reserva: {reservation.reservationDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Vence: {reservation.dueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="h-4 w-4" />
                      <span>Renovaciones: {reservation.renewalCount || 0}/2</span>
                    </div>
                  </div>

                  {reservation.status === 'activa' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReturnBook(reservation.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        Devolver
                      </button>
                      <button
                        onClick={() => handleRenewReservation(reservation.id)}
                        disabled={(reservation.renewalCount || 0) >= 2}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        Renovar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
          
          {userNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.date.toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multas Pendientes</h3>
          
          {userFines.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes multas pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userFines.map((fine) => (
                <div key={fine.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-red-900">€{fine.amount.toFixed(2)}</p>
                      <p className="text-sm text-red-700">{fine.reason}</p>
                      <p className="text-xs text-red-600">{fine.date.toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handlePayFine(fine.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {showBookDetails && (
        <BookDetailsModal
          bookId={showBookDetails}
          onClose={() => setShowBookDetails(null)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          bookId={showReviewModal}
          onClose={() => setShowReviewModal(null)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
};

const BookDetailsModal: React.FC<{
  bookId: string;
  onClose: () => void;
}> = ({ bookId, onClose }) => {
  const { getBookDetails } = useApp();
  const book = getBookDetails(bookId);

  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Autor</label>
              <p className="text-gray-900">{book.author}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <p className="text-gray-900 font-mono text-sm">{book.isbn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Año</label>
                <p className="text-gray-900">{book.publishYear}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <p className="text-gray-900">{book.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <p className="text-gray-900">{book.location}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Disponibilidad</label>
              <p className="text-gray-900">{book.availableCopies} de {book.totalCopies} copias disponibles</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Calificación</label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(book.rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {book.rating?.toFixed(1) || 'Sin calificar'} ({book.reviews?.length || 0} reseñas)
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900 text-sm">{book.description}</p>
            </div>
          </div>
        </div>
        
        {book.reviews && book.reviews.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Reseñas</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {book.reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{review.userName}</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{review.date.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewModal: React.FC<{
  bookId: string;
  onClose: () => void;
  onSubmit: (bookId: string, rating: number, comment: string) => void;
}> = ({ bookId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(bookId, rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Escribir Reseña</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`h-8 w-8 ${
                    i < rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="h-full w-full fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Escribe tu reseña..."
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDashboard;
