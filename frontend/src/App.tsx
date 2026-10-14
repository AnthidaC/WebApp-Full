import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Type, Menu } from './types';
import { 
  UtensilsCrossed, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Database, 
  Check, 
  X,
  Search,
  Tag,
  Home as HomeIcon,
  Star,
  LogOut,
  CheckCircle2,
  Sparkles,
  Users,
  ArrowRight,
  LogIn,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Globe,
  Layers,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export default function App() {
  // MAIN MODE:
  // 'portal'     = หน้าแรกของหน้าแรก (Landing page with 2 buttons: "todo full stack 2" and "todo authen")
  // 'fullstack2' = แบบในรูป: ไม่มี role, ไม่มีล็อกอิน แต่แก้ไขได้เลย ลบได้เลย
  // 'authen'     = ระบบที่มี Register ➔ Login ➔ Home (Guest / User / Admin roles)
  const [mainMode, setMainMode] = useState<'portal' | 'fullstack2' | 'authen'>('portal');

  // Selected font: 'prompt' | 'kanit' | 'sarabun'
  const [selectedFont, setSelectedFont] = useState<'prompt' | 'kanit' | 'sarabun'>('prompt');

  // ----------------------------------------------------
  // States for "todo full stack 2" (No Auth, No Roles)
  // ----------------------------------------------------
  const [fs2Tab, setFs2Tab] = useState<'home' | 'menu' | 'type'>('menu');

  // ----------------------------------------------------
  // States for "todo authen" (Register -> Login -> Home with Roles)
  // ----------------------------------------------------
  const [authenPageView, setAuthenPageView] = useState<'register' | 'login' | 'home'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminSubView, setAdminSubView] = useState<'menu' | 'users' | 'type'>('menu');

  // Register Form states
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);

  // Login Form states
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // ----------------------------------------------------
  // Shared Data States (Menus, Types, Users)
  // ----------------------------------------------------
  const [types, setTypes] = useState<Type[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [userList, setUserList] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | 'all'>('all');

  // Menu Form states (Shared between FullStack 2 & Admin)
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [menuName, setMenuName] = useState<string>('');
  const [menuPrice, setMenuPrice] = useState<string>('');
  const [menuIsBestSeller, setMenuIsBestSeller] = useState<boolean>(false);
  const [menuTypeId, setMenuTypeId] = useState<string>('');
  const [isSubmittingMenu, setIsSubmittingMenu] = useState<boolean>(false);

  // Animation flag for bouncing into the first input box
  const [isBouncingInput, setIsBouncingInput] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Type Form states
  const [typeName, setTypeName] = useState<string>('');
  const [isSubmittingType, setIsSubmittingType] = useState<boolean>(false);

  // User ratings dictionary (MenuId -> Rating number 1-5)
  const [ratings, setRatings] = useState<Record<number, number>>({
    1: 3.5,
    2: 4.5,
    3: 3.8,
    4: 4.2,
    5: 3.1,
  });

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all types
  const fetchTypes = async () => {
    try {
      const res = await axios.get('/api/type');
      setTypes(res.data);
      if (res.data.length > 0 && !menuTypeId) {
        setMenuTypeId(String(res.data[0].typeId));
      }
    } catch (err) {
      console.error('Error fetching types:', err);
    }
  };

  // Fetch all menus
  const fetchMenus = async () => {
    try {
      const res = await axios.get('/api/menu');
      setMenus(res.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  // Fetch users for user list
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/auth/users');
      setUserList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchTypes(), fetchMenus(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update default menuTypeId when types load
  useEffect(() => {
    if (types.length > 0 && !menuTypeId) {
      setMenuTypeId(String(types[0].typeId));
    }
  }, [types]);

  // Handle Register Submit (Todo Authen)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    setIsSubmittingReg(true);
    try {
      const res = await axios.post('/api/auth/register', {
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      showToast(`✅ ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบด้วยชื่อ ${res.data.user.username}`, 'success');
      setLoginUsername(regUsername.trim());
      setLoginPassword('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setAuthenPageView('login');
      await fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Handle Login Submit (Todo Authen)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      showToast('กรุณากรอก Username และ Password', 'error');
      return;
    }

    setIsSubmittingLogin(true);
    try {
      const res = await axios.post('/api/auth/login', {
        username: loginUsername.trim(),
        password: loginPassword,
      });

      const user: AuthUser = res.data.user;
      setCurrentUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      showToast(`🎉 เข้าสู่ระบบสำเร็จ! บทบาท: ${user.role.toUpperCase()}`, 'success');
      setAuthenPageView('home');
      setAdminSubView('menu');
      await loadAllData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Username หรือ Password ไม่ถูกต้อง', 'error');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Quick switch role for testing in Todo Authen
  const setRole = (role: 'guest' | 'user' | 'admin') => {
    if (role === 'guest') {
      setCurrentUser(null);
      localStorage.removeItem('auth_user');
      setAuthenPageView('home');
      showToast('🌐 สลับเป็นโหมด: Guest mode (ผู้เยี่ยมชม)', 'info');
    } else if (role === 'user') {
      const u: AuthUser = {
        id: 2,
        username: 'Ann, Dalton',
        email: 'Ann@gmail.com',
        role: 'user'
      };
      setCurrentUser(u);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setAuthenPageView('home');
      showToast('👤 สลับเป็นโหมด: User mode (Ann, Dalton)', 'success');
    } else {
      const u: AuthUser = {
        id: 1,
        username: 'John, Doe',
        email: 'john@gmail.com',
        role: 'admin'
      };
      setCurrentUser(u);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setAuthenPageView('home');
      setAdminSubView('menu');
      showToast('👑 สลับเป็นโหมด: Admin mode (John, Doe)', 'success');
    }
  };

  // Logout from Todo Authen
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_user');
    setAuthenPageView('login');
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Trigger Edit Mode & Bounce data into the first input box
  const startEditMenu = (item: Menu) => {
    setEditingMenuId(item.menuId);
    setMenuName(item.name);
    setMenuPrice(String(item.price));
    setMenuIsBestSeller(item.isBestSeller);
    setMenuTypeId(String(item.typeId));

    if (mainMode === 'fullstack2') {
      setFs2Tab('menu');
    } else {
      setAdminSubView('menu');
    }

    // Trigger bounce/pulse visual cue on the first input box
    setIsBouncingInput(true);
    setTimeout(() => setIsBouncingInput(false), 1400);

    // Focus and select the first input box immediately
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.select();
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);

    showToast(`✏️ ข้อมูล "${item.name}" เด้งไปที่กล่องกรอกแรกแล้ว แก้ไขได้ทันที`, 'info');
  };

  // Reset menu form to initial add state
  const resetMenuForm = () => {
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuIsBestSeller(false);
    if (types.length > 0) {
      setMenuTypeId(String(types[0].typeId));
    }
  };

  // Submit Menu (Add or Update)
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim() || !menuPrice || !menuTypeId) {
      showToast('กรุณากรอกข้อมูลชื่อเมนู ราคา และชนิดอาหารให้ครบถ้วน', 'error');
      nameInputRef.current?.focus();
      return;
    }

    setIsSubmittingMenu(true);
    try {
      const payload = {
        name: menuName.trim(),
        price: parseFloat(menuPrice),
        isBestSeller: menuIsBestSeller,
        typeId: parseInt(menuTypeId, 10),
      };

      if (editingMenuId) {
        // Edit existing menu
        await axios.put(`/api/menu/${editingMenuId}`, payload);
        showToast(`✅ บันทึกการแก้ไขเมนู "${menuName}" สำเร็จ!`, 'success');
      } else {
        // Create new menu
        await axios.post('/api/menu', payload);
        showToast(`✅ เพิ่มเมนู "${menuName}" เข้าสู่ระบบสำเร็จ!`, 'success');
      }

      resetMenuForm();
      await fetchMenus();
      await fetchTypes();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลเมนู', 'error');
    } finally {
      setIsSubmittingMenu(false);
    }
  };

  // Delete Menu
  const handleDeleteMenu = async (id: number, name: string) => {
    if (!window.confirm(`ต้องการลบเมนู "${name}" ออกจากระบบหรือไม่?`)) return;

    try {
      await axios.delete(`/api/menu/${id}`);
      showToast(`🗑️ ลบเมนู "${name}" สำเร็จ`, 'info');
      if (editingMenuId === id) {
        resetMenuForm();
      }
      await fetchMenus();
      await fetchTypes();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบเมนู', 'error');
    }
  };

  // Add Type
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    setIsSubmittingType(true);
    try {
      const res = await axios.post('/api/type', { name: typeName.trim() });
      showToast(`✅ เพิ่มชนิดอาหาร "${res.data.name}" สำเร็จ!`, 'success');
      setTypeName('');
      await fetchTypes();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มชนิดอาหาร', 'error');
    } finally {
      setIsSubmittingType(false);
    }
  };

  // Delete Type
  const handleDeleteType = async (id: number, name: string) => {
    if (!window.confirm(`ต้องการลบชนิด "${name}" หรือไม่?\n(คำเตือน: เมนูทั้งหมดในชนิดนี้จะถูกลบไปด้วย)`)) return;

    try {
      await axios.delete(`/api/type/${id}`);
      showToast(`ลบชนิด "${name}" สำเร็จ`, 'info');
      await loadAllData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบชนิดอาหาร', 'error');
    }
  };

  // Update User Role (Admin permission in Todo Authen)
  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await axios.put(`/api/auth/users/${userId}/role`, { role: newRole });
      showToast(`เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ!`, 'success');
      await fetchUsers();
      if (currentUser && currentUser.id === userId) {
        const updated = { ...currentUser, role: newRole as 'admin' | 'user' };
        setCurrentUser(updated);
        localStorage.setItem('auth_user', JSON.stringify(updated));
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์', 'error');
    }
  };

  // Handle rating change in User mode (Slide 4 right)
  const handleRateMenu = (menuId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [menuId]: rating }));
    showToast(`⭐ อัปเดตคะแนนดาว = ${rating} ดาวเรียบร้อยแล้ว`, 'success');
  };

  // Filtered menus
  const filteredMenus = menus.filter((menu) => {
    const matchesType = selectedTypeFilter === 'all' || menu.typeId === selectedTypeFilter;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (menu.type?.name && menu.type.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Dynamic font class
  const fontClass = selectedFont === 'kanit' ? 'font-kanit' : selectedFont === 'sarabun' ? 'font-sarabun' : 'font-prompt';

  // Determine active role in Todo Authen
  const activeRole: 'admin' | 'user' | 'guest' = currentUser ? currentUser.role : 'guest';

  return (
    <div className={`min-h-screen bg-slate-100/90 text-slate-800 ${fontClass} flex flex-col justify-between`}>
      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR: Portal / Mode Switcher + Font Switcher */}
      {/* ======================================================== */}
      <nav className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Main Mode Navigation (Portal / Fullstack 2 / Authen) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMainMode('portal')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                mainMode === 'portal'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>หน้าแรกหลัก (Portal)</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* ปุ่ม 1: todo full stack 2 */}
            <button
              onClick={() => setMainMode('fullstack2')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                mainMode === 'fullstack2'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="ไม่มี role ไม่มีล็อกอิน แต่แก้ไขได้เลย ลบได้เลย"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>todo full stack 2</span>
            </button>

            {/* ปุ่ม 2: todo authen */}
            <button
              onClick={() => setMainMode('authen')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                mainMode === 'authen'
                  ? 'bg-indigo-500 text-white font-bold shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="ระบบมี Register -> Login -> Home พร้อม 3 Roles"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>todo authen</span>
            </button>
          </div>

          {/* Right Controls: Font Selector & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
              <span className="text-slate-400 px-1.5 hidden sm:inline">Font:</span>
              <button
                onClick={() => setSelectedFont('prompt')}
                className={`px-2 py-0.5 rounded transition ${
                  selectedFont === 'prompt' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Prompt
              </button>
              <button
                onClick={() => setSelectedFont('kanit')}
                className={`px-2 py-0.5 rounded transition ${
                  selectedFont === 'kanit' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kanit
              </button>
              <button
                onClick={() => setSelectedFont('sarabun')}
                className={`px-2 py-0.5 rounded transition ${
                  selectedFont === 'sarabun' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sarabun
              </button>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {toast && (
        <div className="max-w-5xl mx-auto px-4 w-full pt-4">
          <div className={`p-3.5 rounded-xl flex items-center justify-between text-sm shadow-sm transition animate-fade-in ${
            toast.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-sky-600 text-white'
          }`}>
            <span className="flex items-center gap-2 font-medium">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {toast.type === 'error' && <X className="w-4 h-4 shrink-0" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 shrink-0" />}
              {toast.text}
            </span>
            <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 0: หน้าแรกของหน้าแรก (PORTAL LANDING PAGE)           */}
      {/* แยก 2 ปุ่ม: ปุ่มแรก "todo full stack 2" | ปุ่มสอง "todo authen" */}
      {/* ======================================================== */}
      {mainMode === 'portal' && (
        <main className="max-w-5xl mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              Web Application Project
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mt-3 mb-2">
              ระบบจัดการเมนูอาหาร (Full Stack)
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              โปรดเลือกโปรเจกต์งานที่ต้องการใช้งานหรือตรวจงาน:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
            {/* Card 1: todo full stack 2 */}
            <div 
              onClick={() => setMainMode('fullstack2')}
              className="bg-white rounded-3xl border-2 border-sky-300 p-8 shadow-sm hover:shadow-xl hover:border-sky-500 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-sky-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl">
                โหมดดั้งเดิม
              </div>

              <div>
                <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>

                <h2 className="text-2xl font-bold font-serif text-slate-900 group-hover:text-sky-600 transition-colors">
                  todo full stack 2
                </h2>

                <div className="inline-block bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-md my-3 border border-sky-200">
                  ไม่มี role • ไม่มีล็อกอิน • แก้ไขได้เลย ลบได้เลย
                </div>

                <ul className="text-xs text-slate-600 space-y-2 mt-2 font-sans">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>หน้าตาตรงตามภาพสไลด์ 1:</strong> ปุ่ม Home/Menu ด้านซ้าย, กล่อง Our Menu ขอบฟ้า</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>ปุ่มแก้ไขเมนู [แก้ไข]</strong> ข้อมูลเด้งไปกล่องแรก พร้อม Cursor Focus และ Glow Animation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>แก้ในหน้าเดียวกันทันที</strong> ลบและเพิ่มเมนูได้อิสระ ไม่ต้องผ่านหน้าล็อกอิน</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 group-hover:underline flex items-center gap-1">
                  เปิด Todo Full Stack 2
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="bg-sky-500 text-white p-2 rounded-xl group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Card 2: todo authen */}
            <div 
              onClick={() => setMainMode('authen')}
              className="bg-white rounded-3xl border-2 border-indigo-200 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl">
                โหมดมีระบบ Authen
              </div>

              <div>
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <h2 className="text-2xl font-bold font-serif text-slate-900 group-hover:text-indigo-600 transition-colors">
                  todo authen
                </h2>

                <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md my-3 border border-indigo-200">
                  Register ➔ Login ➔ Home (มีครบ 3 Roles)
                </div>

                <ul className="text-xs text-slate-600 space-y-2 mt-2 font-sans">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>หน้าลงทะเบียน (Register)</strong> & เข้าสู่ระบบ (Login) ดีไซน์เรียบง่าย สะอาดตา</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>ครบ 3 Roles:</strong> Guest mode (ดูอย่างเดียว), User mode (ให้คะแนนดาว), Admin mode (จัดการระบบ)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Admin Mode:</strong> มีปุ่ม user/menu สลับไปจัดการบทบาทผู้ใช้ และจัดการเมนูอาหาร</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>มีปุ่มลัดสลับทดสอบ Role ได้ในคลิกเดียว</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                  เปิด Todo Authen
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="bg-indigo-600 text-white p-2 rounded-xl group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* MODE 1: TODO FULL STACK 2                                */}
      {/* เป็นแบบในรูป: ไม่มี role, ไม่มีล็อกอิน แต่แก้ไขได้เลย ลบได้เลย */}
      {/* ======================================================== */}
      {mainMode === 'fullstack2' && (
        <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
          {/* Top Note Banner matching Slide 1 */}
          <div className="bg-[#5eaab7] text-white p-3 rounded-xl mb-6 shadow-xs flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium">
              ปรับแก้งานครั้งก่อน โดยให้เชื่อมต่อฐานข้อมูล ผ่าน backend เพื่อ เพิ่ม ลบ แก้ไขเมนูต่างๆ
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white font-normal hidden sm:inline">
              todo full stack 2 (ไม่มี role / ไม่มีล็อกอิน)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Buttons: [Home] [Menu] (Slide 1) */}
            <aside className="md:col-span-3 flex md:flex-col gap-2.5">
              <button
                onClick={() => setFs2Tab('home')}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition shadow-xs ${
                  fs2Tab === 'home'
                    ? 'bg-[#3b9aa7] text-white font-bold shadow-md'
                    : 'bg-[#5eaab7] hover:bg-[#3b9aa7] text-white'
                }`}
              >
                <span>Home</span>
              </button>

              <button
                onClick={() => setFs2Tab('menu')}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition shadow-xs ${
                  fs2Tab === 'menu'
                    ? 'bg-[#3b9aa7] text-white font-bold shadow-md'
                    : 'bg-[#5eaab7] hover:bg-[#3b9aa7] text-white'
                }`}
              >
                <span>Menu</span>
                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-normal hidden md:inline">
                  {menus.length}
                </span>
              </button>

              <button
                onClick={() => setFs2Tab('type')}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition shadow-xs ${
                  fs2Tab === 'type'
                    ? 'bg-[#3b9aa7] text-white font-bold shadow-md'
                    : 'bg-[#5eaab7] hover:bg-[#3b9aa7] text-white'
                }`}
              >
                <span>Type</span>
                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-normal hidden md:inline">
                  {types.length}
                </span>
              </button>
            </aside>

            {/* Right Card Area */}
            <div className="md:col-span-9">
              {/* TAB 1: MENU (Slide 1: Our Menu + New Food + Edit & Del everywhere) */}
              {fs2Tab === 'menu' && (
                <div className="bg-white rounded-3xl border-2 border-sky-300 p-7 shadow-sm">
                  {/* Our Menu Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
                      <span>Our Menu</span>
                      <span className="text-xs bg-sky-100 text-sky-800 font-sans font-normal px-2.5 py-0.5 rounded-full">
                        {menus.length} รายการ
                      </span>
                    </h2>

                    {/* Filter and search */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ค้นหาชื่อเมนู..."
                          className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      <select
                        value={selectedTypeFilter}
                        onChange={(e) => setSelectedTypeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="all">ทุกชนิด</option>
                        {types.map((t) => (
                          <option key={t.typeId} value={t.typeId}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Menu List: • cake - 35 baht 🏅 [แก้ไข] [Del] */}
                  <div className="mb-8">
                    {loading ? (
                      <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                        กำลังโหลดข้อมูลเมนู...
                      </div>
                    ) : filteredMenus.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีรายการเมนูอาหาร (เพิ่มที่ฟอร์ม New Food ด้านล่างได้เลย)
                      </div>
                    ) : (
                      <ul className="space-y-2.5 text-sm">
                        {filteredMenus.map((item) => {
                          const isBeingEdited = editingMenuId === item.menuId;
                          return (
                            <li
                              key={item.menuId}
                              className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl transition ${
                                isBeingEdited 
                                  ? 'bg-sky-50 border border-sky-300 ring-2 ring-sky-200' 
                                  : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400">•</span>
                                <span className="font-semibold text-slate-800">{item.name}</span>
                                <span className="text-slate-600">- {item.price} baht</span>
                                {item.isBestSeller && (
                                  <span className="text-base" title="สินค้าขายดี">🏅</span>
                                )}
                                {item.type?.name && (
                                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-normal border border-slate-200">
                                    {item.type.name}
                                  </span>
                                )}
                              </div>

                              {/* ปุ่มแก้ไข และ Del ทำงานได้ทันทีโดยไม่ต้องล็อกอิน */}
                              <div className="flex items-center space-x-1.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => startEditMenu(item)}
                                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
                                    isBeingEdited
                                      ? 'bg-amber-500 text-white font-semibold'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 active:scale-95'
                                  }`}
                                  title="กดเพื่อแก้ไขเมนูนี้ (ข้อมูลจะเด้งไปที่กล่องกรอกแรก)"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>แก้ไข</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenu(item.menuId, item.name)}
                                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg border border-slate-300 hover:border-rose-300 font-medium transition flex items-center gap-1 active:scale-95"
                                  title="ลบเมนูนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Del</span>
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Form: New Food (or แก้ไขเมนู) */}
                  <div className={`mt-6 pt-5 border-t-2 rounded-2xl p-4 transition-all duration-300 ${
                    editingMenuId 
                      ? 'border-amber-300 bg-amber-50/40' 
                      : 'border-slate-100 bg-slate-50/70'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">
                          {editingMenuId ? (
                            <span className="text-amber-900 flex items-center gap-1.5">
                              <Edit3 className="w-4 h-4 text-amber-600" />
                              แก้ไขเมนู (Edit Food) #{editingMenuId}
                            </span>
                          ) : (
                            <span>New Food</span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {editingMenuId 
                            ? 'กำลังแก้ไขข้อมูลในหน้าเดียวกัน ข้อมูลถูกดึงลงกล่องกรอกแรกแล้ว' 
                            : 'กรอกข้อมูลเมนูอาหารเพื่อบันทึกผ่าน API ลงฐานข้อมูล'}
                        </p>
                      </div>

                      {editingMenuId && (
                        <button
                          type="button"
                          onClick={resetMenuForm}
                          className="text-xs bg-white text-slate-600 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-slate-300 hover:border-rose-300 transition"
                        >
                          ยกเลิกการแก้ไข
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleMenuSubmit} className="space-y-3 max-w-sm">
                      {/* name : (กล่องกรอกแรก - Bounces on Edit) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <span>name :</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          {isBouncingInput && (
                            <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium animate-pulse">
                              ✨ เด้งข้อมูลมาที่กล่องนี้แล้ว!
                            </span>
                          )}
                        </div>
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={menuName}
                          onChange={(e) => setMenuName(e.target.value)}
                          placeholder="เช่น cake, bread, milk"
                          className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-white transition-all duration-300 ${
                            isBouncingInput 
                              ? 'edit-bounce-highlight border-sky-500 ring-4 ring-sky-300/60 scale-[1.01]' 
                              : editingMenuId 
                              ? 'border-amber-400 focus:ring-2 focus:ring-amber-500/20' 
                              : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                          } focus:outline-none`}
                          required
                        />
                      </div>

                      {/* price : */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          price : <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={menuPrice}
                          onChange={(e) => setMenuPrice(e.target.value)}
                          placeholder="เช่น 35"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      </div>

                      {/* Type Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Type : <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={menuTypeId}
                          onChange={(e) => setMenuTypeId(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          required
                        >
                          {types.length === 0 ? (
                            <option value="">-- ยังไม่มีชนิดอาหาร --</option>
                          ) : (
                            types.map((t) => (
                              <option key={t.typeId} value={t.typeId}>
                                {t.name} (ID: {t.typeId})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Best Seller : */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Best Seller :
                        </label>
                        <select
                          value={menuIsBestSeller ? 'true' : 'false'}
                          onChange={(e) => setMenuIsBestSeller(e.target.value === 'true')}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        >
                          <option value="false">Normal</option>
                          <option value="true">BestSeller 🏅</option>
                        </select>
                      </div>

                      {/* Buttons: Add menu / บันทึกการแก้ไข */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmittingMenu || types.length === 0}
                          className={`px-4 py-2 rounded-xl font-medium text-xs text-white transition flex items-center gap-1 shadow-sm active:scale-98 ${
                            editingMenuId
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300'
                          }`}
                        >
                          {isSubmittingMenu ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : editingMenuId ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>บันทึกการแก้ไข</span>
                            </>
                          ) : (
                            'Add menu'
                          )}
                        </button>

                        {editingMenuId && (
                          <button
                            type="button"
                            onClick={resetMenuForm}
                            className="px-3 py-2 rounded-xl font-medium text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: HOME VIEW (Simple Customer View without Auth) */}
              {fs2Tab === 'home' && (
                <div className="bg-white rounded-3xl border-2 border-sky-300 p-8 shadow-sm">
                  <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Our Menu</h2>
                  <p className="text-xs text-slate-500 mb-6">หน้าร้านแสดงรายการอาหาร (Real-time live view)</p>

                  <ul className="space-y-3 text-sm">
                    {filteredMenus.map((item) => (
                      <li key={item.menuId} className="flex items-center space-x-2 text-slate-800">
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-slate-600">- {item.price} baht</span>
                        {item.isBestSeller && (
                          <span className="text-base" title="สินค้าขายดี">🏅</span>
                        )}
                        {item.type?.name && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-normal border border-slate-200">
                            {item.type.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 3: TYPE (Manage Food Categories) */}
              {fs2Tab === 'type' && (
                <div className="bg-white rounded-3xl border-2 border-sky-300 p-8 shadow-sm">
                  <h2 className="text-xl font-bold font-serif text-slate-900 mb-4">
                    จัดการชนิดอาหาร (Table: type)
                  </h2>

                  <form onSubmit={handleAddType} className="mb-6 flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="เพิ่มชื่อชนิดอาหาร เช่น เครื่องดื่ม, ของหวาน"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingType}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition"
                    >
                      เพิ่ม
                    </button>
                  </form>

                  <div className="overflow-x-auto max-w-md">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                          <th className="py-2 px-3">typeId</th>
                          <th className="py-2 px-3">ชื่อชนิด</th>
                          <th className="py-2 px-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {types.map((type) => (
                          <tr key={type.typeId}>
                            <td className="py-2 px-3 font-mono text-xs">#{type.typeId}</td>
                            <td className="py-2 px-3 font-medium">{type.name}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleDeleteType(type.typeId, type.name)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* MODE 2: TODO AUTHEN                                      */}
      {/* ระบบที่มี Register ➔ Login ➔ Home พร้อม 3 Roles           */}
      {/* ======================================================== */}
      {mainMode === 'authen' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Authen Sub-bar: Flow Stepper + Role Switcher */}
          <div className="bg-slate-800 text-white text-xs py-2 px-4 border-b border-slate-700">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Stepper buttons: Register -> Login -> Home */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-slate-400 font-medium hidden sm:inline">Authen Flow:</span>
                
                <button
                  onClick={() => setAuthenPageView('register')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    authenPageView === 'register' 
                      ? 'bg-purple-600 text-white font-bold' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Register</span>
                </button>

                <ArrowRight className="w-3 h-3 text-slate-500" />

                <button
                  onClick={() => setAuthenPageView('login')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    authenPageView === 'login' 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login</span>
                </button>

                <ArrowRight className="w-3 h-3 text-slate-500" />

                <button
                  onClick={() => setAuthenPageView('home')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    authenPageView === 'home' 
                      ? 'bg-sky-600 text-white font-bold' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  <HomeIcon className="w-3 h-3" />
                  <span>Home</span>
                </button>
              </div>

              {/* Quick Role Switcher (Guest, User, Admin) */}
              <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                <span className="text-amber-400 font-medium px-2">Role:</span>
                
                <button
                  onClick={() => setRole('guest')}
                  className={`px-2 py-0.5 rounded transition ${
                    activeRole === 'guest' 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Guest mode (Slide 4 ซ้าย)"
                >
                  Guest
                </button>

                <button
                  onClick={() => setRole('user')}
                  className={`px-2 py-0.5 rounded transition ${
                    activeRole === 'user' 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="User mode (Slide 4 ขวา: Ann)"
                >
                  User (Ann)
                </button>

                <button
                  onClick={() => setRole('admin')}
                  className={`px-2 py-0.5 rounded transition ${
                    activeRole === 'admin' 
                      ? 'bg-sky-500 text-slate-950 font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Admin mode (Slide 2: John)"
                >
                  Admin (John)
                </button>
              </div>
            </div>
          </div>

          {/* Authen Screen 1: Register Page (Clean Minimalist) */}
          {authenPageView === 'register' && (
            <div className="flex-1 flex items-center justify-center py-12 px-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Register</h2>
                  <p className="text-xs text-slate-500 mt-1">สร้างบัญชีใหม่เพื่อเข้าสู่ระบบ</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="เช่น john, ann"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="เช่น ann@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="ยืนยันรหัสผ่าน"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReg}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
                    >
                      {isSubmittingReg ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Sign Up'}
                    </button>
                  </div>

                  <div className="text-center pt-2 text-xs text-slate-500">
                    <span>Have an Account ? </span>
                    <button
                      type="button"
                      onClick={() => setAuthenPageView('login')}
                      className="text-sky-600 hover:underline font-semibold"
                    >
                      Login Here
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Authen Screen 2: Login Page (Clean Minimalist) */}
          {authenPageView === 'login' && (
            <div className="flex-1 flex items-center justify-center py-12 px-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Login</h2>
                  <p className="text-xs text-slate-500 mt-1">เข้าสู่ระบบเพื่อใช้งาน</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Username หรือ Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="เช่น John หรือ Ann"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="เช่น password"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingLogin}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
                    >
                      {isSubmittingLogin ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'ส่ง'}
                    </button>
                  </div>

                  <div className="text-center pt-2 text-xs text-slate-500">
                    <span>No Account ? </span>
                    <button
                      type="button"
                      onClick={() => setAuthenPageView('register')}
                      className="text-sky-600 hover:underline font-semibold"
                    >
                      Register Here
                    </button>
                  </div>

                  {/* Fast Login options by Role */}
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <div className="text-xs text-slate-400 mb-2">คลิกเลือกบทบาทเพื่อเข้าสู่ระบบทดสอบ:</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 text-xs font-semibold transition"
                      >
                        👑 Admin (John)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('user')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 text-xs font-semibold transition"
                      >
                        👤 User (Ann)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('guest')}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 text-xs font-semibold transition"
                      >
                        🌐 Guest (ไม่ล็อกอิน)
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Authen Screen 3: Home Page (Adapts dynamically by Role: Guest / User / Admin) */}
          {authenPageView === 'home' && (
            <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
              {/* Role 1: Guest Mode (Slide 4 Left) */}
              {activeRole === 'guest' && (
                <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-300 shadow-md overflow-hidden">
                  <div className="bg-[#faecd9] px-6 py-3 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950">
                    <span className="font-semibold text-amber-800">Guest mode</span>
                    <button
                      onClick={() => setAuthenPageView('login')}
                      className="bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-1 rounded-md text-xs font-medium text-slate-700 transition"
                    >
                      Login
                    </button>
                  </div>

                  <div className="p-8">
                    <h2 className="text-2xl font-bold font-serif text-slate-900 mb-6">Our menu</h2>
                    <ul className="space-y-3.5 text-sm">
                      {filteredMenus.map((item, idx) => {
                        const currentRating = ratings[item.menuId] || (3.5 + (idx % 3) * 0.5).toFixed(1);
                        return (
                          <li key={item.menuId} className="flex items-center space-x-2 text-slate-800">
                            <span className="text-slate-400">•</span>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-slate-600">(★ {currentRating} )-</span>
                            <span className="text-slate-700">{item.price} baht</span>
                            {item.isBestSeller && <span className="text-base">🏅</span>}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                      <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full font-medium inline-block border border-emerald-200">
                        * Menu show with real-time data update
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Role 2: User Mode (Slide 4 Right - Ann, Dalton) */}
              {activeRole === 'user' && (
                <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-300 shadow-md overflow-hidden">
                  <div className="bg-[#faecd9] px-6 py-3 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">User mode</span>
                      <span className="text-slate-700 font-medium">หน้าร้านสำหรับสมาชิก</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">{currentUser?.username || 'Ann, Dalton'}</span>
                      <button
                        onClick={handleLogout}
                        className="bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-0.5 rounded text-xs text-slate-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  <div className="p-8">
                    <h2 className="text-2xl font-bold font-serif text-slate-900 mb-6">Our menu</h2>
                    <ul className="space-y-4 text-sm">
                      {filteredMenus.map((item, idx) => {
                        const currentRating = ratings[item.menuId] || (3.5 + (idx % 3) * 0.5);
                        return (
                          <li key={item.menuId} className="flex flex-wrap items-center justify-between gap-2 text-slate-800 pb-2 border-b border-slate-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400">•</span>
                              <span className="font-medium text-slate-900">{item.name}</span>
                              <span className="text-slate-600">(★ {typeof currentRating === 'number' ? currentRating.toFixed(1) : currentRating} )-</span>
                              <span className="text-slate-700">{item.price} baht</span>
                              {item.isBestSeller && <span className="text-base">🏅</span>}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs ml-auto">
                              <span className="bg-[#5ae2b8] text-slate-900 px-2 py-1 rounded text-xs font-medium">
                                Choose rating:
                              </span>
                              <select
                                value={Math.round(Number(currentRating))}
                                onChange={(e) => handleRateMenu(item.menuId, Number(e.target.value))}
                                className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-semibold"
                              >
                                <option value={5}>5</option>
                                <option value={4}>4</option>
                                <option value={3}>3</option>
                                <option value={2}>2</option>
                                <option value={1}>1</option>
                              </select>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                      <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full font-medium inline-block border border-emerald-200">
                        * Menu show with real-time data update
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Role 3: Admin Mode (Slide 2 - John, Doe) */}
              {activeRole === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Side Buttons */}
                  <aside className="md:col-span-3 flex md:flex-col gap-2.5">
                    <button
                      onClick={() => setRole('guest')}
                      className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-medium text-sm bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Home (Guest)</span>
                    </button>

                    <button
                      onClick={() => setAdminSubView('menu')}
                      className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition ${
                        adminSubView === 'menu'
                          ? 'bg-sky-600 text-white shadow-md font-semibold'
                          : 'bg-sky-500 hover:bg-sky-600 text-white'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Menu</span>
                      <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-normal hidden md:inline">
                        {menus.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setAdminSubView('users')}
                      className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition ${
                        adminSubView === 'users'
                          ? 'bg-sky-600 text-white shadow-md font-semibold'
                          : 'bg-sky-500 hover:bg-sky-600 text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>User</span>
                      <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-normal hidden md:inline">
                        {userList.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setAdminSubView('type')}
                      className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition ${
                        adminSubView === 'type'
                          ? 'bg-sky-600 text-white shadow-md font-semibold'
                          : 'bg-sky-500 hover:bg-sky-600 text-white'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span>Type</span>
                      <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-normal hidden md:inline">
                        {types.length}
                      </span>
                    </button>
                  </aside>

                  {/* Main Admin Content */}
                  <div className="md:col-span-9">
                    {adminSubView === 'menu' && (
                      <div className="bg-white rounded-3xl border-2 border-sky-300 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                          <div>
                            <span className="bg-sky-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold mr-2">Admin mode</span>
                            <span className="font-semibold text-slate-800">{currentUser?.username || 'John, Doe'}</span>
                          </div>
                          <button
                            onClick={() => setAdminSubView('users')}
                            className="bg-[#5ae2b8] hover:bg-[#4dd3a9] text-slate-900 font-semibold text-xs px-3.5 py-1.5 rounded-md transition"
                          >
                            user
                          </button>
                        </div>

                        <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">Our Menu</h2>
                        
                        <ul className="space-y-2.5 text-sm mb-6">
                          {filteredMenus.map((item) => (
                            <li key={item.menuId} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400">•</span>
                                <span className="font-semibold text-slate-800">{item.name}</span>
                                <span className="text-slate-600">- {item.price} baht</span>
                                {item.isBestSeller && <span>🏅</span>}
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => startEditMenu(item)}
                                  className="px-2.5 py-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteMenu(item.menuId, item.name)}
                                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 rounded-lg flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Del</span>
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Admin Form */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-2">
                            {editingMenuId ? `แก้ไขเมนู #${editingMenuId}` : 'New Food'}
                          </h3>
                          <form onSubmit={handleMenuSubmit} className="space-y-3 max-w-sm">
                            <div>
                              <label className="text-xs font-semibold text-slate-700 block mb-1">name :</label>
                              <input
                                ref={nameInputRef}
                                type="text"
                                value={menuName}
                                onChange={(e) => setMenuName(e.target.value)}
                                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-white ${
                                  isBouncingInput ? 'edit-bounce-highlight ring-4 ring-sky-300' : 'border-slate-300'
                                }`}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700 block mb-1">price :</label>
                              <input
                                type="number"
                                step="0.5"
                                value={menuPrice}
                                onChange={(e) => setMenuPrice(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700 block mb-1">Type :</label>
                              <select
                                value={menuTypeId}
                                onChange={(e) => setMenuTypeId(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl"
                                required
                              >
                                {types.map(t => (
                                  <option key={t.typeId} value={t.typeId}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700 block mb-1">Best Seller :</label>
                              <select
                                value={menuIsBestSeller ? 'true' : 'false'}
                                onChange={(e) => setMenuIsBestSeller(e.target.value === 'true')}
                                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-xl"
                              >
                                <option value="false">Normal</option>
                                <option value="true">BestSeller 🏅</option>
                              </select>
                            </div>
                            <div className="pt-2 flex gap-2">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
                              >
                                {editingMenuId ? 'บันทึกการแก้ไข' : 'Add menu'}
                              </button>
                              {editingMenuId && (
                                <button
                                  type="button"
                                  onClick={resetMenuForm}
                                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs"
                                >
                                  ยกเลิก
                                </button>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {adminSubView === 'users' && (
                      <div className="bg-white rounded-3xl border-2 border-sky-300 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                          <h2 className="text-2xl font-bold font-serif text-slate-900">User</h2>
                          <button
                            onClick={() => setAdminSubView('menu')}
                            className="bg-[#5ae2b8] hover:bg-[#4dd3a9] text-slate-900 font-semibold text-xs px-3.5 py-1.5 rounded-md transition"
                          >
                            menu
                          </button>
                        </div>

                        <ul className="space-y-3.5 text-sm max-w-md">
                          {userList.map((user) => (
                            <li key={user.id} className="flex items-center justify-between text-slate-800">
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400">•</span>
                                <span className="font-semibold">{user.username}</span>
                                <span className="text-slate-500 text-xs">{user.email}</span>
                              </div>
                              <select
                                value={user.role}
                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {adminSubView === 'type' && (
                      <div className="bg-white rounded-3xl border-2 border-sky-300 p-6 shadow-sm">
                        <h2 className="text-xl font-bold font-serif text-slate-900 mb-4">จัดการชนิดอาหาร</h2>
                        <form onSubmit={handleAddType} className="mb-6 flex gap-2 max-w-md">
                          <input
                            type="text"
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            placeholder="ชื่อชนิดอาหาร"
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                            required
                          />
                          <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">
                            เพิ่ม
                          </button>
                        </form>
                        <table className="w-full text-left text-sm max-w-md">
                          <tbody>
                            {types.map(t => (
                              <tr key={t.typeId} className="border-b">
                                <td className="py-2 text-xs font-mono">#{t.typeId}</td>
                                <td className="py-2 font-medium">{t.name}</td>
                                <td className="py-2 text-right">
                                  <button onClick={() => handleDeleteType(t.typeId, t.name)} className="text-rose-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-400">
          React + TypeScript + Tailwind CSS + Prisma + Express MySQL API
        </div>
      </footer>
    </div>
  );
}
