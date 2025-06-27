export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'cliente';
  name: string;
  email?: string;
  phone?: string;
  registrationDate?: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverUrl: string;
  publishYear: number;
  rating?: number;
  reviews?: Review[];
  location?: string;
  language?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  reservationDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'activa' | 'devuelto' | 'vencido' | 'cancelado';
  userName: string;
  bookTitle: string;
  fine?: number;
  renewalCount?: number;
}

export interface BugDetection {
  id: string;
  description: string;
  detected: boolean;
  location: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  date: Date;
}

export interface Fine {
  id: string;
  userId: string;
  reservationId: string;
  amount: number;
  reason: string;
  paid: boolean;
  date: Date;
}