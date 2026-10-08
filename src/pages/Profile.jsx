import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, User, MapPin, Calendar, Mail, Camera, Save, Check, Loader, LogOut, Info,
} from "lucide-react";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";
import { uploadFile } from "../api/attachments";
import { fullName } from "../lib/format";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    birthdate: user?.birthdate || "",
    address: user?.address || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  useEffect(() => {
    if (!avatarPreview) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      /* Backend ProfileUpdateDto da avatarId ni majburiy deb qabul qiladi
         (null bo'lsa so'rov yiqiladi), shuning uchun eskisini qayta yuboramiz. */
      let avatarId = user?.avatarId || null;
      if (avatarFile) {
        avatarId = (await uploadFile(avatarFile)).id;
      }

      if (!avatarId) {
        setError("Avval profil rasmini tanlang — backend avatarsiz saqlamaydi.");
        return;
      }

      await updateProfile({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        birthdate: form.birthdate || null,
        address: form.address.trim() || null,
        avatarId,
      });

      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Profil saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button type="button" className="back-btn" onClick={() => navigate("/")}>
          <ChevronLeft size={18} /> Orqaga
        </button>

        <h1 className="add-book-title">Profil</h1>

        <form className="profile-card" onSubmit={handleSubmit}>
          <div className="avatar-section">
            <div className="avatar-edit">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Yangi avatar" className="avatar-edit-img" />
              ) : (
                <Avatar profile={user} size={86} />
              )}
              <button
                type="button"
                className="avatar-change-btn"
                onClick={() => fileRef.current?.click()}
                title="Rasmni o'zgartirish"
              >
                <Camera size={15} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  setAvatarFile(event.target.files?.[0] || null);
                  setSaved(false);
                }}
              />
            </div>

            <div className="avatar-info">
              <span className="avatar-name">{fullName(user)}</span>
              <span className="avatar-username">
                <Mail size={13} /> {user?.email}
              </span>
            </div>
          </div>

          <div className="field-row">
            <div className="form-group">
              <label htmlFor="firstname">
                <User size={14} /> Ism
              </label>
              <input
                id="firstname"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="Ismingiz"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">
                <User size={14} /> Familiya
              </label>
              <input
                id="lastname"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Familiyangiz"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="form-group">
              <label htmlFor="birthdate">
                <Calendar size={14} /> Tug'ilgan kun
              </label>
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                value={form.birthdate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <MapPin size={14} /> Manzil
              </label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Shahar, tuman"
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className={`btn-submit ${saved ? "btn-saved" : ""}`} disabled={saving}>
            {saving ? (
              <><Loader size={16} className="spin" /> Saqlanmoqda...</>
            ) : saved ? (
              <><Check size={17} /> Saqlandi</>
            ) : (
              <><Save size={17} /> Saqlash</>
            )}
          </button>

          <p className="notice">
            <Info size={15} />
            <span>
              Email o'zgartirilmaydi — backend ProfileUpdateDto da bu maydon yo'q.
              GET /users/me hozircha tokendagi ma'lumotni qaytargani uchun yangilangan
              profil shu brauzerda saqlanadi.
            </span>
          </p>

          <button type="button" className="btn-logout wide" onClick={logout}>
            <LogOut size={16} /> Hisobdan chiqish
          </button>
        </form>
      </div>
    </div>
  );
}
