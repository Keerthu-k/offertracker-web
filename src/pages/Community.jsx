import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Users,
    Plus,
    Heart,
    ThumbsUp,
    Flame,
    Star,
    Send,
    UserPlus,
    UserMinus,
    LogIn,
    LogOut,
    Search,
} from 'lucide-react';
import {
    getFeed,
    createPost,
    getMyPosts,
    deletePost,
    reactToPost,
    removeReaction,
    getGroups,
    getMyGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    getFollowStats,
    searchUsers,
    followUser,
    unfollowUser,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const reactionIcons = {
    Like: ThumbsUp,
    Love: Heart,
    Fire: Flame,
    Star: Star,
};

const postTypes = [
    { value: 'Update', label: '📢 Update', color: 'bg-blue-100 text-blue-600' },
    { value: 'Question', label: '❓ Question', color: 'bg-amber-100 text-amber-600' },
    { value: 'Win', label: '🎉 Win', color: 'bg-emerald-100 text-emerald-600' },
    { value: 'Tip', label: '💡 Tip', color: 'bg-violet-100 text-violet-600' },
    { value: 'Vent', label: '😤 Vent', color: 'bg-rose-100 text-rose-600' },
];

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function Community() {
    const { user } = useAuth();
    const [tab, setTab] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showPostModal, setShowPostModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [postForm, setPostForm] = useState({ content: '', post_type: 'Update', group_id: '' });
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    // People tab
    const [peopleQuery, setPeopleQuery] = useState('');
    const [people, setPeople] = useState([]);
    const [followStats, setFollowStats] = useState(null);

    useEffect(() => { load(); }, [tab]);

    async function load() {
        setLoading(true);
        try {
            if (tab === 'feed') {
                const data = await getFeed({ limit: 50 });
                setPosts(data);
            } else if (tab === 'my-posts') {
                const data = await getMyPosts();
                setPosts(data);
            } else if (tab === 'groups') {
                const [all, mine] = await Promise.all([getGroups(), getMyGroups()]);
                setGroups(all);
                setMyGroups(mine);
            } else if (tab === 'people') {
                if (user) {
                    const stats = await getFollowStats(user.id).catch(() => null);
                    setFollowStats(stats);
                }
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }

    async function handleSearchPeople() {
        if (!peopleQuery.trim()) return;
        try {
            const data = await searchUsers(peopleQuery.trim());
            setPeople(data);
        } catch { setPeople([]); }
    }

    async function handleCreatePost(e) {
        e.preventDefault();
        if (!postForm.content.trim()) return;
        setSaving(true);
        try {
            const payload = { content: postForm.content, post_type: postForm.post_type };
            if (postForm.group_id) payload.group_id = postForm.group_id;
            await createPost(payload);
            showToast('Post shared!', 'success');
            setShowPostModal(false);
            setPostForm({ content: '', post_type: 'Update', group_id: '' });
            setTab('feed');
            load();
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    async function handleCreateGroup(e) {
        e.preventDefault();
        if (!groupForm.name.trim()) return;
        setSaving(true);
        try {
            await createGroup(groupForm);
            showToast('Group created!', 'success');
            setShowGroupModal(false);
            setGroupForm({ name: '', description: '' });
            load();
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    async function handleReact(postId, existing) {
        try {
            if (existing) {
                await removeReaction(postId);
            } else {
                await reactToPost(postId, 'Like');
            }
            load();
        } catch { /* empty */ }
    }

    async function handleDeletePost(id) {
        if (!confirm('Delete this post?')) return;
        try {
            await deletePost(id);
            showToast('Deleted', 'success');
            load();
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function handleJoinGroup(id) {
        try { await joinGroup(id); showToast('Joined!', 'success'); load(); }
        catch (err) { showToast(err.message, 'error'); }
    }

    async function handleLeaveGroup(id) {
        try { await leaveGroup(id); showToast('Left group', 'success'); load(); }
        catch (err) { showToast(err.message, 'error'); }
    }

    async function handleFollow(userId) {
        try { await followUser(userId); showToast('Following!', 'success'); handleSearchPeople(); }
        catch (err) { showToast(err.message, 'error'); }
    }

    async function handleUnfollow(userId) {
        try { await unfollowUser(userId); showToast('Unfollowed', 'success'); handleSearchPeople(); }
        catch (err) { showToast(err.message, 'error'); }
    }

    const myGroupIds = new Set(myGroups.map((g) => g.id));

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community</h1>
                    <p className="text-sm text-slate-400 mt-1">Connect, share wins & learn together</p>
                </div>
                <div className="flex gap-2">
                    {tab === 'groups' && (
                        <button className="btn-secondary text-sm" onClick={() => setShowGroupModal(true)}>
                            <Plus size={16} /> New Group
                        </button>
                    )}
                    <button className="btn-primary text-sm" onClick={() => setShowPostModal(true)}>
                        <Send size={16} /> New Post
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                {[
                    ['feed', 'Feed'],
                    ['my-posts', 'My Posts'],
                    ['groups', 'Groups'],
                    ['people', 'People'],
                ].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${key === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Feed / My Posts */}
                    {(tab === 'feed' || tab === 'my-posts') && (
                        posts.length === 0 ? (
                            <EmptyState icon={MessageSquare} title="No posts yet"
                                description={tab === 'feed' ? 'Be the first to share something with the community!' : "You haven't posted anything yet."} />
                        ) : (
                            <div className="space-y-4 max-w-2xl">
                                {posts.map((p) => {
                                    const typeInfo = postTypes.find((t) => t.value === p.post_type) || postTypes[0];
                                    return (
                                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all hover:shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {(p.author?.display_name || p.author?.username || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            {p.author?.display_name || p.author?.username || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-slate-400">{timeAgo(p.created_at)}</div>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{p.content}</p>
                                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                                <button onClick={() => handleReact(p.id, p.user_reaction)}
                                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${p.user_reaction ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                                >
                                                    <ThumbsUp size={14} /> {p.reaction_count || 0}
                                                </button>
                                                {p.author?.id === user?.id && (
                                                    <button onClick={() => handleDeletePost(p.id)}
                                                        className="text-xs text-slate-300 hover:text-red-500 ml-auto transition-colors"
                                                    >Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Groups */}
                    {tab === 'groups' && (
                        groups.length === 0 ? (
                            <EmptyState icon={Users} title="No groups yet" description="Create the first group to start collaborating!" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {groups.map((g) => {
                                    const isMember = myGroupIds.has(g.id);
                                    return (
                                        <div key={g.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {g.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{g.name}</div>
                                                    <div className="text-xs text-slate-400">{g.member_count || 0} members</div>
                                                </div>
                                            </div>
                                            {g.description && (
                                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{g.description}</p>
                                            )}
                                            {isMember ? (
                                                <button onClick={() => handleLeaveGroup(g.id)}
                                                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg py-2 transition-colors"
                                                ><LogOut size={12} /> Leave</button>
                                            ) : (
                                                <button onClick={() => handleJoinGroup(g.id)}
                                                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-2 transition-colors"
                                                ><LogIn size={12} /> Join</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* People */}
                    {tab === 'people' && (
                        <div className="max-w-2xl">
                            {followStats && (
                                <div className="flex gap-6 mb-6">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-900">{followStats.followers_count ?? 0}</div>
                                        <div className="text-xs text-slate-400">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-900">{followStats.following_count ?? 0}</div>
                                        <div className="text-xs text-slate-400">Following</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Search users..." className="pl-9 !rounded-xl"
                                        value={peopleQuery}
                                        onChange={(e) => setPeopleQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchPeople()} />
                                </div>
                                <button className="btn-primary text-sm" onClick={handleSearchPeople}>Search</button>
                            </div>
                            {people.length > 0 ? (
                                <div className="space-y-2">
                                    {people.map((p) => (
                                        <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/80 px-4 py-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                                                {(p.display_name || p.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-900">{p.display_name || p.username}</div>
                                                {p.bio && <div className="text-xs text-slate-400 truncate">{p.bio}</div>}
                                            </div>
                                            {p.id !== user?.id && (
                                                p.is_following ? (
                                                    <button onClick={() => handleUnfollow(p.id)}
                                                        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
                                                    ><UserMinus size={12} /> Unfollow</button>
                                                ) : (
                                                    <button onClick={() => handleFollow(p.id)}
                                                        className="flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 transition-colors"
                                                    ><UserPlus size={12} /> Follow</button>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-10">Search for users to follow them</p>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Post Modal */}
            <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Share with Community" size="md">
                <form onSubmit={handleCreatePost}>
                    <div className="form-group">
                        <label>Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {postTypes.map((t) => (
                                <button key={t.value} type="button"
                                    onClick={() => setPostForm({ ...postForm, post_type: t.value })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${postForm.post_type === t.value ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >{t.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>What's on your mind? *</label>
                        <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                            placeholder="Share an update, ask a question, celebrate a win..." rows={4} required />
                    </div>
                    {myGroups.length > 0 && (
                        <div className="form-group">
                            <label>Post to Group (optional)</label>
                            <select value={postForm.group_id} onChange={(e) => setPostForm({ ...postForm, group_id: e.target.value })}>
                                <option value="">General Feed</option>
                                {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowPostModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Group Modal */}
            <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title="Create Group" size="md">
                <form onSubmit={handleCreateGroup}>
                    <div className="form-group">
                        <label>Group Name *</label>
                        <input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                            placeholder="e.g. Frontend Engineers, Bay Area Job Seekers" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                            placeholder="What's this group about?" rows={3} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowGroupModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
