import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Shirt,
  Flag,
  Lock,
  LogOut,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  KeyRound,
  Scissors,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { User, Garment, AdminReport, AdminStats } from '../types';

interface AdminPanelProps {
  onBackToSite?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToSite }) => {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Navigation Tab inside Admin Panel
  const [activeTab, setActiveTab] = useState<'resumen' | 'usuarios' | 'prendas' | 'reportes' | 'seguridad'>('resumen');

  // Dashboard Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [garmentsList, setGarmentsList] = useState<Garment[]>([]);
  const [reportsList, setReportsList] = useState<AdminReport[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'todos' | 'normal' | 'confeccionista' | 'bloqueados'>('todos');
  const [garmentSearch, setGarmentSearch] = useState('');
  const [garmentFilter, setGarmentFilter] = useState<'todas' | 'disponibles' | 'ocultas'>('todas');
  const [reportFilter, setReportFilter] = useState<'todos' | 'pendiente' | 'revisado' | 'resuelto'>('todos');

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check saved admin session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('reborn_admin_token');
    if (savedToken) {
      verifyAdminSession(savedToken);
    }
  }, []);

  const verifyAdminSession = async (token: string) => {
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setAdminToken(token);
        setAdminUser(data.user);
        setIsAdminLoggedIn(true);
        fetchAdminData(token);
      } else {
        localStorage.removeItem('reborn_admin_token');
        setIsAdminLoggedIn(false);
      }
    } catch {
      localStorage.removeItem('reborn_admin_token');
      setIsAdminLoggedIn(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('reborn_admin_token', data.token);
        setAdminToken(data.token);
        setAdminUser(data.user);
        setIsAdminLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');
        fetchAdminData(data.token);
      } else {
        setLoginError(data.error || 'Credenciales de administrador no válidas.');
      }
    } catch {
      setLoginError('Error de conexión con el servidor de administración.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {}
    }
    localStorage.removeItem('reborn_admin_token');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
  };

  const fetchAdminData = async (token: string) => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resStats, resUsers, resGarments, resReports] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/garments', { headers }),
        fetch('/api/admin/reports', { headers }),
      ]);

      const [dataStats, dataUsers, dataGarments, dataReports] = await Promise.all([
        resStats.json(),
        resUsers.json(),
        resGarments.json(),
        resReports.json(),
      ]);

      if (resStats.ok) setStats(dataStats);
      if (resUsers.ok && Array.isArray(dataUsers.users)) setUsersList(dataUsers.users);
      if (resGarments.ok && Array.isArray(dataGarments.garments)) setGarmentsList(dataGarments.garments);
      if (resReports.ok && Array.isArray(dataReports.reports)) setReportsList(dataReports.reports);
    } catch {
      setActionMessage({ type: 'error', text: 'Error al sincronizar datos del panel.' });
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  // User Actions: Block / Unblock
  const handleToggleBlockUser = async (user: User) => {
    if (!adminToken) return;
    const confirmText = user.isBlocked
      ? `¿Deseas reactivar la cuenta de ${user.name}?`
      : `¿Estás seguro de bloquear el acceso a ${user.name}? El usuario no podrá iniciar sesión.`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/block`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: data.user.isBlocked, status: data.user.status } : u))
        );
        showNotification('success', data.message);
        if (adminToken) fetchAdminData(adminToken);
      } else {
        showNotification('error', data.error || 'No se pudo actualizar el estado del usuario.');
      }
    } catch {
      showNotification('error', 'Error al procesar bloqueo de usuario.');
    }
  };

  // User Actions: Delete
  const handleDeleteUser = async (user: User) => {
    if (!adminToken) return;
    if (!window.confirm(`ATENCIÓN: ¿Deseas eliminar definitivamente al usuario "${user.name}" (${user.email})? Esta acción es irreversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        showNotification('success', data.message);
        if (adminToken) fetchAdminData(adminToken);
      } else {
        showNotification('error', data.error || 'No se pudo eliminar al usuario.');
      }
    } catch {
      showNotification('error', 'Error al procesar eliminación de usuario.');
    }
  };

  // Garment Actions: Toggle Visibility (Hide / Show)
  const handleToggleGarmentVisibility = async (garment: Garment) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/garments/${garment.id}/toggle-visibility`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGarmentsList((prev) =>
          prev.map((g) => (g.id === garment.id ? { ...g, status: data.garment.status } : g))
        );
        showNotification('success', data.message);
        if (adminToken) fetchAdminData(adminToken);
      } else {
        showNotification('error', data.error || 'No se pudo modificar la visibilidad de la prenda.');
      }
    } catch {
      showNotification('error', 'Error al cambiar visibilidad.');
    }
  };

  // Garment Actions: Delete Garment
  const handleDeleteGarment = async (garment: Garment) => {
    if (!adminToken) return;
    if (!window.confirm(`¿Deseas eliminar la prenda "${garment.title}" del catálogo?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/garments/${garment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGarmentsList((prev) => prev.filter((g) => g.id !== garment.id));
        showNotification('success', data.message);
        if (adminToken) fetchAdminData(adminToken);
      } else {
        showNotification('error', data.error || 'No se pudo eliminar la prenda.');
      }
    } catch {
      showNotification('error', 'Error al eliminar prenda.');
    }
  };

  // Report Actions: Update Status
  const handleUpdateReportStatus = async (reportId: string, status: AdminReport['status']) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReportsList((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
        showNotification('success', `Reporte marcado como ${status}.`);
        if (adminToken) fetchAdminData(adminToken);
      } else {
        showNotification('error', data.error || 'No se pudo actualizar el reporte.');
      }
    } catch {
      showNotification('error', 'Error al procesar el reporte.');
    }
  };

  // Change Admin Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    if (newPassword.length < 8) {
      showNotification('error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', '¡Contraseña de administrador actualizada con éxito! Guarda tu nueva clave.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showNotification('error', data.error || 'Error al actualizar la contraseña.');
      }
    } catch {
      showNotification('error', 'Error de conexión al cambiar contraseña.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.city.toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (userRoleFilter === 'confeccionista') return user.role === 'confeccionista';
    if (userRoleFilter === 'normal') return user.role !== 'confeccionista' && user.role !== 'admin';
    if (userRoleFilter === 'bloqueados') return user.isBlocked || user.status === 'bloqueado';
    return true;
  });

  // Filtered Garments
  const filteredGarments = garmentsList.filter((garment) => {
    const matchesSearch =
      garment.title.toLowerCase().includes(garmentSearch.toLowerCase()) ||
      garment.category.toLowerCase().includes(garmentSearch.toLowerCase()) ||
      (garment.location && garment.location.toLowerCase().includes(garmentSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (garmentFilter === 'disponibles') return garment.status !== 'oculta';
    if (garmentFilter === 'ocultas') return garment.status === 'oculta';
    return true;
  });

  // Filtered Reports
  const filteredReports = reportsList.filter((report) => {
    if (reportFilter === 'todos') return true;
    return report.status === reportFilter;
  });

  // -------------------------------------------------------------
  // VIEW 1: Login Screen (Isolated for Admin)
  // -------------------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d4f30]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E8DCB8]/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Back button */}
          {onBackToSite && (
            <button
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2d4f30] hover:text-[#1e3620] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Reborn Your Style
            </button>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DCB8]/80 p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#032517] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#032517]/20">
                <ShieldAlert className="w-8 h-8 text-[#A3B899]" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#032517]">Panel de Administración</h1>
              <p className="text-xs uppercase tracking-widest text-[#2d4f30] font-semibold mt-1">
                Acceso Exclusivo & Confidencial
              </p>
              <p className="text-sm text-stone-600 mt-2">
                Ingresa tus credenciales autorizadas de administrador para gestionar la plataforma.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{loginError}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Correo Electrónico de Administrador
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@rebornyourstyle.com"
                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] focus:border-transparent bg-stone-50/50 text-stone-900 text-sm placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] focus:border-transparent bg-stone-50/50 text-stone-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#032517] hover:bg-[#1a3825] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Ingresar al Panel de Control</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                Sistema protegido de gestión para <span className="font-semibold text-[#032517]">Reborn Your Style</span>.
                Todas las sesiones son registradas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Dashboard Panel
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-stone-900 font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-[#032517] text-white sticky top-0 z-40 border-b border-[#1f4228] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d4f30] flex items-center justify-center border border-[#486b4c]">
              <ShieldAlert className="w-5 h-5 text-[#A3B899]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-wide text-white">REBORN YOUR STYLE</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2d4f30] text-[#E8DCB8] px-2 py-0.5 rounded-full border border-[#486b4c]/50">
                  Panel Administrador
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-mono hidden sm:block">
                {adminUser?.email || 'admin@rebornyourstyle.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToSite && (
              <button
                onClick={onBackToSite}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Sitio Web</span>
              </button>
            )}
            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-2 text-xs font-medium text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 border-t border-white/5 py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'bg-[#2d4f30] text-[#FDFBF7] shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Métricas & Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-[#2d4f30] text-[#FDFBF7] shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Usuarios ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('prendas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'prendas'
                ? 'bg-[#2d4f30] text-[#FDFBF7] shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Prendas & Catálogo ({garmentsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reportes'
                ? 'bg-[#2d4f30] text-[#FDFBF7] shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Reportes & Moderación ({reportsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'seguridad'
                ? 'bg-[#2d4f30] text-[#FDFBF7] shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Cambiar Contraseña</span>
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border ${
              actionMessage.type === 'success'
                ? 'bg-[#032517] text-white border-[#2d4f30]'
                : 'bg-red-900 text-white border-red-700'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================================== */}
        {/* TAB 1: RESUMEN / DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'resumen' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#032517]">Métricas Generales del Sistema</h2>
              <p className="text-sm text-stone-600 mt-1">
                Monitorea el crecimiento de la comunidad, publicaciones y reportes en tiempo real.
              </p>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Total Usuarios</span>
                  <div className="w-10 h-10 rounded-xl bg-[#2d4f30]/10 text-[#2d4f30] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-[#032517] mt-3">
                  {stats?.totalUsers ?? usersList.length}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-600">
                  <span className="font-semibold text-[#2d4f30]">
                    {stats?.confeccionistasCount ?? usersList.filter((u) => u.role === 'confeccionista').length}
                  </span>{' '}
                  confeccionistas registrados
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Prendas Publicadas</span>
                  <div className="w-10 h-10 rounded-xl bg-[#2d4f30]/10 text-[#2d4f30] flex items-center justify-center">
                    <Shirt className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-[#032517] mt-3">
                  {stats?.totalGarments ?? garmentsList.length}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-600">
                  <span className="font-semibold text-emerald-700">
                    {stats?.activeGarments ?? garmentsList.filter((g) => g.status !== 'oculta').length}
                  </span>{' '}
                  visibles en catálogo
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Reportes Pendientes</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <Flag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-amber-900 mt-3">
                  {stats?.pendingReports ?? reportsList.filter((r) => r.status === 'pendiente').length}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Requieren atención de moderación
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Confeccionistas</span>
                  <div className="w-10 h-10 rounded-xl bg-[#2d4f30]/10 text-[#2d4f30] flex items-center justify-center">
                    <Scissors className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-[#032517] mt-3">
                  {usersList.filter((u) => u.role === 'confeccionista').length}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Talleres y sastres comunitarios
                </p>
              </div>
            </div>

            {/* Quick action blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users preview */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-[#032517]">Últimos Usuarios Registrados</h3>
                  <button
                    onClick={() => setActiveTab('usuarios')}
                    className="text-xs font-semibold uppercase tracking-wider text-[#2d4f30] hover:text-[#1e3620] flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-stone-100">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E8DCB8] text-[#032517] font-semibold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{u.name}</p>
                          <p className="text-xs text-stone-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            u.role === 'confeccionista'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role === 'confeccionista' ? 'Confeccionista' : u.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                        {u.isBlocked && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending reports preview */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCB8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-[#032517]">Reportes Recientes</h3>
                  <button
                    onClick={() => setActiveTab('reportes')}
                    className="text-xs font-semibold uppercase tracking-wider text-[#2d4f30] hover:text-[#1e3620] flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {reportsList.length === 0 ? (
                  <p className="text-sm text-stone-500 py-6 text-center">No hay reportes registrados.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {reportsList.slice(0, 5).map((r) => (
                      <div key={r.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-stone-900">{r.targetTitle}</p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              r.status === 'pendiente'
                                ? 'bg-amber-100 text-amber-800'
                                : r.status === 'resuelto'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-1">{r.reason}: {r.details}</p>
                        <p className="text-[11px] text-stone-400 mt-1">Por: {r.reportedBy} ({r.createdAt})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USUARIOS */}
        {/* ============================================================== */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#032517]">Gestión de Usuarios</h2>
                <p className="text-sm text-stone-600">
                  Visualiza, bloquea o elimina cuentas registradas en el sistema.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] bg-white"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] bg-white font-medium"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="normal">Usuarios normales</option>
                  <option value="confeccionista">Confeccionistas</option>
                  <option value="bloqueados">Bloqueados</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-[#E8DCB8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Ubicación</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                          No se encontraron usuarios coincidentes con los filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E8DCB8] text-[#032517] font-bold flex items-center justify-center text-sm flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-stone-900">{user.name}</p>
                                <p className="text-xs text-stone-500 font-mono">{user.email}</p>
                                {user.phone && <p className="text-[11px] text-stone-400">{user.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                user.role === 'confeccionista'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {user.role === 'confeccionista'
                                ? 'Confeccionista'
                                : user.role === 'admin'
                                ? 'Administrador'
                                : 'Usuario Normal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-600">
                            {user.city || user.department ? `${user.city || ''}, ${user.department || ''}` : 'No registrada'}
                          </td>
                          <td className="px-6 py-4">
                            {user.isBlocked || user.status === 'bloqueado' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                                <Ban className="w-3.5 h-3.5" /> Bloqueado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" /> Activo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user.role === 'admin' || user.email === 'admin@rebornyourstyle.com' ? (
                              <span className="text-xs text-stone-400 italic">Cuenta Principal</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleBlockUser(user)}
                                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                                    user.isBlocked
                                      ? 'text-emerald-700 hover:bg-emerald-50'
                                      : 'text-amber-700 hover:bg-amber-50'
                                  }`}
                                  title={user.isBlocked ? 'Desbloquear cuenta' : 'Bloquear cuenta'}
                                >
                                  {user.isBlocked ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Ban className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar usuario definitivamente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PRENDAS & CATÁLOGO */}
        {/* ============================================================== */}
        {activeTab === 'prendas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#032517]">Gestión de Prendas</h2>
                <p className="text-sm text-stone-600">
                  Modera las prendas publicadas: oculta publicaciones que incumplan normas o elimínalas.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por prenda, tela..."
                    value={garmentSearch}
                    onChange={(e) => setGarmentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] bg-white"
                  />
                </div>

                <select
                  value={garmentFilter}
                  onChange={(e) => setGarmentFilter(e.target.value as any)}
                  className="py-2 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] bg-white font-medium"
                >
                  <option value="todas">Todas las publicaciones</option>
                  <option value="disponibles">Visibles en catálogo</option>
                  <option value="ocultas">Ocultas por moderación</option>
                </select>
              </div>
            </div>

            {/* Garments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGarments.length === 0 ? (
                <div className="col-span-full py-16 text-center text-stone-400 bg-white rounded-2xl border border-[#E8DCB8]">
                  No se encontraron prendas coincidentes con la búsqueda.
                </div>
              ) : (
                filteredGarments.map((garment) => (
                  <div
                    key={garment.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm flex flex-col ${
                      garment.status === 'oculta' ? 'border-amber-300 bg-amber-50/20' : 'border-[#E8DCB8]'
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={garment.image}
                        alt={garment.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        <span className="bg-[#032517]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                          {garment.category}
                        </span>
                        {garment.status === 'oculta' && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                            Oculta
                          </span>
                        )}
                      </div>
                      {garment.color && (
                        <div
                          className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 shadow-sm border border-stone-200"
                        >
                          Color: {garment.color}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#032517] line-clamp-1">
                          {garment.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{garment.description}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                          <span>Estado: <strong>{garment.condition}</strong></span>
                          <span>Ubicación: <strong>{garment.location || 'No especificada'}</strong></span>
                        </div>
                      </div>

                      {/* Moderation Controls */}
                      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleGarmentVisibility(garment)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl border transition-colors ${
                            garment.status === 'oculta'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {garment.status === 'oculta' ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Publicar</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ocultar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteGarment(garment)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                          title="Eliminar prenda definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: REPORTES */}
        {/* ============================================================== */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#032517]">Reportes de la Comunidad</h2>
                <p className="text-sm text-stone-600">
                  Revisa denuncias y reportes enviados por los usuarios de la plataforma.
                </p>
              </div>

              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as any)}
                className="py-2 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] bg-white font-medium"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Solo Pendientes</option>
                <option value="revisado">Revisados</option>
                <option value="resuelto">Resueltos</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="py-16 text-center text-stone-400 bg-white rounded-2xl border border-[#E8DCB8]">
                  No hay reportes que coincidan con el filtro seleccionado.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-[#E8DCB8] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2d4f30] bg-[#2d4f30]/10 px-2.5 py-0.5 rounded-full">
                          {report.targetType}
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#032517]">{report.targetTitle}</h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            report.status === 'pendiente'
                              ? 'bg-amber-100 text-amber-900'
                              : report.status === 'resuelto'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-stone-800 font-medium">Motivo: {report.reason}</p>
                      {report.details && <p className="text-xs text-stone-600">{report.details}</p>}
                      <p className="text-[11px] text-stone-400">
                        Reportado por: <strong>{report.reportedBy}</strong> ({report.reporterEmail}) · {report.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'revisado')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-300 hover:bg-stone-50 text-stone-700"
                      >
                        Marcar Revisado
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'resuelto')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#032517] text-white hover:bg-[#1f4228]"
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'descartado')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-600"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SEGURIDAD & CAMBIAR CONTRASEÑA */}
        {/* ============================================================== */}
        {activeTab === 'seguridad' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#032517]">Seguridad de la Cuenta Administrador</h2>
              <p className="text-sm text-stone-600 mt-1">
                Actualiza la contraseña de acceso confidencial de <span className="font-semibold text-[#032517]">{adminUser?.email}</span>.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DCB8] p-8 shadow-sm">
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Contraseña Actual (Temporal o Vigente)
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Contraseña actual"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres seguros"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d4f30] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#032517] hover:bg-[#1a3825] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando nueva contraseña...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Actualizar Contraseña de Administrador</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
