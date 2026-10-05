import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Clock, 
  Receipt, 
  Truck, 
  BarChart3, 
  Settings, 
  PauseCircle, 
  DollarSign, 
  PlusCircle, 
  Store,
  Layers,
  Users
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, heldBills, items, user, setUser } = useApp();

  const lowStockCount = items.filter((i) => i.current_stock <= i.min_stock).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: t('nav_dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'items',
      label: t('nav_items'),
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'billing',
      label: t('nav_new_bill'),
      icon: <ShoppingCart className="w-5 h-5 text-emerald-400" />,
      badge: 'POS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'hold_bills',
      label: t('nav_hold_bills'),
      icon: <PauseCircle className="w-5 h-5 text-amber-400" />,
      badge: heldBills.length > 0 ? heldBills.length : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    {
      id: 'bill_history',
      label: t('nav_bill_history'),
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'purchases',
      label: t('nav_purchases'),
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: 'suppliers',
      label: t('nav_suppliers'),
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'expenses',
      label: t('nav_expenses'),
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: t('nav_reports'),
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: t('nav_settings'),
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-900/30 font-bold text-lg">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-100 text-sm tracking-wide truncate">
            {t('app_title')}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {t('shift_active')}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = 
            activeTab === item.id || 
            (item.id === 'items' && activeTab === 'new_item') ||
            (item.id === 'purchases' && (activeTab === 'new_purchase' || activeTab === 'purchase_history'));

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator Session Info / Role Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-xs uppercase">
              {user.display_name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-200 truncate">{user.display_name}</div>
              <div className="text-[10px] text-slate-400">{user.role === 'Admin' ? t('role_admin') : t('role_cashier')}</div>
            </div>
          </div>
          <button
            onClick={() => {
              setUser({
                ...user,
                role: user.role === 'Admin' ? 'Cashier' : 'Admin',
                display_name: user.role === 'Admin' ? 'Murugan Cashier 1' : 'Shop Manager',
              });
            }}
            title={t('switch_role')}
            className="text-[10px] font-medium text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 px-2 py-1 rounded border border-blue-800/50 transition-colors"
          >
            {user.role === 'Admin' ? 'Cashier' : 'Admin'}
          </button>
        </div>
      </div>
    </aside>
  );
};
