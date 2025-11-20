import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import CarImage from "../assets/Car.png";
import toast from "react-hot-toast";

export default function LotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [slots, setSlots] = useState([]);
  const [lotName, setLotName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("LotDetail mounted - User:", user);
    console.log("User role:", user?.role);
    console.log("Token exists:", !!localStorage.getItem('token'));
  }, []);
  
  useEffect(() => {
    console.log("Selected Slot:", selectedSlot);
  }, [selectedSlot]);
  
  useEffect(() => {
    console.log("User changed:", user);
  }, [user]);

  const isOccupiedStatus = (s) => String(s || "").toUpperCase() === "OCCUPIED";

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const slotsRes = await api.get(`/slots/lot/${id}`);
        const slotsData = Array.isArray(slotsRes.data)
          ? slotsRes.data
          : slotsRes.data.slots || [];

        if (mounted) {
          setSlots(slotsData);
          setLotName(slotsRes.data.lotName || "Parking Lot");
        }
      } catch (err) {
        console.error("Failed loading lot/slots", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    // Real-time slot updates via WebSocket
    const socket = io("http://localhost:5000");
    socket.on("slot-updated", (payload) => {
      if (!payload || payload.lotId !== id) return;
      // Update specific slot status in real-time
      setSlots((prev) =>
        prev.map((s) => (s._id === payload.slotId ? { ...s, status: payload.status } : s))
      );

      // Clear selection if selected slot becomes occupied
      if (selectedSlot && payload.slotId === selectedSlot._id && isOccupiedStatus(payload.status)) {
        setSelectedSlot(null);
      }
    });

    // Cleanup: prevent memory leaks and close socket connection
    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [id]);

  const onSlotClick = (slot) => {
    if (isOccupiedStatus(slot.status)) return;
    
    if (selectedSlot && selectedSlot._id === slot._id) {
      setSelectedSlot(null); 
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleClearSlot = async (slot) => {
    if (!user || user.role !== 'ADMIN') return;
    if (!isOccupiedStatus(slot.status)) return;

    if (!confirm(`Clear occupied slot ${slot.code}?`)) return;

    try {
      await api.put(`/slots/${slot._id}/clear`);
      setSlots((prev) =>
        prev.map((s) => (s._id === slot._id ? { ...s, status: "AVAILABLE" } : s))
      );
      toast.success(`Slot ${slot.code} cleared successfully!`);
    } catch (err) {
      console.error("Failed to clear slot", err);
      toast.error("Failed to clear slot. Please try again.");
    }
  };

  const handleNext = async () => {
    if (!selectedSlot) return;

    const token = localStorage.getItem("token");
    if (!user || !token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      await api.put(`/slots/${selectedSlot._id}/book`);
      setSlots((prev) =>
        prev.map((s) => (s._id === selectedSlot._id ? { ...s, status: "OCCUPIED" } : s))
      );
      setSelectedSlot(null);
      toast.success(`Successfully occupied slot ${selectedSlot.code}!`);
    } catch (err) {
      console.error("Failed to occupy slot", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to occupy slot. Please try again.");
      }
    }
  };

  /**
   * Role-based navigation - different back destinations based on user type
   * Admin users return to admin lots management, regular users to dashboard
   */
  const goBack = () => {
    console.log("goBack called");
    console.log("Current user:", user);
    console.log("User role:", user?.role);
    
    if (!user) {
      console.log("No user, going back");
      return navigate(-1);
    }

    if (user.role === "ADMIN") {
      console.log("Admin user, navigating to /admin/lots");
      navigate("/admin/lots");
    } else {
      console.log("Regular user, navigating to /");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b47a1] via-[#0d4aa7] to-[#0b2f66] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#0a3a86" />
                <stop offset="100%" stopColor="#0b47a1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#g1)"
              d="M0,96L48,117.3C96,139,192,181,288,181.3C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,160C1248,139,1344,149,1392,154.7L1440,160V0H0Z"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="md:w-1/2">
            <p className="uppercase tracking-wider text-sm text-[#cbe0ff]">Parking Lot</p>
            <h1 className="text-3xl md:text-5xl font-extrabold">{lotName}</h1>
            <p className="mt-4 text-[#d8e8ff]">
              {selectedSlot 
                ? `Selected: ${selectedSlot.code}` 
                : "Select a slot and press NEXT to occupy."
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 pb-24">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-gray-900 relative">

          <button
            onClick={goBack}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
          >
            ← Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Slots</h2>
              <p className="text-sm text-gray-500">
                {selectedSlot 
                  ? `Selected: ${selectedSlot.code} - Click NEXT to confirm`
                  : user?.role === 'ADMIN' 
                  ? "Tap to select — press NEXT to occupy. Double-click occupied slots to clear."
                  : "Tap to select — press NEXT to occupy"
                }
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Status legend</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-white border border-gray-300" />
                  <span className="text-xs text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-[#E8F1FF] border border-[#003E92]" />
                  <span className="text-xs text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={CarImage} alt="car" className="w-6 h-6" />
                  <span className="text-xs text-gray-600">Occupied</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-gray-500">Loading slots…</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {slots.map((slot) => {
                const occupied = isOccupiedStatus(slot.status);
                const selected = selectedSlot && selectedSlot._id === slot._id;

                return (
                  <div
                    key={slot._id}
                    onClick={() => onSlotClick(slot)}
                    onDoubleClick={() => handleClearSlot(slot)}
                    className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      occupied && user?.role === 'ADMIN'
                        ? "bg-transparent cursor-pointer hover:opacity-75" 
                        :
                      occupied 
                        ? "bg-transparent cursor-not-allowed" 
                        : selected
                        ? "bg-[#E8F1FF] border-2 border-[#003E92] shadow-md cursor-pointer"
                        : "bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md"
                    }`}
                    style={{ width: 100, height: 180 }}
                  >
                    {occupied ? (
                      <img
                        src={CarImage}
                        alt="Car"
                        className="h-full w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <span className={`text-lg font-semibold ${
                        selected ? "text-[#003E92]" : "text-gray-800"
                      }`}>
                        {slot.code}
                      </span>
                    )}
                    
                    {selected && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-[#003E92] rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="fixed bottom-6 right-48 z-50">
              <button
                onClick={handleNext}
                className="px-8 py-4 rounded-full text-white font-semibold bg-[#003E92] hover:bg-[#002a66] shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}