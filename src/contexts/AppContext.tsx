import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Book, Reservation, Notification, Fine, Review } from '../types';
import { users, books as initialBooks, initialReservations, initialNotifications, initialFines } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  books: Book[];
  reservations: Reservation[];
  notifications: Notification[];
  fines: Fine[];
  bugsDetected: number;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  reserveBook: (bookId: string) => boolean;
  returnBook: (reservationId: string) => boolean;
  renewReservation: (reservationId: string) => boolean;
  cancelReservation: (reservationId: string) => boolean;
  updateBook: (book: Book) => void;
  addBook: (book: Omit<Book, 'id'>) => void;
  deleteBook: (bookId: string) => boolean;
  detectBug: (bugDescription: string) => void;
  searchBooks: (query: string) => Book[];
  filterBooksByCategory: (category: string) => Book[];
  addReview: (bookId: string, rating: number, comment: string) => boolean;
  markNotificationAsRead: (notificationId: string) => void;
  payFine: (fineId: string) => boolean;
  calculateFine: (daysLate: number) => number;
  getBookDetails: (bookId: string) => Book | null;
  exportReservations: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [fines, setFines] = useState<Fine[]>(initialFines);
  const [bugsDetected, setBugsDetected] = useState(0);

  const login = (username: string, password: string): boolean => {
    // BUG: Permite login con espacios en blanco
    if (username.trim() === '' || password.trim() === '') {
      return false;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const reserveBook = (bookId: string): boolean => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) {
      return false;
    }

    // BUG: No verifica si el usuario ya tiene el libro reservado
    const existingReservation = reservations.find(r => 
      r.userId === currentUser!.id && 
      r.bookId === bookId && 
      r.status === 'activa'
    );
    
    // BUG: Permite reservar el mismo libro múltiples veces
    const newReservation: Reservation = {
      id: Date.now().toString(),
      userId: currentUser!.id,
      bookId,
      reservationDate: new Date(),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // BUG: 10 días en lugar de 14
      status: 'activa',
      userName: currentUser!.name,
      bookTitle: book.title,
      renewalCount: 0
    };

    setReservations(prev => [...prev, newReservation]);
    
    // BUG: Resta 2 copias en lugar de 1
    setBooks(prev => prev.map(b => 
      b.id === bookId 
        ? { ...b, availableCopies: Math.max(0, b.availableCopies - 2) }
        : b
    ));

    return true;
  };

  const returnBook = (reservationId: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;

    const returnDate = new Date();
    const isLate = returnDate > reservation.dueDate;
    
    // BUG: Calcula mal los días de retraso
    if (isLate) {
      const daysLate = Math.floor((returnDate.getTime() - reservation.dueDate.getTime()) / (1000 * 60 * 60 * 24)) + 2; // BUG: +2 días extra
      const fine = calculateFine(daysLate);
      
      const newFine: Fine = {
        id: Date.now().toString(),
        userId: reservation.userId,
        reservationId: reservation.id,
        amount: fine,
        reason: `Devolución tardía (${daysLate} días)`,
        paid: false,
        date: returnDate
      };
      
      setFines(prev => [...prev, newFine]);
    }

    setReservations(prev => prev.map(r => 
      r.id === reservationId 
        ? { ...r, status: 'devuelto' as const, returnDate }
        : r
    ));

    // BUG: No restaura el stock disponible al devolver
    return true;
  };

  const renewReservation = (reservationId: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || reservation.status !== 'activa') return false;
    
    // BUG: Permite renovar infinitas veces
    if ((reservation.renewalCount || 0) >= 2) {
      return false;
    }

    const newDueDate = new Date(reservation.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    setReservations(prev => prev.map(r => 
      r.id === reservationId 
        ? { 
            ...r, 
            dueDate: newDueDate,
            renewalCount: (r.renewalCount || 0) + 1
          }
        : r
    ));

    return true;
  };

  const cancelReservation = (reservationId: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || reservation.status !== 'activa') return false;

    setReservations(prev => prev.map(r => 
      r.id === reservationId 
        ? { ...r, status: 'cancelado' as const }
        : r
    ));

    // BUG: No restaura el stock al cancelar
    const book = books.find(b => b.id === reservation.bookId);
    if (book) {
      setBooks(prev => prev.map(b => 
        b.id === reservation.bookId 
          ? { ...b, availableCopies: b.availableCopies + 1 }
          : b
      ));
    }

    return true;
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      rating: 0,
      reviews: []
    };
    setBooks(prev => [...prev, newBook]);
  };

  const deleteBook = (bookId: string): boolean => {
    // BUG: Permite eliminar libros con reservas activas
    const activeReservations = reservations.filter(r => 
      r.bookId === bookId && r.status === 'activa'
    );
    
    setBooks(prev => prev.filter(b => b.id !== bookId));
    return true;
  };

  const detectBug = (bugDescription: string) => {
    setBugsDetected(prev => prev + 1);
    
    // Mostrar popup de bug detectado
    const popup = document.createElement('div');
    popup.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce max-w-sm';
    popup.innerHTML = `
      <div class="flex items-start space-x-3">
        <span class="text-2xl">🐛</span>
        <div>
          <p class="font-bold text-lg">¡Bug Detectado!</p>
          <p class="text-sm mt-1">${bugDescription}</p>
          <p class="text-xs mt-2 opacity-75">Total detectados: ${bugsDetected + 1}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 4000);
  };

  const searchBooks = (query: string): Book[] => {
    if (!query) return books;
    
    // BUG: Búsqueda case-sensitive
    return books.filter(book => 
      book.title.includes(query) || 
      book.author.includes(query) ||
      book.isbn.includes(query) ||
      book.category.includes(query)
    );
  };

  const filterBooksByCategory = (category: string): Book[] => {
    if (category === 'Todos') return books;
    
    // BUG: Filtro funciona al revés para algunas categorías
    if (category === 'Literatura' || category === 'Clásicos') {
      return books.filter(book => book.category !== category);
    }
    
    return books.filter(book => book.category === category);
  };

  const addReview = (bookId: string, rating: number, comment: string): boolean => {
    if (!currentUser) return false;
    
    const newReview: Review = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      date: new Date()
    };

    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const updatedReviews = [...(book.reviews || []), newReview];
        // BUG: Cálculo incorrecto del rating promedio
        const avgRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0) / (updatedReviews.length + 1); // BUG: +1 extra en divisor
        
        return {
          ...book,
          reviews: updatedReviews,
          rating: Math.round(avgRating * 10) / 10
        };
      }
      return book;
    }));

    return true;
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const payFine = (fineId: string): boolean => {
    const fine = fines.find(f => f.id === fineId);
    if (!fine) return false;

    // BUG: Permite pagar multas ya pagadas
    setFines(prev => prev.map(f => 
      f.id === fineId ? { ...f, paid: true } : f
    ));

    return true;
  };

  const calculateFine = (daysLate: number): number => {
    // BUG: Cálculo incorrecto de multas
    const baseRate = 0.50; // €0.50 por día
    return daysLate * baseRate * 2; // BUG: Multiplica por 2 extra
  };

  const getBookDetails = (bookId: string): Book | null => {
    // BUG: A veces devuelve el libro incorrecto
    const books_copy = [...books];
    if (bookId === '1') {
      return books_copy[1]; // BUG: Devuelve índice incorrecto para el libro con ID '1'
    }
    return books.find(b => b.id === bookId) || null;
  };

  const exportReservations = (): string => {
    // BUG: Exportación incompleta - falta información
    const data = reservations.map(r => ({
      usuario: r.userName,
      libro: r.bookTitle,
      fecha: r.reservationDate.toLocaleDateString()
      // BUG: Falta estado, fecha de vencimiento, etc.
    }));
    
    return JSON.stringify(data, null, 2);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      books,
      reservations,
      notifications,
      fines,
      bugsDetected,
      login,
      logout,
      reserveBook,
      returnBook,
      renewReservation,
      cancelReservation,
      updateBook,
      addBook,
      deleteBook,
      detectBug,
      searchBooks,
      filterBooksByCategory,
      addReview,
      markNotificationAsRead,
      payFine,
      calculateFine,
      getBookDetails,
      exportReservations
    }}>
      {children}
    </AppContext.Provider>
  );
};