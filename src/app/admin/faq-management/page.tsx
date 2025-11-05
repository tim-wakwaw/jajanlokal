"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/OptimizedAuthContext";
import { motion } from "framer-motion";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";

interface FAQItem {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  status: string;
  email: string;
  created_at: string;
  user_id?: string;
}

export default function FAQManagementPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: Cek user session dan role
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔍 DEBUG - User role:", profile?.role);
      console.log("🔍 DEBUG - Session metadata:", session?.user?.user_metadata);
      
      let query = supabase
        .from("faq_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      console.log("🔍 DEBUG - FAQ Query result:", { data, error });
      
      if (error) {
        console.error("❌ RLS Policy Error:", error);
        throw error;
      }
      
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showErrorAlert("Gagal memuat FAQ");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, profile?.role]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (profile?.role !== "admin" && profile?.role !== "super_admin")) {
        router.push("/");
        return;
      }
      fetchFAQs();
    }
  }, [user, profile, authLoading, router, fetchFAQs]);

  const handleAnswer = async (faqId: string, answer: string) => {
    if (!answer.trim()) {
      showErrorAlert("Jawaban tidak boleh kosong");
      return;
    }

    try {
      const { error } = await supabase
        .from("faq_questions")
        .update({ answer: answer.trim(), status: "answered" })
        .eq("id", faqId);

      if (error) throw error;

      await showSuccessAlert("Berhasil!", "Jawaban berhasil disimpan");
      await fetchFAQs();
      setEditingId(null);
      setEditForm({ question: "", answer: "" });
    } catch (error) {
      console.error("Error updating FAQ:", error);
      showErrorAlert("Gagal menjawab FAQ");
    }
  };

  const handleDelete = async (faqId: string) => {
    const confirmed = window.confirm("Hapus FAQ? Pertanyaan dan jawaban akan dihapus permanen.");

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("faq_questions").delete().eq("id", faqId);

      if (error) throw error;
      
      await showSuccessAlert("Berhasil!", "FAQ berhasil dihapus");
      await fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showErrorAlert("Gagal menghapus FAQ");
    }
  };

  const handleReject = async (faqId: string) => {
    const confirmed = window.confirm("Tolak Pertanyaan? Pertanyaan akan ditandai sebagai ditolak.");

    if (!confirmed) return;

    try {
      const { error} = await supabase
        .from("faq_questions")
        .update({ status: "rejected" })
        .eq("id", faqId);

      if (error) throw error;
      
      await showSuccessAlert("Berhasil!", "Pertanyaan ditolak");
      await fetchFAQs();
    } catch (error) {
      console.error("Error rejecting FAQ:", error);
      showErrorAlert("Gagal menolak pertanyaan");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingCount = faqs.filter((f) => f.status === "pending").length;
  const answeredCount = faqs.filter((f) => f.status === "answered").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📝 FAQ Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola pertanyaan dari pengguna
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Pertanyaan</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{faqs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Perlu Dijawab</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Terjawab</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{answeredCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "answered", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${filterStatus === status ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              {status === "all" ? "Semua" : status === "pending" ? "Perlu Dijawab" : status === "answered" ? "Terjawab" : "Ditolak"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${faq.status === "answered" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : faq.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                      {faq.status === "answered" ? "Terjawab" : faq.status === "rejected" ? "Ditolak" : "Pending"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">{faq.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{faq.email} • {new Date(faq.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="flex gap-2">
                  {faq.status === "pending" && <button onClick={() => handleReject(faq.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm">Tolak</button>}
                  <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm">Hapus</button>
                </div>
              </div>

              {editingId === faq.id ? (
                <div className="mt-4 space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <textarea
                    value={editForm.answer}
                    onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tulis jawaban yang jelas dan membantu..."
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleAnswer(faq.id, editForm.answer)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">Simpan Jawaban</button>
                    <button onClick={() => { setEditingId(null); setEditForm({ question: "", answer: "" }); }} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium">Batal</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  {faq.answer ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Jawaban Admin:</p>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{faq.answer}</p>
                      <button onClick={() => { setEditingId(faq.id); setEditForm({ question: faq.question, answer: faq.answer || "" }); }} className="mt-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Edit Jawaban</button>
                    </div>
                  ) : faq.status !== "rejected" ? (
                    <button onClick={() => { setEditingId(faq.id); setEditForm({ question: faq.question, answer: "" }); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">Jawab Pertanyaan</button>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm italic">Pertanyaan ditolak</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Belum Ada FAQ</h3>
              <p className="text-gray-500 dark:text-gray-400">{filterStatus === "all" ? "Belum ada pertanyaan dari pengguna" : `Belum ada FAQ dengan status ${filterStatus}`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
