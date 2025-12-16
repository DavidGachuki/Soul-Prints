import React, { useEffect, useState } from 'react';
import {
    Users, Heart, MessageSquare, Activity, ArrowLeft,
    LayoutDashboard, Shield, FileText, Search, Trash2, Ban, Eye, LogOut,
    Filter, ChevronRight, User as UserIcon, Calendar, Download, RefreshCw,
    TrendingUp, BarChart3, Settings as SettingsIcon, HelpCircle, Edit3, Save, X, RotateCcw
} from 'lucide-react';
import { getAdminStats, getAllUsers, deleteUser, getMessagesForUser } from '../services/databaseService';
import { getQuestionnairePrompts, updateQuestionnairePrompt, seedQuestionnairePrompts, QuestionnairePrompt } from '../services/profileCompletionService';
import { AdminStats, AppView, UserProfile, RecentMessage } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabaseClient';

interface AdminViewProps {
    onBack: () => void;
}

type AdminTab = 'dashboard' | 'analytics' | 'users' | 'content' | 'logs' | 'settings' | 'questions';

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadStats = async () => {
        setIsLoading(true);
        const data = await getAdminStats();
        setStats(data);
        setIsLoading(false);
    };

    const exportToCSV = async (type: 'users' | 'matches' | 'messages') => {
        try {
            let data: any[] = [];
            let filename = '';
            let headers: string[] = [];

            if (type === 'users') {
                const users = await getAllUsers();
                headers = ['ID', 'Name', 'Age', 'Bio', 'Interests', 'Created At'];
                data = users.map(u => [
                    u.id,
                    u.name,
                    u.age,
                    u.bio || '',
                    u.interests?.join('; ') || '',
                    new Date(u.id).toLocaleDateString() // Using ID timestamp as proxy
                ]);
                filename = `soul-prints-users-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (type === 'matches') {
                const { data: matches } = await supabase.from('matches').select('*');
                headers = ['Match ID', 'User 1 ID', 'User 2 ID', 'Created At'];
                data = (matches || []).map(m => [
                    m.id,
                    m.user_id_1,
                    m.user_id_2,
                    new Date(m.created_at).toLocaleString()
                ]);
                filename = `soul-prints-matches-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (type === 'messages') {
                const { data: messages } = await supabase.from('messages').select('*').limit(1000);
                headers = ['Message ID', 'Match ID', 'Sender ID', 'Content', 'Created At', 'AI Generated'];
                data = (messages || []).map(m => [
                    m.id,
                    m.match_id,
                    m.sender_id,
                    m.content?.replace(/"/g, '""') || '', // Escape quotes
                    new Date(m.created_at).toLocaleString(),
                    m.is_ai_generated ? 'Yes' : 'No'
                ]);
                filename = `soul-prints-messages-${new Date().toISOString().split('T')[0]}.csv`;
            }

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const SidebarItem = ({ tab, icon, label }: { tab: AdminTab, icon: React.ReactNode, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1
                ${activeTab === tab
                    ? 'bg-black text-white shadow-lg shadow-black/5 transform scale-102'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
        >
            {icon}
            <span>{label}</span>
            {activeTab === tab && <ChevronRight size={14} className="ml-auto opacity-50" />}
        </button>
    );

    if (isLoading && !stats) {
        return (
            <div className="flex-1 w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 font-medium tracking-wide text-sm uppercase">Loading Dashboard</div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="flex h-full w-full bg-[#FAFAFA] text-gray-900 font-sans selection:bg-black/10">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="p-8 pb-6">
                    <div className="flex items-center gap-3 mb-8 text-black">
                        <Heart className="w-6 h-6 fill-black" />
                        <span className="font-serif-display text-xl font-bold tracking-tight">Soul Prints</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</div>
                    <SidebarItem tab="dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
                    <SidebarItem tab="analytics" icon={<TrendingUp size={18} />} label="Analytics" />
                    <SidebarItem tab="users" icon={<Users size={18} />} label="User Management" />
                    <SidebarItem tab="content" icon={<Shield size={18} />} label="Moderation" />
                    <SidebarItem tab="logs" icon={<FileText size={18} />} label="Audit Logs" />
                    <SidebarItem tab="questions" icon={<HelpCircle size={18} />} label="Questionnaire" />
                    <div className="h-px bg-gray-200 my-4"></div>
                    <SidebarItem tab="settings" icon={<SettingsIcon size={18} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">admin@soulprints.app</p>
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all font-medium text-sm shadow-sm"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-serif-display text-4xl text-gray-900 tracking-tight mb-2">
                                {activeTab === 'dashboard' && 'Dashboard Overview'}
                                {activeTab === 'analytics' && 'Platform Analytics'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'content' && 'Content Moderation'}
                                {activeTab === 'logs' && 'System Audit Logs'}
                                {activeTab === 'questions' && 'Questionnaire Management'}
                                {activeTab === 'settings' && 'Platform Settings'}
                            </h1>
                            <p className="text-gray-500">Welcome back. Here's what's happening today.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                System Operational
                            </span>

                            {/* CSV Export Dropdown */}
                            <div className="relative group">
                                <button className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-black rounded-lg transition-all shadow-sm flex items-center gap-2">
                                    <Download size={18} />
                                    <span className="text-sm font-medium">Export</span>
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <button onClick={() => exportToCSV('users')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <Users size={16} />
                                        Export Users
                                    </button>
                                    <button onClick={() => exportToCSV('matches')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                        <Heart size={16} />
                                        Export Matches
                                    </button>
                                    <button onClick={() => exportToCSV('messages')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 rounded-b-lg">
                                        <MessageSquare size={16} />
                                        Export Messages
                                    </button>
                                </div>
                            </div>

                            <button onClick={loadStats} className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-black rounded-lg transition-all shadow-sm">
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </header>

                    <div className="animate-fade-in-up">
                        {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
                        {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
                        {activeTab === 'users' && <UsersTab />}
                        {activeTab === 'content' && <ContentTab stats={stats} />}
                        {activeTab === 'logs' && <LogsTab stats={stats} />}
                        {activeTab === 'questions' && <QuestionsTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const DashboardTab = ({ stats }: { stats: AdminStats }) => (
    <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                icon={<Users className="text-purple-600" size={24} />}
                label="Total Users"
                value={stats.totalUsers}
                trend="+12%"
                trendUp={true}
                color="bg-purple-50 border-purple-100"
            />
            <StatCard
                icon={<Heart className="text-pink-600" size={24} />}
                label="Total Matches"
                value={stats.totalMatches}
                trend="+5%"
                trendUp={true}
                color="bg-pink-50 border-pink-100"
            />
            <StatCard
                icon={<MessageSquare className="text-blue-600" size={24} />}
                label="Messages Sent"
                value={stats.totalMessages}
                trend="+24%"
                trendUp={true}
                color="bg-blue-50 border-blue-100"
            />
            <StatCard
                icon={<Activity className="text-amber-600" size={24} />}
                label="Soul Analyses"
                value={stats.soulDistribution['Analyzed Souls'] || 0}
                trend="98% Success"
                trendUp={true}
                color="bg-amber-50 border-amber-100"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-gray-900 text-lg">Soul Type Distribution</h3>
                    <button className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                        Last 30 Days <Calendar size={14} />
                    </button>
                </div>
                <div className="space-y-6">
                    {Object.entries(stats.soulDistribution).map(([type, count]) => (
                        <div key={type} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">{type}</span>
                                <span className="text-sm text-gray-500 font-mono">{count}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-black rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(((count || 0) / (stats.totalUsers || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Recent Activity</h3>
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-px h-full bg-gray-100 left-[15px]"></div>
                    <div className="space-y-6 relative">
                        {stats.recentMessages.slice(0, 5).map((msg, i) => (
                            <div key={i} className="flex gap-4 relative">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 z-10">
                                    <div className="w-2 h-2 rounded-full bg-editorial-accent"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        <span className="font-bold">{msg.senderName}</span> sent a message
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="mt-6 w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    View All Activity
                </button>
            </div>
        </div>
    </div>
);

// ============================================
// ANALYTICS TAB - Comprehensive Metrics
// ============================================

const AnalyticsTab = ({ stats }: { stats: AdminStats }) => {
    const [dateRange, setDateRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [userSegment, setUserSegment] = React.useState<'all' | 'active' | 'inactive' | 'high-engagement'>('all');

    // Prepare data for charts
    const engagementData = [
        { name: 'DAU', value: stats.engagement.dau, color: '#8b5cf6' },
        { name: 'MAU', value: stats.engagement.mau, color: '#3b82f6' }
    ];

    const retentionData = [
        { period: '1 Day', rate: stats.retention.retention1Day },
        { period: '7 Days', rate: stats.retention.retention7Day },
        { period: '30 Days', rate: stats.retention.retention30Day }
    ];

    const matchmakingData = [
        { metric: 'Match Success', value: stats.matchmaking.matchSuccessRate },
        { metric: 'Conversation Rate', value: stats.matchmaking.conversationRate },
        { metric: 'Response Rate', value: stats.matchmaking.responseRate || 0 }
    ];

    const contentData = [
        { name: 'Profile Complete', value: stats.content.profileCompletionRate },
        { name: 'Bio Added', value: stats.content.bioCompletionRate },
        { name: 'Soul Analysis', value: stats.content.soulAnalysisCompletionRate }
    ];

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8">
            {/* Filter Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Analytics Filters</h3>
                        <p className="text-sm text-gray-500">Customize your view with date ranges and user segments</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Date Range Filter */}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as any)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        {/* User Segment Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-500" />
                            <select
                                value={userSegment}
                                onChange={(e) => setUserSegment(e.target.value as any)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active Users</option>
                                <option value="inactive">Inactive Users</option>
                                <option value="high-engagement">High Engagement</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Segment Info */}
                {userSegment !== 'all' && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <p className="text-sm text-purple-900">
                            <span className="font-bold">
                                {userSegment === 'active' && 'Active Users: '}
                                {userSegment === 'inactive' && 'Inactive Users: '}
                                {userSegment === 'high-engagement' && 'High Engagement Users: '}
                            </span>
                            {userSegment === 'active' && 'Users who logged in within the last 7 days'}
                            {userSegment === 'inactive' && 'Users who haven\'t logged in for 30+ days'}
                            {userSegment === 'high-engagement' && 'Users with 10+ matches or 50+ messages'}
                        </p>
                    </div>
                )}
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">User Engagement</h3>
                        <p className="text-sm text-gray-500 mt-1">Daily and monthly active users</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                        <TrendingUp size={16} />
                        <span>{stats.engagement.dauMauRatio}% Stickiness</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <MetricCard label="Daily Active Users" value={stats.engagement.dau} icon={<Users size={20} className="text-purple-600" />} />
                        <MetricCard label="Monthly Active Users" value={stats.engagement.mau} icon={<Users size={20} className="text-blue-600" />} />
                        <MetricCard label="Active Conversations" value={stats.engagement.activeConversations} icon={<MessageSquare size={20} className="text-green-600" />} />
                    </div>
                </div>
            </div>

            {/* Retention & Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Retention Rates</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={retentionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{stats.retention.retention7Day}%</div>
                            <div className="text-xs text-gray-500 mt-1">7-Day</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{stats.retention.retention30Day}%</div>
                            <div className="text-xs text-gray-500 mt-1">30-Day</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{stats.retention.churnRate}%</div>
                            <div className="text-xs text-gray-500 mt-1">Churn</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">New Signups</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-600">Today</div>
                                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.retention.newSignupsToday}</div>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Users className="text-purple-600" size={28} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-600">This Week</div>
                                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.retention.newSignupsThisWeek}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-600">This Month</div>
                                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.retention.newSignupsThisMonth}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matchmaking Performance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Matchmaking Performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={matchmakingData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="metric" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-pink-50 rounded-xl">
                            <Heart className="text-pink-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-gray-900">{stats.matchmaking.totalMatches}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Matches</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                            <Activity className="text-green-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-gray-900">{stats.matchmaking.matchesLast24h}</div>
                            <div className="text-sm text-gray-600 mt-1">Last 24h</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <MessageSquare className="text-blue-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-gray-900">{stats.matchmaking.avgMessagesPerMatch}</div>
                            <div className="text-sm text-gray-600 mt-1">Avg Messages</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <TrendingUp className="text-purple-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-gray-900">{stats.matchmaking.conversationRate}%</div>
                            <div className="text-sm text-gray-600 mt-1">Conversation Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Moderation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Content Completion</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={contentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {contentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Avg Photos: <span className="font-bold text-gray-900">{stats.content.avgPhotosPerUser}</span> per user
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Safety & Moderation</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Shield className="text-yellow-600" size={24} />
                                <div>
                                    <div className="font-bold text-gray-900">{stats.moderation.pendingReports}</div>
                                    <div className="text-sm text-gray-600">Pending Reports</div>
                                </div>
                            </div>
                            {stats.moderation.pendingReports > 0 && (
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Action Needed</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Ban className="text-red-600" size={24} />
                                <div>
                                    <div className="font-bold text-gray-900">{stats.moderation.flaggedContent}</div>
                                    <div className="text-sm text-gray-600">Flagged Content</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Eye className="text-green-600" size={24} />
                                <div>
                                    <div className="font-bold text-gray-900">{stats.moderation.verifiedUsers}</div>
                                    <div className="text-sm text-gray-600">Verified Users</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Email: {stats.moderation.emailVerificationRate}%</div>
                                <div className="text-xs text-gray-500">Photo: {stats.moderation.photoVerificationRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for metric cards
const MetricCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
    <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
            {icon}
            <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        <div className="text-sm text-gray-600">{label}</div>
    </div>
);

const UsersTab = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            const success = await deleteUser(id);
            if (success) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.bio && u.bio.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, bio, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all font-medium text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                        <Filter size={18} />
                    </button>
                    <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="p-6 pl-8 font-bold">User Identity</th>
                            <th className="p-6 font-bold">Location & Status</th>
                            <th className="p-6 font-bold">Soul Type</th>
                            <th className="p-6 pr-8 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colspan={4} className="p-12 text-center text-gray-400">Loading users...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-4 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                                            {user.imageUrl ? (
                                                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={24} className="text-gray-400 m-auto mt-3" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.name}, {user.age}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{user.bio || 'No bio available'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-sm text-gray-600">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{user.settings?.discovery.location?.city || 'Unknown Location'}</span>
                                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    {user.soulAnalysis ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-blue-50 text-indigo-700 border border-indigo-100">
                                            Analyzed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User" onClick={() => handleDelete(user.id, user.name)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ContentTab = ({ stats }: { stats: AdminStats }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 text-lg">Recent Media Uploads</h3>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg">All</button>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">Images</button>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">Videos</button>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {stats.recentMedia.map((item, idx) => (
                <div key={idx} className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    {item.type === 'image' ? (
                        <img src={item.url} alt="Upload" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                            <span className="text-xs font-mono mb-2">VIDEO</span>
                            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">▶</div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <button className="p-2.5 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all text-xs font-medium backdrop-blur-md">View</button>
                    </div>
                </div>
            ))}
            {stats.recentMedia.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Shield className="text-gray-300" />
                    </div>
                    No recent media found
                </div>
            )}
        </div>
    </div>
);

const LogsTab = ({ stats }: { stats: AdminStats }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<RecentMessage[]>(stats.recentMessages);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        // Load users for the filter dropdown
        const fetchUsers = async () => {
            const data = await getAllUsers();
            setUsers(data);
        };
        fetchUsers();
    }, []);

    const handleUserSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUser(userId);

        if (userId === 'all') {
            setMessages(stats.recentMessages);
        } else {
            setLoadingLogs(true);
            const userMsgs = await getMessagesForUser(userId);
            setMessages(userMsgs);
            setLoadingLogs(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6">
            {/* Main Log Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
                    <h3 className="font-bold text-gray-900">Message Audit Log</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer"
                                onChange={handleUserSelect}
                                value={selectedUser || 'all'}
                            >
                                <option value="all">Global Feed (Recent)</option>
                                <option disabled>--- Select User ---</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="rotate-90 text-gray-400" size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loadingLogs ? (
                        <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">Fetching history...</div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                            <p>No messages found for this criteria.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden text-xs flex items-center justify-center font-bold text-gray-500">
                                            {msg.senderAvatar ? <img src={msg.senderAvatar} className="w-full h-full object-cover" /> : msg.senderName[0]}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm text-gray-900 block">{msg.senderName}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{msg.id}</span>
                                        </div>
                                        {msg.isAiGenerated && (
                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">AI Bot</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 tabular-nums">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="pl-11">
                                    <div className="text-sm text-gray-700 leading-relaxed max-w-3xl">
                                        {msg.type === 'text' ? (
                                            msg.text
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 w-fit">
                                                {msg.type === 'image' ? (
                                                    <><Eye size={14} /> <span>Image Attachment</span></>
                                                ) : (
                                                    <><Activity size={14} /> <span>Video Attachment</span></>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================
// SETTINGS TAB - Platform Configuration
// ============================================

const SettingsTab = () => {
    const [matchingSettings, setMatchingSettings] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await supabase
                .from('platform_settings')
                .select('setting_value')
                .eq('setting_key', 'matching_mode')
                .single();

            setMatchingSettings(data?.setting_value || { ai_enabled: true, fallback_to_custom: true });
        } catch (error) {
            console.error('Error loading settings:', error);
            setMatchingSettings({ ai_enabled: true, fallback_to_custom: true });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('platform_settings')
                .update({
                    setting_value: matchingSettings,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', 'matching_mode');

            if (error) throw error;
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Matching Mode Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Matching Engine</h3>
                        <p className="text-sm text-gray-500">Configure how users are matched on the platform</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-medium text-sm ${matchingSettings?.ai_enabled
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {matchingSettings?.ai_enabled ? '🤖 AI Mode' : '🎯 Custom Mode'}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* AI Matching Toggle */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="text-purple-600" size={24} />
                                <h4 className="font-bold text-gray-900">AI-Powered Matching</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                                Use advanced AI algorithms to analyze user profiles, interests, and compatibility for intelligent matching
                            </p>
                        </div>
                        <button
                            onClick={() => setMatchingSettings({ ...matchingSettings, ai_enabled: !matchingSettings.ai_enabled })}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ml-6 ${matchingSettings?.ai_enabled ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${matchingSettings?.ai_enabled ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Custom Matching Info */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="text-blue-600" size={24} />
                                <h4 className="font-bold text-gray-900">Smart Custom Matching</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                Proximity-based matching using location, shared interests, age compatibility, and activity levels
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">📍 Location (30%)</span>
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">🎯 Interests (25%)</span>
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">👥 Age (15%)</span>
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">✅ Profile (15%)</span>
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">⚡ Activity (15%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Fallback Option */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">Fallback to Custom Matching</h4>
                            <p className="text-sm text-gray-600">Automatically use custom matching if AI service fails</p>
                        </div>
                        <button
                            onClick={() => setMatchingSettings({ ...matchingSettings, fallback_to_custom: !matchingSettings.fallback_to_custom })}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${matchingSettings?.fallback_to_custom ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${matchingSettings?.fallback_to_custom ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Changes will affect all future matches. Existing matches remain unchanged.
                    </p>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Matching Statistics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Matching Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-purple-50 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
                        <div className="text-sm text-gray-600">AI Matches (Coming Soon)</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
                        <div className="text-sm text-gray-600">Custom Matches (Coming Soon)</div>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl">
                        <div className="text-3xl font-bold text-green-600 mb-2">--</div>
                        <div className="text-sm text-gray-600">Success Rate (Coming Soon)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, trendUp, color }: any) => (
    <div className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 duration-300 ${color} bg-white shadow-sm`}>
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-black/5">
                {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend}
            </span>
        </div>
        <div>
            <span className="text-3xl font-serif-display text-gray-900 tracking-tight block mb-1">{value}</span>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    </div>
);

const QuestionsTab = () => {
    const [prompts, setPrompts] = useState<QuestionnairePrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<QuestionnairePrompt>>({});

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        setLoading(true);
        const data = await getQuestionnairePrompts();
        setPrompts(data);
        setLoading(false);
    };

    const handleEdit = (prompt: QuestionnairePrompt) => {
        setEditingId(prompt.id);
        setEditForm({
            questionText: prompt.questionText,
            weight: prompt.weight
        });
    };

    const handleSave = async (id: string) => {
        const success = await updateQuestionnairePrompt(id, editForm);
        if (success) {
            setEditingId(null);
            loadPrompts();
        } else {
            alert('Failed to update question');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSeed = async () => {
        if (confirm('This will reset/add the default 13 questions. Continue?')) {
            const success = await seedQuestionnairePrompts();
            if (success) {
                loadPrompts();
                alert('Questions seeded successfully!');
            } else {
                alert('Failed to seed questions.');
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Questionnaire Management</h3>
                    <p className="text-sm text-gray-500">Edit the 13 core compatibility questions</p>
                </div>
                <div className="flex gap-2">
                    {prompts.length === 0 && (
                        <button
                            onClick={handleSeed}
                            className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                            <RotateCcw size={14} />
                            Seed Defaults
                        </button>
                    )}
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {prompts.length} Questions
                    </span>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading questions...</div>
                ) : (
                    prompts.map((prompt) => (
                        <div key={prompt.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                            {editingId === prompt.id ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                        <input
                                            type="text"
                                            value={editForm.questionText || ''}
                                            onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (0-100)</label>
                                            <input
                                                type="number"
                                                value={editForm.weight || 0}
                                                onChange={(e) => setEditForm({ ...editForm, weight: parseInt(e.target.value) })}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                            />
                                        </div>
                                        <div className="flex-1 pt-6 text-sm text-gray-500">
                                            Type: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{prompt.questionType}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSave(prompt.id)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                                        >
                                            <Save size={16} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider rounded">
                                                {prompt.section}
                                            </span>
                                            <span className="text-gray-400 text-xs">#{prompt.questionOrder}</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 text-lg">{prompt.questionText}</h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Activity size={14} />
                                                Weight: {prompt.weight}%
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HelpCircle size={14} />
                                                {prompt.questionType}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(prompt)}
                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

