"use client";

import React, { useState, useEffect } from "react";

// Types matching schema
interface User {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: string;
  profilePhoto: string | null;
  doctorId?: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualifications: string;
  registrationNo: string;
  clinicName: string;
  clinicAddress: string;
  consultationFee: number;
  bio: string;
  languages: string;
  availableDays: string;
  profilePhoto: string | null;
  rating: number;
  reviewsCount: number;
  isApproved: boolean;
  phone?: string;
}

interface Patient {
  id: string;
  name: string;
  primaryPhone: string;
  email: string | null;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string | null;
  emergencyContact: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  familyMembers?: FamilyMember[];
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  patientId: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  familyMemberId: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  visitType: string;
  chiefComplaint: string;
  notes: string | null;
}

interface Consultation {
  id: string;
  appointmentId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosisCodes: string | null;
  bp: string | null;
  pulse: string | null;
  temp: string | null;
  spo2: string | null;
  weight: string | null;
  height: string | null;
  followUpDate: string | null;
  createdAt: string;
}

interface Prescription {
  id: string;
  consultationId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  familyMemberId: string | null;
  issuedAt: string;
  validUntil: string;
  notes: string | null;
  medicinesJson: string; // JSON string of medicines array
}

interface LabOrder {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  labId: string | null;
  testsJson: string;
  status: string;
  notes: string | null;
}

interface LabReport {
  id: string;
  labOrderId: string;
  appointmentId: string;
  patientId: string;
  uploadedBy: string;
  reportTitle: string;
  reportType: string;
  findings: string;
  notes: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  uploadedAt: string;
  isVisiblePatient: boolean;
}

interface MedicinesCatalog {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  unit: string;
  requiresPrescription: boolean;
}

interface CartItem {
  medicine_id: string;
  name: string;
  price: number;
  qty: number;
}

interface PendingApproval {
  id: string;
  name: string;
  meta: string;
  type: string;
}

