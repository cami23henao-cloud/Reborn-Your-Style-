import React, { useState } from 'react';
import { User, isModista, isAdmin } from '../types';
import { LOCATION_HIERARCHY } from '../data/initialData';
import { X, Edit3, Save, RotateCcw, LogOut, Trash2, MapPin, Phone, Mail, UserCheck, ShieldCheck, Scissors, User as UserIcon } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [country, setCountry] = useState(user.country || 'Colombia');
  const [department, setDepartment] = useState(user.department || 'Antioquia');
  const [city, setCity] = useState(user.city || 'Medellín');
  const [neighborhood, setNeighborhood] = useState(user.neighborhood || 'Buenos Aires');
  const [address, setAddress] = useState(user.address || 'Calle 49 #35-12');
  const [phone, setPhone] = useState(user.phone || '+57 300 123 4567');
  const [preferencesStr, setPreferencesStr] = useState(user.preferences.join(', '));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCancel = () => {
    setName(user.name);
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
    setCountry(user.country);
    setDepartment(user.department);
    setCity(user.city);
    setNeighborhood(user.neighborhood);
    setAddress(user.address);
    setPhone(user.phone || '');
    setPreferencesStr(user.preferences.join(', '));
    setIsEditing(false);
  };

  const handleSave = () => {
    const updated: User = {
      ...user,
      name: name.trim() || user.name,
      bio: bio.trim(),
      avatar: avatar.trim() || user.avatar,
      country,
      department,
      city,
      neighborhood,
      address,
      phone: phone.trim(),
      preferences: preferencesStr.split(',').map((p) => p.trim()).filter(Boolean),
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
              Cuenta Comunitaria
            </span>
            <h2 className="text-xl sm:text-2xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              Perfil del Usuario
            </h2>
          </div>
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Avatar and Main Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-[#f8f3ee] rounded-2xl border border-[#e6e2dd]">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#486548] shadow-md"
            />
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg font-bold text-[#032517] font-['Bodoni_Moda',serif]">
                  {name}
                </h3>
                {isModista(user.role) ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#caecc6] text-[#032517]">
                    <Scissors className="w-3 h-3" />
                    Modista
                  </span>
                ) : isAdmin(user.role) ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <ShieldCheck className="w-3 h-3" />
                    Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                    <UserIcon className="w-3 h-3" />
                    Usuario
                  </span>
                )}
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#caecc6] text-[#032517]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-xs text-[#486548] font-medium flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <p className="text-[11px] text-[#727973] flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {city}, {neighborhood} ({country})
              </p>
            </div>

            {!isEditing && (
              <button
                id="btn-edit-profile-toggle"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#032517] bg-[#caecc6]/60 hover:bg-[#caecc6] border border-[#aecfab] rounded-full transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar perfil</span>
              </button>
            )}
          </div>

          {/* Form or Display Mode */}
          {isEditing ? (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] border-b border-[#e6e2dd] pb-2">
                Modificar información personal
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    URL de Foto de perfil
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Biografía / Intereses textiles
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] resize-none"
                />
              </div>

              {/* Location hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">País</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">Barrio</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Preferencias textiles (separadas por comas)
                </label>
                <input
                  type="text"
                  value={preferencesStr}
                  onChange={(e) => setPreferencesStr(e.target.value)}
                  placeholder="Upcycling, Sastrería, Bordado visible"
                  className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs"
                />
              </div>

              {/* Action buttons during edit */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  id="btn-cancel-profile-edit"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#424843] hover:bg-[#e6e2dd] rounded-full transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cancelar cambios</span>
                </button>
                <button
                  type="button"
                  id="btn-save-profile-edit"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </div>
          ) : (
            /* Read-Only Profile View */
            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-1.5">
                  Biografía
                </h4>
                <p className="text-xs text-[#424843] leading-relaxed bg-[#f8f3ee] p-4 rounded-xl border border-[#e6e2dd]">
                  {user.bio || 'Sin biografía añadida todavía.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#f8f3ee] p-3.5 rounded-xl border border-[#e6e2dd]">
                  <span className="text-[11px] font-bold text-[#727973] uppercase tracking-wider block">
                    Ubicación guardada
                  </span>
                  <p className="text-xs font-semibold text-[#032517] mt-0.5">
                    {address}, {neighborhood}
                  </p>
                  <p className="text-[11px] text-[#424843]">
                    {city}, {department} ({country})
                  </p>
                </div>

                <div className="bg-[#f8f3ee] p-3.5 rounded-xl border border-[#e6e2dd]">
                  <span className="text-[11px] font-bold text-[#727973] uppercase tracking-wider block">
                    Contacto
                  </span>
                  <p className="text-xs font-semibold text-[#032517] mt-0.5">
                    {phone || 'No especificado'}
                  </p>
                  <p className="text-[11px] text-[#424843]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-2">
                  Técnicas y Preferencias
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.preferences.map((pref, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#caecc6]/50 text-[#032517] border border-[#aecfab] rounded-full text-xs font-semibold"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Management & Security */}
          <div className="pt-6 border-t border-[#e6e2dd] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              id="btn-logout"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#424843] hover:text-[#032517] p-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-700 font-semibold">¿Seguro?</span>
                <button
                  onClick={() => {
                    onDeleteAccount();
                    onClose();
                  }}
                  className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full"
                >
                  Sí, eliminar cuenta
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-xs text-[#424843] hover:bg-[#e6e2dd] rounded-full"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                id="btn-delete-account"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 p-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar cuenta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
