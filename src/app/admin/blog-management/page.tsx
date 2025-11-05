"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/OptimizedAuthContext";
import { motion } from "framer-motion";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author_name: string;
  category: string;
  tags: string[];
  status: string;
  published_at: string | null;
  reading_time: number;
  views: number;
  created_at: string;
}

export default function BlogManagementPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    author_name: "Admin",
    category: "umum",
    tags: [] as string[],
    status: "draft",
    reading_time: 5,
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      showErrorAlert("Gagal memuat blog posts");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (profile?.role !== "admin" && profile?.role !== "super_admin")) {
        router.push("/");
        return;
      }
      fetchPosts();
    }
  }, [user, profile, authLoading, router, fetchPosts]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showErrorAlert("File harus berupa gambar!");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showErrorAlert("Ukuran file maksimal 2MB!");
      return;
    }

    try {
      setUploading(true);

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (error) {
        // If bucket doesn't exist, create it
        if (error.message.includes("not found")) {
          showErrorAlert("Storage bucket belum dibuat. Hubungi admin untuk setup.");
        }
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      showSuccessAlert("Berhasil!", "Gambar berhasil diupload");
    } catch (error) {
      console.error("Error uploading image:", error);
      showErrorAlert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showErrorAlert("Judul dan konten harus diisi");
      return;
    }

    try {
      const slug = generateSlug(formData.title);
      const postData = {
        ...formData,
        slug,
        published_at: formData.status === "published" ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        await showSuccessAlert("Berhasil!", "Blog post berhasil diupdate");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        await showSuccessAlert("Berhasil!", "Blog post berhasil dibuat");
      }

      await fetchPosts();
      resetForm();
    } catch (error) {
      console.error("Error saving post:", error);
      showErrorAlert("Gagal menyimpan blog post");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      author_name: post.author_name,
      category: post.category,
      tags: post.tags || [],
      status: post.status,
      reading_time: post.reading_time,
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm("Hapus blog post? Ini tidak bisa dibatalkan.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      
      await showSuccessAlert("Berhasil!", "Blog post berhasil dihapus");
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      showErrorAlert("Gagal menghapus blog post");
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          status: "published",
          published_at: new Date().toISOString()
        })
        .eq("id", postId);

      if (error) throw error;
      
      await showSuccessAlert("Berhasil!", "Blog post dipublikasikan");
      await fetchPosts();
    } catch (error) {
      console.error("Error publishing post:", error);
      showErrorAlert("Gagal publish blog post");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      author_name: "Admin",
      category: "umum",
      tags: [],
      status: "draft",
      reading_time: 5,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const draftCount = posts.filter((p) => p.status === "draft").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Blog Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola artikel blog untuk platform
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg"
          >
            {showForm ? "Tutup Form" : "Buat Blog Baru"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingPost ? "Edit Blog Post" : "Buat Blog Post Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Judul artikel..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt (Ringkasan Singkat)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ringkasan singkat artikel..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konten (HTML) *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="<h2>Heading</h2><p>Paragraf...</p>"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gambar Cover
                  </label>
                  
                  {/* Upload Section */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                          <div className="text-center">
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                              </>
                            ) : (
                              <>
                                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  📤 Upload gambar (max 2MB)
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">atau pakai URL</span>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://images.unsplash.com/photo-xxx?w=800"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <Image
                          src={formData.image_url}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Penulis
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="umum">Umum</option>
                    <option value="tips-bisnis">Tips Bisnis</option>
                    <option value="marketing">Marketing</option>
                    <option value="teknologi">Teknologi</option>
                    <option value="kuliner">Kuliner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Waktu Baca (menit)
                  </label>
                  <input
                    type="number"
                    value={formData.reading_time}
                    onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  {editingPost ? "Update Post" : "Post Blog"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Posts</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{posts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Draft</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{draftCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Published</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{publishedCount}</p>
          </motion.div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "draft", "published"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${filterStatus === status ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              {status === "all" ? "Semua" : status === "draft" ? "Draft" : "Published"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex gap-6">
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${post.status === "published" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">{post.category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">📖 {post.reading_time} min read</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">👁️ {post.views} views</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{post.excerpt}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ✍️ {post.author_name} • {new Date(post.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(post)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Edit</button>
                  {post.status === "draft" && (
                    <button onClick={() => handlePublish(post.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Publish</button>
                  )}
                  <button onClick={() => handleDelete(post.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Hapus</button>
                </div>
              </div>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Belum Ada Blog Post</h3>
              <p className="text-gray-500 dark:text-gray-400">Klik tombol &quot;Buat Blog Baru&quot; untuk membuat artikel pertama</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