export default function MedLinkApp() {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginRole, setLoginRole] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<string>("");
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("1234");

  // --- APPLICATION DATA STATE ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [medicines, setMedicines] = useState<MedicinesCatalog[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [allAssistants, setAllAssistants] = useState<any[]>([]);
  const [bookingIsBlock, setBookingIsBlock] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState("");
  const [newAssistantPhone, setNewAssistantPhone] = useState("");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>("");

  // --- ACTIVE WORKSPACE PAGE ---
  const [activePage, setActivePage] = useState<string>("dashboard");

  // --- FILTERS / SELECTED IDS ---
  const [activePatientId, setActivePatientId] = useState<string>(""); // For active patient switching
  const [selectedPatDetailId, setSelectedPatDetailId] = useState<string>(""); // For doctor viewing patient folder
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Expandable toggles in Patients Directory
  const [expandedDetailsPatientIds, setExpandedDetailsPatientIds] = useState<Record<string, boolean>>({});
  const [expandedAppointmentsPatientIds, setExpandedAppointmentsPatientIds] = useState<Record<string, boolean>>({});

  // --- MODALS TOGGLES ---
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isBookAppOpen, setIsBookAppOpen] = useState(false);
  const [isSoapOpen, setIsSoapOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isLabUploadOpen, setIsLabUploadOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- MODALS DATA CONTEXTS ---
  const [bookingDoctorId, setBookingDoctorId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingVisitType, setBookingVisitType] = useState<string>("first-visit");
  const [bookingComplaint, setBookingComplaint] = useState<string>("");
  const [bookingPatientId, setBookingPatientId] = useState<string>("");
  const [bookingSlots, setBookingSlots] = useState<string[]>([]);

  // SOAP Form states
  const [soapAppId, setSoapAppId] = useState<string>("");
  const [soapBp, setSoapBp] = useState<string>("120/80");
  const [soapPulse, setSoapPulse] = useState<string>("72");
  const [soapTemp, setSoapTemp] = useState<string>("98.6");
  const [soapSpo2, setSoapSpo2] = useState<string>("99");
  const [soapWeight, setSoapWeight] = useState<string>("70");
  const [soapHeight, setSoapHeight] = useState<string>("170");
  const [soapSubjective, setSoapSubjective] = useState<string>("");
  const [soapObjective, setSoapObjective] = useState<string>("");
  const [soapAssessment, setSoapAssessment] = useState<string>("");
  const [soapAssessmentIcd, setSoapAssessmentIcd] = useState<string>("");
  const [soapPlan, setSoapPlan] = useState<string>("");
  const [soapFollowUp, setSoapFollowUp] = useState<string>("");
  const [soapPrescribedMeds, setSoapPrescribedMeds] = useState<any[]>([]);
  const [soapSelectedMedId, setSoapSelectedMedId] = useState<string>("");
  const [soapTestsChecked, setSoapTestsChecked] = useState<Record<string, boolean>>({});

  // Prescription preview context
  const [previewRx, setPreviewRx] = useState<any | null>(null);

  // Lab Report upload context
  const [uploadLabOrderId, setUploadLabOrderId] = useState<string>("");
  const [uploadReportTitle, setUploadReportTitle] = useState<string>("");
  const [uploadFindings, setUploadFindings] = useState<string>("");
  const [uploadNotes, setUploadNotes] = useState<string>("");

  // Pharmacy Cart context
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutAddress, setCheckoutAddress] = useState<string>("");
  const [checkoutRxId, setCheckoutRxId] = useState<string>("");

  // Referrals context
  const [sentReferrals, setSentReferrals] = useState<any[]>([]);
  const [receivedReferrals, setReceivedReferrals] = useState<any[]>([]);
  const [referralTab, setReferralTab] = useState<string>("incoming");
  const [activeReferralId, setActiveReferralId] = useState<string>("");

  // SOAP modal referral inputs
  const [soapReferEnabled, setSoapReferEnabled] = useState(false);
  const [soapReferDoctorId, setSoapReferDoctorId] = useState("");
  const [soapReferReason, setSoapReferReason] = useState("");
  const [soapReferUrgency, setSoapReferUrgency] = useState("routine");
  const [soapReferNotes, setSoapReferNotes] = useState("");

  // Direct Diagnostic Upload states (for patient/lab)
  const [isDirectUploadOpen, setIsDirectUploadOpen] = useState(false);
  const [directUploadRole, setDirectUploadRole] = useState<"patient" | "lab">("patient");
  const [directUploadAppId, setDirectUploadAppId] = useState("");
  const [directUploadTitle, setDirectUploadTitle] = useState("");
  const [directUploadType, setDirectUploadType] = useState("blood-test");
  const [directUploadFindings, setDirectUploadFindings] = useState("");
  const [directUploadNotes, setDirectUploadNotes] = useState("");
  const [directUploadFileName, setDirectUploadFileName] = useState("");

  // Lab Order Upload state
  const [uploadFileName, setUploadFileName] = useState("");

  // Diagnostics Viewer states
  const [isViewReportsOpen, setIsViewReportsOpen] = useState(false);
  const [viewReportsAppId, setViewReportsAppId] = useState("");
  const [viewReportsList, setViewReportsList] = useState<any[]>([]);

  // Simulated PDF Viewer modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [viewPdfReport, setViewPdfReport] = useState<any | null>(null);

  // Clinical Analytics states
  const [analyticsMonthFilter, setAnalyticsMonthFilter] = useState<string>("all");
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);
  const [expandedReferredDocId, setExpandedReferredDocId] = useState<string | null>(null);

  const openViewReportsModal = async (appId: string) => {
    setViewReportsAppId(appId);
    try {
      const res = await fetch(`/api/lab-reports?appointmentId=${appId}`);
      const data = await res.json();
      if (res.ok && data.labReports) {
        setViewReportsList(data.labReports);
        setIsViewReportsOpen(true);
      } else {
        alert("Failed loading reports list.");
      }
    } catch (e) {
      alert("Error loading reports.");
    }
  };

  const fetchReferrals = async () => {
    if (!currentUser) return;
    const docId = currentUser.role === "doctor" ? currentUser.id : (currentUser.role === "assistant" ? currentUser.doctorId : "");
    if (!docId) return;
    try {
      const resRef = await fetch(`/api/referrals?doctorId=${docId}`);
      const dataRef = await resRef.json();
      if (dataRef.sent) setSentReferrals(dataRef.sent);
      if (dataRef.received) setReceivedReferrals(dataRef.received);
    } catch (e) {
      console.error("Failed loading referrals list", e);
    }
  };

  const fetchAssistants = async () => {
    if (!currentUser || currentUser.role !== "doctor") return;
    try {
      const res = await fetch(`/api/assistants?doctorId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok && data.assistants) {
        setAssistants(data.assistants);
      }
    } catch (e) {
      console.error("Failed loading assistants list", e);
    }
  };

  // Fetch referrals and assistants when logged in
  useEffect(() => {
    if (currentUser && (currentUser.role === "doctor" || currentUser.role === "assistant")) {
      fetchReferrals();
      if (currentUser.role === "doctor") {
        fetchAssistants();
      }
    } else {
      setSentReferrals([]);
      setReceivedReferrals([]);
      setAssistants([]);
    }
  }, [currentUser]);

  // --- MOUNT TRIGGERS ---
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const resDocs = await fetch("/api/doctors?includePending=true");
      const dataDocs = await resDocs.json();
      if (dataDocs.doctors) setDoctors(dataDocs.doctors);

      const resPats = await fetch("/api/patients");
      const dataPats = await resPats.json();
      if (dataPats.patients) setPatients(dataPats.patients);

      const resApps = await fetch("/api/appointments");
      const dataApps = await resApps.json();
      if (dataApps.appointments) setAppointments(dataApps.appointments);

      const resLabs = await fetch("/api/lab-orders");
      const dataLabs = await resLabs.json();
      if (dataLabs.labOrders) setLabOrders(dataLabs.labOrders);

      const resReports = await fetch("/api/lab-reports");
      const dataReports = await resReports.json();
      if (dataReports.labReports) setLabReports(dataReports.labReports);

      const resMeds = await fetch("/api/medicines");
      const dataMeds = await resMeds.json();
      if (dataMeds.medicines) {
        setMedicines(dataMeds.medicines);
        if (dataMeds.medicines.length > 0) setSoapSelectedMedId(dataMeds.medicines[0].id);
      }

      const resPending = await fetch("/api/admin/approvals");
      const dataPending = await resPending.json();
      if (dataPending.pending) setPendingApprovals(dataPending.pending);

      const resAssistants = await fetch("/api/assistants");
      const dataAssistants = await resAssistants.json();
      if (dataAssistants.assistants) setAllAssistants(dataAssistants.assistants);
    } catch (e) {
      console.error("Failed loading backend API records", e);
    }
  }

  // --- AUTH SWITCHER FLOW ---
  const handleRoleSelection = (role: string) => {
    setLoginRole(role);
    setOtpSent(false);

    let accounts: any[] = [];
    if (role === "doctor") {
      accounts = doctors.map(d => ({ id: d.id, label: `${d.name} (${d.speciality}) ${d.isApproved ? "" : "[Pending]"}` }));
    } else if (role === "patient") {
      accounts = patients.map(p => ({ id: p.id, label: `${p.name} (${p.primaryPhone})` }));
    } else if (role === "lab") {
      // Sandboxed lab users
      accounts = [
        { id: "LAB-00001", label: "Apex Diagnostics Center" },
        { id: "LAB-00002", label: "Metro Pathology Labs" }
      ];
    } else if (role === "admin") {
      accounts = [{ id: "ADM-001", label: "System Administrator" }];
    } else if (role === "assistant") {
      accounts = allAssistants.map(a => ({ id: a.id, label: `${a.name} (Assistant for ${doctors.find(d => d.id === a.doctorId)?.name || a.doctorId})` }));
    }

    setDemoAccounts(accounts);
    if (accounts.length > 0) {
      setSelectedDemoAccount(accounts[0].id);
      fillDemoPhone(role, accounts[0].id);
    }
  };

  const handleDemoAccountChange = (val: string) => {
    setSelectedDemoAccount(val);
    fillDemoPhone(loginRole || "", val);
  };

  const fillDemoPhone = (role: string, id: string) => {
    if (role === "doctor") {
      setLoginPhone("9876500001");
    } else if (role === "patient") {
      const pat = patients.find(p => p.id === id);
      setLoginPhone(pat ? pat.primaryPhone : "");
    } else if (role === "lab") {
      setLoginPhone(id === "LAB-00001" ? "8888888888" : "7777777777");
    } else if (role === "admin") {
      setLoginPhone("9900001122");
    } else if (role === "assistant") {
      const ast = allAssistants.find(a => a.id === id);
      setLoginPhone(ast ? ast.phone : "");
    }
  };

  const triggerMockOtp = () => {
    setOtpSent(true);
  };

  const verifyDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234") {
      alert("Invalid code! Please use '1234' for sandbox access.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, role: loginRole, userId: selectedDemoAccount })
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setCurrentUser(data.user);
        if (loginRole === "patient") {
          const patProfile = patients.find(p => p.id === data.user.id || p.primaryPhone === data.user.phone);
          if (patProfile?.familyMembers && patProfile.familyMembers.length > 0) {
            setActivePage("profile-select");
            setActivePatientId(data.user.id);
          } else {
            setActivePatientId(data.user.id);
            setActivePage("dashboard");
          }
        } else {
          setActivePage("dashboard");
        }
      } else {
        alert(data.error || "Authentication failed.");
      }
    } catch (e) {
      alert("An error occurred during verification.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginRole(null);
    setOtpSent(false);
    setCartItems([]);
  };

  // --- DATES & FORMAT UTILS ---
  const getPatientAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // --- BOOKING WORKSPACE LOAD ---
  const loadBookingSlots = () => {
    const slots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
      "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ];
    setBookingSlots(slots);
  };

  // --- DOCTOR INTERACTION METHODS ---
  const startConsultationSoap = (appId: string, walkInApp?: any) => {
    const app = walkInApp || appointments.find(a => a.id === appId);
    if (!app) return;

    setSoapAppId(appId);
    setSoapSubjective(app.chiefComplaint || "");
    setSoapObjective("");
    setSoapAssessment("");
    setSoapAssessmentIcd("");
    setSoapPlan("");
    setSoapFollowUp("");
    setSoapPrescribedMeds([]);
    setSoapBp("120/80");
    setSoapPulse("72");
    setSoapTemp("98.6");
    setSoapSpo2("99");
    setSoapWeight("70");
    setSoapHeight("170");
    setSoapTestsChecked({});

    setSoapReferEnabled(false);
    setSoapReferDoctorId("");
    setSoapReferReason("");
    setSoapReferUrgency("routine");
    setSoapReferNotes("");

    setIsSoapOpen(true);
  };

  const handleLogConsultClick = async (patId: string) => {
    const existingApp = appointments.find(
      a => a.patientId === patId && a.doctorId === currentUser?.id && a.status === "scheduled"
    );

    if (existingApp) {
      startConsultationSoap(existingApp.id);
    } else {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: currentUser?.id,
            patientId: patId,
            familyMemberId: null,
            appointmentDate: todayStr,
            appointmentTime: timeStr,
            visitType: "first-visit",
            chiefComplaint: "Walk-in consultation record."
          })
        });
        const data = await res.json();
        if (res.ok && data.appointment) {
          await loadData();
          startConsultationSoap(data.appointment.id, data.appointment);
        } else {
          alert("Failed creating walk-in appointment: " + (data.error || ""));
        }
      } catch (e) {
        alert("Failed creating walk-in appointment.");
      }
    }
  };

  const handleUpdateReferralStatus = async (refId: string, status: string) => {
    try {
      const res = await fetch("/api/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId: refId, status })
      });
      if (res.ok) {
        alert(`Referral status updated to ${status}.`);
        fetchReferrals();
      } else {
        const data = await res.json();
        alert(data.error || "Failed updating referral status.");
      }
    } catch (e) {
      alert("Failed updating referral status.");
    }
  };

  const handleLogReferralConsultClick = async (ref: any) => {
    setActiveReferralId(ref.id);
    handleLogConsultClick(ref.patientId);
  };

  const addSoapMedicineRow = () => {
    const med = medicines.find(m => m.id === soapSelectedMedId);
    if (!med) return;

    setSoapPrescribedMeds([
      ...soapPrescribedMeds,
      {
        name: med.name,
        dosage: med.category === "Analgesic" ? "650mg" : "1 tab",
        frequency: "Once daily (morning)",
        duration: "10 days"
      }
    ]);
  };

  const removeSoapMedicineRow = (idx: number) => {
    setSoapPrescribedMeds(soapPrescribedMeds.filter((_, i) => i !== idx));
  };

  const updateSoapMedField = (idx: number, field: string, val: string) => {
    const list = [...soapPrescribedMeds];
    list[idx][field] = val;
    setSoapPrescribedMeds(list);
  };

  const handleSoapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTests: any[] = [];
    Object.entries(soapTestsChecked).forEach(([code, checked]) => {
      if (checked) {
        const item = dbTestsCatalog.find(t => t.test_code === code);
        if (item) {
          selectedTests.push({ test_code: code, test_name: item.name, urgency: "routine" });
        }
      }
    });

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: soapAppId,
          subjective: soapSubjective,
          objective: soapObjective,
          assessment: soapAssessment + (soapAssessmentIcd ? ` (${soapAssessmentIcd})` : ""),
          plan: soapPlan,
          vitalSigns: {
            bp: soapBp,
            pulse: soapPulse,
            temp: soapTemp,
            spo2: soapSpo2,
            weight: soapWeight,
            height: soapHeight
          },
          medicines: soapPrescribedMeds,
          tests: selectedTests,
          followUpDate: soapFollowUp
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 1. Complete active referral if any
        if (activeReferralId) {
          try {
            await fetch("/api/referrals", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ referralId: activeReferralId, status: "completed" })
            });
          } catch (err) {
            console.error("Failed marking referral completed", err);
          }
          setActiveReferralId("");
        }

        // 2. Create outgoing referral if enabled
        if (soapReferEnabled && soapReferDoctorId && soapReferReason) {
          try {
            const app = appointments.find(a => a.id === soapAppId) || (data.consultation ? { patientId: data.consultation.patientId } : null);
            const patientId = app ? app.patientId : selectedPatDetailId;
            
            await fetch("/api/referrals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: soapAppId,
                referringDoctorId: currentUser?.id,
                referredToDoctorId: soapReferDoctorId,
                patientId,
                reason: soapReferReason,
                urgency: soapReferUrgency,
                notes: soapReferNotes
              })
            });
          } catch (err) {
            console.error("Failed creating referral", err);
          }
        }

        alert("Consultation soap note locked and saved successfully!");
        setIsSoapOpen(false);
        loadData();
        fetchReferrals();

        if (data.prescription) {
          loadPrescriptionPrint(data.prescription.id);
        }
      } else {
        alert(data.error || "Failed logging soap notes.");
      }
    } catch (e) {
      alert("Consultation transaction failed.");
    }
  };

  const loadPrescriptionPrint = async (rxId: string, appId?: string) => {
    try {
      const url = appId 
        ? `/api/prescriptions?appointmentId=${appId}`
        : `/api/prescriptions?prescriptionId=${rxId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.rx) {
        setPreviewRx(data);
        setIsPrescriptionOpen(true);
      } else {
        alert("Failed loading prescription details.");
      }
    } catch (e) {
      alert("Error loading prescription details.");
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("form-p-name") as HTMLInputElement).value;
    const phone = (document.getElementById("form-p-phone") as HTMLInputElement).value;
    const email = (document.getElementById("form-p-email") as HTMLInputElement).value;
    const dob = (document.getElementById("form-p-dob") as HTMLInputElement).value;
    const gender = (document.getElementById("form-p-gender") as HTMLSelectElement).value;
    const blood = (document.getElementById("form-p-blood") as HTMLSelectElement).value;
    const address = (document.getElementById("form-p-address") as HTMLTextAreaElement).value;
    const emergency = (document.getElementById("form-p-emergency") as HTMLInputElement).value;
    const allergies = (document.getElementById("form-p-allergies") as HTMLInputElement).value;
    const chronic = (document.getElementById("form-p-chronic") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          primaryPhone: phone,
          email,
          dateOfBirth: dob,
          gender,
          bloodGroup: blood,
          address,
          emergencyContact: emergency,
          allergies,
          chronicConditions: chronic
        })
      });

      const data = await res.json();
      if (res.ok && data.patient) {
        alert(`Patient registered successfully! Patient ID: ${data.patient.id}`);
        setIsAddPatientOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed registering patient profile.");
      }
    } catch (e) {
      alert("Error submitting registration form.");
    }
  };
  
  const handleRegisterAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssistantName || !newAssistantPhone) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const res = await fetch("/api/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAssistantName,
          phone: newAssistantPhone,
          doctorId: currentUser?.id
        })
      });
      const data = await res.json();
      if (res.ok && data.assistant) {
        alert("Assistant registered successfully!");
        setNewAssistantName("");
        setNewAssistantPhone("");
        fetchAssistants();
        const resAll = await fetch("/api/assistants");
        const dataAll = await resAll.json();
        if (dataAll.assistants) setAllAssistants(dataAll.assistants);
      } else {
        alert(data.error || "Failed to register assistant.");
      }
    } catch (err) {
      alert("Error registering assistant.");
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    if (!confirm("Are you sure you want to remove this assistant?")) return;
    try {
      const res = await fetch(`/api/assistants?assistantId=${assistantId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Assistant removed successfully!");
        fetchAssistants();
        const resAll = await fetch("/api/assistants");
        const dataAll = await resAll.json();
        if (dataAll.assistants) setAllAssistants(dataAll.assistants);
      } else {
        alert(data.error || "Failed to remove assistant.");
      }
    } catch (err) {
      alert("Error removing assistant.");
    }
  };

  // --- PATIENT INTERACTION METHODS ---
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTime) {
      alert("Please select an available calendar slot.");
      return;
    }

    const isBlock = bookingIsBlock && (currentUser?.role === "doctor" || currentUser?.role === "assistant");
    let patId: string | null = null;
    let famMemberId: string | null = null;

    if (!isBlock) {
      if (currentUser?.role === "patient") {
        patId = currentUser.id;
        famMemberId = activePatientId === currentUser.id ? null : activePatientId;
      } else {
        if (!bookingPatientId) {
          alert("Please select a patient profile.");
          return;
        }
        patId = bookingPatientId;
        famMemberId = null;
      }
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: bookingDoctorId,
          patientId: patId,
          familyMemberId: famMemberId,
          appointmentDate: bookingDate,
          appointmentTime: bookingTime,
          visitType: isBlock ? "block" : bookingVisitType,
          chiefComplaint: isBlock ? (bookingComplaint || "Calendar Blocked") : bookingComplaint,
          status: isBlock ? "blocked" : "scheduled"
        })
      });

      const data = await res.json();
      if (res.ok && data.appointment) {
        alert(isBlock ? "Calendar slot blocked successfully!" : `Appointment booked successfully! ID: ${data.appointment.id}`);
        setIsBookAppOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed scheduling appointment.");
      }
    } catch (e) {
      alert("Error scheduling appointment.");
    }
  };

  const handleCancelAppointment = async (appId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appId,
          status: "cancelled"
        })
      });

      if (res.ok) {
        alert("Appointment cancelled successfully.");
        loadData();
      } else {
        alert("Failed cancelling appointment.");
      }
    } catch (e) {
      alert("Error updating appointment.");
    }
  };

  const claimLabOrderDemo = async (orderId: string) => {
    try {
      const res = await fetch("/api/lab-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labOrderId: orderId,
          status: "lab-assigned",
          labId: "LAB-00001" // Assign default Center
        })
      });

      if (res.ok) {
        alert("Lab testing assigned successfully!");
        loadData();
      } else {
        alert("Failed claiming order.");
      }
    } catch (e) {
      alert("Error claiming order.");
    }
  };

  const handleAddToCart = (medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (!med) return;

    const existing = cartItems.find(item => item.medicine_id === medId);
    if (existing) {
      setCartItems(cartItems.map(item => item.medicine_id === medId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCartItems([...cartItems, { medicine_id: med.id, name: med.name, price: med.price, qty: 1 }]);
    }
    alert(`${med.name} added to cart.`);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    try {
      const res = await fetch("/api/medicines/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: currentUser?.id,
          prescriptionId: checkoutRxId || null,
          items: cartItems,
          totalAmount: total,
          deliveryAddress: checkoutAddress
        })
      });

      const data = await res.json();
      if (res.ok && data.order) {
        alert(`Pharmacy order checkout completed! ID: ${data.order.id}`);
        setCartItems([]);
        setIsCartOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed checking out pharmacy order.");
      }
    } catch (e) {
      alert("Error placing order.");
    }
  };

  // --- LAB PORTAL INTERACTION METHODS ---
  const handleLabReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labOrderId: uploadLabOrderId,
          reportTitle: uploadReportTitle,
          findings: uploadFindings,
          notes: uploadNotes,
          uploadedBy: currentUser?.id,
          fileName: uploadFileName || "report_clinical_diagnostics.pdf",
          fileUrl: `/uploads/${uploadFileName || "report_clinical_diagnostics.pdf"}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Laboratory findings file uploaded and synced to doctor files!");
        setIsLabUploadOpen(false);
        setUploadFileName("");
        loadData();
      } else {
        alert(data.error || "Failed uploading findings file.");
      }
    } catch (e) {
      alert("Error uploading report.");
    }
  };

  const handleDirectReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUploadAppId) {
      alert("Please select a valid appointment.");
      return;
    }

    try {
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: directUploadAppId,
          reportTitle: directUploadTitle,
          reportType: directUploadType,
          findings: directUploadFindings,
          notes: directUploadNotes,
          uploadedBy: currentUser?.id,
          fileName: directUploadFileName || "imaging_result_report.pdf",
          fileUrl: `/uploads/${directUploadFileName || "imaging_result_report.pdf"}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Diagnostic findings file uploaded and synced to doctor files!");
        setIsDirectUploadOpen(false);
        setDirectUploadAppId("");
        setDirectUploadTitle("");
        setDirectUploadType("blood-test");
        setDirectUploadFindings("");
        setDirectUploadNotes("");
        setDirectUploadFileName("");
        loadData();
      } else {
        alert(data.error || "Failed uploading findings file.");
      }
    } catch (e) {
      alert("Error uploading report.");
    }
  };

  // --- ADMIN INTERACTION METHODS ---
  const handleApprovePartner = async (partnerId: string, type: string) => {
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, type })
      });

      if (res.ok) {
        alert("Partner account approved and activated live!");
        loadData();
      } else {
        alert("Failed approving account.");
      }
    } catch (e) {
      alert("Error approving partner.");
    }
  };

  // --- STATIC CATALOG DATA ---
  const dbTestsCatalog = [
    { test_code: "LIPID", name: "Lipid Profile (Cholesterol, HDL, LDL)" },
    { test_code: "CBC", name: "Complete Blood Count (CBC)" },
    { test_code: "TSH", name: "Thyroid Stimulating Hormone (TSH)" },
    { test_code: "XRAY_CHEST", name: "Chest X-Ray (PA View)" },
    { test_code: "CT_BRAIN", name: "CT Brain (Plain)" },
    { test_code: "MRI_SPINE", name: "MRI Lumbar Spine" },
    { test_code: "ECG", name: "12-Lead Electrocardiogram (ECG)" },
    { test_code: "USG_ABD", name: "Ultrasound Abdomen & Pelvis" },
    { test_code: "URINE_RE", name: "Urine Routine Analysis" },
    { test_code: "HBA1C", name: "HbA1c Diabetes Profile" }
  ];


  // ==================== RENDERING COMPONENT PANELS ====================

  // A. LOGIN & LANDING VIEW RENDER
  if (!currentUser) {
    return (
      <div id="app-container">
        <div id="auth-view">
          <header className="auth-header">
            <div className="logo">
              <i className="fa-solid fa-house-chimney-medical"></i>
              MedLink<span>Pro</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              <i className="fa-solid fa-shield-halved"></i> Full-Stack Sandbox (SQLite)
            </div>
          </header>

          <main className="auth-main">
            <h1 className="auth-title">Complete Healthcare Portal</h1>
            <p className="auth-subtitle">Seamless database-driven clinical workspace. Select a role to verify authentication.</p>

            {!loginRole ? (
              <div className="role-grid">
                <div className="role-card" onClick={() => handleRoleSelection("doctor")}>
                  <div className="role-icon"><i className="fa-solid fa-user-doctor"></i></div>
                  <h3>Doctor Portal</h3>
                  <p>Practice dashboards, SOAP entries, print RX, and patient history.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelection("patient")}>
                  <div className="role-icon"><i className="fa-solid fa-hospital-user"></i></div>
                  <h3>Patient Portal</h3>
                  <p>Check records wallet, book consultations, and checkout prescriptions pharmacy.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelection("lab")}>
                  <div className="role-icon"><i className="fa-solid fa-flask-vial"></i></div>
                  <h3>Lab Portal</h3>
                  <p>Claim test orders, manage queues, and upload digital reports.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelection("admin")}>
                  <div className="role-icon"><i className="fa-solid fa-user-gear"></i></div>
                  <h3>Admin Panel</h3>
                  <p>Review credentials approvals, verify accounts, and check platform statistics.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelection("assistant")}>
                  <div className="role-icon"><i className="fa-solid fa-user-tie"></i></div>
                  <h3>Receptionist Portal</h3>
                  <p>Book doctor appointments, register walk-in patients, and block calendar slots.</p>
                </div>
              </div>
            ) : (
              <div className="otp-box" style={{ display: "block" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <a onClick={() => setLoginRole(null)} style={{ cursor: "pointer", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to selection
                  </a>
                </div>
                <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
                  {loginRole === "doctor" ? "Doctor Login" : loginRole === "patient" ? "Patient Login" : loginRole === "lab" ? "Lab Partner Login" : loginRole === "assistant" ? "Receptionist Login" : "Admin Panel Access"}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                  Enter verified phone OTP code to access the database sandbox.
                </p>

                <form onSubmit={verifyDemoLogin}>
                  <div className="form-group">
                    <label>Select Demo Account</label>
                    <select value={selectedDemoAccount} onChange={(e) => handleDemoAccountChange(e.target.value)}>
                      {demoAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={loginPhone} readOnly style={{ backgroundColor: "var(--background)", cursor: "not-allowed" }} />
                  </div>

                  {otpSent && (
                    <div className="form-group">
                      <label>Verification Code (OTP)</label>
                      <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={4} style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: 700 }} />
                    </div>
                  )}

                  {!otpSent ? (
                    <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={triggerMockOtp}>
                      Request OTP Code
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                      Verify & Access Portal
                    </button>
                  )}
                </form>
              </div>
            )}
          </main>

          <footer className="auth-footer">
            <p>&copy; 2026 MedLink Pro Suite. proof of Concept Sandbox powered by Next.js & Prisma.</p>
          </footer>
        </div>
      </div>
    );
  }

  // --- FILTERED SELECTION LOGICS ---
  const activePatientName = () => {
    if (activePatientId === currentUser.id) return `${currentUser.fullName} (Self)`;
    const pat = patients.find(p => p.id === currentUser.id);
    const fam = pat?.familyMembers?.find(f => f.id === activePatientId);
    return fam ? `${fam.name} (${fam.relation})` : currentUser.fullName;
  };

  // B. PROFILE SELECT VIEW RENDER
  if (currentUser && activePage === "profile-select") {
    const pat = patients.find(p => p.id === currentUser.id);
    const profiles = [
      { id: currentUser.id, name: currentUser.fullName, relation: "Self" },
      ...(pat?.familyMembers || []).map(f => ({ id: f.id, name: f.name, relation: f.relation }))
    ];

    return (
      <div id="app-container" style={{ justifyContent: "center", alignItems: "center", background: "var(--background)", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{__html: `
          .profile-select-card:hover {
            transform: translateY(-8px);
          }
          .profile-select-card:hover .profile-select-avatar {
            border-color: var(--primary) !important;
            box-shadow: 0 0 25px var(--primary-glow) !important;
          }
        `}} />
        <div style={{ maxWidth: "800px", width: "100%", padding: "2rem", textAlign: "center" }}>
          <div className="logo" style={{ justifyContent: "center", fontSize: "2rem", marginBottom: "2.5rem" }}>
            <i className="fa-solid fa-house-chimney-medical" style={{ color: "var(--primary)" }}></i> MedLink<span>Pro</span>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Who is using MedLink Pro today?</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "3.5rem", fontSize: "1.05rem" }}>Select a family profile to customize your workspace.</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
            {profiles.map((prof, idx) => {
              const initials = prof.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              const gradients = [
                "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              ];
              const grad = gradients[idx % gradients.length];

              return (
                <div 
                  key={prof.id}
                  onClick={() => {
                    setActivePatientId(prof.id);
                    setActivePage("dashboard");
                  }}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  className="profile-select-card"
                >
                  <div style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "24px",
                    background: grad,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    border: "3px solid transparent",
                    boxShadow: "var(--shadow-md)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  className="profile-select-avatar"
                  >
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>{prof.name}</h3>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "capitalize", fontWeight: 500 }}>
                      {prof.relation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "4.5rem" }}>
            <button 
              className="btn btn-outline"
              onClick={handleLogout}
              style={{ padding: "0.6rem 1.75rem", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredDoctors = () => {
    let list = doctors;
    if (doctorSpecialtyFilter !== "all") {
      list = list.filter(d => d.speciality === doctorSpecialtyFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.clinicName.toLowerCase().includes(q) || d.speciality.toLowerCase().includes(q));
    }
    return list;
  };

  const getFilteredPatients = () => {
    let list = patients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.primaryPhone.includes(q));
    }
    return list;
  };

  const getActivePatientDetails = () => {
    const primaryPat = patients.find(p => p.id === currentUser?.id);
    if (!primaryPat) return null;
    if (activePatientId === currentUser?.id || !activePatientId) {
      return {
        id: primaryPat.id,
        name: primaryPat.name,
        bloodGroup: primaryPat.bloodGroup,
        allergies: primaryPat.allergies,
        chronicConditions: primaryPat.chronicConditions,
        gender: primaryPat.gender,
        dateOfBirth: primaryPat.dateOfBirth
      };
    }
    const fam = primaryPat.familyMembers?.find(f => f.id === activePatientId);
    if (fam) {
      return {
        id: fam.id,
        name: fam.name,
        bloodGroup: fam.bloodGroup,
        allergies: fam.allergies,
        chronicConditions: fam.chronicConditions,
        gender: fam.gender,
        dateOfBirth: fam.dateOfBirth
      };
    }
    return null;
  };

  const getSortedPatientAppointments = (patientId: string) => {
    const patApps = appointments.filter(a => a.patientId === patientId);
    
    // Sort by Date & Time (latest first)
    return [...patApps].sort((a, b) => {
      // Compare dates (YYYY-MM-DD)
      if (a.appointmentDate !== b.appointmentDate) {
        return b.appointmentDate.localeCompare(a.appointmentDate);
      }
      
      // Compare times (e.g. "09:30 AM", "02:00 PM", or "14:30")
      const getMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const matchAmpm = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (matchAmpm) {
          let hours = parseInt(matchAmpm[1], 10);
          const minutes = parseInt(matchAmpm[2], 10);
          const ampm = matchAmpm[3].toUpperCase();
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
          return hours * 60 + minutes;
        }
        const match24h = timeStr.match(/^(\d+):(\d+)/);
        if (match24h) {
          const hours = parseInt(match24h[1], 10);
          const minutes = parseInt(match24h[2], 10);
          return hours * 60 + minutes;
        }
        return 0;
      };
      
      return getMinutes(b.appointmentTime) - getMinutes(a.appointmentTime);
    });
  };

  const getFilteredMedicines = () => {
    let list = medicines;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q));
    }
    return list;
  };


  // B. MAIN LAYOUT & RUNTIME WORKSPACE RENDER
  return (
    <div id="app-container">
      <div id="dashboard-wrapper">
        
        {/* Sidebar Nav */}
        <aside id="sidebar">
          <div>
            <div className="sidebar-brand logo">
              <i className="fa-solid fa-house-chimney-medical"></i> MedLink<span>Pro</span>
            </div>
            
            <ul className="sidebar-menu">
              {currentUser.role === "doctor" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => setActivePage("dashboard")}><i className="fa-solid fa-gauge"></i><span>Dashboard</span></a></li>
                  <li className={`sidebar-item ${activePage === "patients-dir" ? "active" : ""}`}><a onClick={() => setActivePage("patients-dir")}><i className="fa-solid fa-users"></i><span>Patients Directory</span></a></li>
                  <li className={`sidebar-item ${activePage === "calendar" ? "active" : ""}`}><a onClick={() => setActivePage("calendar")}><i className="fa-solid fa-calendar"></i><span>Availability calendar</span></a></li>
                  <li className={`sidebar-item ${activePage === "analytics" ? "active" : ""}`}><a onClick={() => setActivePage("analytics")}><i className="fa-solid fa-chart-line"></i><span>Clinical Analytics</span></a></li>
                  <li className={`sidebar-item ${activePage === "assistants" ? "active" : ""}`}><a onClick={() => setActivePage("assistants")}><i className="fa-solid fa-user-gear"></i><span>Manage Assistants</span></a></li>
                </>
              )}
              {currentUser.role === "assistant" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => setActivePage("dashboard")}><i className="fa-solid fa-gauge"></i><span>Assistant Hub</span></a></li>
                  <li className={`sidebar-item ${activePage === "calendar" ? "active" : ""}`}><a onClick={() => setActivePage("calendar")}><i className="fa-solid fa-calendar"></i><span>Doctor Calendar</span></a></li>
                  <li className={`sidebar-item ${activePage === "patients-dir" ? "active" : ""}`}><a onClick={() => setActivePage("patients-dir")}><i className="fa-solid fa-users"></i><span>Patients Directory</span></a></li>
                </>
              )}
              {currentUser.role === "patient" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => setActivePage("dashboard")}><i className="fa-solid fa-gauge"></i><span>Dashboard</span></a></li>
                  <li className={`sidebar-item ${activePage === "find-doctors" ? "active" : ""}`}><a onClick={() => setActivePage("find-doctors")}><i className="fa-solid fa-user-md"></i><span>Find Doctors</span></a></li>
                  <li className={`sidebar-item ${activePage === "records-wallet" ? "active" : ""}`}><a onClick={() => setActivePage("records-wallet")}><i className="fa-solid fa-folder-open"></i><span>Records Wallet</span></a></li>
                  <li className={`sidebar-item ${activePage === "pending-labs" ? "active" : ""}`}><a onClick={() => setActivePage("pending-labs")}><i className="fa-solid fa-microscope"></i><span>Pending Lab Orders</span></a></li>
                  <li className={`sidebar-item ${activePage === "pharmacy" ? "active" : ""}`}><a onClick={() => setActivePage("pharmacy")}><i className="fa-solid fa-pills"></i><span>Order Medicines</span></a></li>
                </>
              )}
              {currentUser.role === "lab" && (
                <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => setActivePage("dashboard")}><i className="fa-solid fa-list-check"></i><span>Orders Queue</span></a></li>
              )}
              {currentUser.role === "admin" && (
                <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => setActivePage("dashboard")}><i className="fa-solid fa-user-check"></i><span>Approvals Panel</span></a></li>
              )}
            </ul>
          </div>

          <div className="sidebar-footer">
            <div className="user-badge">
              <img src={currentUser.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} alt="avatar" />
              <div className="user-badge-info">
                <h4>{currentUser.fullName}</h4>
                <p>{currentUser.role}</p>
              </div>
            </div>
            
            <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ width: "100%", justifyContent: "center", gap: "0.5rem", borderColor: "var(--danger-light)", color: "var(--danger)" }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
            </button>
          </div>
        </aside>

        {/* Workspace panel wrapper */}
        <main id="main-panel">
          
          {/* Header */}
          <header id="header">
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {activePage === "dashboard" ? (currentUser.role === "assistant" ? "Assistant Hub" : "Dashboard Hub") : activePage === "patients-dir" ? "Clinical Patients Folders" : activePage === "patient-folder" ? "Detailed Patient Summary" : activePage === "calendar" ? "Availability Template" : activePage === "analytics" ? "Practice Business Intel" : activePage === "assistants" ? "Manage Assistants" : activePage === "find-doctors" ? "Schedule consultations" : activePage === "records-wallet" ? "Personal records Wallet" : activePage === "pending-labs" ? "Diagnostic test bookings" : "Pharmacy catalog"}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {currentUser.role.toUpperCase()} PORTAL {currentUser.role === "assistant" && ` (Assisting Dr. ${doctors.find(d => d.id === currentUser.doctorId)?.name || currentUser.doctorId})`} / {activePage.toUpperCase()}
              </span>
            </div>

            <div className="header-actions">
               {(activePage === "patients-dir" || activePage === "find-doctors" || activePage === "pharmacy") && (
                 <div className="header-search">
                   <i className="fa-solid fa-magnifying-glass"></i>
                   <input type="text" placeholder="Search entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 </div>
               )}

              {/* Patient Active Profile switcher */}
              {currentUser.role === "patient" && (
                <div className="family-profile-switcher">
                  <i className="fa-solid fa-users"></i>
                  <span style={{ color: "var(--text-secondary)" }}>Active Profile:</span>
                  <select value={activePatientId} onChange={(e) => setActivePatientId(e.target.value)}>
                    <option value={currentUser.id}>{currentUser.fullName} (Self)</option>
                    {patients.find(p => p.id === currentUser.id)?.familyMembers?.map(fam => (
                      <option key={fam.id} value={fam.id}>{fam.name} ({fam.relation})</option>
                    ))}
                  </select>
                </div>
              )}

              <button className="icon-btn" onClick={() => alert("Notification center is preloaded inside sandbox logs.")}>
                <i className="fa-regular fa-bell"></i>
              </button>
            </div>
          </header>

          <div id="workspace">

            {/* ==================== DOCTOR SCREEN WORKSPACES ==================== */}
            {((currentUser.role === "doctor" || currentUser.role === "assistant") && activePage === "dashboard") && (() => {
              const targetDocId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
              const docProfile = doctors.find(d => d.id === targetDocId);
              return (
                <section className="page-section">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon primary"><i className="fa-regular fa-calendar-check"></i></div>
                      <div className="stat-info">
                        <h3>{appointments.filter(a => a.doctorId === targetDocId && a.appointmentDate === new Date().toISOString().split("T")[0]).length}</h3>
                        <p>Today's Consultations</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon secondary"><i className="fa-solid fa-house-chimney-crack"></i></div>
                      <div className="stat-info">
                        <h3>{[...new Set(appointments.filter(a => a.doctorId === targetDocId && a.patientId).map(a => a.patientId))].length}</h3>
                        <p>Total seen Patients</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon warning"><i className="fa-solid fa-clipboard-list"></i></div>
                      <div className="stat-info">
                        <h3>{labReports.length}</h3>
                        <p>Uploaded Lab Files</p>
                      </div>
                    </div>
                    </div>

                  <div className="dash-row">
                    <div className="panel">
                      <div className="panel-header">
                        <h3 className="panel-title"><i className="fa-regular fa-clock" style={{ color: "var(--primary)" }}></i> Practice Schedule Queue</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => openBookAppointmentModal()}>
                          <i className="fa-solid fa-plus"></i> New Appointment
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", padding: "1.25rem 0" }}>
                        {appointments.filter(a => a.doctorId === targetDocId).length === 0 ? (
                          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0", gridColumn: "span 3" }}>
                            No scheduled consults.
                          </p>
                        ) : (
                          appointments.filter(a => a.doctorId === targetDocId).map(app => {
                            const isBlocked = app.status === "blocked" || app.visitType === "block";
                            const pat = patients.find(p => p.id === app.patientId);
                            let pName = isBlocked ? "Calendar Slot Blocked" : (pat?.name || "Patient");
                            let pMeta = isBlocked ? "Unavailable for Bookings" : (pat ? `${getPatientAge(pat.dateOfBirth)} Yrs / ${pat.gender}` : "");

                            if (app.familyMemberId && !isBlocked) {
                              const fam = pat?.familyMembers?.find(f => f.id === app.familyMemberId);
                              if (fam) {
                                pName = `${fam.name} (Son/Spouse)`;
                                pMeta = `${getPatientAge(fam.dateOfBirth)} Yrs / ${fam.gender} [Family Link]`;
                              }
                            }

                            let badgeClass = isBlocked ? "badge-danger" : "badge-info";
                            if (!isBlocked) {
                              if (app.visitType === "emergency") {
                                badgeClass = "badge-danger";
                              } else if (app.visitType === "follow-up") {
                                badgeClass = "badge-success";
                              }
                            }

                            const statusBadgeClass = isBlocked
                              ? "badge-danger"
                              : (app.status === "completed" 
                                ? "badge-success" 
                                : (app.status === "scheduled" ? "badge-info" : "badge-danger"));

                            return (
                              <div 
                                key={app.id} 
                                className="glass-card" 
                                style={{ 
                                  cursor: isBlocked ? "default" : "pointer", 
                                  borderTop: isBlocked ? "4px solid var(--text-secondary)" : "4px solid var(--primary)",
                                  padding: "1.25rem",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  height: "100%",
                                  opacity: isBlocked ? 0.75 : 1,
                                  background: isBlocked ? "var(--background)" : "var(--glass)"
                                }}
                                onClick={() => {
                                  if (isBlocked) return;
                                  setSelectedPatDetailId(app.patientId);
                                  setActivePage("patient-folder");
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                      {app.appointmentTime} - {formatDate(app.appointmentDate)}
                                    </div>
                                    <span className={`badge ${statusBadgeClass}`} style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                                      {app.status}
                                    </span>
                                  </div>

                                  <div style={{ marginBottom: "0.75rem" }}>
                                    <h4 style={{ margin: 0, color: isBlocked ? "var(--text-secondary)" : "var(--primary)", fontSize: "1.1rem" }}>{pName}</h4>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>{pMeta}</div>
                                  </div>

                                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                                    <span className={`badge ${badgeClass}`} style={{ fontSize: "0.7rem" }}>
                                      {isBlocked ? "block" : app.visitType}
                                    </span>
                                    <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
                                      ID: {app.id}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", backgroundColor: "var(--background)", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border)", marginBottom: "1.25rem", minHeight: "45px", display: "flex", alignItems: "center" }}>
                                    <div><strong>{isBlocked ? "Reason:" : "Complaint:"}</strong> {app.chiefComplaint}</div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                                  {isBlocked && (
                                    <button 
                                      className="btn btn-outline btn-sm" 
                                      style={{ flex: 1, justifyContent: "center", color: "var(--danger)", borderColor: "var(--danger)" }}
                                      onClick={async () => {
                                        if (!confirm("Are you sure you want to unblock this slot?")) return;
                                        try {
                                          const res = await fetch("/api/appointments", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ appointmentId: app.id, status: "cancelled" })
                                          });
                                          if (res.ok) {
                                            alert("Slot unblocked successfully!");
                                            loadData();
                                          } else {
                                            alert("Failed to unblock slot.");
                                          }
                                        } catch (err) {
                                          alert("Failed to unblock slot.");
                                        }
                                      }}
                                    >
                                      <i className="fa-solid fa-unlock"></i> Unblock Slot
                                    </button>
                                  )}
                                  {!isBlocked && app.status === "scheduled" && currentUser.role === "doctor" && (
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      style={{ flex: 1, justifyContent: "center" }}
                                      onClick={() => startConsultationSoap(app.id)}
                                    >
                                      <i className="fa-solid fa-stethoscope"></i> Start SOAP
                                    </button>
                                  )}
                                  {!isBlocked && app.status === "completed" && (
                                    <button 
                                      className="btn btn-outline btn-sm" 
                                      style={{ flex: 1, justifyContent: "center" }}
                                      onClick={() => loadPrescriptionPrint(generateId('RX'))}
                                    >
                                      <i className="fa-solid fa-print"></i> Prescription
                                    </button>
                                  )}
                                  {(() => {
                                    const appReports = labReports.filter(r => r.appointmentId === app.id);
                                    if (appReports.length > 0 && !isBlocked) {
                                      return (
                                        <button 
                                          type="button"
                                          className="btn btn-outline btn-sm" 
                                          style={{ flex: 1, justifyContent: "center" }} 
                                          onClick={() => openViewReportsModal(app.id)}
                                        >
                                          <i className="fa-solid fa-file-waveform"></i> Reports ({appReports.length})
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  <div>
                    <div className="panel" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)", color: "var(--surface)" }}>
                      <h3 style={{ color: "var(--surface)", marginBottom: "0.5rem", fontSize: "1.1rem" }}><i className="fa-solid fa-bolt"></i> Quick Assistant</h3>
                      <p style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "1.25rem" }}>Register new patient records directly into the clinical system.</p>
                      <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setIsAddPatientOpen(true)}>
                        <i className="fa-solid fa-user-plus"></i> Register Patient
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referrals Tracker Section */}
                <div className="panel" style={{ marginTop: "1.5rem" }}>
                  <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                    <h3 className="panel-title">
                      <i className="fa-solid fa-share-nodes" style={{ color: "var(--primary)" }}></i> Specialist Referrals Tracker
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        type="button"
                        className={`btn ${referralTab === "incoming" ? "btn-primary" : "btn-outline"} btn-sm`} 
                        onClick={() => setReferralTab("incoming")}
                      >
                        Incoming Referrals ({receivedReferrals.filter(r => r.status === "sent" || r.status === "accepted").length})
                      </button>
                      <button 
                        type="button"
                        className={`btn ${referralTab === "outgoing" ? "btn-primary" : "btn-outline"} btn-sm`} 
                        onClick={() => setReferralTab("outgoing")}
                      >
                        Outgoing Referrals ({sentReferrals.length})
                      </button>
                    </div>
                  </div>

                  {referralTab === "incoming" ? (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Referral Date</th>
                            <th>Patient Name</th>
                            <th>Referring Doctor</th>
                            <th>Reason / Urgency</th>
                            <th>Additional Notes</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivedReferrals.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No incoming referrals found.</td></tr>
                          ) : (
                            receivedReferrals.map(ref => (
                              <tr key={ref.id}>
                                <td>{formatDate(ref.createdAt)}</td>
                                <td>
                                  <div style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }} onClick={() => { setSelectedPatDetailId(ref.patientId); setActivePage("patient-folder"); }}>
                                    {ref.patientName}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ID: {ref.patientId}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{ref.referringDoctorName}</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ref.referringDoctorSpeciality}</div>
                                </td>
                                <td>
                                  <div>{ref.reason}</div>
                                  <span className={`badge ${ref.urgency === "emergency" ? "badge-danger" : (ref.urgency === "urgent" ? "badge-warning" : "badge-info")}`}>
                                    {ref.urgency}
                                  </span>
                                </td>
                                <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ref.notes || "No extra notes"}</td>
                                <td>
                                  <span className={`badge ${ref.status === "completed" ? "badge-success" : (ref.status === "accepted" ? "badge-info" : (ref.status === "rejected" ? "badge-danger" : "badge-warning"))}`}>
                                    {ref.status}
                                  </span>
                                </td>
                                <td>
                                  {ref.status === "sent" && (
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleUpdateReferralStatus(ref.id, "accepted")}>
                                        Accept
                                      </button>
                                      <button type="button" className="btn btn-outline btn-danger btn-sm" onClick={() => handleUpdateReferralStatus(ref.id, "rejected")}>
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {ref.status === "accepted" && (
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLogReferralConsultClick(ref)}>
                                      <i className="fa-solid fa-stethoscope"></i> Log Consult
                                    </button>
                                  )}
                                  {ref.status === "rejected" && <span style={{ fontSize: "0.8rem", color: "var(--danger)" }}>Rejected</span>}
                                  {ref.status === "completed" && <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>Completed</span>}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Referral Date</th>
                            <th>Patient Name</th>
                            <th>Referred Specialist</th>
                            <th>Reason / Urgency</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sentReferrals.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No outgoing referrals found.</td></tr>
                          ) : (
                            sentReferrals.map(ref => (
                              <tr key={ref.id}>
                                <td>{formatDate(ref.createdAt)}</td>
                                <td>
                                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>{ref.patientName}</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ID: {ref.patientId}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{ref.referredToDoctorName}</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ref.referredToDoctorSpeciality}</div>
                                </td>
                                <td>
                                  <div>{ref.reason}</div>
                                  <span className={`badge ${ref.urgency === "emergency" ? "badge-danger" : (ref.urgency === "urgent" ? "badge-warning" : "badge-info")}`}>
                                    {ref.urgency}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${ref.status === "completed" ? "badge-success" : (ref.status === "accepted" ? "badge-info" : (ref.status === "rejected" ? "badge-danger" : "badge-warning"))}`}>
                                    {ref.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

            {((currentUser.role === "doctor" || currentUser.role === "assistant") && activePage === "patients-dir") && (
              <section className="page-section">
                <div className="panel" style={{ padding: "1.5rem" }}>
                  <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 className="panel-title">
                      <i className="fa-solid fa-users" style={{ color: "var(--primary)" }}></i> Attending Clinical Patients Folder
                    </h3>
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAddPatientOpen(true)}>
                      <i className="fa-solid fa-user-plus"></i> Add New Patient
                    </button>
                  </div>

                  <div className="patients-custom-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {getFilteredPatients().length === 0 ? (
                      <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem" }}>
                        <i className="fa-solid fa-user-slash" style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                        <p>No patients match the search query.</p>
                      </div>
                    ) : (
                      getFilteredPatients().map(pat => {
                        const patApps = getSortedPatientAppointments(pat.id);
                        const isDetailsExpanded = !!expandedDetailsPatientIds[pat.id];
                        const isApptsExpanded = !!expandedAppointmentsPatientIds[pat.id];
                        const initials = pat.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

                        return (
                          <div 
                            key={pat.id} 
                            className="glass-card" 
                            style={{ 
                              border: "1px solid var(--border)", 
                              borderRadius: "12px", 
                              overflow: "hidden",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: isApptsExpanded || isDetailsExpanded ? "var(--shadow-md)" : "var(--shadow-sm)",
                              background: isApptsExpanded || isDetailsExpanded ? "var(--surface)" : "var(--glass)"
                            }}
                          >
                            {/* Card Header Panel */}
                            <div 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between", 
                                padding: "1.25rem", 
                                cursor: "pointer",
                                userSelect: "none"
                              }}
                              onClick={() => setExpandedAppointmentsPatientIds(prev => ({ ...prev, [pat.id]: !prev[pat.id] }))}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                {/* Profile Avatar: clicking toggles details */}
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDetailsPatientIds(prev => ({ ...prev, [pat.id]: !prev[pat.id] }));
                                  }}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: isDetailsExpanded ? "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)" : "linear-gradient(135deg, var(--primary-light) 0%, hsl(var(--primary-hue), 95%, 90%) 100%)",
                                    color: isDetailsExpanded ? "var(--surface)" : "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    position: "relative",
                                    transition: "all 0.25s ease",
                                    border: "2px solid var(--border)"
                                  }}
                                  title="Click avatar to toggle detailed demographics"
                                  className="avatar-interactive"
                                >
                                  {initials}
                                  {/* Small indicator dot for details */}
                                  <span style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.65rem",
                                    color: "var(--text-secondary)"
                                  }}>
                                    <i className={isDetailsExpanded ? "fa-solid fa-chevron-up" : "fa-solid fa-address-card"}></i>
                                  </span>
                                </div>

                                {/* Patient Core Info */}
                                <div>
                                  <h4 
                                    style={{ 
                                      margin: 0, 
                                      fontSize: "1.15rem", 
                                      color: "var(--text-primary)", 
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "0.5rem"
                                    }}
                                  >
                                    {pat.name}
                                    <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-secondary)", backgroundColor: "var(--background)", padding: "2px 8px", borderRadius: "4px" }}>
                                      {pat.id}
                                    </span>
                                  </h4>
                                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    <span><i className="fa-regular fa-calendar" style={{ marginRight: "0.25rem" }}></i> {getPatientAge(pat.dateOfBirth)} Yrs ({pat.gender})</span>
                                    <span><i className="fa-solid fa-phone" style={{ marginRight: "0.25rem" }}></i> {pat.primaryPhone}</span>
                                    {pat.bloodGroup && <span><i className="fa-solid fa-droplet" style={{ marginRight: "0.25rem", color: "var(--danger)" }}></i> {pat.bloodGroup}</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Right side controls */}
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} onClick={(e) => e.stopPropagation()}>
                                <span className={`badge ${patApps.length > 0 ? 'badge-info' : 'badge-outline'}`} style={{ fontSize: "0.75rem" }}>
                                  {patApps.length} {patApps.length === 1 ? 'Appointment' : 'Appointments'}
                                </span>
                                
                                {currentUser.role === "doctor" ? (
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => handleLogConsultClick(pat.id)}
                                    style={{ height: "34px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                  >
                                    <i className="fa-solid fa-stethoscope"></i> Log Consult
                                  </button>
                                ) : (
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => {
                                      setBookingPatientId(pat.id);
                                      setBookingDoctorId(currentUser.doctorId || "");
                                      setBookingDate(new Date().toISOString().split("T")[0]);
                                      setBookingIsBlock(false);
                                      loadBookingSlots();
                                      setIsBookAppOpen(true);
                                    }}
                                    style={{ height: "34px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                  >
                                    <i className="fa-regular fa-calendar-check"></i> Book Slot
                                  </button>
                                )}

                                <button 
                                  className="btn btn-outline btn-sm" 
                                  onClick={() => { setSelectedPatDetailId(pat.id); setActivePage("patient-folder"); }}
                                  style={{ height: "34px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                >
                                  <i className="fa-solid fa-folder-open"></i> Full File
                                </button>

                                <div 
                                  onClick={() => setExpandedAppointmentsPatientIds(prev => ({ ...prev, [pat.id]: !prev[pat.id] }))}
                                  style={{ 
                                    padding: "0.25rem", 
                                    cursor: "pointer",
                                    color: "var(--text-secondary)",
                                    transition: "transform 0.25s ease",
                                    transform: isApptsExpanded ? "rotate(180deg)" : "rotate(0deg)"
                                  }}
                                >
                                  <i className="fa-solid fa-chevron-down" style={{ fontSize: "1.1rem" }}></i>
                                </div>
                              </div>
                            </div>

                            {/* Demographics Drawer Section */}
                            {isDetailsExpanded && (
                              <div 
                                style={{ 
                                  padding: "1.25rem", 
                                  backgroundColor: "var(--background)", 
                                  borderTop: "1px solid var(--border)",
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                  gap: "1.25rem",
                                  animation: "fadeIn 0.25s ease"
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Contact Email</span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 550 }}>{pat.email || "No Email Registered"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Home Address</span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 550 }}>{pat.address || "No Address Provided"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Emergency Contact</span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 550, color: "var(--danger)" }}>{pat.emergencyContact || "None"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Allergies Profile</span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--danger)" }}>{pat.allergies || "No Known Allergies"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Chronic Conditions</span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{pat.chronicConditions || "None Logged"}</span>
                                </div>
                              </div>
                            )}

                            {/* Appointments Timeline Drawer Section */}
                            {isApptsExpanded && (
                              <div 
                                style={{ 
                                  padding: "1.25rem", 
                                  borderTop: "1px solid var(--border)", 
                                  backgroundColor: "#fcfdfe",
                                  animation: "fadeIn 0.25s ease"
                                }}
                              >
                                <h5 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", fontWeight: 600 }}>
                                  Clinical Appointments History (Latest First)
                                </h5>

                                {patApps.length === 0 ? (
                                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                                    <i className="fa-regular fa-calendar-times" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", opacity: 0.5 }}></i>
                                    <p style={{ fontSize: "0.9rem" }}>No clinical appointments found for this patient.</p>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {patApps.map(app => {
                                      let visitBadge = "badge-info";
                                      if (app.visitType === "emergency") visitBadge = "badge-danger";
                                      else if (app.visitType === "follow-up") visitBadge = "badge-success";

                                      const statusBadge = app.status === "completed" 
                                        ? "badge-success" 
                                        : (app.status === "scheduled" ? "badge-info" : "badge-danger");

                                      const appReports = labReports.filter(r => r.appointmentId === app.id);

                                      return (
                                        <div 
                                          key={app.id} 
                                          style={{ 
                                            background: "var(--surface)", 
                                            border: "1px solid var(--border)", 
                                            borderRadius: "8px", 
                                            padding: "1rem",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "0.75rem",
                                            transition: "transform 0.2s ease"
                                          }}
                                          className="appointment-inner-card"
                                        >
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)" }}>
                                                {formatDate(app.appointmentDate)} at {app.appointmentTime}
                                              </span>
                                              <span className={`badge ${visitBadge}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                                {app.visitType}
                                              </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                              <span className={`badge ${statusBadge}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                                {app.status}
                                              </span>
                                              <code style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{app.id}</code>
                                            </div>
                                          </div>

                                          <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            <div><strong>Chief Complaint:</strong> {app.chiefComplaint || "No complaint logged."}</div>
                                            {app.notes && (
                                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", backgroundColor: "var(--background)", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border)", marginTop: "0.25rem" }}>
                                                <strong>Doctor Notes:</strong> {app.notes}
                                              </div>
                                            )}
                                          </div>

                                          {/* Appt level quick actions */}
                                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                                            {app.status === "scheduled" && currentUser.role === "doctor" && (
                                              <button 
                                                className="btn btn-secondary btn-sm" 
                                                onClick={() => startConsultationSoap(app.id)}
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                              >
                                                <i className="fa-solid fa-stethoscope"></i> Start SOAP
                                              </button>
                                            )}
                                            {app.status === "completed" && (
                                              <button 
                                                className="btn btn-outline btn-sm" 
                                                onClick={() => loadPrescriptionPrint("", app.id)}
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                              >
                                                <i className="fa-solid fa-print"></i> Prescription Slip
                                              </button>
                                            )}
                                            {appReports.length > 0 && (
                                              <button 
                                                className="btn btn-outline btn-sm" 
                                                onClick={() => openViewReportsModal(app.id)}
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                              >
                                                <i className="fa-solid fa-file-waveform"></i> Diagnostic Reports ({appReports.length})
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            )}

            {((currentUser.role === "doctor" || currentUser.role === "assistant") && activePage === "patient-folder") && (
              <section className="page-section">
                <div style={{ marginBottom: "1.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setActivePage("patients-dir")}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Patients Directory
                  </button>
                </div>
                {(() => {
                  const pat = patients.find(p => p.id === selectedPatDetailId);
                  if (!pat) return <p>Loading Patient profile folder...</p>;

                  // Find history timeline items
                  const consults = appointments.filter(a => a.patientId === pat.id && a.status === "completed");
                  const reports = labReports.filter(r => r.patientId === pat.id);

                  return (
                    <div className="dash-row">
                      <div className="panel" style={{ transition: "all 0.3s ease" }}>
                        <div className="panel-header"><h3 className="panel-title"><i className="fa-solid fa-id-card"></i> Demographics Summary</h3></div>
                        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                          <div 
                            onClick={() => setExpandedDetailsPatientIds(prev => ({ ...prev, [pat.id]: !prev[pat.id] }))}
                            style={{ 
                              width: 70, 
                              height: 70, 
                              borderRadius: "50%", 
                              background: expandedDetailsPatientIds[pat.id] ? "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)" : "var(--primary-light)", 
                              color: expandedDetailsPatientIds[pat.id] ? "var(--surface)" : "var(--primary)", 
                              fontSize: "1.75rem", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              fontWeight: 700, 
                              marginBottom: "0.5rem",
                              cursor: "pointer",
                              border: "2px solid var(--border)",
                              transition: "all 0.25s ease",
                              position: "relative"
                            }}
                            title="Click profile icon to toggle details"
                            className="avatar-interactive"
                          >
                            {pat.name.charAt(0)}
                            <span style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)"
                            }}>
                              <i className={expandedDetailsPatientIds[pat.id] ? "fa-solid fa-chevron-up" : "fa-solid fa-address-card"}></i>
                            </span>
                          </div>
                          <h2>{pat.name}</h2>
                          <code>{pat.id}</code>
                        </div>

                        {expandedDetailsPatientIds[pat.id] ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", animation: "fadeIn 0.25s ease" }}>
                            <div><strong>Age / Gender:</strong> {getPatientAge(pat.dateOfBirth)} Yrs / {pat.gender}</div>
                            <div><strong>Contact Phone:</strong> {pat.primaryPhone}</div>
                            {pat.email && <div><strong>Email:</strong> {pat.email}</div>}
                            <div><strong>Blood Group:</strong> <span className="badge badge-info">{pat.bloodGroup}</span></div>
                            <div><strong>Home Address:</strong> {pat.address || "N/A"}</div>
                            <div><strong>Emergency Contact:</strong> {pat.emergencyContact || "N/A"}</div>
                            <div style={{ color: "var(--danger)" }}><strong>Allergies:</strong> {pat.allergies || "No allergies logged"}</div>
                            <div><strong>Chronic Conditions:</strong> {pat.chronicConditions || "No chronic diseases logged"}</div>
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                            <p><i className="fa-solid fa-circle-info" style={{ marginRight: "0.25rem" }}></i> Click profile icon to view details.</p>
                          </div>
                        )}
                      </div>

                      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div 
                          className="panel-header" 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginBottom: "1rem"
                          }}
                        >
                          <h3 className="panel-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--primary)" }}></i> Clinical Appointments Portfolio
                            <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                              {getSortedPatientAppointments(pat.id).length} Appts
                            </span>
                          </h3>
                          {currentUser.role === "doctor" ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleLogConsultClick(pat.id)}>
                              <i className="fa-solid fa-stethoscope"></i> Log Consult
                            </button>
                          ) : (
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => {
                                setBookingPatientId(pat.id);
                                setBookingDoctorId(currentUser.doctorId || "");
                                setBookingDate(new Date().toISOString().split("T")[0]);
                                setBookingIsBlock(false);
                                loadBookingSlots();
                                setIsBookAppOpen(true);
                              }}
                            >
                              <i className="fa-regular fa-calendar-check"></i> Book Slot
                            </button>
                          )}
                        </div>

                        <div className="patient-appointments-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {getSortedPatientAppointments(pat.id).length === 0 ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                              <i className="fa-regular fa-calendar-times" style={{ fontSize: "1.8rem", marginBottom: "0.5rem", opacity: 0.5 }}></i>
                              <p>No historical appointments found in this file.</p>
                            </div>
                          ) : (
                            getSortedPatientAppointments(pat.id).map(app => {
                              let visitBadge = "badge-info";
                              if (app.visitType === "emergency") visitBadge = "badge-danger";
                              else if (app.visitType === "follow-up") visitBadge = "badge-success";

                              const statusBadge = app.status === "completed" 
                                ? "badge-success" 
                                : (app.status === "scheduled" ? "badge-info" : "badge-danger");

                              const appReports = labReports.filter(r => r.appointmentId === app.id);

                              return (
                                <div 
                                  key={app.id} 
                                  style={{ 
                                    background: "var(--surface)", 
                                    border: "1px solid var(--border)", 
                                    borderRadius: "10px", 
                                    padding: "1.25rem",
                                    boxShadow: "var(--shadow-sm)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.85rem"
                                  }}
                                  className="appointment-full-card"
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--primary)" }}>
                                        {formatDate(app.appointmentDate)} at {app.appointmentTime}
                                      </span>
                                      <span className={`badge ${visitBadge}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                        {app.visitType}
                                      </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                      <span className={`badge ${statusBadge}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                        {app.status}
                                      </span>
                                      <code style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{app.id}</code>
                                    </div>
                                  </div>

                                  <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                    <div><strong>Chief Complaint:</strong> {app.chiefComplaint || "No complaint logged."}</div>
                                    {app.notes && (
                                      <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", backgroundColor: "var(--background)", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border)", marginTop: "0.25rem" }}>
                                        <strong>Attending Doctor Notes:</strong> {app.notes}
                                      </div>
                                    )}
                                  </div>

                                  {/* Lab Reports inline for this appointment if any exist */}
                                  {appReports.length > 0 && (
                                    <div style={{ marginTop: "0.5rem", borderTop: "1px dashed var(--border)", paddingTop: "0.5rem" }}>
                                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Linked Diagnostic Reports</span>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                                        {appReports.map(rep => (
                                          <div key={rep.id} style={{ padding: "0.75rem", background: "var(--background)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                                              <span>{rep.reportTitle}</span>
                                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{formatDate(rep.uploadedAt)}</span>
                                            </div>
                                            <pre style={{ fontFamily: "monospace", fontSize: "0.75rem", padding: "0.35rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, whiteSpace: "pre-wrap", margin: 0 }}>
                                              {rep.findings}
                                            </pre>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Appt level quick actions */}
                                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                                    {app.status === "scheduled" && currentUser.role === "doctor" && (
                                      <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={() => startConsultationSoap(app.id)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                      >
                                        <i className="fa-solid fa-stethoscope"></i> Start SOAP
                                      </button>
                                    )}
                                    {app.status === "completed" && (
                                      <button 
                                        className="btn btn-outline btn-sm" 
                                        onClick={() => loadPrescriptionPrint("", app.id)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                      >
                                        <i className="fa-solid fa-print"></i> Prescription Slip
                                      </button>
                                    )}
                                    {appReports.length > 0 && (
                                      <button 
                                        className="btn btn-outline btn-sm" 
                                        onClick={() => openViewReportsModal(app.id)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                      >
                                        <i className="fa-solid fa-file-waveform"></i> View PDF/Files ({appReports.length})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {((currentUser.role === "doctor" || currentUser.role === "assistant") && activePage === "calendar") && (() => {
              const targetDocId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
              const docProfile = doctors.find(d => d.id === targetDocId);
              
              const year = calendarDate.getFullYear();
              const month = calendarDate.getMonth();
              const monthName = calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" });
              
              const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
              const totalDays = new Date(year, month + 1, 0).getDate();
              
              const calendarCells: (Date | null)[] = [];
              for (let i = 0; i < firstDay; i++) {
                calendarCells.push(null);
              }
              for (let d = 1; d <= totalDays; d++) {
                calendarCells.push(new Date(year, month, d));
              }
              while (calendarCells.length % 7 !== 0) {
                calendarCells.push(null);
              }
              
              const getLocalDateString = (d: Date) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}`;
              };
              
              const getSessionType = (timeStr: string) => {
                if (!timeStr) return "morning";
                const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                if (match) {
                  let hours = parseInt(match[1], 10);
                  const ampm = match[3].toUpperCase();
                  if (ampm === "PM" && hours < 12) hours += 12;
                  if (ampm === "AM" && hours === 12) hours = 0;
                  return hours >= 16 ? "evening" : "morning";
                }
                const match24 = timeStr.match(/^(\d+):(\d+)/);
                if (match24) {
                  const hours = parseInt(match24[1], 10);
                  return hours >= 16 ? "evening" : "morning";
                }
                return "morning";
              };
              
              const handlePrevMonth = () => {
                setCalendarDate(new Date(year, month - 1, 1));
              };
              
              const handleNextMonth = () => {
                setCalendarDate(new Date(year, month + 1, 1));
              };
              
              return (
                <section className="page-section animate-fade-in">
                  <div className="panel" style={{ padding: "1.5rem" }}>
                    <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                      <h3 className="panel-title">
                        <i className="fa-solid fa-calendar-days" style={{ color: "var(--primary)" }}></i> 
                        {currentUser.role === "assistant" ? `Dr. ${docProfile?.name || ""}'s Consulting Schedule` : "Consultation Load Calendar"}
                      </h3>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={handlePrevMonth}>
                          <i className="fa-solid fa-chevron-left"></i> Prev
                        </button>
                        <strong style={{ fontSize: "1.1rem", minWidth: "140px", textAlign: "center" }}>{monthName}</strong>
                        <button type="button" className="btn btn-outline btn-sm" onClick={handleNextMonth}>
                          Next <i className="fa-solid fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="calendar-grid-monthly" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.75rem" }}>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div 
                          key={d} 
                          className="calendar-header-day" 
                          style={{ 
                            textAlign: "center", 
                            fontWeight: 700, 
                            padding: "0.5rem", 
                            color: d === "Sun" || d === "Sat" ? "var(--text-secondary)" : "var(--text-primary)",
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}
                        >
                          {d}
                        </div>
                      ))}
                      
                      {calendarCells.map((cellDate, idx) => {
                        if (!cellDate) {
                          return (
                            <div 
                              key={`empty-${idx}`} 
                              style={{ 
                                background: "transparent", 
                                border: "1px dashed var(--border)", 
                                opacity: 0.15,
                                borderRadius: "8px",
                                minHeight: "110px" 
                              }} 
                            />
                          );
                        }
                        
                        const dateStr = getLocalDateString(cellDate);
                        const dayApps = appointments.filter(
                          a => a.doctorId === targetDocId && a.appointmentDate === dateStr && a.status !== "cancelled"
                        );
                        
                        const morningApps = dayApps.filter(a => a.status !== "blocked" && getSessionType(a.appointmentTime) === "morning");
                        const eveningApps = dayApps.filter(a => a.status !== "blocked" && getSessionType(a.appointmentTime) === "evening");
                        const blockedApps = dayApps.filter(a => a.status === "blocked");
                        
                        const totalActive = morningApps.length + eveningApps.length;
                        
                        let loadColor = "var(--border)";
                        let glowClass = "";
                        if (totalActive > 20) {
                          loadColor = "var(--danger)";
                          glowClass = "high-load-glow";
                        } else if (totalActive > 5) {
                          loadColor = "var(--primary)";
                        } else if (totalActive > 0) {
                          loadColor = "var(--success)";
                        }
                        
                        const isToday = getLocalDateString(new Date()) === dateStr;
                        
                        return (
                          <div 
                            key={dateStr} 
                            onClick={() => setSelectedCalendarDateStr(dateStr)}
                            className={`calendar-day-card ${glowClass}`}
                            style={{ 
                              cursor: "pointer", 
                              border: isToday ? "2px solid var(--secondary)" : `1px solid ${loadColor}`, 
                              borderRadius: "8px", 
                              padding: "0.75rem",
                              minHeight: "115px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              transition: "all 0.2s ease",
                              background: isToday ? "rgba(16, 185, 129, 0.05)" : "var(--glass)",
                              boxShadow: isToday ? "0 0 15px rgba(16, 185, 129, 0.15)" : "var(--shadow-sm)"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ 
                                fontWeight: 700, 
                                fontSize: "1.05rem",
                                color: isToday ? "var(--secondary)" : "var(--text-primary)"
                              }}>
                                {cellDate.getDate()}
                              </span>
                              {totalActive > 0 && (
                                <span className={`badge ${totalActive > 20 ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: "0.65rem", padding: "1px 5px" }}>
                                  {totalActive} visits
                                </span>
                              )}
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem" }}>
                              {morningApps.length > 0 && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <span style={{ color: "#eab308" }}>🌅</span> M: <strong>{morningApps.length}</strong>
                                </div>
                              )}
                              {eveningApps.length > 0 && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <span style={{ color: "#3b82f6" }}>🌇</span> E: <strong>{eveningApps.length}</strong>
                                </div>
                              )}
                              {blockedApps.length > 0 && (
                                <div style={{ fontSize: "0.72rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <span>🚫</span> Blocked
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })()}

            {currentUser.role === "doctor" && activePage === "analytics" && (() => {
              // 1. Calculate months list (last 6 months)
              const today = new Date();
              const monthsList = [];
              for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
                const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                monthsList.push({ monthKey, label });
              }

              // 2. Fetch doctor appointments & filter
              const docApps = appointments.filter(a => a.doctorId === currentUser.id);
              const completedApps = docApps.filter(a => a.status === "completed");
              
              // 3. Compute stats for summary cards
              const totalAppsCount = docApps.length;
              const completedAppsCount = completedApps.length;
              const doctorFee = doctors.find(d => d.id === currentUser.id)?.consultationFee || 500;
              const totalRevenue = completedAppsCount * doctorFee;
              const sentRefsCount = sentReferrals.length;
              const rcvdRefsCount = receivedReferrals.length;

              // 4. Monthly breakdowns for SVG bar chart
              const monthlyData = monthsList.map(m => {
                const monthApps = docApps.filter(a => a.appointmentDate.startsWith(m.monthKey));
                const monthCompleted = monthApps.filter(a => a.status === "completed");
                return {
                  monthKey: m.monthKey,
                  label: m.label,
                  count: monthApps.length,
                  revenue: monthCompleted.length * doctorFee
                };
              });

              // Max count for scaling the bar chart heights
              const maxCount = Math.max(...monthlyData.map(d => d.count), 5);

              // 5. Diagnoses list for the donut chart
              const activeAppsForDiagnoses = analyticsMonthFilter === "all"
                ? completedApps
                : completedApps.filter(a => a.appointmentDate.startsWith(analyticsMonthFilter));
              
              const doctorSpecialty = doctors.find(d => d.id === currentUser.id)?.speciality || "General Practitioner";
              const diagnosesProfile = getDiagnosesProfile(doctorSpecialty, activeAppsForDiagnoses.length);
              const totalDiagnosesCases = diagnosesProfile.reduce((sum, d) => sum + d.cases, 0);

              // 6. Specialist referrals month-wise calculations
              const filteredReferrals = sentReferrals.filter(ref => {
                if (analyticsMonthFilter === "all") return true;
                const refDate = new Date(ref.createdAt);
                const refMonthKey = refDate.getFullYear() + "-" + String(refDate.getMonth() + 1).padStart(2, "0");
                return refMonthKey === analyticsMonthFilter;
              });

              const referralsByDoctor: Record<string, { doctorId: string; name: string; speciality: string; referrals: any[] }> = {};
              filteredReferrals.forEach(ref => {
                const docId = ref.referredToDoctorId;
                if (!referralsByDoctor[docId]) {
                  referralsByDoctor[docId] = {
                    doctorId: docId,
                    name: ref.referredToDoctorName || "Unknown Doctor",
                    speciality: ref.referredToDoctorSpeciality || "Specialist",
                    referrals: []
                  };
                }
                referralsByDoctor[docId].referrals.push(ref);
              });
              const referredDoctorsList = Object.values(referralsByDoctor);

              // Helper for diagnoses data distribution
              function getDiagnosesProfile(specialty: string, total: number) {
                let categories = [
                  { name: "General Checkup", pct: 40, color: "var(--primary)" },
                  { name: "Seasonal Influenza", pct: 30, color: "var(--secondary)" },
                  { name: "Allergic Rhinitis", pct: 15, color: "var(--warning)" },
                  { name: "Acute Gastritis", pct: 10, color: "var(--danger)" },
                  { name: "Vitamin Deficiency", pct: 5, color: "#a855f7" }
                ];

                if (specialty === "Cardiologist") {
                  categories = [
                    { name: "Essential Hypertension", pct: 35, color: "var(--primary)" },
                    { name: "Coronary Artery Disease", pct: 25, color: "var(--secondary)" },
                    { name: "Atrial Fibrillation", pct: 20, color: "var(--warning)" },
                    { name: "Congestive Heart Failure", pct: 12, color: "var(--danger)" },
                    { name: "Hyperlipidemia", pct: 8, color: "#a855f7" }
                  ];
                } else if (specialty === "Neurologist") {
                  categories = [
                    { name: "Migraine Disorders", pct: 40, color: "var(--primary)" },
                    { name: "Tension Headaches", pct: 25, color: "var(--secondary)" },
                    { name: "Epilepsy / Seizures", pct: 15, color: "var(--warning)" },
                    { name: "Multiple Sclerosis", pct: 12, color: "var(--danger)" },
                    { name: "Parkinson's Disease", pct: 8, color: "#a855f7" }
                  ];
                } else if (specialty === "Pediatrician") {
                  categories = [
                    { name: "Pediatric Asthma", pct: 30, color: "var(--primary)" },
                    { name: "Acute Otitis Media", pct: 25, color: "var(--secondary)" },
                    { name: "Viral Gastroenteritis", pct: 20, color: "var(--warning)" },
                    { name: "Allergic Dermatitis", pct: 15, color: "var(--danger)" },
                    { name: "Streptococcal Pharyngitis", pct: 10, color: "#a855f7" }
                  ];
                }

                return categories.map(cat => {
                  const cases = Math.max(1, Math.round((cat.pct / 100) * total));
                  return { ...cat, cases };
                });
              }

              // Compute donut segments
              let currentOffset = 0;
              const donutSegments = diagnosesProfile.map((diag, index) => {
                const percentage = totalDiagnosesCases > 0 ? (diag.cases / totalDiagnosesCases) * 100 : 0;
                const strokeDasharray = `${(percentage / 100) * 314} 314`;
                const strokeDashoffset = -currentOffset;
                currentOffset += (percentage / 100) * 314;
                return {
                  ...diag,
                  percentage: Math.round(percentage),
                  strokeDasharray,
                  strokeDashoffset
                };
              });

              return (
                <section className="page-section">
                  {/* Platform Vitals Summary Row */}
                  <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                    <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="stat-icon primary"><i className="fa-regular fa-calendar-check"></i></div>
                      <div className="stat-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3>{totalAppsCount}</h3>
                          <svg width="50" height="20" viewBox="0 0 50 20" style={{ opacity: 0.7 }}>
                            <path d="M0,15 L10,12 L20,18 L30,5 L40,12 L50,6" fill="none" stroke="var(--primary)" strokeWidth="2" />
                          </svg>
                        </div>
                        <p>Total Consultations</p>
                      </div>
                    </div>
                    
                    <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="stat-icon secondary"><i className="fa-solid fa-indian-rupee-sign"></i></div>
                      <div className="stat-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3>₹{totalRevenue}</h3>
                          <svg width="50" height="20" viewBox="0 0 50 20" style={{ opacity: 0.7 }}>
                            <path d="M0,18 L10,15 L20,16 L30,10 L40,8 L50,4" fill="none" stroke="var(--secondary)" strokeWidth="2" />
                          </svg>
                        </div>
                        <p>Estimated Revenue</p>
                      </div>
                    </div>

                    <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="stat-icon warning"><i className="fa-solid fa-paper-plane"></i></div>
                      <div className="stat-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3>{sentRefsCount}</h3>
                          <svg width="50" height="20" viewBox="0 0 50 20" style={{ opacity: 0.7 }}>
                            <path d="M0,5 L10,8 L20,12 L30,6 L40,14 L50,10" fill="none" stroke="var(--warning)" strokeWidth="2" />
                          </svg>
                        </div>
                        <p>Referrals Sent</p>
                      </div>
                    </div>

                    <div className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="stat-icon danger"><i className="fa-solid fa-inbox"></i></div>
                      <div className="stat-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3>{rcvdRefsCount}</h3>
                          <svg width="50" height="20" viewBox="0 0 50 20" style={{ opacity: 0.7 }}>
                            <path d="M0,12 L10,14 L20,8 L30,15 L40,5 L50,2" fill="none" stroke="var(--danger)" strokeWidth="2" />
                          </svg>
                        </div>
                        <p>Referrals Received</p>
                      </div>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    
                    {/* Monthly Volume Bar Chart */}
                    <div className="panel" style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 className="panel-title"><i className="fa-solid fa-chart-bar" style={{ color: "var(--primary)" }}></i> Monthly Consultation Volume</h3>
                        {analyticsMonthFilter !== "all" && (
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm" 
                            onClick={() => setAnalyticsMonthFilter("all")}
                            style={{ fontSize: "0.75rem", padding: "2px 6px" }}
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                        Click on any month bar to filter the Diagnoses and Specialist Referrals widgets.
                      </p>

                      <div style={{ position: "relative", width: "100%", height: 180 }}>
                        <svg width="100%" height="100%" viewBox="0 0 360 160" preserveAspectRatio="none">
                          {/* Y-Axis Guidlines */}
                          <line x1="20" y1="20" x2="350" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="20" y1="75" x2="350" y2="75" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="20" y1="130" x2="350" y2="130" stroke="var(--border)" strokeWidth="2" />

                          {monthlyData.map((d, idx) => {
                            const barWidth = 32;
                            const barGap = 20;
                            const x = 30 + idx * (barWidth + barGap);
                            const height = (d.count / maxCount) * 100;
                            const y = 130 - height;
                            const isSelected = analyticsMonthFilter === d.monthKey;

                            return (
                              <g key={d.monthKey}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={height}
                                  rx="4"
                                  fill={isSelected ? "var(--secondary)" : (hoveredBarIdx === idx ? "var(--primary-hover)" : "var(--primary)")}
                                  style={{
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    cursor: "pointer",
                                    filter: isSelected ? "drop-shadow(0 0 8px var(--secondary))" : (hoveredBarIdx === idx ? "drop-shadow(0 4px 8px var(--primary-glow))" : "none")
                                  }}
                                  onMouseEnter={() => setHoveredBarIdx(idx)}
                                  onMouseLeave={() => setHoveredBarIdx(null)}
                                  onClick={() => setAnalyticsMonthFilter(analyticsMonthFilter === d.monthKey ? "all" : d.monthKey)}
                                />
                                <text x={x + barWidth / 2} y="148" textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight="600">
                                  {d.label}
                                </text>

                                {/* Tooltip on hover */}
                                {hoveredBarIdx === idx && (
                                  <g>
                                    <rect
                                      x={x - 24}
                                      y={y - 28}
                                      width={80}
                                      height={22}
                                      rx="4"
                                      fill="var(--text-primary)"
                                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                                    />
                                    <text x={x + barWidth / 2} y={y - 14} textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--surface)">
                                      {d.count} Appt | ₹{d.revenue}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Donut diagnoses profile */}
                    <div className="panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 className="panel-title" style={{ width: "100%", alignSelf: "flex-start" }}>
                        <i className="fa-solid fa-chart-pie" style={{ color: "var(--secondary)" }}></i> Diagnoses Profile
                      </h3>
                      
                      {totalDiagnosesCases === 0 ? (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", padding: "3rem 0", textAlign: "center" }}>
                          No clinical diagnostics locked in this period.
                        </p>
                      ) : (
                        <>
                          <div style={{ margin: "1rem 0" }}>
                            <svg width="150" height="150" viewBox="0 0 160 160">
                              {donutSegments.map((seg, idx) => (
                                <circle
                                  key={idx}
                                  cx="80"
                                  cy="80"
                                  r="50"
                                  fill="transparent"
                                  stroke={seg.color}
                                  strokeWidth={hoveredDonutIdx === idx ? 24 : 20}
                                  strokeDasharray={seg.strokeDasharray}
                                  strokeDashoffset={seg.strokeDashoffset}
                                  transform="rotate(-90 80 80)"
                                  style={{
                                    transition: "all 0.2s ease",
                                    opacity: hoveredDonutIdx === null || hoveredDonutIdx === idx ? 1 : 0.6,
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={() => setHoveredDonutIdx(idx)}
                                  onMouseLeave={() => setHoveredDonutIdx(null)}
                                />
                              ))}
                              
                              <circle cx="80" cy="80" r="38" fill="var(--surface)" />
                              
                              {hoveredDonutIdx !== null ? (
                                <>
                                  <text x="80" y="76" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--text-primary)">
                                    {donutSegments[hoveredDonutIdx].name.slice(0, 16)}
                                  </text>
                                  <text x="80" y="93" textAnchor="middle" fontSize="10" fontWeight="800" fill={donutSegments[hoveredDonutIdx].color}>
                                    {donutSegments[hoveredDonutIdx].cases} Cases ({donutSegments[hoveredDonutIdx].percentage}%)
                                  </text>
                                </>
                              ) : (
                                <>
                                  <text x="80" y="74" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--text-secondary)">
                                    Total Profile
                                  </text>
                                  <text x="80" y="94" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text-primary)">
                                    {totalDiagnosesCases} Cases
                                  </text>
                                </>
                              )}
                            </svg>
                          </div>

                          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem" }}>
                            {donutSegments.map((seg, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  alignItems: "center", 
                                  padding: "0.25rem 0.5rem", 
                                  borderRadius: 4,
                                  background: hoveredDonutIdx === idx ? "var(--background)" : "transparent",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={() => setHoveredDonutIdx(idx)}
                                onMouseLeave={() => setHoveredDonutIdx(null)}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color }}></span>
                                  <strong style={{ color: "var(--text-primary)" }}>{seg.name}</strong>
                                </span>
                                <span style={{ color: "var(--text-secondary)" }}>{seg.cases} cases ({seg.percentage}%)</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Referred Specialists Month-Wise card grid */}
                  <div className="panel" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                      <h3 className="panel-title">
                        <i className="fa-solid fa-share-nodes" style={{ color: "var(--secondary)" }}></i> Specialist Referrals Month-Wise
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>Month Filter:</label>
                        <select 
                          value={analyticsMonthFilter} 
                          onChange={(e) => setAnalyticsMonthFilter(e.target.value)} 
                          style={{ width: 130, padding: "4px 8px", borderRadius: 6, fontSize: "0.8rem" }}
                        >
                          <option value="all">All Months</option>
                          {monthsList.map(m => (
                            <option key={m.monthKey} value={m.monthKey}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {referredDoctorsList.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>
                        No outbound referrals found in this period.
                      </p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
                        {referredDoctorsList.map(rec => {
                          const isExpanded = expandedReferredDocId === rec.doctorId;
                          const totalRefs = rec.referrals.length;
                          const sentRefs = rec.referrals.filter(r => r.status === "sent").length;
                          const acceptedRefs = rec.referrals.filter(r => r.status === "accepted").length;
                          const completedRefs = rec.referrals.filter(r => r.status === "completed").length;

                          const completionRate = Math.round((completedRefs / totalRefs) * 100);

                          return (
                            <div 
                              key={rec.doctorId}
                              className="glass-card"
                              style={{ 
                                padding: "1.25rem", 
                                borderLeft: "4px solid var(--secondary)", 
                                cursor: "pointer"
                              }}
                              onClick={() => setExpandedReferredDocId(isExpanded ? null : rec.doctorId)}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                  <h4 style={{ margin: 0, color: "var(--secondary)", fontSize: "1rem" }}>{rec.name}</h4>
                                  <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{rec.speciality}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <span className="badge badge-info" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{totalRefs} Referrals</span>
                                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                    {completionRate}% Completed
                                  </p>
                                </div>
                              </div>

                              <div style={{ marginTop: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 600 }}>
                                  <span>Sent ({sentRefs})</span>
                                  <span>Accepted ({acceptedRefs})</span>
                                  <span>Completed ({completedRefs})</span>
                                </div>
                                <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, display: "flex", overflow: "hidden" }}>
                                  <div style={{ width: `${(sentRefs / totalRefs) * 100}%`, height: "100%", background: "var(--warning)" }}></div>
                                  <div style={{ width: `${(acceptedRefs / totalRefs) * 100}%`, height: "100%", background: "var(--primary)" }}></div>
                                  <div style={{ width: `${(completedRefs / totalRefs) * 100}%`, height: "100%", background: "var(--secondary)" }}></div>
                                </div>
                              </div>

                              <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                                <span>{isExpanded ? "Click to collapse details" : "Click to view patient details"}</span>
                                <i className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                              </div>

                              {isExpanded && (
                                <div style={{ marginTop: "1rem", borderTop: "1px dashed var(--border)", paddingTop: "0.75rem" }} onClick={(e) => e.stopPropagation()}>
                                  <h5 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Referred Patients</h5>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {rec.referrals.map(ref => (
                                      <div key={ref.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "var(--background)", borderRadius: 6, border: "1px solid var(--border)", fontSize: "0.75rem" }}>
                                        <div>
                                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ref.patientName}</div>
                                          <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                                            Reason: {ref.reason} | Date: {formatDate(ref.createdAt)}
                                          </div>
                                        </div>
                                        <span className={`badge ${ref.status === "completed" ? "badge-success" : (ref.status === "accepted" ? "badge-info" : "badge-warning")}`} style={{ fontSize: "0.65rem" }}>
                                          {ref.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {currentUser.role === "doctor" && activePage === "assistants" && (
              <section className="page-section animate-fade-in">
                <div className="dash-row">
                  {/* Left Column: Register New Assistant */}
                  <div className="panel" style={{ flex: 1, minWidth: "320px" }}>
                    <div className="panel-header">
                      <h3 className="panel-title">
                        <i className="fa-solid fa-user-plus" style={{ color: "var(--primary)" }}></i> Register New Receptionist
                      </h3>
                    </div>
                    <form onSubmit={handleRegisterAssistant} style={{ marginTop: "1.25rem" }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Alex Assistant" 
                          value={newAssistantName} 
                          onChange={(e) => setNewAssistantName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="e.g. 9898989898" 
                          value={newAssistantPhone} 
                          onChange={(e) => setNewAssistantPhone(e.target.value)} 
                          required 
                        />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "block" }}>
                          Used for sandbox OTP login (verification code will be <strong>1234</strong>)
                        </span>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}>
                        <i className="fa-solid fa-user-plus"></i> Add Assistant
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Active Assistants List */}
                  <div className="panel" style={{ flex: 2, minWidth: "450px" }}>
                    <div className="panel-header">
                      <h3 className="panel-title">
                        <i className="fa-solid fa-user-tie" style={{ color: "var(--secondary)" }}></i> Active Assistants
                      </h3>
                      <span className="badge badge-info">{assistants.length} Active</span>
                    </div>
                    
                    <div style={{ marginTop: "1.25rem" }}>
                      {assistants.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--glass)" }}>
                          <i className="fa-solid fa-user-tie" style={{ fontSize: "2.5rem", color: "var(--text-secondary)", marginBottom: "1rem", opacity: 0.5 }}></i>
                          <p style={{ color: "var(--text-secondary)" }}>No assistants bound to your account yet.</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Add a receptionist on the left to start delegation.</p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {assistants.map(ast => (
                            <div 
                              key={ast.id} 
                              className="glass-card" 
                              style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                padding: "1.25rem", 
                                borderLeft: "4px solid var(--primary)",
                                background: "var(--glass)",
                                borderRadius: "10px"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ 
                                  width: "45px", 
                                  height: "45px", 
                                  borderRadius: "50%", 
                                  background: "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)",
                                  color: "white", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  fontWeight: 700 
                                }}>
                                  {ast.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{ast.name}</h4>
                                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem", display: "flex", gap: "1rem" }}>
                                    <span><i className="fa-solid fa-id-badge"></i> {ast.id}</span>
                                    <span><i className="fa-solid fa-phone"></i> {ast.phone}</span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                className="btn btn-outline btn-danger btn-sm" 
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                onClick={() => handleDeleteAssistant(ast.id)}
                              >
                                <i className="fa-regular fa-trash-can"></i> Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}


            {/* ==================== PATIENT SCREEN WORKSPACES ==================== */}
            {currentUser.role === "patient" && activePage === "dashboard" && (
              <section className="page-section">
                <div className="panel" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderColor: "#bfdbfe" }}>
                  <h3 style={{ color: "#1e3a8a", marginBottom: "0.5rem" }}><i className="fa-solid fa-wallet"></i> Patient Health Wallet</h3>
                  {(() => {
                    const activeDetails = getActivePatientDetails();
                    return activeDetails ? (
                      <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem", color: "#1e40af" }}>
                        <div><strong>Blood Group:</strong> {activeDetails.bloodGroup || "N/A"}</div>
                        <div><strong>Allergies:</strong> <span style={{ color: "var(--danger)", fontWeight: 600 }}>{activeDetails.allergies || "None"}</span></div>
                        <div><strong>Chronic:</strong> {activeDetails.chronicConditions || "None"}</div>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="dash-row">
                  <div className="panel">
                    <div className="panel-header">
                      <h3 className="panel-title"><i className="fa-regular fa-calendar-check"></i> My upcoming Consultations</h3>
                      <button className="btn btn-primary btn-sm" onClick={() => setActivePage("find-doctors")}>
                        <i className="fa-solid fa-magnifying-glass"></i> Find Doctors
                      </button>
                    </div>
                    <div>
                      {appointments.filter(a => a.patientId === currentUser.id && (activePatientId === currentUser.id ? !a.familyMemberId : a.familyMemberId === activePatientId) && a.status === "scheduled").length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>No upcoming consultations. Find specialized doctors to schedule a review.</p>
                      ) : (
                        appointments.filter(a => a.patientId === currentUser.id && (activePatientId === currentUser.id ? !a.familyMemberId : a.familyMemberId === activePatientId) && a.status === "scheduled").map(app => {
                          const doc = doctors.find(d => d.id === app.doctorId);
                          return (
                            <div className="panel" key={app.id} style={{ borderLeft: "4px solid var(--primary)", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                              <div>
                                <h4 style={{ color: "var(--primary)" }}>{doc?.name} ({doc?.speciality})</h4>
                                <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                                  <i className="fa-regular fa-calendar"></i> {formatDate(app.appointmentDate)} at {app.appointmentTime}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                  Clinic: {doc?.clinicName}
                                </div>
                              </div>
                              <button className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "var(--danger-light)" }} onClick={() => handleCancelAppointment(app.id)}>
                                Cancel
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="panel">
                      <h4 style={{ marginBottom: "1rem" }}>Quick Links</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("find-doctors")}>
                          <i className="fa-solid fa-user-doctor" style={{ color: "var(--primary)" }}></i> Find Doctors
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("records-wallet")}>
                          <i className="fa-solid fa-file-invoice" style={{ color: "var(--secondary)" }}></i> Health Wallet Records
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("pharmacy")}>
                          <i className="fa-solid fa-pills" style={{ color: "var(--warning)" }}></i> Order Prescriptions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {currentUser.role === "patient" && activePage === "find-doctors" && (
              <section className="page-section">
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="panel-title"><i className="fa-solid fa-user-md"></i> Find specialized Doctor Profiles</h3>
                    <select value={doctorSpecialtyFilter} onChange={(e) => setDoctorSpecialtyFilter(e.target.value)} style={{ width: 200 }}>
                      <option value="all">All Specialties</option>
                      <option value="Cardiologist">Cardiology</option>
                      <option value="Pediatrician">Pediatrics</option>
                      <option value="Neurologist">Neurology</option>
                    </select>
                  </div>

                  <div className="doctor-search-grid">
                    {getFilteredDoctors().map(doc => (
                      <div className="doctor-search-card" key={doc.id}>
                        <div>
                          <div className="doc-card-top">
                            <img className="doc-card-avatar" src={doc.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200"} alt="doc" />
                            <div className="doc-card-info">
                              <div className="doc-card-speciality">{doc.speciality}</div>
                              <h3>{doc.name}</h3>
                              <div className="doc-card-qual">{doc.qualifications}</div>
                              <div className="doc-card-rating"><i className="fa-solid fa-star"></i> {doc.rating}</div>
                            </div>
                          </div>
                          <div className="doc-card-details">
                            <div><i className="fa-solid fa-hospital"></i> {doc.clinicName}</div>
                            <div><i className="fa-solid fa-location-dot"></i> {doc.clinicAddress}</div>
                          </div>
                        </div>
                        <a 
                          href={doc.phone ? `tel:${doc.phone}` : "#"} 
                          className="btn btn-outline" 
                          style={{ width: "100%", justifyContent: "center", gap: "0.5rem", textDecoration: "none" }}
                        >
                          <i className="fa-solid fa-phone"></i> Call to Book: {doc.phone || "N/A"}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {currentUser.role === "patient" && activePage === "records-wallet" && (() => {
              const combinedRecords: any[] = [
                ...labReports.filter(r => {
                  if (r.patientId !== currentUser.id) return false;
                  const app = appointments.find(a => a.id === r.appointmentId);
                  if (!app) {
                    return activePatientId === currentUser.id;
                  }
                  return activePatientId === currentUser.id ? !app.familyMemberId : app.familyMemberId === activePatientId;
                }).map(r => ({
                  id: r.id,
                  type: "report",
                  date: new Date(r.uploadedAt),
                  title: r.reportTitle,
                  reportType: r.reportType,
                  provider: r.uploadedBy === "LAB-00001" ? "Apex Diagnostics Center" : (r.uploadedBy === "LAB-00002" ? "Metro Pathology Labs" : `Self-uploaded (${r.uploadedBy})`),
                  findings: r.findings,
                  notes: r.notes,
                  fileName: r.fileName,
                  fileUrl: r.fileUrl,
                  raw: r
                })),
                ...appointments.filter(a => a.patientId === currentUser.id && (activePatientId === currentUser.id ? !a.familyMemberId : a.familyMemberId === activePatientId) && a.status === "completed").map(app => {
                  const doc = doctors.find(d => d.id === app.doctorId);
                  return {
                    id: app.id,
                    type: "prescription",
                    date: new Date(app.appointmentDate),
                    title: "Consultation Prescription Slip",
                    reportType: "prescription",
                    provider: doc ? `Dr. ${doc.name} (${doc.speciality})` : "Attending Doctor",
                    appointmentId: app.id,
                    raw: app
                  };
                })
              ];

              combinedRecords.sort((a, b) => b.date.getTime() - a.date.getTime());

              return (
                <section className="page-section">
                  <div className="panel">
                    <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                      <h3 className="panel-title"><i className="fa-solid fa-folder-open"></i> Clinical Records Wallet</h3>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setDirectUploadRole("patient");
                          setDirectUploadAppId("");
                          setDirectUploadTitle("");
                          setDirectUploadType("blood-test");
                          setDirectUploadFindings("");
                          setDirectUploadNotes("");
                          setDirectUploadFileName("");
                          setIsDirectUploadOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upload Diagnostic / Imaging PDF Report
                      </button>
                    </div>

                    {combinedRecords.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>
                        No prescriptions or laboratory reports found in your records folder.
                      </p>
                    ) : (
                      <div className="records-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                        {combinedRecords.map(item => {
                          const isRx = item.type === "prescription";
                          let icon = <i className="fa-solid fa-file-prescription" style={{ color: "var(--primary)" }}></i>;
                          let themeColor = "var(--primary)";
                          let badgeText = "Prescription";
                          let badgeClass = "badge-info";

                          if (!isRx) {
                            badgeText = "Lab Report";
                            badgeClass = "badge-success";
                            if (item.reportType === "x-ray") {
                              icon = <i className="fa-solid fa-radiation" style={{ color: "#eab308" }}></i>;
                              themeColor = "#eab308";
                              badgeText = "X-Ray Film";
                              badgeClass = "badge-warning";
                            } else if (item.reportType === "ct-scan" || item.reportType === "mri") {
                              icon = <i className="fa-solid fa-circle-nodes" style={{ color: "#a855f7" }}></i>;
                              themeColor = "#a855f7";
                              badgeText = "Diagnostic Scan";
                              badgeClass = "badge-danger";
                            } else if (item.reportType === "blood-test" || item.reportType === "urine-test") {
                              icon = <i className="fa-solid fa-flask" style={{ color: "#ef4444" }}></i>;
                              themeColor = "#ef4444";
                              badgeText = "Pathology Lab";
                            } else {
                              icon = <i className="fa-solid fa-microscope" style={{ color: "#10b981" }}></i>;
                              themeColor = "#10b981";
                            }
                          }

                          return (
                            <div key={item.id} className="glass-card" style={{ borderTop: `4px solid ${themeColor}` }}>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                    {formatDate(item.date.toISOString())}
                                  </span>
                                  <span className={`badge ${badgeClass}`} style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                                    {badgeText}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                  <div style={{ width: 45, height: 45, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", border: "1px solid var(--border)" }}>
                                    {icon}
                                  </div>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.provider}</p>
                                  </div>
                                </div>

                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", backgroundColor: "var(--background)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)", marginBottom: "1rem" }}>
                                  {isRx ? (
                                    <div>
                                      <strong>Medical consult:</strong> {item.raw.chiefComplaint || "Routine review."}
                                    </div>
                                  ) : (
                                    <div>
                                      <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                        <strong>Findings:</strong> {item.findings}
                                      </div>
                                      {item.fileName && (
                                        <div style={{ marginTop: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--primary)", fontWeight: 600 }}>
                                          <i className="fa-regular fa-file-pdf"></i> {item.fileName}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                {isRx ? (
                                  <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    style={{ width: "100%", justifyContent: "center" }} 
                                    onClick={() => loadPrescriptionPrint("", item.id)}
                                  >
                                    <i className="fa-solid fa-file-pdf"></i> View Prescription PDF
                                  </button>
                                ) : (
                                  <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    style={{ width: "100%", justifyContent: "center" }} 
                                    onClick={() => {
                                      setViewPdfReport(item.raw);
                                      setIsPdfModalOpen(true);
                                    }}
                                  >
                                    <i className="fa-solid fa-file-pdf"></i> View Simulated Report PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {currentUser.role === "patient" && activePage === "pending-labs" && (
              <section className="page-section">
                <div className="panel">
                  <div className="panel-header"><h3 className="panel-title"><i className="fa-solid fa-microscope"></i> Pending Lab orders queue</h3></div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Attending MD</th>
                          <th>Tests Requested</th>
                          <th>Testing Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labOrders.filter(o => o.patientId === currentUser.id).map(order => (
                          <tr key={order.id}>
                            <td><code>{order.id}</code></td>
                            <td>Dr. Sarah Jenkins</td>
                            <td>{JSON.parse(order.testsJson).map((t: any) => t.test_name).join(", ")}</td>
                            <td><span className="badge badge-warning">{order.status}</span></td>
                            <td>
                              {order.status === "ordered" && (
                                <button className="btn btn-secondary btn-sm" onClick={() => claimLabOrderDemo(order.id)}>
                                  Assign Diagnostics partner
                                </button>
                              )}
                              {order.status !== "ordered" && (
                                <span style={{ textTransform: "capitalize", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{order.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {labOrders.filter(o => o.patientId === currentUser.id).length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No pending lab orders.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {currentUser.role === "patient" && activePage === "pharmacy" && (
              <section className="page-section">
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="panel-title"><i className="fa-solid fa-cart-shopping"></i> Online Pharmacy Catalogue</h3>
                    <button className="btn btn-secondary cart-indicator" onClick={() => setIsCartOpen(true)}>
                      <i className="fa-solid fa-basket-shopping"></i> View cart
                      <span className="badge-count">{cartItems.reduce((s, i) => s + i.qty, 0)}</span>
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
                    {getFilteredMedicines().map(med => (
                      <div className="role-card" key={med.id} style={{ cursor: "default", textAlign: "left", alignItems: "flex-start", padding: "1.25rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem" }}>{med.category}</div>
                        <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>{med.name}</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Formula: {med.genericName}</p>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "auto" }}>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{med.unit}</div>
                            <div style={{ fontSize: "1.15rem", fontWeight: 800 }}>₹{med.price}</div>
                          </div>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleAddToCart(med.id)}>
                            <i className="fa-solid fa-cart-plus"></i> Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}


            {/* ==================== LAB SCREEN WORKSPACES ==================== */}
            {currentUser.role === "lab" && activePage === "dashboard" && (
              <section className="page-section">
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="panel-title"><i className="fa-solid fa-list-check"></i> Lab Testing Orders Queue</h3>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => {
                        setDirectUploadRole("lab");
                        setDirectUploadAppId("");
                        setDirectUploadTitle("");
                        setDirectUploadType("blood-test");
                        setDirectUploadFindings("");
                        setDirectUploadNotes("");
                        setIsDirectUploadOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i> Upload Direct Diagnostic Report
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Order Code</th>
                          <th>Patient Name</th>
                          <th>Doctor Ref</th>
                          <th>Tests Requested</th>
                          <th>Status</th>
                          <th>Pathology Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labOrders.map(order => {
                          const pat = patients.find(p => p.id === order.patientId);
                          return (
                            <tr key={order.id}>
                              <td><code>{order.id}</code></td>
                              <td style={{ fontWeight: 600 }}>{pat?.name || "Patient"}</td>
                              <td>Dr. Sarah Jenkins</td>
                              <td>{JSON.parse(order.testsJson).map((t: any) => t.test_name).join(", ")}</td>
                              <td><span className="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">{order.status}</span></td>
                              <td>
                                {order.status === "lab-assigned" && (
                                  <button className="btn btn-secondary btn-sm" onClick={() => {
                                    setUploadLabOrderId(order.id);
                                    setUploadReportTitle(JSON.parse(order.testsJson).map((t: any) => t.test_name).join(", ") + " Report");
                                    setUploadFindings("");
                                    setUploadNotes("");
                                    setIsLabUploadOpen(true);
                                  }}>
                                    <i className="fa-solid fa-file-arrow-up"></i> Upload Report
                                  </button>
                                )}
                                {order.status === "completed" && (
                                  <span style={{ color: "var(--secondary)", fontWeight: 600 }}><i className="fa-solid fa-check-circle"></i> Uploaded</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {labOrders.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No pending lab order requests in queue.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}


            {/* ==================== ADMIN SCREEN WORKSPACES ==================== */}
            {currentUser.role === "admin" && activePage === "dashboard" && (
              <section className="page-section">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon primary"><i className="fa-solid fa-user-md"></i></div>
                    <div className="stat-info">
                      <h3>{doctors.filter(d => d.isApproved).length}</h3>
                      <p>Approved Specialists</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon secondary"><i className="fa-solid fa-users"></i></div>
                    <div className="stat-info">
                      <h3>{patients.length}</h3>
                      <p>Registered Patients</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon warning"><i className="fa-solid fa-flask"></i></div>
                    <div className="stat-info">
                      <h3>2</h3>
                      <p>Diagnostics Partners</p>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header"><h3 className="panel-title"><i className="fa-solid fa-user-check"></i> Pending Credentials Approvals</h3></div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Full Name</th>
                          <th>Specialty / Credentials</th>
                          <th>Partner Type</th>
                          <th>Approvals Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map(item => (
                          <tr key={item.id}>
                            <td><code>{item.id}</code></td>
                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                            <td>{item.meta}</td>
                            <td><span className="badge badge-info">{item.type}</span></td>
                            <td>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleApprovePartner(item.id, item.type)}>
                                <i className="fa-solid fa-check"></i> Approve Credentials
                              </button>
                            </td>
                          </tr>
                        ))}
                        {pendingApprovals.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No registrations pending approval.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>


      {/* ==================== REGISTER PATIENT DIALOG ==================== */}
      <div className={`modal-backdrop ${isAddPatientOpen ? "active" : ""}`}>
        <div className="modal-container">
          <div className="modal-header">
            <h3>Register New Patient record</h3>
            <button className="modal-close" onClick={() => setIsAddPatientOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleRegisterPatient}>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" id="form-p-name" placeholder="John Doe" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Phone</label>
                  <input type="tel" id="form-p-phone" placeholder="9876543210" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" id="form-p-email" placeholder="john.doe@gmail.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" id="form-p-dob" required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select id="form-p-gender" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select id="form-p-blood">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input type="text" id="form-p-emergency" placeholder="Mary Doe (+91 98765...)" />
                </div>
              </div>
              <div className="form-group">
                <label>Home Address</label>
                <textarea id="form-p-address" rows={2} placeholder="Street, City, State"></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Drug / Food Allergies</label>
                  <input type="text" id="form-p-allergies" placeholder="Penicillin, Peanuts" />
                </div>
                <div className="form-group">
                  <label>Chronic Conditions</label>
                  <input type="text" id="form-p-chronic" placeholder="Hypertension, Asthma" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsAddPatientOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Patient File</button>
            </div>
          </form>
        </div>
      </div>


      {/* ==================== SCHEDULER APPOINTMENT DIALOG ==================== */}
      <div className={`modal-backdrop ${isBookAppOpen ? "active" : ""}`}>
        <div className="modal-container">
          <div className="modal-header">
            <h3>Schedule Consultation Appointment</h3>
            <button className="modal-close" onClick={() => setIsBookAppOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleBookAppointment}>
            <div className="modal-body">
              {(currentUser.role === "doctor" || currentUser.role === "assistant") && (
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={bookingIsBlock} 
                      onChange={(e) => setBookingIsBlock(e.target.checked)} 
                    />
                    Block this calendar slot (no patient)
                  </label>
                </div>
              )}
              {(currentUser.role === "doctor" || currentUser.role === "assistant") && !bookingIsBlock && (
                <div className="form-group">
                  <label>Select Patient Profile</label>
                  <select value={bookingPatientId} onChange={(e) => setBookingPatientId(e.target.value)} required>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group" style={{ flex: bookingIsBlock ? "1 0 100%" : "1" }}>
                  <label>Appointment Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
                </div>
                {!bookingIsBlock && (
                  <div className="form-group" style={{ flex: "1" }}>
                    <label>Visit Type</label>
                    <select value={bookingVisitType} onChange={(e) => setBookingVisitType(e.target.value)}>
                      <option value="first-visit">First Visit</option>
                      <option value="follow-up">Follow-up Review</option>
                      <option value="emergency">Emergency consult</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Select Available Time slot</label>
                <div className="time-slots-container">
                  {bookingSlots.map(slot => (
                    <button type="button" key={slot} className={`time-slot-btn ${bookingTime === slot ? "selected" : ""}`} onClick={() => setBookingTime(slot)}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>{bookingIsBlock ? "Reason for Block" : "Chief Complaint / Symptoms"}</label>
                <textarea 
                  rows={2} 
                  placeholder={bookingIsBlock ? "e.g., Attending conference, surgery block..." : "Describe reasons for scheduling consultation..."} 
                  value={bookingComplaint} 
                  onChange={(e) => setBookingComplaint(e.target.value)} 
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsBookAppOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{bookingIsBlock ? "Apply Calendar Block" : "Confirm Booking"}</button>
            </div>
          </form>
        </div>
      </div>


      {/* ==================== SOAP CLINICAL WORKSPACE DIALOG ==================== */}
      <div className={`modal-backdrop ${isSoapOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 900 }}>
          <div className="modal-header">
            <h3>Medical Consultation Worksheet (SOAP Notes)</h3>
            <button className="modal-close" onClick={() => setIsSoapOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleSoapSubmit}>
            <div className="modal-body">
              
              {/* Patient Vitals */}
              <div className="panel" style={{ padding: "1rem", backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}><i className="fa-solid fa-heart-pulse"></i> Patient Vital Signs</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>BP (mmHg)</label><input type="text" value={soapBp} onChange={(e) => setSoapBp(e.target.value)} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Pulse (bpm)</label><input type="text" value={soapPulse} onChange={(e) => setSoapPulse(e.target.value)} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Temp (°F)</label><input type="text" value={soapTemp} onChange={(e) => setSoapTemp(e.target.value)} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>SpO2 (%)</label><input type="text" value={soapSpo2} onChange={(e) => setSoapSpo2(e.target.value)} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Weight (kg)</label><input type="text" value={soapWeight} onChange={(e) => setSoapWeight(e.target.value)} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Height (cm)</label><input type="text" value={soapHeight} onChange={(e) => setSoapHeight(e.target.value)} /></div>
                </div>
              </div>

              {/* SOAP Text areas */}
              <div className="soap-box" style={{ marginTop: "1.5rem" }}>
                <div className="consultation-form-section">
                  <h4 style={{ fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.5rem" }}><i className="fa-solid fa-user-clock"></i> Subjective (Patient complaints)</h4>
                  <textarea rows={3} value={soapSubjective} onChange={(e) => setSoapSubjective(e.target.value)}></textarea>
                </div>
                <div className="consultation-form-section">
                  <h4 style={{ fontSize: "0.85rem", color: "var(--secondary)", marginBottom: "0.5rem" }}><i className="fa-solid fa-magnifying-glass-chart"></i> Objective (Observations)</h4>
                  <textarea rows={3} value={soapObjective} onChange={(e) => setSoapObjective(e.target.value)}></textarea>
                </div>
              </div>

              <div className="soap-box" style={{ marginTop: "1rem" }}>
                <div className="consultation-form-section">
                  <h4 style={{ fontSize: "0.85rem", color: "var(--warning)", marginBottom: "0.5rem" }}><i className="fa-solid fa-clipboard-question"></i> Assessment (Diagnosis)</h4>
                  <input type="text" placeholder="e.g. Essential Hypertension (ICD-10 I10)" value={soapAssessmentIcd} onChange={(e) => setSoapAssessmentIcd(e.target.value)} style={{ marginBottom: "0.5rem" }} />
                  <textarea rows={2} value={soapAssessment} onChange={(e) => setSoapAssessment(e.target.value)}></textarea>
                </div>
                <div className="consultation-form-section">
                  <h4 style={{ fontSize: "0.85rem", color: "var(--danger)", marginBottom: "0.5rem" }}><i className="fa-solid fa-prescription-bottle-medical"></i> Treatment Plan & Follow-up</h4>
                  <textarea rows={2} value={soapPlan} onChange={(e) => setSoapPlan(e.target.value)}></textarea>
                  <div className="form-group" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                    <label style={{ fontSize: "0.75rem" }}>Follow-up Visit Date</label>
                    <input type="date" value={soapFollowUp} onChange={(e) => setSoapFollowUp(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Specialist Referral Section */}
              <div className="panel" style={{ padding: "1.25rem", marginTop: "1.5rem", border: "1px dashed var(--primary)" }}>
                <h4 style={{ fontSize: "0.9rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input 
                    type="checkbox" 
                    id="soap-refer-enable" 
                    checked={soapReferEnabled} 
                    onChange={(e) => {
                      setSoapReferEnabled(e.target.checked);
                      if (e.target.checked && doctors.length > 0) {
                        const otherDocs = doctors.filter(d => d.id !== currentUser?.id && d.isApproved);
                        if (otherDocs.length > 0 && !soapReferDoctorId) {
                          setSoapReferDoctorId(otherDocs[0].id);
                        }
                      }
                    }} 
                  />
                  <label htmlFor="soap-refer-enable" style={{ cursor: "pointer", margin: 0, fontWeight: 600 }}>
                    <i className="fa-solid fa-share-nodes"></i> Refer Patient to a Specialist (Optional)
                  </label>
                </h4>
                
                {soapReferEnabled && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Select Specialist Doctor</label>
                      <select 
                        value={soapReferDoctorId} 
                        onChange={(e) => setSoapReferDoctorId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Specialist --</option>
                        {doctors.filter(d => d.id !== currentUser?.id && d.isApproved).map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Urgency Level</label>
                      <select 
                        value={soapReferUrgency} 
                        onChange={(e) => setSoapReferUrgency(e.target.value)}
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Reason for Referral</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Clinical evaluation for cardiac murmurs" 
                        value={soapReferReason} 
                        onChange={(e) => setSoapReferReason(e.target.value)} 
                        required={soapReferEnabled}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Additional Clinical Notes (Optional)</label>
                      <textarea 
                        rows={2} 
                        placeholder="Details of symptoms, clinical history, or specific questions for the specialist..." 
                        value={soapReferNotes} 
                        onChange={(e) => setSoapReferNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Medicines & Labs Selector Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                
                {/* Prescription list creator */}
                <div className="panel" style={{ padding: "1rem" }}>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}><i className="fa-solid fa-pills"></i> Write Prescription Medicines</h4>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <select value={soapSelectedMedId} onChange={(e) => setSoapSelectedMedId(e.target.value)} style={{ width: "70%" }}>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-outline btn-sm" onClick={addSoapMedicineRow}>
                      <i className="fa-solid fa-plus"></i> Add
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table style={{ fontSize: "0.75rem" }}>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {soapPrescribedMeds.map((med, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{med.name}</td>
                            <td><input type="text" value={med.dosage} onChange={(e) => updateSoapMedField(idx, "dosage", e.target.value)} style={{ padding: 4 }} /></td>
                            <td>
                              <select value={med.frequency} onChange={(e) => updateSoapMedField(idx, "frequency", e.target.value)} style={{ padding: 4 }}>
                                <option value="Once daily (morning)">Once daily (morning)</option>
                                <option value="Once daily (night)">Once daily (night)</option>
                                <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                                <option value="Thrice daily (1-1-1)">Thrice daily (1-1-1)</option>
                              </select>
                            </td>
                            <td><input type="text" value={med.duration} onChange={(e) => updateSoapMedField(idx, "duration", e.target.value)} style={{ padding: 4, width: 70 }} /></td>
                            <td>
                              <button type="button" className="btn btn-danger btn-sm" style={{ padding: "0.15rem 0.35rem" }} onClick={() => removeSoapMedicineRow(idx)}>
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lab orders checklist */}
                <div className="panel" style={{ padding: "1rem" }}>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}><i className="fa-solid fa-microscope"></i> Lab Diagnostics Tests</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {dbTestsCatalog.map(test => (
                      <div key={test.test_code} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <input type="checkbox" id={`soap-test-${test.test_code}`} checked={soapTestsChecked[test.test_code] || false} onChange={(e) => setSoapTestsChecked({ ...soapTestsChecked, [test.test_code]: e.target.checked })} />
                        <label htmlFor={`soap-test-${test.test_code}`}>{test.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsSoapOpen(false)}>Discard</button>
              <button type="submit" className="btn btn-primary"><i className="fa-solid fa-file-circle-check"></i> Save Consultation & Print</button>
            </div>
          </form>
        </div>
      </div>


      {/* ==================== PRESCRIPTION PRINT SLIP DIALOG ==================== */}
      <div id="prescription-preview-modal" className={`modal-backdrop ${isPrescriptionOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 850, backgroundColor: "#eaeaea" }}>
          <div className="modal-header">
            <h3>Prescription Slip Preview</h3>
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Print Slip</button>
              <button className="modal-close" style={{ display: "inline-flex", marginLeft: "1rem" }} onClick={() => setIsPrescriptionOpen(false)}>&times;</button>
            </div>
          </div>
          <div className="modal-body" style={{ padding: "1.5rem 0" }}>
            {previewRx && (
              <div className="prescription-layout">
                <div className="prescription-header">
                  <div className="pres-clinic-logo">
                    <i className="fa-solid fa-house-chimney-medical"></i>
                    <span>{previewRx.doctor?.clinicName || "Clinic Center"}</span>
                  </div>
                  <div className="pres-doc-info">
                    <h2>{previewRx.doctor?.name}</h2>
                    <p><strong>{previewRx.doctor?.qualifications}</strong></p>
                    <p>Reg No: {previewRx.doctor?.registrationNo}</p>
                    <p style={{ fontSize: "0.75rem" }}>{previewRx.doctor?.clinicAddress}</p>
                  </div>
                </div>

                <div className="pres-meta-grid">
                  <div className="pres-meta-item">
                    <strong>Patient Name</strong>
                    <span>{previewRx.patient?.name}</span>
                  </div>
                  <div className="pres-meta-item">
                    <strong>Age / Gender</strong>
                    <span>{getPatientAge(previewRx.patient?.dateOfBirth)} Yrs / {previewRx.patient?.gender}</span>
                  </div>
                  <div className="pres-meta-item">
                    <strong>Prescription ID</strong>
                    <code>{previewRx.rx.id}</code>
                  </div>
                  <div className="pres-meta-item">
                    <strong>Issued Date</strong>
                    <span>{formatDate(previewRx.rx.issuedAt)}</span>
                  </div>
                </div>

                {previewRx.consultation && (
                  <div className="pres-body-vitals">
                    <span className="pres-vitals-pill">BP: {previewRx.consultation.bp} mmHg</span>
                    <span className="pres-vitals-pill">Pulse: {previewRx.consultation.pulse} bpm</span>
                    <span className="pres-vitals-pill">Temp: {previewRx.consultation.temp}°F</span>
                    <span className="pres-vitals-pill">SpO2: {previewRx.consultation.spo2}%</span>
                    <span className="pres-vitals-pill">Weight: {previewRx.consultation.weight} kg</span>
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <strong>Diagnosis / Assessment:</strong>
                  <div style={{ fontWeight: 600, marginTop: "0.25rem" }}>{previewRx.consultation?.assessment || "N/A"}</div>
                </div>

                <div className="pres-rx-section">
                  <div className="pres-rx-symbol">R<sub>x</sub></div>
                  <table className="pres-table">
                    <thead>
                      <tr>
                        <th>Medicine Details</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {JSON.parse(previewRx.rx.medicinesJson).map((med: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{idx + 1}. {med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td><span style={{ fontSize: "0.75rem", fontStyle: "italic", color: "var(--text-secondary)" }}>{med.instructions || "Take with water"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Diagnostics ordered section */}
                {previewRx.labOrder && (
                  <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                    <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--primary)" }}>
                      <i className="fa-solid fa-microscope"></i> Diagnostics & Investigations Ordered:
                    </strong>
                    <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                      {JSON.parse(previewRx.labOrder.testsJson).map((test: any, idx: number) => (
                        <li key={idx} style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                          <strong>{test.test_name}</strong> <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>({test.urgency})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewRx.consultation?.followUpDate && (
                  <div style={{ marginTop: "1.5rem", padding: "0.5rem", border: "1px dashed var(--border)", fontSize: "0.85rem" }}>
                    <strong>Follow-up Visit Date:</strong> Please return for review on or before <strong>{formatDate(previewRx.consultation.followUpDate)}</strong>
                  </div>
                )}

                <div className="pres-sig-footer">
                  <div>
                    <p>MedLink Pro Digital Signature Slip</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ID Hash: SHA-{previewRx.rx.id.slice(-6)}</p>
                  </div>
                  <div className="pres-signature-line">
                    <div className="line"></div>
                    <p>{previewRx.doctor?.name}</p>
                    <p style={{ fontSize: "0.75rem" }}>Attending Doctor</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ==================== LAB REPORT UPLOAD DIALOG ==================== */}
      <div className={`modal-backdrop ${isLabUploadOpen ? "active" : ""}`}>
        <div className="modal-container">
          <div className="modal-header">
            <h3>Upload Diagnostic laboratory findings</h3>
            <button className="modal-close" onClick={() => setIsLabUploadOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleLabReportUpload}>
            <div className="modal-body">
              <div className="form-group">
                <label>Report Title</label>
                <input type="text" value={uploadReportTitle} onChange={(e) => setUploadReportTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Diagnostic Findings & Observations</label>
                <textarea rows={4} placeholder="Enter findings values (e.g. Total Cholesterol: 242 mg/dL - High)" value={uploadFindings} onChange={(e) => setUploadFindings(e.target.value)} required></textarea>
              </div>
              <div className="form-group">
                <label>Pathologist Interpretations / Notes</label>
                <textarea rows={2} placeholder="Additional pathology notes..." value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label>Upload Clinical Report (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadFileName(e.target.files[0].name);
                    }
                  }} 
                  required 
                />
                {uploadFileName && (
                  <div style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                    <i className="fa-regular fa-file-pdf"></i> Selected: {uploadFileName}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsLabUploadOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><i className="fa-solid fa-file-arrow-up"></i> Upload & Notify Attending MD</button>
            </div>
          </form>
        </div>
      </div>


      {/* ==================== DIRECT DIAGNOSTIC REPORT UPLOAD DIALOG ==================== */}
      <div className={`modal-backdrop ${isDirectUploadOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 600 }}>
          <div className="modal-header">
            <h3>Upload Diagnostic / Imaging Report</h3>
            <button className="modal-close" onClick={() => setIsDirectUploadOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleDirectReportUpload}>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Associated Consultation Appointment</label>
                <select 
                  value={directUploadAppId} 
                  onChange={(e) => {
                    setDirectUploadAppId(e.target.value);
                    const app = appointments.find(a => a.id === e.target.value);
                    if (app && !directUploadTitle) {
                      setDirectUploadTitle(`${app.chiefComplaint || "Diagnostic"} Report`);
                    }
                  }} 
                  required
                >
                  <option value="">-- Choose Appointment --</option>
                  {directUploadRole === "patient" ? (
                    appointments.filter(a => a.patientId === currentUser?.id).map(app => {
                      const doc = doctors.find(d => d.id === app.doctorId);
                      return (
                        <option key={app.id} value={app.id}>
                          {app.appointmentTime} - {formatDate(app.appointmentDate)} (Dr. {doc?.name || "MD"} - {app.chiefComplaint})
                        </option>
                      );
                    })
                  ) : (
                    appointments.map(app => {
                      const pat = patients.find(p => p.id === app.patientId);
                      const doc = doctors.find(d => d.id === app.doctorId);
                      return (
                        <option key={app.id} value={app.id}>
                          APT: {app.id} - {pat?.name || "Patient"} with Dr. {doc?.name || "MD"} ({formatDate(app.appointmentDate)})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Report Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chest X-Ray PA View, Lipid Panel" 
                  value={directUploadTitle} 
                  onChange={(e) => setDirectUploadTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Diagnostic Modality / Type</label>
                <select 
                  value={directUploadType} 
                  onChange={(e) => setDirectUploadType(e.target.value)}
                >
                  <option value="blood-test">Blood Test</option>
                  <option value="urine-test">Urine Test</option>
                  <option value="x-ray">X-Ray Imaging</option>
                  <option value="ct-scan">CT Scan</option>
                  <option value="mri">MRI Scan</option>
                  <option value="ecg">ECG Cardiogram</option>
                  <option value="other">Other Diagnostic</option>
                </select>
              </div>

              <div className="form-group">
                <label>Diagnostic Findings & Observations</label>
                <textarea 
                  rows={4} 
                  placeholder="Enter pathology values, imaging observations, or diagnostic reports..." 
                  value={directUploadFindings} 
                  onChange={(e) => setDirectUploadFindings(e.target.value)} 
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Additional Clinical Notes / Interpretations (Optional)</label>
                <textarea 
                  rows={2} 
                  placeholder="Pathologist or radiologist notes..." 
                  value={directUploadNotes} 
                  onChange={(e) => setDirectUploadNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Upload Clinical/Imaging PDF Report</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setDirectUploadFileName(e.target.files[0].name);
                    }
                  }} 
                  required
                />
                {directUploadFileName && (
                  <div style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                    <i className="fa-regular fa-file-pdf"></i> Selected: {directUploadFileName}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsDirectUploadOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><i className="fa-solid fa-cloud-arrow-up"></i> Upload Diagnostic File</button>
            </div>
          </form>
        </div>
      </div>


      {/* ==================== DIAGNOSTIC REPORTS VIEWER DIALOG ==================== */}
      <div className={`modal-backdrop ${isViewReportsOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 700 }}>
          <div className="modal-header">
            <h3>Diagnostic Reports Inspector</h3>
            <button className="modal-close" onClick={() => setIsViewReportsOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <strong>Appointment Reference ID:</strong> <code>{viewReportsAppId}</code>
            </div>
            {viewReportsList.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0" }}>
                No diagnostic reports have been uploaded for this appointment yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {viewReportsList.map(rep => (
                  <div key={rep.id} className="panel" style={{ padding: "1.25rem", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                      <h4 style={{ margin: 0, color: "var(--primary)" }}>{rep.reportTitle}</h4>
                      <span className="badge badge-info" style={{ textTransform: "uppercase" }}>{rep.reportType}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                      <div><strong>Uploaded At:</strong> {formatDate(rep.uploadedAt)}</div>
                      <div><strong>Uploader Ref:</strong> {rep.uploadedBy}</div>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>Findings & Observations:</strong>
                      <pre style={{ fontFamily: "monospace", fontSize: "0.8rem", padding: "0.5rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, whiteSpace: "pre-wrap", marginTop: "0.25rem" }}>
                        {rep.findings}
                      </pre>
                    </div>
                    {rep.notes && (
                      <div>
                        <strong>Pathologist/Clinical Notes:</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>{rep.notes}</p>
                      </div>
                    )}
                    <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm" 
                        onClick={() => {
                          setViewPdfReport(rep);
                          setIsPdfModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-file-pdf"></i> View Simulated PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => setIsViewReportsOpen(false)}>Close Inspector</button>
          </div>
        </div>
      </div>


      {/* ==================== PHARMACY CART SHOPPING DIALOG ==================== */}
      <div className={`modal-backdrop ${isCartOpen ? "active" : ""}`}>
        <div className="modal-container">
          <div className="modal-header">
            <h3>Shopping Basket - Online Pharmacy</h3>
            <button className="modal-close" onClick={() => setIsCartOpen(false)}>&times;</button>
          </div>
          <form onSubmit={handleCheckout}>
            <div className="modal-body">
              <div className="table-wrapper" style={{ marginBottom: "1.5rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.name}</strong></td>
                        <td>₹{item.price}</td>
                        <td>
                          <input type="number" min={1} value={item.qty} onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setCartItems(cartItems.map(i => i.medicine_id === item.medicine_id ? { ...i, qty: val } : i));
                          }} style={{ width: 60, padding: 4 }} />
                        </td>
                        <td>₹{item.price * item.qty}</td>
                        <td>
                          <button type="button" className="btn btn-danger btn-sm" style={{ padding: "0.15rem 0.35rem" }} onClick={() => setCartItems(cartItems.filter(i => i.medicine_id !== item.medicine_id))}>
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-group">
                <label>Delivery Address</label>
                <textarea rows={2} value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} required></textarea>
              </div>

              <div className="form-group">
                <label>Link Prescriptions Slip (Optional)</label>
                <select value={checkoutRxId} onChange={(e) => setCheckoutRxId(e.target.value)}>
                  <option value="">No prescription required (OTC drugs only)</option>
                  {appointments.filter(a => a.patientId === currentUser.id && a.status === "completed").map(app => (
                    <option key={app.id} value={generateId('RX')}>Consultation prescription dated {formatDate(app.appointmentDate)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Total:</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--secondary)", marginLeft: "0.5rem" }}>
                  ₹{cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCartOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">Place Order (COD)</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ==================== SIMULATED CLINICAL PDF REPORT VIEWER DIALOG ==================== */}
      <div id="clinical-report-preview-modal" className={`modal-backdrop ${isPdfModalOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 850, backgroundColor: "#eaeaea" }}>
          <div className="modal-header">
            <h3>Clinical Report PDF Viewer</h3>
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Print Report</button>
              <button className="modal-close" style={{ display: "inline-flex", marginLeft: "1rem" }} onClick={() => setIsPdfModalOpen(false)}>&times;</button>
            </div>
          </div>
          <div className="modal-body" style={{ padding: "1.5rem 0" }}>
            {viewPdfReport && (
              <div className="clinical-report-pdf" id="clinical-report-pdf-print">
                <div className="clinical-report-header">
                  <div className="report-clinic-logo">
                    <i className="fa-solid fa-house-chimney-medical"></i>
                    <span>
                      {viewPdfReport.uploadedBy === "LAB-00001" 
                        ? "Apex Diagnostics Center" 
                        : (viewPdfReport.uploadedBy === "LAB-00002" 
                          ? "Metro Pathology Labs" 
                          : `Attending Doctor Upload (${viewPdfReport.uploadedBy})`)}
                    </span>
                  </div>
                  <div className="report-doc-info">
                    <h2>Diagnostic Lab Report</h2>
                    <p><strong>NABL Accredited Sandbox Facility</strong></p>
                    <p>File Ref: {viewPdfReport.fileName || "report.pdf"}</p>
                    <p style={{ fontSize: "0.75rem" }}>Diagnostic Drive, Sector 4, MedCity</p>
                  </div>
                </div>

                <div className="report-meta-grid">
                  <div className="report-meta-item">
                    <strong>Patient ID</strong>
                    <code>{viewPdfReport.patientId}</code>
                  </div>
                  <div className="report-meta-item">
                    <strong>Report ID</strong>
                    <code>{viewPdfReport.id}</code>
                  </div>
                  <div className="report-meta-item">
                    <strong>Associated Appointment</strong>
                    <code>{viewPdfReport.appointmentId || "Direct Upload"}</code>
                  </div>
                  <div className="report-meta-item">
                    <strong>Uploaded At</strong>
                    <span>{formatDate(viewPdfReport.uploadedAt)}</span>
                  </div>
                </div>

                <div className="report-section">
                  <h3>Report Title</h3>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                    {viewPdfReport.reportTitle}
                  </div>
                </div>

                <div className="report-section">
                  <h3>Diagnostic Observations & Findings</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Investigation Parameter</th>
                        <th>Observed Clinical Value / Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPdfReport.findings.split("\n").map((line: string, idx: number) => {
                        const parts = line.split(":");
                        if (parts.length >= 2) {
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{parts[0].trim()}</td>
                              <td>{parts.slice(1).join(":").trim()}</td>
                            </tr>
                          );
                        }
                        return (
                          <tr key={idx}>
                            <td colSpan={2} style={{ whiteSpace: "pre-wrap" }}>{line}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {viewPdfReport.notes && (
                  <div className="report-section">
                    <h3>Clinical Interpretations / Notes</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.6" }}>
                      {viewPdfReport.notes}
                    </p>
                  </div>
                )}

                <div className="pres-sig-footer" style={{ marginTop: "3rem" }}>
                  <div>
                    <p>MedLink Pro Digital Signature Slip</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Verification Hash: SHA-{viewPdfReport.id.slice(-6)}</p>
                  </div>
                  <div className="pres-signature-line">
                    <div className="line"></div>
                    <p>Dr. Alan Vance, MD</p>
                    <p style={{ fontSize: "0.75rem" }}>Chief Radiologist / Pathologist</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== CALENDAR DAILY DETAILS MODAL ==================== */}
      <div className={`modal-backdrop ${selectedCalendarDateStr ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 700 }}>
          <div className="modal-header">
            <h3>Schedule Details: {selectedCalendarDateStr && formatDate(selectedCalendarDateStr)}</h3>
            <button className="modal-close" onClick={() => setSelectedCalendarDateStr("")}>&times;</button>
          </div>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {(() => {
              if (!selectedCalendarDateStr || !currentUser) return null;
              const targetDocId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
              const dayApps = appointments.filter(
                a => a.doctorId === targetDocId && a.appointmentDate === selectedCalendarDateStr
              );
              
              if (dayApps.length === 0) {
                return (
                  <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                    <i className="fa-regular fa-calendar-times" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                    <p>No appointments or calendar blocks on this day.</p>
                  </div>
                );
              }
              
              const getSessionType = (timeStr: string) => {
                if (!timeStr) return "morning";
                const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                if (match) {
                  let hours = parseInt(match[1], 10);
                  const ampm = match[3].toUpperCase();
                  if (ampm === "PM" && hours < 12) hours += 12;
                  if (ampm === "AM" && hours === 12) hours = 0;
                  return hours >= 16 ? "evening" : "morning";
                }
                const match24 = timeStr.match(/^(\d+):(\d+)/);
                if (match24) {
                  const hours = parseInt(match24[1], 10);
                  return hours >= 16 ? "evening" : "morning";
                }
                return "morning";
              };

              const morningApps = dayApps.filter(a => a.status !== "blocked" && getSessionType(a.appointmentTime) === "morning");
              const eveningApps = dayApps.filter(a => a.status !== "blocked" && getSessionType(a.appointmentTime) === "evening");
              const blockedApps = dayApps.filter(a => a.status === "blocked");
              const cancelledApps = dayApps.filter(a => a.status === "cancelled");

              const renderAppRow = (app: Appointment) => {
                const pat = patients.find(p => p.id === app.patientId);
                const isBlocked = app.status === "blocked";
                const patientNameStr = isBlocked ? "Slot Blocked" : (pat?.name || `Patient (${app.patientId})`);
                
                return (
                  <div 
                    key={app.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid var(--border)", 
                      borderRadius: "8px", 
                      background: isBlocked ? "var(--background)" : "var(--glass)",
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)" }}>{app.appointmentTime}</span>
                        <span className={`badge ${app.status === "completed" ? "badge-success" : (app.status === "scheduled" ? "badge-info" : "badge-danger")}`} style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>
                          {app.status}
                        </span>
                      </div>
                      <h4 style={{ margin: "0.25rem 0", fontSize: "1rem" }}>{patientNameStr}</h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <strong>{isBlocked ? "Reason:" : "Complaint:"}</strong> {app.chiefComplaint}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {app.status === "scheduled" && (
                        <button 
                          type="button"
                          className="btn btn-outline btn-sm" 
                          style={{ color: "var(--danger)", borderColor: "var(--danger-light)" }}
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this appointment?")) {
                              handleCancelAppointment(app.id);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      {isBlocked && (
                        <button 
                          type="button"
                          className="btn btn-outline btn-danger btn-sm"
                          onClick={async () => {
                            if (confirm("Are you sure you want to unblock this slot?")) {
                              try {
                                const res = await fetch("/api/appointments", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ appointmentId: app.id, status: "cancelled" })
                                });
                                if (res.ok) {
                                  alert("Slot unblocked successfully!");
                                  loadData();
                                } else {
                                  alert("Failed to unblock slot.");
                                }
                              } catch (err) {
                                alert("Failed to unblock slot.");
                              }
                            }
                          }}
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {morningApps.length > 0 && (
                    <div>
                      <h4 style={{ color: "#eab308", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
                        <span>🌅</span> Morning Session (10:00 AM - 02:00 PM) <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", borderColor: "var(--border)" }}>{morningApps.length}</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {morningApps.map(renderAppRow)}
                      </div>
                    </div>
                  )}

                  {eveningApps.length > 0 && (
                    <div>
                      <h4 style={{ color: "#3b82f6", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
                        <span>🌇</span> Evening Session (06:00 PM - 08:00 PM) <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", borderColor: "var(--border)" }}>{eveningApps.length}</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {eveningApps.map(renderAppRow)}
                      </div>
                    </div>
                  )}

                  {blockedApps.length > 0 && (
                    <div>
                      <h4 style={{ color: "var(--danger)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
                        <span>🚫</span> Blocked Calendar Slots <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", borderColor: "var(--border)" }}>{blockedApps.length}</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {blockedApps.map(renderAppRow)}
                      </div>
                    </div>
                  )}

                  {cancelledApps.length > 0 && (
                    <div>
                      <h4 style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.25rem" }}>
                        <span>✖</span> Cancelled/Unblocked Slots <span className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", borderColor: "var(--border)" }}>{cancelledApps.length}</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", opacity: 0.6 }}>
                        {cancelledApps.map(renderAppRow)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => setSelectedCalendarDateStr("")}>Close</button>
          </div>
        </div>
      </div>

    </div>
  );

  // Helper inside Page to search and open appointment modal
  function openBookAppointmentModal() {
    const docId = currentUser?.role === "doctor" ? currentUser.id : (currentUser?.role === "assistant" ? (currentUser.doctorId || "") : "");
    setBookingDoctorId(docId);
    setBookingPatientId("");
    setBookingDate(new Date().toISOString().split("T")[0]);
    setBookingIsBlock(false);
    loadBookingSlots();
    setIsBookAppOpen(true);
  }

  function generateId(prefix: string) {
    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    return `${prefix}-${dateStr}-${String(Math.floor(Math.random() * 900) + 100)}`;
  }
}
