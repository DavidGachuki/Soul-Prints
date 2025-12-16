import React from 'react';
import { Heart, Compass, MessageCircle, Settings, User } from 'lucide-react';
import { AppView, UserProfile } from '../types';

interface SidebarProps {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    currentUser: UserProfile | null;
    activeChatId: string | null;
}

export const EditorialSidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser }) => {
    const navItems = [
        {
            view: AppView.PROFILE,
            icon: <User size={24} />,
            label: "Profile",
            onClick: () => setCurrentView(AppView.PROFILE)
        },
        {
            view: AppView.DISCOVERY,
            icon: <Compass size={24} />,
            label: "Discover",
            onClick: () => setCurrentView(AppView.DISCOVERY)
        },
        {
            view: AppView.CHAT,
            icon: <MessageCircle size={24} />,
            label: "Messages",
            onClick: () => setCurrentView(AppView.CHAT)
        },
        {
            view: AppView.SETTINGS,
            icon: <Settings size={24} />,
            label: "Settings",
            onClick: () => setCurrentView(AppView.SETTINGS)
        }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 h-full bg-[#FAFAFA] border-r border-editorial flex-col pt-12 pb-8 px-8 fixed md:static">
                {/* Brand */}
                <div className="mb-16">
                    <h1 className="font-serif-display text-3xl font-bold tracking-tight text-warm-text">Soul Prints</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6">
                    <p className="text-xs font-bold tracking-widest text-warm-subtext uppercase mb-6">Navigation</p>

                    <NavItem
                        icon={<User size={20} />}
                        label="Profile"
                        active={currentView === AppView.PROFILE}
                        onClick={() => setCurrentView(AppView.PROFILE)}
                    />

                    <NavItem
                        icon={<Compass size={20} />}
                        label="Discover"
                        active={currentView === AppView.DISCOVERY}
                        onClick={() => setCurrentView(AppView.DISCOVERY)}
                    />

                    <NavItem
                        icon={<MessageCircle size={20} />}
                        label="Messages"
                        active={currentView === AppView.CHAT}
                        onClick={() => setCurrentView(AppView.CHAT)}
                    />

                    <div className="pt-8 space-y-6">
                        <p className="text-xs font-bold tracking-widest text-warm-subtext uppercase mb-6">Settings</p>
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Preferences"
                            active={currentView === AppView.SETTINGS}
                            onClick={() => setCurrentView(AppView.SETTINGS)}
                        />
                    </div>
                </nav>

                {/* User Mini Profile */}
                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-editorial">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {currentUser?.imageUrl ? (
                            <img src={currentUser.imageUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-warm-subtext flex items-center justify-center text-white text-xs">Me</div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-warm-text truncate max-w-[120px]">{currentUser?.name || "Guest"}</p>
                        <p className="text-xs text-warm-subtext">Free Member</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-editorial z-50 flex justify-between items-center px-6 py-4 animate-slide-up">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onClick}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentView === item.view ? 'text-editorial-accent' : 'text-warm-subtext'}`}
                    >
                        {item.icon}
                        <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
                    </button>
                ))}
            </nav>
        </>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 w-full text-left transition-colors duration-200 group ${active ? 'text-editorial-accent' : 'text-warm-subtext hover:text-warm-text'}`}
    >
        <span className={`transition-colors ${active ? 'text-editorial-accent' : 'text-warm-subtext group-hover:text-warm-text'}`}>
            {icon}
        </span>
        <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
    </button>
);
