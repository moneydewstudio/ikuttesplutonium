import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import AdminLayout from '../../../components/AdminLayout';
import { getQuestionById, updateQuestion } from '../../../services/questionService';

const QuestionEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'TWK',
    difficulty: 'medium',
    tags: []
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchQuestion();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const question = await getQuestionById(id);
      if (question) {
        // Ensure options array has 4 items
        const options = [...(question.options || [])];
        while (options.length < 4) {
          options.push('');
        }
        setFormData({
          question: question.question || '',
          options,
          correctAnswer: question.correctAnswer || 0,
          explanation: question.explanation || '',
          category: question.category || 'TWK',
          difficulty: question.difficulty || 'medium',
          tags: question.tags || []
        });
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Gagal memuat pertanyaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
    setSuccess(false);
    try {
      // Validate form
      if (!formData.question.trim()) {
        throw new Error('Pertanyaan tidak boleh kosong');
      }
      if (formData.options.some(option => !option.trim())) {
        throw new Error('Semua opsi jawaban harus diisi');
      }
      // Create or update question
      if (id && id !== 'new') {
        await updateQuestion(id, formData);
      } else {
        // For new questions, redirect to the create page
        router.push('/admin/questions/new');
        return;
      }
      setSuccess(true);
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error saving question:', error);
      setError(error.message || 'Gagal menyimpan pertanyaan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <NextSeo title="Edit Pertanyaan" />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Pertanyaan</h1>
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900 dark:border-red-600 dark:text-red-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 dark:bg-green-900 dark:border-green-600 dark:text-green-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>Pertanyaan berhasil disimpan!</p>
              </div>
            </div>
          )}
          {/* Form Fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              rows={3}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilihan Jawaban <span className="text-red-500">*</span>
            </label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={e => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  required
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === index}
                  onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                  className="ml-2"
                />
                <span className="ml-2 text-xs">Kunci</span>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Penjelasan
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              rows={2}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="TWK">TWK</option>
              <option value="TIU">TIU</option>
              <option value="TKP">TKP</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tingkat Kesulitan
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tag (pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="misal: sejarah, pkn, logika"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};

export default QuestionEdit;
