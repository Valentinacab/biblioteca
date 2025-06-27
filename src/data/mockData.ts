import { User, Book, Reservation, Review, Notification, Fine } from '../types';

export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Administrador del Sistema',
    email: 'admin@biblioteca.com',
    phone: '+34 123 456 789',
    registrationDate: new Date('2023-01-01')
  },
  {
    id: '2',
    username: 'cliente',
    password: 'cliente',
    role: 'cliente',
    name: 'Cliente de Prueba',
    email: 'cliente@email.com',
    phone: '+34 987 654 321',
    registrationDate: new Date('2023-06-15')
  },
  {
    id: '3',
    username: 'maria',
    password: 'maria123',
    role: 'cliente',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+34 555 123 456',
    registrationDate: new Date('2023-08-20')
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Cliente de Prueba',
    rating: 5,
    comment: 'Excelente libro, muy recomendado',
    date: new Date('2024-01-10')
  },
  {
    id: '2',
    userId: '3',
    userName: 'María González',
    rating: 4,
    comment: 'Muy buena lectura, aunque un poco larga',
    date: new Date('2024-01-12')
  }
];

export const books: Book[] = [
  {
    id: '1',
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez',
    isbn: '978-84-376-0494-7',
    category: 'Literatura',
    totalCopies: 5,
    availableCopies: 3,
    description: 'Una obra maestra del realismo mágico que narra la historia de la familia Buendía.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1967,
    rating: 4.8,
    reviews: reviews.slice(0, 2),
    location: 'Estantería A-1',
    language: 'Español'
  },
  {
    id: '2',
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    isbn: '978-84-376-0495-4',
    category: 'Clásicos',
    totalCopies: 4,
    availableCopies: 2,
    description: 'La obra cumbre de la literatura española y una de las novelas más importantes de la historia.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1605,
    rating: 4.5,
    location: 'Estantería B-2',
    language: 'Español'
  },
  {
    id: '3',
    title: 'La Casa de los Espíritus',
    author: 'Isabel Allende',
    isbn: '978-84-376-0496-1',
    category: 'Literatura',
    totalCopies: 3,
    availableCopies: 1,
    description: 'Una saga familiar que abarca varias generaciones en un país latinoamericano.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1982,
    rating: 4.6,
    location: 'Estantería A-3',
    language: 'Español'
  },
  {
    id: '4',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    isbn: '978-84-376-0497-8',
    category: 'Infantil',
    totalCopies: 6,
    availableCopies: 4,
    description: 'Una historia poética sobre la amistad, el amor y la pérdida de la inocencia.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1943,
    rating: 4.9,
    location: 'Estantería C-1',
    language: 'Español'
  },
  {
    id: '5',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-84-376-0498-5',
    category: 'Ciencia Ficción',
    totalCopies: 4,
    availableCopies: 2,
    description: 'Una distopía que explora los peligros del totalitarismo y la vigilancia masiva.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1949,
    rating: 4.7,
    location: 'Estantería D-1',
    language: 'Español'
  },
  {
    id: '6',
    title: 'Rayuela',
    author: 'Julio Cortázar',
    isbn: '978-84-376-0499-2',
    category: 'Literatura',
    totalCopies: 3,
    availableCopies: 3,
    description: 'Una novela experimental que puede leerse de múltiples formas.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1963,
    rating: 4.4,
    location: 'Estantería A-4',
    language: 'Español'
  },
  {
    id: '7',
    title: 'El Alquimista',
    author: 'Paulo Coelho',
    isbn: '978-84-376-0500-5',
    category: 'Filosofía',
    totalCopies: 5,
    availableCopies: 3,
    description: 'Una fábula sobre seguir los sueños y escuchar al corazón.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1988,
    rating: 4.3,
    location: 'Estantería E-1',
    language: 'Español'
  },
  {
    id: '8',
    title: 'Crónica de una Muerte Anunciada',
    author: 'Gabriel García Márquez',
    isbn: '978-84-376-0501-2',
    category: 'Literatura',
    totalCopies: 4,
    availableCopies: 2,
    description: 'Una novela corta que narra los eventos que llevan a un asesinato.',
    coverUrl: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    publishYear: 1981,
    rating: 4.5,
    location: 'Estantería A-2',
    language: 'Español'
  }
];

export const initialReservations: Reservation[] = [
  {
    id: '1',
    userId: '2',
    bookId: '1',
    reservationDate: new Date('2024-01-15'),
    dueDate: new Date('2024-01-29'),
    status: 'activa',
    userName: 'Cliente de Prueba',
    bookTitle: 'Cien Años de Soledad',
    renewalCount: 0
  },
  {
    id: '2',
    userId: '3',
    bookId: '4',
    reservationDate: new Date('2024-01-10'),
    dueDate: new Date('2024-01-24'),
    returnDate: new Date('2024-01-22'),
    status: 'devuelto',
    userName: 'María González',
    bookTitle: 'El Principito',
    renewalCount: 1
  },
  {
    id: '3',
    userId: '2',
    bookId: '5',
    reservationDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-12'),
    status: 'vencido',
    userName: 'Cliente de Prueba',
    bookTitle: '1984',
    fine: 5.50,
    renewalCount: 0
  }
];

export const initialNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    message: 'Tu reserva de "Cien Años de Soledad" vence en 3 días',
    type: 'warning',
    read: false,
    date: new Date('2024-01-26')
  },
  {
    id: '2',
    userId: '2',
    message: 'Tienes una multa pendiente de €5.50',
    type: 'error',
    read: false,
    date: new Date('2024-01-13')
  }
];

export const initialFines: Fine[] = [
  {
    id: '1',
    userId: '2',
    reservationId: '3',
    amount: 5.50,
    reason: 'Devolución tardía (7 días)',
    paid: false,
    date: new Date('2024-01-13')
  }
];