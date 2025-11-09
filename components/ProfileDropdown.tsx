"use client";

import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateEmail, updateProfile } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";

interface ProfileDropdownProps {
  user: any;
  onClose: () => void;
  logout: () => Promise<void>;
}

export default function ProfileDropdown({
  user,
  onClose,
  logout,
}: ProfileDropdownProps) {
  const { showToast } = useToast();
  const [name, setName] = useState(user.displayName || "");
  const [emailLocal, setEmailLocal] = useState(user.email || "");
  const [billing, setBilling] = useState("");
  const [delivery, setDelivery] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setEmailLocal(data.email || "");
          setBilling(data.billingAddress || "");
          setDelivery(data.deliveryAddress || "");
          setPhotoURL(data.photoURL || user.photoURL || "");
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user?.uid]);

  const handlePhotoUpload = async () => {
    if (!photoFile || !user?.uid) return null;
    const fileRef = ref(storage, `users/${user.uid}/profile.jpg`);
    await uploadBytes(fileRef, photoFile);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user?.uid) return;
    setLoading(true);

    try {
      let uploadedPhotoURL = photoURL;
      if (photoFile) uploadedPhotoURL = await handlePhotoUpload();

      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email: emailLocal,
          billingAddress: billing,
          deliveryAddress: sameAsBilling ? billing : delivery,
          photoURL: uploadedPhotoURL,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      await updateProfile(auth.currentUser!, {
        displayName: name,
        photoURL: uploadedPhotoURL || undefined,
      });

      if (emailLocal && emailLocal !== auth.currentUser?.email) {
        try {
          await updateEmail(auth.currentUser!, emailLocal);
        } catch {
          console.warn("Email update requires re-login.");
        }
      }

      showToast("Profile updated successfully!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to save profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[150] p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border"
            />
          ) : (
            <UserCircleIcon className="w-14 h-14 text-gray-600" />
          )}
          <label className="absolute bottom-0 right-0 bg-black text-white text-xs rounded-full p-1 cursor-pointer hover:bg-gray-800">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            ✏️
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{name || "User"}</p>
          <p className="text-xs text-gray-500 truncate">{emailLocal}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
        />
        <input
          type="email"
          placeholder="Email"
          value={emailLocal}
          onChange={(e) => setEmailLocal(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
        />
        <textarea
          placeholder="Billing Address"
          value={billing}
          onChange={(e) => setBilling(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none h-20"
        />
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
          />
          <label>Same as billing</label>
        </div>
        <textarea
          placeholder="Delivery Address"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
          disabled={sameAsBilling}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none h-20"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-full font-semibold ${
            loading
              ? "bg-gray-300 text-gray-700"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mt-5 border-t border-gray-200 pt-4 flex flex-col gap-2">
        {/* ✅ View Orders Link */}
        <a
          href="/orders"
          onClick={onClose}
          className="w-full text-center border border-gray-300 rounded-full py-2 text-sm font-medium hover:bg-black hover:text-white transition-all"
        >
          🛍️ View My Orders
        </a>

        {/* 🚪 Logout Button */}
        <button
          onClick={async () => {
            await logout();
            onClose();
          }}
          className="w-full border border-gray-300 rounded-full py-2 text-sm hover:bg-gray-50 font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
