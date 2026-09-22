import React, { useState, useId } from 'react';
import { Garment, GarmentCategory, GarmentCondition } from '../types';
import { GARMENT_COLORS, LOCATION_HIERARCHY } from '../data/initialData';
import { X, Upload, Check, MapPin, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGarmentPublished: (newGarment: Garment) => void;
  currentUser: { name: string; email?: string } | null;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onGarmentPublished,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('camisas');
  const [condition, setCondition] = useState<GarmentCondition>('Muy bueno');
  const [size, setSize] = useState('Talla M');
  const [composition, setComposition] = useState('');
  const [description, setDescription] = useState('');

  // Color Palette state
  const [selectedColor, setSelectedColor] = useState(GARMENT_COLORS[2]); // Beige default

  // Progressive Location state: País -> Departamento -> Ciudad -> Barrio -> Dirección
  const [countryIndex, setCountryIndex] = useState(0); // Colombia default
  const [departmentIndex, setDepartmentIndex] = useState(0); // Antioquia
  const [cityIndex, setCityIndex] = useState(0); // Medellín
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Buenos Aires');
  const [streetAddress, setStreetAddress] = useState('Calle 49 #35-12');

  // Photo uploads
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
  ]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentCountry = LOCATION_HIERARCHY[countryIndex];
  const currentDepartment = currentCountry.departments[departmentIndex] || currentCountry.departments[0];
  const currentCity = currentDepartment.cities[cityIndex] || currentDepartment.cities[0];

  const fullLocationQuery = `${streetAddress}, ${selectedNeighborhood}, ${currentCity.name}, ${currentDepartment.name}, ${currentCountry.name}`;

  const handleCountryChange = (idx: number) => {
    setCountryIndex(idx);
    setDepartmentIndex(0);
    setCityIndex(0);
    const firstCity = LOCATION_HIERARCHY[idx].departments[0]?.cities[0];
    if (firstCity) {
      setSelectedNeighborhood(firstCity.neighborhoods[0] || '');
    }
  };

  const handleDepartmentChange = (idx: number) => {
    setDepartmentIndex(idx);
    setCityIndex(0);
    const firstCity = currentCountry.departments[idx]?.cities[0];
    if (firstCity) {
      setSelectedNeighborhood(firstCity.neighborhoods[0] || '');
    }
  };

  const handleCityChange = (idx: number) => {
    setCityIndex(idx);
    const city = currentDepartment.cities[idx];
    if (city) {
      setSelectedNeighborhood(city.neighborhoods[0] || '');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotoUrls([reader.result as string, ...photoUrls]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor completa el título y la descripción de la prenda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newGarment: Garment = {
      id: `garment-${Date.now()}`,
      title: title.trim(),
      category,
      condition,
      size,
      composition: composition.trim() || 'Algodón y fibras mixtas',
      description: description.trim(),
      country: currentCountry.name,
      department: currentDepartment.name,
      city: currentCity.name,
      neighborhood: selectedNeighborhood,
      address: streetAddress,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      photos: photoUrls.length > 0 ? photoUrls : ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80'],
      createdAt: 'Publicado hace unos momentos',
      authorName: currentUser?.name || 'Comunidad Reborn',
      authorEmail: currentUser?.email,
      status: 'disponible',
    };

    try {
      // Send to server
      await fetch('/api/garments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGarment),
      });
    } catch (err) {
      console.warn('Network offline or preview mode, persisting locally', err);
    }

    onGarmentPublished(newGarment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
              Dar una segunda vida
            </span>
            <h2 className="text-xl sm:text-2xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              Publicar una prenda para rescate
            </h2>
          </div>
          <button
            id="btn-close-publish-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#032517] border-b border-[#e6e2dd] pb-2">
              1. Información de la prenda
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                Título o nombre de la prenda *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Trench clásico de gabardina para cortar o entallar"
                className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  <option value="camisas">Camisas</option>
                  <option value="blusas">Blusas</option>
                  <option value="pantalones">Pantalones / Vaqueros</option>
                  <option value="vestidos">Vestidos</option>
                  <option value="faldas">Faldas</option>
                  <option value="chaquetas">Chaquetas / Abrigos</option>
                  <option value="bolsos">Bolsos</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                  Estado actual
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as GarmentCondition)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  <option value="Excelente (Sin uso)">Excelente (Sin uso)</option>
                  <option value="Muy bueno">Muy bueno</option>
                  <option value="Con desgaste">Con desgaste</option>
                  <option value="Con pequeño defecto">Con pequeño defecto</option>
                  <option value="Desgaste para patronaje">Desgaste para patronaje</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                  Talla estimada
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Ej. Talla M / 38"
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1.5">
                Composición del tejido (Opcional)
              </label>
              <input
                type="text"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="Ej. 100% Algodón, Denim rígido, Lino rústico, Lana virgen..."
                className="w-full px-4 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
              />
            </div>
          </div>

          {/* 2. Visual Color Palette Swatches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e6e2dd] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#032517]">
                2. Paleta de Color Visual
              </h3>
              <span className="text-xs font-semibold text-[#486548] flex items-center gap-1.5">
                Seleccionado: <strong>{selectedColor.name}</strong>
              </span>
            </div>
            <p className="text-xs text-[#424843]">
              Selecciona el tono predominante de la prenda para ayudar a modistas a proyectar hilos y forros:
            </p>

            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 pt-2">
              {GARMENT_COLORS.map((color) => {
                const isSelected = selectedColor.id === color.id;
                return (
                  <button
                    type="button"
                    key={color.id}
                    id={`color-swatch-${color.id}`}
                    onClick={() => setSelectedColor(color)}
                    className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#f2ede8] ring-2 ring-[#032517] shadow-sm'
                        : 'hover:bg-[#f8f3ee]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs relative"
                      style={{ background: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            color.id === 'blanco' || color.id === 'crema' || color.id === 'amarillo'
                              ? 'text-[#032517]'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#1d1b19] truncate max-w-[55px]">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Progressive Location Hierarchy: País -> Departamento -> Ciudad -> Barrio -> Dirección */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6e2dd] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#032517] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#486548]" />
                <span>3. Ubicación Progresiva & Mapa</span>
              </h3>
              <span className="text-[11px] text-[#727973]">
                Para modistas de cercanía
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* País */}
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  1. País *
                </label>
                <select
                  value={countryIndex}
                  onChange={(e) => handleCountryChange(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  {LOCATION_HIERARCHY.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento / Comunidad */}
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  2. Departamento / Región *
                </label>
                <select
                  value={departmentIndex}
                  onChange={(e) => handleDepartmentChange(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  {currentCountry.departments.map((d, i) => (
                    <option key={d.name} value={i}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad / Municipio */}
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  3. Ciudad / Municipio *
                </label>
                <select
                  value={cityIndex}
                  onChange={(e) => handleCityChange(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  {currentDepartment.cities.map((city, i) => (
                    <option key={city.name} value={i}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barrio */}
              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  4. Barrio / Sector *
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  {currentCity.neighborhoods.map((nb) => (
                    <option key={nb} value={nb}>
                      {nb}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-semibold text-[#032517] mb-1">
                5. Dirección o punto de referencia *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Ej. Calle 49 #35-12 / Cerca a la estación"
                className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
              />
            </div>

            {/* Interactive Map Preview */}
            <div className="rounded-2xl overflow-hidden border border-[#e6e2dd] bg-[#ece7e2] shadow-inner">
              <div className="bg-[#f8f3ee] px-4 py-2 border-b border-[#e6e2dd] flex items-center justify-between text-[11px] text-[#486548]">
                <span className="font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {fullLocationQuery}
                </span>
                <span className="text-[#727973]">Vista previa de Google Maps</span>
              </div>
              <div className="h-44 w-full relative">
                <iframe
                  title="Ubicación de la prenda"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    fullLocationQuery
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>

          {/* 4. Idea & Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#032517] border-b border-[#e6e2dd] pb-2">
              4. Idea de transformación deseada
            </h3>
            <p className="text-xs text-[#424843]">
              Describe qué imaginas hacer: ¿recortar, transformar en otra prenda, entallar, bordar o dividir en dos piezas?
            </p>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Tengo esta camisa oversize que no uso. Me gustaría cortarla a la cintura, ponerle un dobladillo con elástico fruncido y entallar un poco la espalda..."
              className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white resize-none"
            />
          </div>

          {/* 5. Photos Upload */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#032517] border-b border-[#e6e2dd] pb-2">
              5. Fotografías de la prenda
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e6e2dd] group">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {photoUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#c1c8c2] hover:border-[#032517] bg-[#f8f3ee] flex flex-col items-center justify-center cursor-pointer transition-colors text-[#424843] hover:text-[#032517]">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Subir foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-[#e6e2dd] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-semibold text-[#424843] hover:bg-[#e6e2dd] rounded-full transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-publish-submit"
              className="inline-flex items-center gap-2 px-8 py-3 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar prenda ahora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
