'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ConfirmModal } from '@/components/confirm-modal'
import { SourcesModal } from '@/components/sources-modal'
import { ArticlesModal } from '@/components/articles-modal'
import { ShareModal } from '@/components/share-modal'
import { ViewsChart } from '@/components/views-chart'
import { AddPostPanel } from '@/components/add-post-panel'

type ModalAction = {
  type: 'publish' | 'unpublish' | 'delete'
  post: Post
} | null

type TimeFrame = '7' | '28' | '90' | 'all'

type AnalyticsData = {
  dailyData: { date: string; views: number; visitors: number; tiago: number; vicente: number }[]
  sources: { referrer: string | null; count: number }[]
  topArticles: { slug: string; title: string; views: number; clicks: number; author: string }[]
  summary: {
    totalViews: number
    uniqueVisitors: number
    blogOverviewViews: number
    totalCtaClicks: number
  }
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [modalAction, setModalAction] = useState<ModalAction>(null)
  const [activeTab, setActiveTab] = useState<'drafts' | 'live'>('live')
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('28')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const [showArticlesModal, setShowArticlesModal] = useState(false)
  const [sharePost, setSharePost] = useState<Post | null>(null)
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false)
  const [showAddPostPanel, setShowAddPostPanel] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check localStorage for analytics exclusion
    setExcludeFromAnalytics(localStorage.getItem('nw_exclude_analytics') === 'true')
  }, [])

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [])

  useEffect(() => {
    if (activeTab === 'live' && user) {
      fetchAnalytics()
    }
  }, [activeTab, timeFrame, user])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin')
    } else {
      setUser(user)
    }
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const days = timeFrame === 'all' ? '365' : timeFrame
      
      const response = await fetch(`/api/analytics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // Set empty analytics on error
        setAnalytics({
          dailyData: [],
          sources: [],
          topArticles: [],
          summary: { totalViews: 0, uniqueVisitors: 0, blogOverviewViews: 0 }
        })
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Set empty analytics on error
      setAnalytics({
        dailyData: [],
        sources: [],
        topArticles: [],
        summary: { totalViews: 0, uniqueVisitors: 0, blogOverviewViews: 0 }
      })
    }
    setAnalyticsLoading(false)
  }

  const handleConfirmAction = async () => {
    if (!modalAction) return

    const { type, post } = modalAction

    if (type === 'publish' || type === 'unpublish') {
      const updates: any = { draft: type === 'unpublish' }
      if (type === 'publish') {
        updates.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', post.id)

      if (!error) {
        fetchPosts()
      }
    } else if (type === 'delete') {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (!error) {
        fetchPosts()
      }
    }

    setModalAction(null)
  }

  const toggleExcludeAnalytics = () => {
    const newValue = !excludeFromAnalytics
    setExcludeFromAnalytics(newValue)
    if (newValue) {
      localStorage.setItem('nw_exclude_analytics', 'true')
    } else {
      localStorage.removeItem('nw_exclude_analytics')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const getModalContent = () => {
    if (!modalAction) return { title: '', message: '', confirmText: '', variant: 'primary' as const }

    const { type, post } = modalAction

    switch (type) {
      case 'publish':
        return {
          title: 'Publish Post',
          message: `Are you sure you want to publish "${post.title}"? It will be visible to everyone.`,
          confirmText: 'Publish',
          variant: 'primary' as const,
        }
      case 'unpublish':
        return {
          title: 'Unpublish Post',
          message: `Are you sure you want to unpublish "${post.title}"? It will no longer be visible to the public.`,
          confirmText: 'Unpublish',
          variant: 'danger' as const,
        }
      case 'delete':
        return {
          title: 'Delete Post',
          message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
          confirmText: 'Delete',
          variant: 'danger' as const,
        }
    }
  }

  const draftPosts = posts.filter(p => p.draft)
  const livePosts = posts.filter(p => !p.draft)

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const modalContent = getModalContent()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-6 px-6">
        <div className="w-full max-w-[1320px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-foreground text-xl font-semibold">Node Wave</span>
            </Link>
            <span className="text-foreground/20">/</span>
            <span className="text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleExcludeAnalytics}
              className={`text-sm transition-colors flex items-center gap-1.5 ${
                excludeFromAnalytics 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={excludeFromAnalytics ? 'Your views are excluded' : 'Your views are being tracked'}
            >
              {excludeFromAnalytics ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
              {excludeFromAnalytics ? 'Excluded' : 'Tracking'}
            </button>
            <span className="text-muted-foreground text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 flex-1 w-full">
        <div className="py-16">
          <div className="mb-8">
            <h1 className="text-foreground text-4xl md:text-5xl font-semibold mb-4">
              Posts
            </h1>
            <p className="text-muted-foreground text-lg">
              {draftPosts.length} drafts, {livePosts.length} published
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'live'
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Live ({livePosts.length})
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'drafts'
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Drafts ({draftPosts.length})
              </button>
            </div>
            <button
              onClick={() => setShowAddPostPanel(true)}
              className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Post
            </button>
          </div>

          {/* Content */}
          {activeTab === 'live' ? (
            <LiveContent
              posts={livePosts}
              analytics={analytics}
              analyticsLoading={analyticsLoading}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
              formatDateShort={formatDateShort}
              onAction={setModalAction}
              onShare={setSharePost}
              onShowSources={() => setShowSourcesModal(true)}
              onShowArticles={() => setShowArticlesModal(true)}
            />
          ) : (
            <DraftsList
              posts={draftPosts}
              onAction={setModalAction}
            />
          )}
        </div>
      </main>

      <footer className="py-8">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to Node Wave
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            View blog
          </Link>
        </div>
      </footer>

      <ConfirmModal
        isOpen={modalAction !== null}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        confirmVariant={modalContent.variant}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalAction(null)}
      />

      <SourcesModal
        isOpen={showSourcesModal}
        sources={analytics?.sources || []}
        onClose={() => setShowSourcesModal(false)}
      />

      <ArticlesModal
        isOpen={showArticlesModal}
        articles={analytics?.topArticles || []}
        onClose={() => setShowArticlesModal(false)}
      />

      <ShareModal
        isOpen={sharePost !== null}
        postSlug={sharePost?.slug || ''}
        postTitle={sharePost?.title || ''}
        onClose={() => setSharePost(null)}
      />

      <AddPostPanel
        isOpen={showAddPostPanel}
        onClose={() => setShowAddPostPanel(false)}
        onPostCreated={() => {
          fetchPosts()
          setActiveTab('drafts')
        }}
      />
    </div>
  )
}

