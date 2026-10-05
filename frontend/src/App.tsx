import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Type, Menu } from './types';
import { 
  UtensilsCrossed, 
  FolderPlus, 
  PlusCircle, 
  Star, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Database, 
  Check, 
  X,
  Layers,
  Search,
  Tag
} from 'lucide-react';

export default function App() {
  const [types, setTypes] = useState<Type[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'type'>('menu');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states for Type
  const [typeName, setTypeName] = useState<string>('');
  const [isSubmittingType, setIsSubmittingType] = useState<boolean>(false);

  // Form states for Menu
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [menuName, setMenuName] = useState<string>('');
  const [menuPrice, setMenuPrice] = useState<string>('');
  const [menuIsBestSeller, setMenuIsBestSeller] = useState<boolean>(false);
  const [menuTypeId, setMenuTypeId] = useState<string>('');
  const [isSubmittingMenu, setIsSubmittingMenu] = useState<boolean>(false);

  // Status notification message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchTypes = async () => {
    try {
      const res = await axios.get('/api/type');
      setTypes(res.data);
      if (res.data.length > 0 && !menuTypeId) {
        setMenuTypeId(String(res.data[0].typeId));
      }
    } catch (err) {
      console.error('Error loading types:', err);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await axios.get('/api/menu');
      setMenus(res.data);
    } catch (err) {
      console.error('Error loading menus:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchTypes(), fetchMenus()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Type Creation
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    setIsSubmittingType(true);
    try {
      const res = await axios.post('/api/type', { name: typeName });
      showNotification(`เพิ่มชนิด "${res.data.name}" สำเร็จ!`);
      setTypeName('');
      await loadAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มชนิด', 'error');
    } finally {
      setIsSubmittingType(false);
    }
  };

  // Handle Type Deletion
  const handleDeleteType = async (id: number, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบชนิด "${name}"? เมนูทั้งหมดในชนิดนี้จะถูกลบด้วย`)) return;

    try {
      await axios.delete(`/api/type/${id}`);
      showNotification(`ลบชนิด "${name}" สำเร็จ`);
      await loadAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบชนิด', 'error');
    }
  };

  // Handle Menu Submit (Create or Update)
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim() || !menuPrice || !menuTypeId) {
      showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    setIsSubmittingMenu(true);
    try {
      const payload = {
        name: menuName,
        price: parseFloat(menuPrice),
        isBestSeller: menuIsBestSeller,
        typeId: parseInt(menuTypeId, 10),
      };

      if (editingMenuId) {
        await axios.put(`/api/menu/${editingMenuId}`, payload);
        showNotification(`แก้ไขเมนู "${menuName}" เรียบร้อยแล้ว`);
      } else {
        await axios.post('/api/menu', payload);
        showNotification(`เพิ่มเมนู "${menuName}" สำเร็จ!`);
      }

      resetMenuForm();
      await loadAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกเมนู', 'error');
    } finally {
      setIsSubmittingMenu(false);
    }
  };

  const startEditMenu = (item: Menu) => {
    setEditingMenuId(item.menuId);
    setMenuName(item.name);
    setMenuPrice(String(item.price));
    setMenuIsBestSeller(item.isBestSeller);
    setMenuTypeId(String(item.typeId));
    setActiveTab('menu');
  };

  const resetMenuForm = () => {
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuIsBestSeller(false);
    if (types.length > 0) setMenuTypeId(String(types[0].typeId));
  };

  const handleDeleteMenu = async (id: number, name: string) => {
    if (!window.confirm(`คุณต้องการลบเมนู "${name}" หรือไม่?`)) return;

    try {
      await axios.delete(`/api/menu/${id}`);
      showNotification(`ลบเมนู "${name}" สำเร็จ`);
      await loadAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบเมนู', 'error');
    }
  };

  // Filtered menus list
  const filteredMenus = menus.filter((menu) => {
    const matchesType = selectedTypeFilter === 'all' || menu.typeId === selectedTypeFilter;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (menu.type?.name && menu.type.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white shadow-lg py-6 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <UtensilsCrossed className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ระบบจัดการ menu และ type</h1>
              <p className="text-blue-100 text-sm">React + Prisma + MySQL API Management System</p>
            </div>
          </div>
          
          <button 
            onClick={loadAllData} 
            className="self-start md:self-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูล
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        {/* Toast Notification */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-md transition ${
            message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            <span className="font-medium flex items-center gap-2">
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              {message.text}
            </span>
            <button onClick={() => setMessage(null)} className="opacity-80 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Database Schema Visualizer Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-3">
            <Database className="w-5 h-5" />
            <span>โครงสร้างข้อมูลตามโจทย์ (Prisma & MySQL Schema)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Box */}
            <div className="bg-slate-50 border-2 border-indigo-200 rounded-xl p-4">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-3">
                <span className="font-bold text-indigo-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Table: type
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded">/api/type</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-600">
                <li className="font-bold text-indigo-600 underline">typeId (PK)</li>
                <li>name (String)</li>
              </ul>
            </div>

            {/* Menu Box */}
            <div className="bg-slate-50 border-2 border-indigo-200 rounded-xl p-4">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-3">
                <span className="font-bold text-indigo-900 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
                  Table: menu
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded">/api/menu</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-600">
                <li className="font-bold text-indigo-600 underline">menuId (PK)</li>
                <li>name (String)</li>
                <li>price (Float)</li>
                <li>isBestSeller (Boolean)</li>
                <li className="text-emerald-700 font-semibold">typeId (FK ➔ type.typeId)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm rounded-t-xl transition border-b-2 ${
              activeTab === 'menu'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 border-transparent'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            จัดการเมนูอาหาร (menu)
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {menus.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm rounded-t-xl transition border-b-2 ${
              activeTab === 'type'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 border-transparent'
            }`}
          >
            <Tag className="w-4 h-4" />
            จัดการชนิดอาหาร (type)
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {types.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Menu Management */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    {editingMenuId ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <PlusCircle className="w-5 h-5 text-indigo-600" />}
                    {editingMenuId ? 'แก้ไขข้อมูลเมนู' : 'เพิ่มเมนูใหม่ (/api/menu)'}
                  </h2>
                  {editingMenuId && (
                    <button
                      onClick={resetMenuForm}
                      className="text-xs text-slate-500 hover:text-rose-600 underline"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>

                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ชื่อเมนู (name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      placeholder="เช่น ชาไทยเย็น, ผัดไทยกุ้งสด"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ราคา (price) (บาท) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={menuPrice}
                      onChange={(e) => setMenuPrice(e.target.value)}
                      placeholder="เช่น 55.00"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ชนิดอาหาร (typeId) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={menuTypeId}
                      onChange={(e) => setMenuTypeId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      required
                    >
                      {types.length === 0 ? (
                        <option value="">-- กรุณาเพิ่มชนิดอาหารก่อน --</option>
                      ) : (
                        types.map((t) => (
                          <option key={t.typeId} value={t.typeId}>
                            {t.name} (typeId: {t.typeId})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer select-none bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={menuIsBestSeller}
                        onChange={(e) => setMenuIsBestSeller(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        เป็นสินค้าขายดี (isBestSeller)
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingMenu || types.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition text-sm active:scale-98"
                    >
                      {isSubmittingMenu ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : editingMenuId ? (
                        'บันทึกการแก้ไข'
                      ) : (
                        'เพิ่มเมนูอาหาร'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อเมนู..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 whitespace-nowrap">ชนิด:</span>
                    <select
                      value={selectedTypeFilter}
                      onChange={(e) => setSelectedTypeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                    >
                      <option value="all">ทั้งหมด ({menus.length})</option>
                      {types.map((t) => (
                        <option key={t.typeId} value={t.typeId}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Menu Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                        <th className="py-3 px-4">menuId</th>
                        <th className="py-3 px-4">ชื่อเมนู (name)</th>
                        <th className="py-3 px-4">ชนิด (type)</th>
                        <th className="py-3 px-4 text-right">ราคา (price)</th>
                        <th className="py-3 px-4 text-center">Best Seller</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMenus.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                            ไม่พบรายการเมนูอาหาร
                          </td>
                        </tr>
                      ) : (
                        filteredMenus.map((item) => (
                          <tr key={item.menuId} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">
                              #{item.menuId}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {item.name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {item.type?.name || `typeId: ${item.typeId}`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                              ฿{item.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.isBestSeller ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                  ขายดี
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => startEditMenu(item)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMenu(item.menuId, item.name)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Type Management */}
        {activeTab === 'type' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Type Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-6">
                <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <FolderPlus className="w-5 h-5 text-indigo-600" />
                  เพิ่มชนิดอาหาร (/api/type)
                </h2>

                <form onSubmit={handleAddType} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ชื่อชนิดอาหาร (name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="เช่น เครื่องดื่ม, ของหวาน, อาหารจานเดียว"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingType}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition text-sm active:scale-98"
                  >
                    {isSubmittingType ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'เพิ่มชนิดอาหาร'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Type List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">รายการชนิดอาหารทั้งหมด</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                        <th className="py-3 px-4">typeId (PK)</th>
                        <th className="py-3 px-4">ชื่อชนิด (name)</th>
                        <th className="py-3 px-4 text-center">จำนวนเมนูในชนิดนี้</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {types.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                            ยังไม่มีรายการชนิดอาหาร
                          </td>
                        </tr>
                      ) : (
                        types.map((type) => (
                          <tr key={type.typeId} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-mono text-xs text-indigo-600 font-bold">
                              #{type.typeId}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {type.name}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                {type._count?.menus ?? 0} เมนู
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteType(type.typeId, type.name)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
