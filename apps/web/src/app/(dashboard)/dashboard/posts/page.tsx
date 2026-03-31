'use client';

import { useState } from 'react';
import { usePosts, useCreatePost, useDeletePost } from '@/hooks/queries/use-posts';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PostsPage() {
  const { data, isLoading } = usePosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost.mutateAsync({ title, content: content || undefined });
      setTitle('');
      setContent('');
      setShowForm(false);
      toast.success('Post created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success('Post deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Example CRUD — demonstrates React Query + API integration
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content (optional)"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={createPost.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {createPost.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Post list */}
      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : data?.data?.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map((post: any) => (
            <div
              key={post.id}
              className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{post.title}</h3>
                {post.content && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {post.content}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                  <span>by {post.author?.name || 'Unknown'}</span>
                  <span>{post.published ? '✅ Published' : '📝 Draft'}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(post.id)}
                className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
