"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  author_name: string;
  category: string;
  tags: string[];
  published_at: string;
  reading_time: number;
  views: number;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch main post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (postError) throw postError;

      setPost(postData);

      // Increment views
      if (postData) {
        await supabase
          .from("blog_posts")
          .update({ views: (postData.views || 0) + 1 })
          .eq("id", postData.id);

        // Fetch related posts
        const { data: related } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("category", postData.category)
          .eq("status", "published")
          .neq("id", postData.id)
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, fetchPost]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Artikel Tidak Ditemukan
          </h1>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            ← Kembali ke Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mb-8"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Blog
        </Link>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl"
        >
          <Image
            src={post.image_url || "/assets/placeholder.jpg"}
            alt={post.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
              {post.category}
            </span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
        >
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                {post.author_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {post.author_name || 'Admin'}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {post.reading_time} min baca
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {post.views} views
            </span>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Tags:
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={relatedPost.image_url || "/assets/placeholder.jpg"}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(relatedPost.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </article>
    </div>
  );
}
