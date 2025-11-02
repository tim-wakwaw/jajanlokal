'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../../contexts/OptimizedAuthContext'
import { supabase } from '../../../lib/supabase'
import { motion } from 'framer-motion'
import { showSuccessAlert, showErrorAlert } from '../../../lib/sweetalert'
import { CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface FAQQuestion {
  id: string
  question: string
  email?: string
  status: string
  admin_answer?: string
  answered_by?: string
  answered_at?: string
  created_at: string
  user_id: string
}

export default function FAQManagementPage() {
  const { profile } = useAuth()
  const [questions, setQuestions] = useState<FAQQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<FAQQuestion | null>(null)
  const [answer, setAnswer] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('pending')

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('faq_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setQuestions(data || [])
      
    } catch (error) {
      console.error('Error fetching FAQ questions:', error)
      showErrorAlert('Error', 'Gagal memuat data pertanyaan FAQ')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      fetchQuestions()
    }
  }, [profile, fetchQuestions])

  const handleAnswerQuestion = async (questionId: string, answerText: string) => {
    try {
      const { error } = await supabase
        .from('faq_questions')
        .update({
          status: 'answered',
          admin_answer: answerText,
          answered_by: profile?.id,
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId)

      if (error) throw error

      showSuccessAlert('Berhasil!', 'Pertanyaan telah dijawab')
      fetchQuestions()
      setSelectedQuestion(null)
      setAnswer('')
      
    } catch (error) {
      console.error('Error answering question:', error)
      showErrorAlert('Error', 'Gagal menjawab pertanyaan')
    }
  }

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      answered: { color: 'bg-green-100 text-green-800', label: 'Dijawab' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Diarsip' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const QuestionCard = ({ question }: { question: FAQQuestion }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
            {getStatusBadge(question.status)}
          </div>
          {question.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Email: <span className="font-medium">{question.email}</span>
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tanggal: {new Date(question.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Pertanyaan:</h3>
        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          {question.question}
        </p>
      </div>

      {question.admin_answer && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Jawaban Admin:</h3>
          <p className="text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900 p-3 rounded-lg">
            {question.admin_answer}
          </p>
          {question.answered_at && (
            <p className="text-xs text-gray-500 mt-2">
              Dijawab pada: {new Date(question.answered_at).toLocaleString('id-ID')}
            </p>
          )}
        </div>
      )}

      {question.status === 'pending' && (
        <button
          onClick={() => {
            setSelectedQuestion(question)
            setAnswer('')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircleIcon className="w-4 h-4" />
          Jawab Pertanyaan
        </button>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Kelola FAQ
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Jawab pertanyaan dari pengguna dan kelola FAQ
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
          >
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Filter:</span>
              {(['all', 'pending', 'answered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'Semua' : 
                   status === 'pending' ? 'Pending' : 'Dijawab'}
                </button>
              ))}
              <div className="ml-auto">
                <button
                  onClick={fetchQuestions}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Questions Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tidak ada pertanyaan
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada pertanyaan FAQ untuk status {filter}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Jawab Pertanyaan FAQ
                </h2>
                <button
                  onClick={() => {
                    setSelectedQuestion(null)
                    setAnswer('')
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pertanyaan:
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">
                    {selectedQuestion.question}
                  </p>
                </div>
                {selectedQuestion.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Dari: {selectedQuestion.email}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jawaban Admin: *
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tulis jawaban untuk pertanyaan ini..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedQuestion(null)
                    setAnswer('')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (answer.trim()) {
                      handleAnswerQuestion(selectedQuestion.id, answer.trim())
                    } else {
                      showErrorAlert('Error', 'Jawaban tidak boleh kosong')
                    }
                  }}
                  disabled={!answer.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Kirim Jawaban
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}