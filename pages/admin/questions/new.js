import { useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import AdminLayout from '../../../components/AdminLayout';
import { createQuestion } from '../../../services/questionService';

const NewQuestion = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'TWK',
    difficulty: 'medium',
    tags: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.question.trim()) {
        throw new Error('Pertanyaan tidak boleh kosong');
      }
      
      if (formData.options.some(option => !option.trim())) {
        throw new Error('Semua opsi jawaban harus diisi');
      }
      
      // Create question
      const newQuestion = await createQuestion({
        ...formData,
        // Add any additional fields needed
      });
      
      // Redirect to questions list with success message
      router.push({
        pathname: '/admin/questions',
        query: { success: 'created' }
      });
    } catch (error) {
      console.error('Error creating question:', error);
      setError(error.message || 'Gagal membuat pertanyaan. Silakan coba lagi.');
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <NextSeo
        title="Tambah Pertanyaan Baru - Ikuttes Admin"
        description="Halaman admin untuk menambah pertanyaan CPNS baru"
        noindex={true}
      />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Tambah Pertanyaan Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buat pertanyaan baru untuk bank soal CPNS
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/questions')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Kembali
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900 dark:border-red-600 dark:text-red-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Question */}
        <div className="mb-6">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pertanyaan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="question"
            name="question"
            rows="3"
            value={formData.question}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Masukkan pertanyaan..."
            required
          ></textarea>
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pilihan Jawaban <span className="text-red-500">*</span>
          </label>
          
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3">
                <span className="text-gray-700 dark:text-gray-300">{String.fromCharCode(65 + index)}</span>
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`flex-1 bg-gray-50 border ${index === formData.correctAnswer ? 'border-green-500 dark:border-green-600' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                placeholder={`Opsi ${String.fromCharCode(65 + index)}...`}
                required
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                className={`ml-3 px-3 py-2 rounded-md ${
                  index === formData.correctAnswer 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {index === formData.correctAnswer ? 'Benar' : 'Jadikan Benar'}
              </button>
            </div>
          ))}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Klik tombol "Jadikan Benar" untuk menandai jawaban yang benar.
          </p>
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Penjelasan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows="3"
            value={formData.explanation}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Masukkan penjelasan jawaban..."
            required
          ></textarea>
        </div>

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            >
              <option value="TWK">TWK - Tes Wawasan Kebangsaan</option>
              <option value="TIU">TIU - Tes Intelegensi Umum</option>
              <option value="TKP">TKP - Tes Karakteristik Pribadi</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tingkat Kesulitan <span className="text-red-500">*</span>
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tag (dipisahkan dengan koma)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="pancasila, sejarah, matematika, dll..."
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Tag membantu dalam pencarian dan pengelompokan pertanyaan.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Buat Pertanyaan
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default NewQuestion;