function DraftsList({ 
  posts, 
  onAction,
}: { 
  posts: Post[]
  onAction: (action: ModalAction) => void
}) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No drafts yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, index) => (
        <PostItem 
          key={post.id} 
          post={post} 
          onAction={onAction}
          showDivider={index < posts.length - 1}
        />
      ))}
    </div>
  )
}

function LiveContent({
  posts,
  analytics,
  analyticsLoading,
  timeFrame,
  setTimeFrame,
  formatDateShort,
  onAction,
  onShare,
  onShowSources,
  onShowArticles,
}: {
  posts: Post[]
  analytics: AnalyticsData | null
  analyticsLoading: boolean
  timeFrame: TimeFrame
  setTimeFrame: (tf: TimeFrame) => void
  formatDateShort: (date: string) => string
  onAction: (action: ModalAction) => void
  onShare: (post: Post) => void
  onShowSources: () => void
  onShowArticles: () => void
}) {
  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: '7', label: '7 days' },
    { value: '28', label: '28 days' },
    { value: '90', label: '90 days' },
    { value: 'all', label: 'All time' },
  ]

  return (
    <div className="space-y-8">
      {/* Analytics Section */}
      <div className="space-y-6">
        {/* Time frame selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-medium">Analytics</h2>
          <div className="flex gap-1 bg-foreground/[0.03] rounded-lg p-1">
            {timeFrameOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTimeFrame(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  timeFrame === option.value
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {analyticsLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-1">Total Views</p>
                <p className="text-foreground text-2xl font-semibold">
                  {(analytics?.summary.totalViews ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-1">Unique Visitors</p>
                <p className="text-foreground text-2xl font-semibold">
                  {(analytics?.summary.uniqueVisitors ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-1">Blog Page Views</p>
                <p className="text-foreground text-2xl font-semibold">
                  {(analytics?.summary.blogOverviewViews ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4">
                <p className="text-muted-foreground text-sm mb-1">CTA Clicks</p>
                <p className="text-foreground text-2xl font-semibold">
                  {(analytics?.summary.totalCtaClicks ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Views Chart */}
            <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-6 overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-medium">Views Over Time</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                    <span className="text-muted-foreground">Total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#1e40af' }} />
                    <span className="text-muted-foreground">Tiago</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#991b1b' }} />
                    <span className="text-muted-foreground">Vicente</span>
                  </div>
                </div>
              </div>
              <ViewsChart data={analytics?.dailyData ?? []} formatDateShort={formatDateShort} />
            </div>

            {/* Two column layout for sources and top articles */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Sources */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground font-medium">Top Sources</h3>
                  {(analytics?.sources.length ?? 0) > 5 && (
                    <button
                      onClick={onShowSources}
                      className="text-primary text-sm hover:underline"
                    >
                      Show all
                    </button>
                  )}
                </div>
                {(analytics?.sources.length ?? 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">No traffic data yet</p>
                ) : (
                  <div className="space-y-3">
                    {(analytics?.sources ?? []).slice(0, 5).map((source) => {
                      const totalViews = (analytics?.sources ?? []).reduce((sum, s) => sum + s.count, 0)
                      const percentage = totalViews > 0 ? (source.count / totalViews) * 100 : 0
                      return (
                        <div key={source.referrer || 'direct'} className="relative">
                          <div 
                            className="absolute inset-0 bg-primary/10 rounded"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between py-1.5 px-2">
                            <span className="text-foreground text-sm">
                              {source.referrer || 'Direct'}
                            </span>
                            <span className="text-muted-foreground text-sm tabular-nums">
                              {source.count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Top Articles */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-foreground font-medium">Top Articles</h3>
                  {(analytics?.topArticles.length ?? 0) > 5 && (
                    <button
                      onClick={onShowArticles}
                      className="text-primary text-sm hover:underline"
                    >
                      Show all
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-muted-foreground/50 text-xs">Article</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/50 text-xs">Views</span>
                    <span className="text-muted-foreground/50 text-xs w-14 text-right">CTR</span>
                  </div>
                </div>
                {(analytics?.topArticles.length ?? 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">No articles yet</p>
                ) : (
                  <div className="space-y-3">
                    {(analytics?.topArticles ?? []).slice(0, 5).map((article) => {
                      const maxViews = analytics?.topArticles[0]?.views || 1
                      const percentage = (article.views / maxViews) * 100
                      const ctr = article.views > 0 ? ((article.clicks / article.views) * 100).toFixed(1) : '0.0'
                      const authorColor = article.author === 'Tiago' 
                        ? 'rgba(30, 64, 175, 0.15)' 
                        : article.author === 'Vicente' 
                          ? 'rgba(153, 27, 27, 0.15)' 
                          : 'hsl(var(--primary) / 0.1)'
                      return (
                        <div key={article.slug} className="relative">
                          <div 
                            className="absolute inset-0 rounded"
                            style={{ width: `${percentage}%`, background: authorColor }}
                          />
                          <div className="relative flex items-center justify-between py-1.5 px-2">
                            <div className="flex items-center gap-2 truncate max-w-[55%]">
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0" 
                                style={{ 
                                  background: article.author === 'Tiago' 
                                    ? '#1e40af' 
                                    : article.author === 'Vicente' 
                                      ? '#991b1b' 
                                      : 'hsl(var(--primary))' 
                                }}
                              />
                              <span className="text-foreground text-sm truncate">
                                {article.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground text-sm tabular-nums">
                                {article.views.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground text-sm tabular-nums w-14 text-right">
                                {ctr}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Published Posts Section */}
      <div>
        <h2 className="text-foreground text-lg font-medium mb-4">Published Posts</h2>
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No published posts yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, index) => (
              <PostItem 
                key={post.id} 
                post={post} 
                onAction={onAction}
                onShare={onShare}
                showDivider={index < posts.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PostItem({ 
  post, 
  onAction,
  onShare,
  showDivider,
}: { 
  post: Post
  onAction: (action: ModalAction) => void
  onShare?: (post: Post) => void
  showDivider: boolean
}) {
  return (
    <article>
      <div className="py-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`px-2 py-0.5 text-xs rounded ${
              post.draft
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-primary/20 text-primary'
            }`}
          >
            {post.draft ? 'Draft' : 'Published'}
          </span>
          <span className="text-muted-foreground text-sm">
            {post.reading_time} min read
          </span>
        </div>
        <h2 className="text-foreground text-xl md:text-2xl font-medium mb-2">
          {post.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {post.description}
        </p>
        <p className="text-muted-foreground/50 text-sm mb-4">
          /{post.slug} · Created {new Date(post.created_at).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/preview/${post.slug}`}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-foreground/[0.06] rounded transition-colors"
          >
            Preview
          </Link>
          <Link
            href={`/admin/edit/${post.id}`}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-foreground/[0.06] rounded transition-colors"
          >
            Edit
          </Link>
          {onShare && (
            <button
              onClick={() => onShare(post)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-foreground/[0.06] rounded transition-colors"
            >
              Share
            </button>
          )}
          <button
            onClick={() => onAction({ type: post.draft ? 'publish' : 'unpublish', post })}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              post.draft
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-foreground/[0.06] text-muted-foreground hover:text-foreground'
            }`}
          >
            {post.draft ? 'Publish' : 'Unpublish'}
          </button>
          <button
            onClick={() => onAction({ type: 'delete', post })}
            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {showDivider && (
        <div className="border-b border-foreground/[0.06]" />
      )}
    </article>
  )
}
