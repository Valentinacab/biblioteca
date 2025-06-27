import React, { useState } from 'react';
import { Plus, Edit, Search, BookOpen, Trash2, Download, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Book } from '../../types';

const BookManagement: React.FC = () => {
  const { books, updateBook, addBook, deleteBook, detectBug } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveBook = (bookData: Partial<Book>) => {
    if (editingBook) {
      // BUG: No valida que las copias disponibles no sean mayores que el total
      if (bookData.availableCopies! > bookData.totalCopies!) {
        detectBug('El formulario permite que las copias disponibles sean mayores que el total');
      }
      
      const updatedBook: Book = {
        ...editingBook,
        ...bookData,
      };
      updateBook(updatedBook);
      setEditingBook(null);
    } else {
      // Agregar nuevo libro
      addBook(bookData as Omit<Book, 'id'>);
    }
    setShowAddForm(false);
  };

  const handleDeleteBook = (bookId: string) => {
    const success = deleteBook(bookId);
    if (success) {
      detectBug('Se permite eliminar libros que pueden tener reservas activas');
      setShowDeleteConfirm(null);
    }
  };

  const handleExportBooks = () => {
    // BUG: Exportación con formato incorrecto
    const data = books.map(book => ({
      titulo: book.title,
      autor: book.author,
      // BUG: Falta información importante como ISBN, categoría, etc.
    }));
    
    const csv = 'titulo,autor\n' + data.map(row => `${row.titulo},${row.autor}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libros.csv';
    a.click();
    
    detectBug('BUG_EXPORTACION_INCOMPLETA');
  };

  const handleImportBooks = () => {
    // BUG: Función de importación no implementada
    detectBug('BUG_IMPORTACION_NO_IMPLEMENTADA');
    alert('Función no disponible');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Libros</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleImportBooks}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>Importar</span>
          </button>
          <button
            onClick={handleExportBooks}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Libro</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar libros por título, autor, ISBN o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Autor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ISBN</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Disponibles</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Ubicación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-10 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{book.title}</p>
                        <p className="text-sm text-gray-500">{book.publishYear}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{book.author}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-sm">{book.isbn}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{book.totalCopies}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{book.location}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingBook(book)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(book.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar/editar libro */}
      {(showAddForm || editingBook) && (
        <BookFormModal
          book={editingBook}
          onSave={handleSaveBook}
          onClose={() => {
            setShowAddForm(false);
            setEditingBook(null);
          }}
          onBugDetect={detectBug}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          bookId={showDeleteConfirm}
          onConfirm={handleDeleteBook}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

const BookFormModal: React.FC<{
  book: Book | null;
  onSave: (book: Partial<Book>) => void;
  onClose: () => void;
  onBugDetect: (description: string) => void;
}> = ({ book, onSave, onClose, onBugDetect }) => {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || 'Literatura',
    totalCopies: book?.totalCopies || 1,
    availableCopies: book?.availableCopies || 1,
    description: book?.description || '',
    publishYear: book?.publishYear || new Date().getFullYear(),
    coverUrl: book?.coverUrl || 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?w=200',
    location: book?.location || '',
    language: book?.language || 'Español'
  });

  const categories = ['Literatura', 'Clásicos', 'Ciencia Ficción', 'Infantil', 'Filosofía', 'Historia', 'Biografía', 'Técnico'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // BUG: Permite que las copias disponibles sean mayores que el total
    if (formData.availableCopies > formData.totalCopies) {
      onBugDetect('BUG_COPIAS_DISPONIBLES_MAYOR');
    }
    
    // BUG: No valida ISBN duplicado
    if (!book && formData.isbn === '978-84-376-0494-7') {
      onBugDetect('BUG_ISBN_DUPLICADO');
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {book ? 'Editar Libro' : 'Agregar Nuevo Libro'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año de Publicación</label>
              <input
                type="number"
                value={formData.publishYear}
                onChange={(e) => setFormData({ ...formData, publishYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Copias *</label>
              <input
                type="number"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibles *</label>
              <input
                type="number"
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Estantería A-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Francés">Francés</option>
                <option value="Alemán">Alemán</option>
                <option value="Italiano">Italiano</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción del libro..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de la Portada</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
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
              {book ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{
  bookId: string;
  onConfirm: (bookId: string) => void;
  onCancel: () => void;
}> = ({ bookId, onConfirm, onCancel }) => {
  const { books } = useApp();
  const book = books.find(b => b.id === bookId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el libro "{book?.title}"? Esta acción no se puede deshacer.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(bookId)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookManagement;
