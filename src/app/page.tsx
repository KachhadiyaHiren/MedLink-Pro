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
  signatureUrl?: string | null;
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
  createdAt: string;
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

interface AppNotification {
  id: string;
  type: "consultation" | "medicine" | "reminder" | "alert" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  forRoles: string[];
}

interface PendingApproval {
  id: string;
  name: string;
  meta: string;
  type: string;
}

export default function HealOne360App() {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginRole, setLoginRole] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<string>("");
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("1234");

  // --- TOUR & LANDING STATE ---
  const [activeTourTab, setActiveTourTab] = useState<string>("dashboard");
  const [activeFolderTab, setActiveFolderTab] = useState<"medical" | "dental">("medical");

  // --- DENTAL SUITE STATE ---
  const [activeDentalTab, setActiveDentalTab] = useState<string>("odontogram");
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothNoteInput, setToothNoteInput] = useState<string>("");
  const [treatmentProcedureInput, setTreatmentProcedureInput] = useState<string>("Composite Filling");
  const [treatmentNotesInput, setTreatmentNotesInput] = useState<string>("");
  const [recallTypeInput, setRecallTypeInput] = useState<string>("Routine Scaling & Exam");
  const [recallDateInput, setRecallDateInput] = useState<string>("");
  const [recallNotesInput, setRecallNotesInput] = useState<string>("");
  
  // Dental chart dictionary patientId -> toothNumber -> status
  const [odontogramData, setOdontogramData] = useState<Record<string, Record<number, string>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("healone_odontogram");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Dental tooth notes patientId -> toothNumber -> note string
  const [toothNotes, setToothNotes] = useState<Record<string, Record<number, string>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("healone_tooth_notes");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Treatment plans patientId -> array of procedures
  const [treatmentPlans, setTreatmentPlans] = useState<Record<string, any[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("healone_treatment_plans");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Dental recalls patientId -> array of recalls
  const [dentalRecalls, setDentalRecalls] = useState<Record<string, any[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("healone_recalls");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("healone_odontogram", JSON.stringify(odontogramData));
  }, [odontogramData]);

  useEffect(() => {
    localStorage.setItem("healone_tooth_notes", JSON.stringify(toothNotes));
  }, [toothNotes]);

  useEffect(() => {
    localStorage.setItem("healone_treatment_plans", JSON.stringify(treatmentPlans));
  }, [treatmentPlans]);

  useEffect(() => {
    localStorage.setItem("healone_recalls", JSON.stringify(dentalRecalls));
  }, [dentalRecalls]);

  // --- APPLICATION DATA STATE ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<MedicinesCatalog[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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
  const [doctorSignatureUrl, setDoctorSignatureUrl] = useState<string>("");

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

  // Doctor Enrollment (self-registration) states
  const [isDoctorEnrollOpen, setIsDoctorEnrollOpen] = useState(false);
  const [enrollName, setEnrollName] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrollSpeciality, setEnrollSpeciality] = useState("");
  const [enrollQual, setEnrollQual] = useState("");
  const [enrollRegNo, setEnrollRegNo] = useState("");
  const [enrollClinicName, setEnrollClinicName] = useState("");
  const [enrollClinicAddress, setEnrollClinicAddress] = useState("");
  const [enrollFee, setEnrollFee] = useState("");
  const [enrollBio, setEnrollBio] = useState("");
  const [enrollLanguages, setEnrollLanguages] = useState("English");
  const [enrollDays, setEnrollDays] = useState("Mon,Tue,Wed,Thu,Fri");

  // --- MODALS DATA CONTEXTS ---
  const [bookingDoctorId, setBookingDoctorId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingVisitType, setBookingVisitType] = useState<string>("first-visit");
  const [bookingComplaint, setBookingComplaint] = useState<string>("");
  const [bookingPatientId, setBookingPatientId] = useState<string>("");
  const [bookingFamilyMemberId, setBookingFamilyMemberId] = useState<string>("");
  const [bookingSlots, setBookingSlots] = useState<string[]>([]);
  const [bookingSearchVal, setBookingSearchVal] = useState<string>("");
  const [bookingSearchDone, setBookingSearchDone] = useState<boolean>(false);

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
  const [soapClinicId, setSoapClinicId] = useState<string>(""); // empty = primary clinic

  // Doctor Clinics management states
  const [doctorClinics, setDoctorClinics] = useState<any[]>([]);
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicAddress, setNewClinicAddress] = useState("");
  const [newClinicPhone, setNewClinicPhone] = useState("");

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
  const [directUploadFile, setDirectUploadFile] = useState<File | null>(null);

  // Lab portal dashboard upload states
  const [labDashAppId, setLabDashAppId] = useState("");
  const [labDashTitle, setLabDashTitle] = useState("");
  const [labDashType, setLabDashType] = useState("blood-test");
  const [labDashFileName, setLabDashFileName] = useState("");
  const [labDashFile, setLabDashFile] = useState<File | null>(null);

  // In-session blob URL map: reportId -> blobUrl (for view/download of uploaded PDFs)
  const [reportBlobUrls, setReportBlobUrls] = useState<Record<string, string>>({});

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

  // Notification system states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: "n1", type: "consultation", title: "Upcoming Consultation", message: "You have an appointment with Dr. Meera Sharma (Dermatology) tomorrow at 10:30 AM.", time: "2 min ago", read: false, forRoles: ["patient"] },
    { id: "n2", type: "medicine", title: "Medicine Reminder", message: "Time to purchase Metformin 500mg — your current supply ends in 3 days. Refill from the pharmacy.", time: "15 min ago", read: false, forRoles: ["patient"] },
    { id: "n3", type: "reminder", title: "Follow-up Due", message: "Your follow-up visit with Dr. Arjun Patel (Cardiology) is scheduled for June 8, 2026.", time: "1 hr ago", read: false, forRoles: ["patient"] },
    { id: "n5", type: "alert", title: "Lab Report Ready", message: "Your CBC blood test results are now available. View them in the Lab History section.", time: "5 hrs ago", read: true, forRoles: ["patient"] },
    { id: "n6", type: "info", title: "Health Tip", message: "Remember to stay hydrated! Drink at least 8 glasses of water daily for optimal health.", time: "1 day ago", read: true, forRoles: ["patient"] },
    { id: "n7", type: "consultation", title: "Next Patient in 15 mins", message: "Rahul Verma (PAT-1002) is scheduled for a first-visit consultation at 11:00 AM today.", time: "Just now", read: false, forRoles: ["doctor", "assistant"] },
    { id: "n8", type: "consultation", title: "Upcoming Consultation", message: "Priya Singh (PAT-1005) has a follow-up appointment tomorrow at 09:30 AM — review notes.", time: "10 min ago", read: false, forRoles: ["doctor", "assistant"] },
    { id: "n9", type: "alert", title: "Urgent Referral Received", message: "Dr. Kavita Rao referred Ankit Mehta for emergency cardiac evaluation. Review referral details.", time: "30 min ago", read: false, forRoles: ["doctor"] },
    { id: "n10", type: "reminder", title: "Pending Lab Reviews", message: "3 lab reports from today's patients are awaiting your review in the diagnostics queue.", time: "2 hrs ago", read: true, forRoles: ["doctor"] },
    { id: "n11", type: "medicine", title: "Prescription Renewal Request", message: "Sanjay Kumar (PAT-1008) has requested a renewal for Amlodipine 5mg. Review and approve.", time: "4 hrs ago", read: true, forRoles: ["doctor"] },
    { id: "n12", type: "info", title: "Schedule Updated", message: "Your availability for next Monday has been updated by your assistant. 8 slots are now open.", time: "1 day ago", read: true, forRoles: ["doctor", "assistant"] },
  ]);

  // Mobile sidebar toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

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

  const fetchDoctorClinics = async () => {
    if (!currentUser || currentUser.role !== "doctor") return;
    try {
      const res = await fetch(`/api/doctor-clinics?doctorId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok && data.clinics) {
        setDoctorClinics(data.clinics);
      }
    } catch (e) {
      console.error("Failed loading doctor clinics list", e);
    }
  };

  // Fetch referrals and assistants when logged in, and trigger data load
  useEffect(() => {
    loadData();
    if (currentUser && (currentUser.role === "doctor" || currentUser.role === "assistant")) {
      fetchReferrals();
      if (currentUser.role === "doctor") {
        fetchAssistants();
        fetchDoctorClinics();
      }
    } else {
      setSentReferrals([]);
      setReceivedReferrals([]);
      setAssistants([]);
      setDoctorClinics([]);
    }
  }, [currentUser]);

  // Set doctor's signature url state when doctors or currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.role === "doctor" && doctors.length > 0) {
      const activeDoc = doctors.find(d => d.id === currentUser.id);
      if (activeDoc) {
        setDoctorSignatureUrl(activeDoc.signatureUrl || "");
      }
    } else if (!currentUser) {
      setDoctorSignatureUrl("");
    }
  }, [currentUser, doctors]);

  async function loadData() {
    try {
      // Determine query filters based on logged in user
      let queryParams = "";
      if (currentUser) {
        if (currentUser.role === "doctor" || currentUser.role === "assistant") {
          const docId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
          queryParams = `?doctorId=${docId}`;
        } else if (currentUser.role === "patient") {
          queryParams = `?patientId=${currentUser.id}`;
        }
      }

      const resDocs = await fetch("/api/doctors?includePending=true");
      const dataDocs = await resDocs.json();
      if (dataDocs.doctors) setDoctors(dataDocs.doctors);

      const resPats = await fetch("/api/patients");
      const dataPats = await resPats.json();
      if (dataPats.patients) setPatients(dataPats.patients);

      const resApps = await fetch(`/api/appointments${queryParams}`);
      const dataApps = await resApps.json();
      if (dataApps.appointments) setAppointments(dataApps.appointments);

      const resLabs = await fetch(`/api/lab-orders${queryParams}`);
      const dataLabs = await resLabs.json();
      if (dataLabs.labOrders) setLabOrders(dataLabs.labOrders);

      const resReports = await fetch(`/api/lab-reports${queryParams}`);
      const dataReports = await resReports.json();
      if (dataReports.labReports) setLabReports(dataReports.labReports);

      const resConsults = await fetch(`/api/consultations${queryParams}`);
      const dataConsults = await resConsults.json();
      if (dataConsults.consultations) setConsultations(dataConsults.consultations);

      const resMeds = await fetch("/api/medicines");
      const dataMeds = await resMeds.json();
      if (dataMeds.medicines) {
        setMedicines(dataMeds.medicines);
        if (dataMeds.medicines.length > 0) setSoapSelectedMedId(dataMeds.medicines[0].id);
      }

      const resRxAll = await fetch(`/api/prescriptions${queryParams}`);
      const dataRxAll = await resRxAll.json();
      if (dataRxAll.prescriptions) setPrescriptions(dataRxAll.prescriptions);

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
      const doc = doctors.find(d => d.id === id);
      setLoginPhone(doc?.phone || "");
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

    setSoapClinicId(""); // default to primary clinic

    setIsSoapOpen(true);
  };

  const handleLogConsultClick = async (patId: string, familyMemberId: string | null = null) => {
    const existingApp = appointments.find(
      a => a.patientId === patId && a.familyMemberId === familyMemberId && a.doctorId === currentUser?.id && a.status === "scheduled"
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
            familyMemberId: familyMemberId,
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

  // --- DENTAL SUITE UTILITIES ---
  const DENTAL_PROCEDURES = [
    { name: "Composite Filling", cost: 1500 },
    { name: "Root Canal Treatment", cost: 4500 },
    { name: "Porcelain Crown", cost: 6000 },
    { name: "Simple Extraction", cost: 1200 },
    { name: "Deep Scaling", cost: 2000 }
  ];

  const getToothStatusClass = (toothNum: number, patId: string) => {
    const patientOdontogram = odontogramData[patId] || {};
    const status = patientOdontogram[toothNum];
    if (status === "decayed") return "decayed";
    if (status === "filled") return "filled";
    if (status === "crown") return "crown";
    if (status === "missing") return "missing";
    return "";
  };

  const getToothStatusChar = (toothNum: number, patId: string) => {
    const patientOdontogram = odontogramData[patId] || {};
    const status = patientOdontogram[toothNum];
    if (status === "decayed") return "D";
    if (status === "filled") return "F";
    if (status === "crown") return "C";
    if (status === "missing") return "M";
    return "H";
  };

  const handleToothClick = (toothNum: number, patId: string) => {
    setSelectedTooth(toothNum);
    const patientToothNotes = toothNotes[patId] || {};
    const existingNote = patientToothNotes[toothNum] || "";
    setToothNoteInput(existingNote);
  };

  const handleUpdateToothStatus = (status: string, patId: string) => {
    if (selectedTooth === null) return;
    const patientOdontogram = odontogramData[patId] || {};
    const updatedPatData = {
      ...patientOdontogram,
      [selectedTooth]: status
    };
    setOdontogramData({
      ...odontogramData,
      [patId]: updatedPatData
    });
  };

  const handleSaveToothNote = (patId: string) => {
    if (selectedTooth === null) return;
    const patientToothNotes = toothNotes[patId] || {};
    const updatedPatNotes = {
      ...patientToothNotes,
      [selectedTooth]: toothNoteInput
    };
    setToothNotes({
      ...toothNotes,
      [patId]: updatedPatNotes
    });
    alert(`Notes saved for Tooth #${selectedTooth}.`);
  };

  const handleAddTreatmentPlan = (patId: string) => {
    const toothLabel = selectedTooth ? `Tooth #${selectedTooth}` : "General";
    const cost = DENTAL_PROCEDURES.find(p => p.name === treatmentProcedureInput)?.cost || 0;
    
    const newItem = {
      id: "TP-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      tooth: toothLabel,
      procedure: treatmentProcedureInput,
      cost: cost,
      notes: treatmentNotesInput || ""
    };
    
    const updatedPlans = {
      ...treatmentPlans,
      [patId]: [...(treatmentPlans[patId] || []), newItem]
    };
    setTreatmentPlans(updatedPlans);
    setTreatmentNotesInput("");
  };

  const handleDeleteTreatmentPlan = (itemId: string, patId: string) => {
    const updatedPlans = {
      ...treatmentPlans,
      [patId]: (treatmentPlans[patId] || []).filter(item => item.id !== itemId)
    };
    setTreatmentPlans(updatedPlans);
  };

  const handleAddRecall = (patId: string) => {
    if (!recallDateInput) {
      alert("Please select a due date for the recall.");
      return;
    }
    
    const newItem = {
      id: "RC-" + Date.now(),
      type: recallTypeInput,
      dueDate: recallDateInput,
      notes: recallNotesInput || "",
      status: "scheduled"
    };
    
    const updatedRecalls = {
      ...dentalRecalls,
      [patId]: [...(dentalRecalls[patId] || []), newItem]
    };
    setDentalRecalls(updatedRecalls);
    setRecallDateInput("");
    setRecallNotesInput("");
  };

  const handleToggleRecallStatus = (itemId: string, patId: string) => {
    const list = dentalRecalls[patId] || [];
    const updatedList = list.map(item => {
      if (item.id === itemId) {
        return { ...item, status: item.status === "scheduled" ? "completed" : "scheduled" };
      }
      return item;
    });
    setDentalRecalls({
      ...dentalRecalls,
      [patId]: updatedList
    });
  };

  const handleDeleteRecall = (itemId: string, patId: string) => {
    const updatedRecalls = {
      ...dentalRecalls,
      [patId]: (dentalRecalls[patId] || []).filter(item => item.id !== itemId)
    };
    setDentalRecalls(updatedRecalls);
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
          followUpDate: soapFollowUp,
          clinicId: soapClinicId || null
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
      } else if (res.status === 404) {
        const msg = data?.reason === 'referred'
          ? "This case was referred to a specialist. No prescription slip was issued."
          : "No prescription was issued for this consultation. The doctor did not prescribe any medicines.";
        alert(msg);
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

  const handleSaveSignature = async () => {
    if (!currentUser || currentUser.role !== "doctor") return;
    try {
      const res = await fetch("/api/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          signatureUrl: doctorSignatureUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.doctor) {
        alert("Signature saved successfully!");
        setDoctors(prev => prev.map(d => d.id === currentUser.id ? { ...d, signatureUrl: data.doctor.signatureUrl } : d));
      } else {
        alert(data.error || "Failed to save signature.");
      }
    } catch (err) {
      alert("Error saving signature.");
    }
  };

  const handleResetSignature = () => {
    if (!currentUser) return;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><path d="M 15 40 Q 55 15 105 45 T 185 30" fill="none" stroke="%230ea5e9" stroke-width="3" stroke-linecap="round"/><text x="30" y="48" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" fill="%231e3a8a">${currentUser.fullName}</text></svg>`;
    const base64Svg = `data:image/svg+xml;utf8,${svgContent}`;
    setDoctorSignatureUrl(base64Svg);
  };

  // --- CLINIC MANAGEMENT HANDLERS ---
  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch("/api/doctor-clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: currentUser.id,
          name: newClinicName,
          address: newClinicAddress,
          phone: newClinicPhone
        })
      });
      const data = await res.json();
      if (res.ok && data.clinic) {
        alert("Clinic added successfully!");
        setNewClinicName("");
        setNewClinicAddress("");
        setNewClinicPhone("");
        fetchDoctorClinics();
      } else {
        alert(data.error || "Failed to add clinic.");
      }
    } catch (err) {
      alert("Error adding clinic.");
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm("Are you sure you want to remove this clinic?")) return;
    try {
      const res = await fetch(`/api/doctor-clinics?clinicId=${clinicId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Clinic removed successfully!");
        fetchDoctorClinics();
      } else {
        alert(data.error || "Failed to remove clinic.");
      }
    } catch (err) {
      alert("Error removing clinic.");
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
        famMemberId = bookingFamilyMemberId || null;
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
          findings: "",
          notes: "",
          uploadedBy: currentUser?.id,
          fileName: directUploadFileName || "imaging_result_report.pdf",
          fileUrl: directUploadFileName ? `/uploads/${directUploadFileName}` : null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Store a blob URL for in-session view/download
        if (directUploadFile && data.labReport?.id) {
          const blobUrl = URL.createObjectURL(directUploadFile);
          setReportBlobUrls(prev => ({ ...prev, [data.labReport.id]: blobUrl }));
        }
        alert("Diagnostic findings file uploaded and synced to doctor files!");
        setIsDirectUploadOpen(false);
        setDirectUploadAppId("");
        setDirectUploadTitle("");
        setDirectUploadType("blood-test");
        setDirectUploadFindings("");
        setDirectUploadNotes("");
        setDirectUploadFileName("");
        setDirectUploadFile(null);
        loadData();
      } else {
        alert(data.error || "Failed uploading findings file.");
      }
    } catch (e) {
      alert("Error uploading report.");
    }
  };

  const handleLabDashboardUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labDashAppId) {
      alert("Please enter a valid appointment ID.");
      return;
    }

    try {
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: labDashAppId,
          reportTitle: labDashTitle,
          reportType: labDashType,
          findings: "",
          notes: "",
          uploadedBy: currentUser?.id || "LAB-00001",
          fileName: labDashFileName || "lab_result_report.pdf",
          fileUrl: labDashFileName ? `/uploads/${labDashFileName}` : null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Store a blob URL for in-session view/download
        if (labDashFile && data.labReport?.id) {
          const blobUrl = URL.createObjectURL(labDashFile);
          setReportBlobUrls(prev => ({ ...prev, [data.labReport.id]: blobUrl }));
        }
        alert("Diagnostic laboratory findings file uploaded and synced successfully!");
        setLabDashAppId("");
        setLabDashTitle("");
        setLabDashType("blood-test");
        setLabDashFileName("");
        setLabDashFile(null);
        loadData();
      } else {
        alert(data.error || "Failed uploading diagnostic report. Please check the Appointment ID.");
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

  // Doctor self-enrollment handler
  const handleDoctorEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date();
      const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      const docId = `DOC-${dateStr}-${seq}`;

      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: docId,
          name: enrollName,
          phone: enrollPhone,
          speciality: enrollSpeciality,
          qualifications: enrollQual,
          registrationNo: enrollRegNo,
          clinicName: enrollClinicName,
          clinicAddress: enrollClinicAddress,
          consultationFee: parseFloat(enrollFee) || 0,
          bio: enrollBio,
          languages: enrollLanguages,
          availableDays: enrollDays
        })
      });

      const data = await res.json();
      if (res.ok && data.doctor) {
        setIsDoctorEnrollOpen(false);
        // Reset form
        setEnrollName(""); setEnrollPhone(""); setEnrollSpeciality("");
        setEnrollQual(""); setEnrollRegNo(""); setEnrollClinicName("");
        setEnrollClinicAddress(""); setEnrollFee(""); setEnrollBio("");
        setEnrollLanguages("English"); setEnrollDays("Mon,Tue,Wed,Thu,Fri");
        alert(`✅ Registration submitted!\n\nYour Doctor ID is: ${docId}\n\nYour application is pending review by the System Administrator. You will be able to log in once your credentials have been approved.`);
        loadData();
      } else {
        alert(data.error || "Enrollment failed. Please check your details.");
      }
    } catch (e) {
      alert("Error submitting enrollment. Please try again.");
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
    if (loginRole) {
      // Return a clean OTP verification view
      return (
        <div id="app-container" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.06) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 40%)" }}>
          <div className="otp-box" style={{ display: "block" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <a onClick={() => setLoginRole(null)} style={{ cursor: "pointer", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <i className="fa-solid fa-arrow-left"></i> Back to homepage
              </a>
            </div>
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
              {loginRole === "doctor" ? "Doctor Portal" : loginRole === "patient" ? "Patient Portal" : loginRole === "lab" ? "Lab Partner Portal" : loginRole === "assistant" ? "Receptionist Hub" : "Administrator Portal"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Verify credential OTP to establish secure database session.
            </p>

            <form onSubmit={verifyDemoLogin}>
              <div className="form-group">
                <label>Select Account Profile</label>
                <select value={selectedDemoAccount} onChange={(e) => handleDemoAccountChange(e.target.value)}>
                  {demoAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Registered Phone</label>
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
                  Request Verification OTP
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Verify & Open Portal
                </button>
              )}
            </form>

            {loginRole === "doctor" && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>New Specialist Enrollment?</p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setIsDoctorEnrollOpen(true)}
                >
                  <i className="fa-solid fa-user-plus"></i> Submit Credentials
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Otherwise, render the premium marketing landing page
    return (
      <div id="app-container" style={{ display: "block", background: "radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 40%)" }}>
        
        {/* Navbar */}
        <nav className="landing-navbar">
          <div className="logo" style={{ fontSize: "1.5rem" }}>
            <i className="fa-solid fa-house-chimney-medical" style={{ color: "var(--primary)" }}></i>
            HealOne<span>360</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#compliance" className="landing-nav-link">Trust & Compliance</a>
            <a href="#tour" className="landing-nav-link">Workflow Tour</a>
            <a href="#demo-launch" className="btn btn-primary btn-sm" style={{ padding: "0.5rem 1.2rem" }}>
              Launch Demo
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="landing-hero">
          <div className="landing-hero-badge" style={{ display: "inline-flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", padding: "0.5rem 1.25rem", borderRadius: "50px", background: "var(--surface)", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)" }}></i> HIPAA & GDPR Standards Compliant
            </span>
            <span style={{ color: "var(--border)", fontSize: "0.8rem" }}>|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--secondary)", fontWeight: 600 }}>
              <i className="fa-solid fa-circle-check"></i> Practice Management + EHR + Patient Wallet
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "2.75rem", lineHeight: 1.2, maxWidth: "900px", margin: "0 auto" }}>A Unified Healthcare Operating System</h1>
          <p style={{ maxWidth: "800px", margin: "1.5rem auto 2.5rem auto", fontSize: "1.1rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
            What is a Healthcare Operating System? It is a single, fully integrated platform where <strong>Doctors</strong>, <strong>Patients</strong>, <strong>Receptionists</strong>, and <strong>Labs</strong> collaborate in real time. Instead of using separate, disjointed tools, your entire practice runs on one secure EHR engine.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#demo-launch" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
              Launch Interactive Demo
            </a>
            <a href="#tour" className="btn btn-outline" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
              Explore Portal Features
            </a>
          </div>
        </header>

        {/* Interactive Demo Video Section */}
        <section id="demo-video" style={{ maxWidth: "1000px", margin: "0 auto 4rem auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <i className="fa-solid fa-circle-play" style={{ marginRight: "0.25rem" }}></i> 1-Minute Platform Demo
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>See HealOne 360 in Action</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Watch how effortlessly patients, doctors, receptionists, and labs communicate.</p>
          </div>
          <div style={{ 
            border: "1px solid var(--border)", 
            borderRadius: "20px", 
            overflow: "hidden", 
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
            padding: "0.5rem",
            background: "linear-gradient(135deg, var(--border) 0%, rgba(255,255,255,0.2) 100%)"
          }}>
            <video 
              src="/Demo.mp4" 
              controls 
              style={{ width: "100%", borderRadius: "16px", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
            />
          </div>
        </section>

        {/* How We Are Different Section */}
        <section id="features" style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1.5rem" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
            .diff-card {
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 16px;
              padding: 2rem;
              box-shadow: var(--shadow-sm);
              transition: all 0.25s ease;
            }
            .diff-card:hover {
              transform: translateY(-5px);
              border-color: var(--primary) !important;
              box-shadow: var(--shadow-md) !important;
            }
          `}} />
          
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              The HealOne 360 Edge
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, marginTop: "0.5rem" }}>How HealOne 360 is Different</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.05rem" }}>Why modern clinics are shifting from legacy EHR systems to a unified workspace.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            
            {/* Difference Card 1 */}
            <div className="diff-card">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(14, 165, 233, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                <i className="fa-solid fa-arrows-spin"></i>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Unified Portal Ecosystem</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                <strong>Legacy systems:</strong> Doctors, Patients, and Labs use separate, disconnected programs that require tedious copy-pasting and manual entry.
              </p>
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "1rem", color: "var(--secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: "0.25rem" }}></i> HealOne 360: All portals sync data in real-time under a single secure ledger.
              </div>
            </div>

            {/* Difference Card 2 */}
            <div className="diff-card">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Background AI Copilot</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                <strong>Legacy systems:</strong> Alerts are passive and don't analyze patient state, requiring doctors to check records manually for allergies or vital anomalies.
              </p>
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "1rem", color: "var(--secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: "0.25rem" }}></i> HealOne 360: Real-time checks flag allergy contraindications & vitals risk on the fly.
              </div>
            </div>

            {/* Difference Card 3 */}
            <div className="diff-card">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                <i className="fa-solid fa-tooth"></i>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Visual Dental Workspace</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                <strong>Legacy systems:</strong> Dental charting is sold as an expensive add-on or managed via physical paper forms separate from standard EMRs.
              </p>
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "1rem", color: "var(--secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: "0.25rem" }}></i> HealOne 360: Interactive 32-tooth odontogram charting and recall scheduler built right in.
              </div>
            </div>

          </div>
        </section>

        {/* Competitor Comparison Section */}
        <section id="comparison" style={{ maxWidth: "1000px", margin: "4.5rem auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Side-by-Side Comparison
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>Why Choose HealOne 360?</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>A direct comparison against legacy medical systems and stand-alone apps.</p>
          </div>

          <div style={{ 
            overflowX: "auto", 
            background: "var(--surface)", 
            border: "1px solid var(--border)", 
            borderRadius: "16px", 
            boxShadow: "var(--shadow-md)" 
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(14, 165, 233, 0.04)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontWeight: 700, width: "35%" }}>Features & Capabilities</th>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontWeight: 700, color: "var(--primary)", background: "rgba(14, 165, 233, 0.06)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", width: "25%" }}>
                    <i className="fa-solid fa-house-chimney-medical" style={{ marginRight: "0.25rem" }}></i> HealOne 360
                  </th>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontWeight: 600, color: "var(--text-secondary)", width: "20%" }}>Traditional EMRs</th>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontWeight: 600, color: "var(--text-secondary)", width: "20%" }}>Stand-alone Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Unified ecosystem (Doctors + Patients + Labs)</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Real-time sync</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Siloed
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Manual export
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Integrated AI Clinical Copilot</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Included free</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> None
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Extra add-on
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Interactive 32-Tooth Odontogram</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Built-in</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Standard only
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Dental only
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Patient-Controlled Health Wallet</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Fully secure</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Read-only portal
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> None
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Setup Costs & Fees</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Zero installation fee</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    High upfront costs
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    Multiple subscriptions
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Offline-Resilient Caching</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Standard offline support</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Online only
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Varies
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Direct Laboratory Syncing</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Direct digital upload</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Manual uploads
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> None
                  </td>
                </tr>

                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Crypto-Signed Prescriptions</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> SHA-256 verification</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> Plain text/PDF only
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8" }}></i> None
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>HIPAA-Level Security & Encryption</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", background: "rgba(14, 165, 233, 0.02)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--secondary)", fontWeight: 700 }}><i className="fa-solid fa-circle-check"></i> Standard</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)" }}></i> Standard
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    Varies by app
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust & Compliance Section */}
        <section id="compliance" className="compliance-grid">
          <div className="compliance-card">
            <div className="compliance-icon"><i className="fa-solid fa-shield-halved"></i></div>
            <h4>AES-256 Data Encryption</h4>
            <p>Clinical logs, patient profiles, and diagnostics are encrypted in transit and at rest with military-grade algorithms.</p>
          </div>
          <div className="compliance-card">
            <div className="compliance-icon"><i className="fa-solid fa-file-contract"></i></div>
            <h4>Regulatory Compliance</h4>
            <p>Designed with data safeguards matching HIPAA administrative, physical, and technical standards.</p>
          </div>
          <div className="compliance-card">
            <div className="compliance-icon"><i className="fa-solid fa-clock-rotate-left"></i></div>
            <h4>Immutable Audit Ledger</h4>
            <p>All clinical modifications, diagnostic approvals, and access activities are logged in an immutable system ledger.</p>
          </div>
          <div className="compliance-card">
            <div className="compliance-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
            <h4>Redundant Backups</h4>
            <p>Hourly automated snapshot systems with geographical replication guarantee clinical backup availability.</p>
          </div>
        </section>

        {/* Interactive Feature Walkthrough Tour */}
        <section id="tour" className="tour-section" style={{ background: "var(--surface)" }}>
          <div className="tour-container">
            <div className="tour-header" style={{ marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800 }}>Interactive Clinical Workflows</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Preview the integrated operating portals of HealOne 360.</p>
            </div>
            
            <div className="tour-tabs" style={{ marginBottom: "2rem" }}>
              <button className={`tour-tab-btn ${activeTourTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTourTab("dashboard")}>Patient Dashboard</button>
              <button className={`tour-tab-btn ${activeTourTab === "appointment" ? "active" : ""}`} onClick={() => setActiveTourTab("appointment")}>Appointment Flow</button>
              <button className={`tour-tab-btn ${activeTourTab === "prescription" ? "active" : ""}`} onClick={() => setActiveTourTab("prescription")}>Prescription Slip</button>
              <button className={`tour-tab-btn ${activeTourTab === "diagnostics" ? "active" : ""}`} onClick={() => setActiveTourTab("diagnostics")}>Diagnostics Hub</button>
              <button className={`tour-tab-btn ${activeTourTab === "odontogram" ? "active" : ""}`} onClick={() => setActiveTourTab("odontogram")}>Odontogram Chart</button>
              <button className={`tour-tab-btn ${activeTourTab === "copilot" ? "active" : ""}`} onClick={() => setActiveTourTab("copilot")}>AI Clinical Copilot</button>
            </div>

            <div className="tour-viewscreen" style={{ minHeight: "420px" }}>
              {activeTourTab === "dashboard" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-solid fa-gauge"></i> Consolidated Patient Wallet</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      Patients gain complete agency over their medical records. A central health wallet aggregates active prescriptions, diagnostic files, allergy profiles, family folders, and clinical consultation records in real-time.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Verify allergy files & chronic conditions in one click</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Share records directly with specialists during referral</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Switch seamlessly between linked family members' profiles</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>AK</div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Amit Kumar (Self)</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Patient ID: PAT-00102</span>
                        </div>
                      </div>
                      <span className="badge badge-success">Active Wallet</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ background: "var(--background)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Allergies</span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--danger)", marginTop: "0.25rem" }}>Penicillin, Peanuts</div>
                      </div>
                      <div style={{ background: "var(--background)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Blood Group</span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", marginTop: "0.25rem" }}>AB+ Positive</div>
                      </div>
                    </div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Next Consultation:</span>
                        <div style={{ fontWeight: 650, marginTop: "0.15rem" }}>Dr. Arjun Patel (Cardiology)</div>
                      </div>
                      <span className="badge badge-info">Tomorrow, 10:30 AM</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTourTab === "appointment" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-regular fa-calendar-check"></i> Unified Practice Calendar</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      Practice receptionists and doctors schedule appointments, search patient demographic files, manage daily consultations, and block clinical slots directly on a high-availability availabilities calendar.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Clear slots mapping with visual load states</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Register walk-ins on the fly, auto-linked to physician</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Isolation metrics ensuring calendar load tracking</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem" }}><i className="fa-regular fa-clock" style={{ color: "var(--primary)" }}></i> Daily Consultations Grid</h4>
                      <span className="badge badge-info">June 9, 2026</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ borderLeft: "3px solid var(--primary)", background: "rgba(14, 165, 233, 0.06)", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <div>
                          <strong>09:30 AM</strong> - Priya Singh <span style={{ color: "var(--text-secondary)" }}>(Follow-up)</span>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: "0.6rem" }}>Completed</span>
                      </div>
                      <div style={{ borderLeft: "3px solid var(--danger)", background: "rgba(239, 68, 68, 0.06)", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <div>
                          <strong>10:30 AM</strong> - Amit Kumar <span style={{ color: "var(--text-secondary)" }}>(Emergency)</span>
                        </div>
                        <span className="badge badge-danger" style={{ fontSize: "0.6rem" }}>Attending</span>
                      </div>
                      <div style={{ borderLeft: "3px solid var(--text-secondary)", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <div>
                          <strong>11:30 AM</strong> - Calendar Blocked <span style={{ color: "var(--text-secondary)" }}>(Surgery Block)</span>
                        </div>
                        <span className="badge badge-outline" style={{ fontSize: "0.6rem" }}>Blocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTourTab === "prescription" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-solid fa-file-prescription"></i> Secure Prescription slips</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      Locked consultation summaries automatically generate structured prescription documents. Slips are verified with cryptographic hash IDs and carry base64-encoded clinical signature marks.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Itemized dosages, drug frequencies, and directions</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Seamless pharmacy dispatch integration for orders</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Cryptographic signatures verifying medical authority</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--primary)" }}>Dr. Arjun Patel</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Cardiologist | MCI-98765</span>
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", fontFamily: "serif" }}>R<sub>x</sub></div>
                    </div>
                    <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
                      <div><strong>1. Metformin 500mg</strong> — 1 tab, Once daily (morning) — 30 Days</div>
                      <div style={{ fontStyle: "italic", color: "var(--text-secondary)", paddingLeft: "0.75rem" }}>Take with meals. Do not crush.</div>
                      <div style={{ marginTop: "0.25rem" }}><strong>2. Amlodipine 5mg</strong> — 1 tab, Once daily (night) — 15 Days</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border)", paddingTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Verify Hash: SHA-20261A</span>
                      <div style={{ fontStyle: "cursive", color: "var(--primary)", fontWeight: 700, fontSize: "0.85rem" }}>Dr. Arjun Patel</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTourTab === "diagnostics" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-solid fa-microscope"></i> Diagnostic Integration & Uploads</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      Pathology orders travel directly to laboratory portal queues. Technicians record diagnostic findings, attach supporting clinical report PDFs, and update clinical records for doctor view instantly.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Laboratory queues matching pending specialist orders</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> High-fidelity PDF report uploading and database syncing</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Patient folder visual dashboard linking radiology/scans</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem" }}><i className="fa-solid fa-flask" style={{ color: "var(--secondary)" }}></i> Pathology Findings Summary</h4>
                      <span className="badge badge-success">Report Synced</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Total Cholesterol:</span>
                        <strong>242 mg/dL <span style={{ color: "var(--danger)" }}>(High)</span></strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>HDL Cholesterol:</span>
                        <strong>48 mg/dL <span style={{ color: "var(--text-secondary)" }}>(Normal)</span></strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Triglycerides:</span>
                        <strong>180 mg/dL <span style={{ color: "var(--warning)" }}>(Borderline)</span></strong>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: "1rem", fontSize: "0.75rem" }}>
                      <i className="fa-solid fa-file-pdf"></i> View Diagnostic Report PDF
                    </button>
                  </div>
                </div>
              )}

              {activeTourTab === "odontogram" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-solid fa-tooth"></i> Interactive Odontogram Charting</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      Dentists utilize the interactive visual odontogram tooth matrix (32 teeth) to log and track dental statuses (decayed, filled, missing, crowns) and build precise treatment plans.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Visual color-coded status mapping on the 32 teeth matrix</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Treatment Plan Builder tracking dental costs & procedures</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Integrated recall logger tracking patient dental follow-ups</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ textAlign: "center", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 700 }}>Adult Tooth Matrix Chart (Upper Arch)</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.25rem", marginBottom: "1rem" }}>
                      {[12, 13, 14, 15, 16].map((num) => {
                        let status = num === 14 ? "decayed" : (num === 15 ? "filled" : "healthy");
                        let color = status === "decayed" ? "var(--danger)" : (status === "filled" ? "var(--primary)" : "var(--text-secondary)");
                        let bg = status === "decayed" ? "var(--danger-light)" : (status === "filled" ? "var(--primary-light)" : "var(--background)");
                        return (
                          <div key={num} style={{ background: bg, border: `1.5px solid ${color}`, borderRadius: "6px", width: "42px", padding: "0.3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>#{num}</span>
                            <span style={{ fontSize: "0.75rem", color: color, marginTop: "0.15rem" }}>
                              <i className="fa-solid fa-tooth"></i>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ border: "1px solid var(--border)", padding: "0.75rem", borderRadius: "8px", background: "var(--background)", fontSize: "0.8rem" }}>
                      <strong>Active Treatment:</strong> Root Canal Treatment (#14) — ₹4,500 <span className="badge badge-warning" style={{ fontSize: "0.6rem", marginLeft: "0.5rem" }}>Planned</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTourTab === "copilot" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center", padding: "1rem" }} className="dash-row">
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1rem" }}><i className="fa-solid fa-brain"></i> AI Clinical Copilot & Warnings</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      An intelligent copilot running in the background dynamically scans SOAP vitals and prescriptions. It instantly warns the doctor of allergy contraindications and anomalies in vital signs.
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Drug allergy lookup checking prescription choices instantly</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Real-time vitals checking evaluating BP, Pulse, SpO2</li>
                      <li><i className="fa-solid fa-circle-check" style={{ color: "var(--secondary)", marginRight: "0.5rem" }}></i> Automated recommendations supporting clinical workflows</li>
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", boxShadow: "var(--shadow-md)" }}>
                    <div style={{ borderLeft: "4px solid var(--danger)", background: "var(--danger-light)", padding: "0.75rem", borderRadius: "0 8px 8px 0", color: "#991b1b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                      <div style={{ fontWeight: 700 }}><i className="fa-solid fa-triangle-exclamation"></i> Drug Allergy Interaction Warning</div>
                      <div style={{ marginTop: "0.25rem" }}>
                        Patient is allergic to <strong>Penicillin</strong>! Prescribing <strong>Amoxicillin</strong> is contra-indicated. Suggest Clindamycin 300mg.
                      </div>
                    </div>
                    <div style={{ borderLeft: "4px solid var(--warning)", background: "var(--warning-light)", padding: "0.75rem", borderRadius: "0 8px 8px 0", color: "#92400e", fontSize: "0.8rem" }}>
                      <div style={{ fontWeight: 700 }}><i className="fa-solid fa-heart-pulse"></i> Hypertension Advisory Alert</div>
                      <div style={{ marginTop: "0.25rem" }}>
                        Vitals show Blood Pressure is <strong>140/90 mmHg</strong> (Stage 2 Hypertension). Limit Epinephrine local anesthesia dosage.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Demo Launcher role selection cards */}
        <section id="demo-launch" style={{ maxWidth: "1200px", margin: "4rem auto", padding: "3rem 1.5rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800 }}>Explore Live Demo Accounts</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.05rem" }}>Select a mock credential portal below to establish database session verification.</p>
          </div>
          
          <div className="role-grid">
            <div className="role-card" onClick={() => handleRoleSelection("doctor")}>
              <div className="role-icon"><i className="fa-solid fa-user-doctor"></i></div>
              <h3>Doctor Portal</h3>
              <p>Practice dashboards, SOAP entries, dental odontogram chart, print RX, and patient history.</p>
            </div>
            <div className="role-card" onClick={() => handleRoleSelection("patient")}>
              <div className="role-icon"><i className="fa-solid fa-hospital-user"></i></div>
              <h3>Patient Portal</h3>
              <p>Check records wallet, book consultations, diagnostics history, and checkout prescriptions pharmacy.</p>
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
        </section>

        <footer className="auth-footer" style={{ paddingBottom: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
          <p>&copy; 2026 HealOne 360 Operating System. All rights reserved. Enterprise Secure EHR Platform.</p>
        </footer>

        {/* ==================== DOCTOR ENROLLMENT MODAL ==================== */}
        {isDoctorEnrollOpen && (
          <div className="modal-backdrop active" style={{ zIndex: 9999 }}>
            <div className="modal-container" style={{ maxWidth: 720 }}>
              <div className="modal-header">
                <div>
                  <h3><i className="fa-solid fa-user-doctor" style={{ color: "var(--primary)" }}></i> Doctor Enrolment Application</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>Your application will be reviewed by the System Administrator before activation.</p>
                </div>
                <button className="modal-close" onClick={() => setIsDoctorEnrollOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleDoctorEnroll}>
                <div className="modal-body">

                  {/* Personal Info */}
                  <div style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <i className="fa-solid fa-id-card"></i> Personal Information
                    </h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                        <input type="text" placeholder="Dr. John Smith" value={enrollName} onChange={e => setEnrollName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Mobile Phone <span style={{ color: "var(--danger)" }}>*</span></label>
                        <input type="tel" placeholder="10-digit mobile number" value={enrollPhone} onChange={e => setEnrollPhone(e.target.value)} required maxLength={10} />
                      </div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <i className="fa-solid fa-graduation-cap"></i> Doctor Credentials
                    </h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Speciality <span style={{ color: "var(--danger)" }}>*</span></label>
                        <select value={enrollSpeciality} onChange={e => setEnrollSpeciality(e.target.value)} required>
                          <option value="">-- Select Speciality --</option>
                          <option>General Physician</option>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>Orthopaedics</option>
                          <option>Gynaecology</option>
                          <option>Paediatrics</option>
                          <option>Dermatology</option>
                          <option>Psychiatry</option>
                          <option>Dental Surgeon</option>
                          <option>Ophthalmology</option>
                          <option>ENT Specialist</option>
                          <option>Gastroenterology</option>
                          <option>Endocrinology</option>
                          <option>Oncology</option>
                          <option>Pulmonology</option>
                          <option>Nephrology</option>
                          <option>Urology</option>
                          <option>Rheumatology</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Qualifications <span style={{ color: "var(--danger)" }}>*</span></label>
                        <input type="text" placeholder="e.g. MBBS, MD, DM" value={enrollQual} onChange={e => setEnrollQual(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Doctor Registration No. <span style={{ color: "var(--danger)" }}>*</span></label>
                        <input type="text" placeholder="e.g. MCI-12345" value={enrollRegNo} onChange={e => setEnrollRegNo(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Consultation Fee (₹)</label>
                        <input type="number" placeholder="e.g. 500" value={enrollFee} onChange={e => setEnrollFee(e.target.value)} min="0" />
                      </div>
                    </div>
                  </div>

                  {/* Clinic Details */}
                  <div style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--warning)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <i className="fa-solid fa-hospital"></i> Clinic / Practice Details
                    </h4>
                    <div className="form-group">
                      <label>Clinic / Hospital Name <span style={{ color: "var(--danger)" }}>*</span></label>
                      <input type="text" placeholder="e.g. City Heart Care Centre" value={enrollClinicName} onChange={e => setEnrollClinicName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Clinic Address</label>
                      <textarea rows={2} placeholder="Street, City, State, PIN" value={enrollClinicAddress} onChange={e => setEnrollClinicAddress(e.target.value)}></textarea>
                    </div>
                  </div>

                  {/* Practice Info */}
                  <div>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <i className="fa-solid fa-calendar-check"></i> Practice Info
                    </h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Languages Spoken</label>
                        <input type="text" placeholder="e.g. English, Hindi, Gujarati" value={enrollLanguages} onChange={e => setEnrollLanguages(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Available Days (comma-separated)</label>
                        <input type="text" placeholder="Mon,Tue,Wed,Thu,Fri" value={enrollDays} onChange={e => setEnrollDays(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Professional Bio / About</label>
                      <textarea rows={2} placeholder="Brief description of your experience and expertise..." value={enrollBio} onChange={e => setEnrollBio(e.target.value)}></textarea>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div style={{ background: "var(--background)", border: "1px dashed var(--primary)", borderRadius: 8, padding: "0.75rem 1rem", marginTop: "0.5rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <i className="fa-solid fa-circle-info" style={{ color: "var(--primary)", marginTop: 2 }}></i>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      Your application will be placed in <strong>Pending Approval</strong> status. The System Administrator will review your credentials and activate your account. You will receive your Doctor ID upon submission.
                    </p>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setIsDoctorEnrollOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><i className="fa-solid fa-paper-plane"></i> Submit Enrolment Application</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
        <style dangerouslySetInnerHTML={{
          __html: `
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
            <i className="fa-solid fa-house-chimney-medical" style={{ color: "var(--primary)" }}></i> HealOne<span>360</span>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Who is using HealOne 360 today?</h1>
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
    const flatList: any[] = [];
    patients.forEach(p => {
      // Primary patient
      flatList.push({
        ...p,
        isFamilyMember: false,
        primaryPatient: p
      });
      // Family members as separate patients
      p.familyMembers?.forEach(fm => {
        flatList.push({
          id: fm.id,
          name: fm.name,
          primaryPhone: p.primaryPhone,
          email: p.email,
          dateOfBirth: fm.dateOfBirth,
          gender: fm.gender,
          bloodGroup: fm.bloodGroup || p.bloodGroup,
          address: p.address,
          emergencyContact: p.emergencyContact,
          allergies: fm.allergies || "No Known Allergies",
          chronicConditions: fm.chronicConditions || "None Logged",
          isFamilyMember: true,
          relation: fm.relation,
          primaryPatient: p
        });
      });
    });

    let list = flatList;
    if (currentUser && (currentUser.role === "doctor" || currentUser.role === "assistant")) {
      const targetDocId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
      if (!searchQuery) {
        list = flatList.filter(p => {
          return appointments.some(a => a.doctorId === targetDocId && (p.isFamilyMember ? a.familyMemberId === p.id : (!a.familyMemberId && a.patientId === p.id)));
        });
      } else {
        const q = searchQuery.toLowerCase();
        list = flatList.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.primaryPhone.includes(q) || (p.isFamilyMember && p.relation.toLowerCase().includes(q)));
      }
    } else {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = flatList.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.primaryPhone.includes(q) || (p.isFamilyMember && p.relation.toLowerCase().includes(q)));
      }
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

  const findPatientOrFamilyMember = (id: string) => {
    for (const pat of patients) {
      if (pat.id === id) {
        return {
          ...pat,
          isFamilyMember: false,
          primaryPatient: pat
        };
      }
      const fm = pat.familyMembers?.find(f => f.id === id);
      if (fm) {
        return {
          id: fm.id,
          name: fm.name,
          primaryPhone: pat.primaryPhone,
          email: pat.email,
          dateOfBirth: fm.dateOfBirth,
          gender: fm.gender,
          bloodGroup: fm.bloodGroup || pat.bloodGroup,
          address: pat.address,
          emergencyContact: pat.emergencyContact,
          allergies: fm.allergies || "No Known Allergies",
          chronicConditions: fm.chronicConditions || "None Logged",
          isFamilyMember: true,
          relation: fm.relation,
          primaryPatient: pat
        };
      }
    }
    return null;
  };

  const getSortedPatientAppointments = (patientId: string) => {
    const patApps = appointments.filter(a => {
      const isFamily = patientId.startsWith("FM-");
      const matchesPatient = isFamily ? a.familyMemberId === patientId : (!a.familyMemberId && a.patientId === patientId);
      
      if (currentUser && (currentUser.role === "doctor" || currentUser.role === "assistant")) {
        const targetDocId = currentUser.role === "doctor" ? currentUser.id : currentUser.doctorId;
        return matchesPatient && a.doctorId === targetDocId;
      }
      return matchesPatient;
    });

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
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

        <aside id="sidebar" className={isMobileMenuOpen ? "mobile-open" : ""}>
          <div>
            <div className="sidebar-brand logo">
              <i className="fa-solid fa-house-chimney-medical"></i> HealOne<span>360</span>
              <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <ul className="sidebar-menu">
              {currentUser.role === "doctor" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => handleNavClick("dashboard")}><i className="fa-solid fa-gauge"></i><span>Dashboard</span></a></li>
                  <li className={`sidebar-item ${activePage === "patients-dir" ? "active" : ""}`}><a onClick={() => handleNavClick("patients-dir")}><i className="fa-solid fa-users"></i><span>Patients Directory</span></a></li>
                  <li className={`sidebar-item ${activePage === "calendar" ? "active" : ""}`}><a onClick={() => handleNavClick("calendar")}><i className="fa-solid fa-calendar"></i><span>Availability calendar</span></a></li>
                  <li className={`sidebar-item ${activePage === "analytics" ? "active" : ""}`}><a onClick={() => handleNavClick("analytics")}><i className="fa-solid fa-chart-line"></i><span>Clinical Analytics</span></a></li>
                  <li className={`sidebar-item ${activePage === "assistants" ? "active" : ""}`}><a onClick={() => handleNavClick("assistants")}><i className="fa-solid fa-user-gear"></i><span>Manage Assistants</span></a></li>
                  <li className={`sidebar-item ${activePage === "my-clinics" ? "active" : ""}`}><a onClick={() => handleNavClick("my-clinics")}><i className="fa-solid fa-hospital"></i><span>My Clinics</span></a></li>
                </>
              )}
              {currentUser.role === "assistant" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => handleNavClick("dashboard")}><i className="fa-solid fa-gauge"></i><span>Assistant Hub</span></a></li>
                  <li className={`sidebar-item ${activePage === "calendar" ? "active" : ""}`}><a onClick={() => handleNavClick("calendar")}><i className="fa-solid fa-calendar"></i><span>Doctor Calendar</span></a></li>
                  <li className={`sidebar-item ${activePage === "patients-dir" ? "active" : ""}`}><a onClick={() => handleNavClick("patients-dir")}><i className="fa-solid fa-users"></i><span>Patients Directory</span></a></li>
                </>
              )}
              {currentUser.role === "patient" && (
                <>
                  <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => handleNavClick("dashboard")}><i className="fa-solid fa-gauge"></i><span>Dashboard</span></a></li>
                  <li className={`sidebar-item ${activePage === "find-doctors" ? "active" : ""}`}><a onClick={() => handleNavClick("find-doctors")}><i className="fa-solid fa-user-md"></i><span>Find Doctors</span></a></li>
                  <li className={`sidebar-item ${activePage === "consultation-history" ? "active" : ""}`}><a onClick={() => handleNavClick("consultation-history")}><i className="fa-solid fa-notes-medical"></i><span>Consultations</span></a></li>
                  <li className={`sidebar-item ${activePage === "lab-history" ? "active" : ""}`}><a onClick={() => handleNavClick("lab-history")}><i className="fa-solid fa-microscope"></i><span>Lab History</span></a></li>
                  <li className={`sidebar-item ${activePage === "pharmacy" ? "active" : ""}`}><a onClick={() => handleNavClick("pharmacy")}><i className="fa-solid fa-pills"></i><span>Medicine History</span></a></li>
                </>
              )}
              {currentUser.role === "lab" && (
                <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => handleNavClick("dashboard")}><i className="fa-solid fa-list-check"></i><span>Orders Queue</span></a></li>
              )}
              {currentUser.role === "admin" && (
                <li className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}><a onClick={() => handleNavClick("dashboard")}><i className="fa-solid fa-user-check"></i><span>Approvals Panel</span></a></li>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
              <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                <i className="fa-solid fa-bars"></i>
              </button>
              <div style={{ minWidth: 0 }}>
                <h2 className="header-title">
                  {activePage === "dashboard" ? (currentUser.role === "assistant" ? "Assistant Hub" : "Dashboard Hub") : activePage === "patients-dir" ? "Clinical Patients Folders" : activePage === "patient-folder" ? "Detailed Patient Summary" : activePage === "calendar" ? "Availability Template" : activePage === "analytics" ? "Practice Business Intel" : activePage === "assistants" ? "Manage Assistants" : activePage === "find-doctors" ? "Schedule consultations" : activePage === "lab-history" ? "Lab History Directory" : activePage === "pending-labs" ? "Diagnostic test bookings" : activePage === "pharmacy" ? "Medicine History" : activePage === "consultation-history" ? "Consultation History" : "Dashboard"}
                </h2>
                <span className="header-subtitle">
                  {currentUser.role.toUpperCase()} PORTAL {currentUser.role === "assistant" && ` (Assisting Dr. ${doctors.find(d => d.id === currentUser.doctorId)?.name || currentUser.doctorId})`} / {activePage.toUpperCase()}
                </span>
              </div>
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

              {/* Notification Bell & Dropdown */}
              <div className="notif-wrapper">
                <button className="icon-btn" onClick={() => setIsNotifOpen(prev => !prev)}>
                  <i className={isNotifOpen ? "fa-solid fa-bell" : "fa-regular fa-bell"}></i>
                  {(() => {
                    const roleNotifs = notifications.filter(n => n.forRoles.includes(currentUser.role));
                    const unreadCount = roleNotifs.filter(n => !n.read).length;
                    return unreadCount > 0 ? <span className="notif-count">{unreadCount}</span> : null;
                  })()}
                </button>

                {isNotifOpen && (
                  <>
                    <div className="notif-overlay" onClick={() => setIsNotifOpen(false)} />
                    <div className="notif-dropdown">
                      <div className="notif-dropdown-header">
                        <h4>
                          <i className="fa-solid fa-bell" style={{ color: "var(--primary)" }}></i>
                          Notifications
                          <span className="notif-header-count">
                            {notifications.filter(n => n.forRoles.includes(currentUser.role)).length}
                          </span>
                        </h4>
                        <button
                          className="notif-mark-read"
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="notif-list">
                        {(() => {
                          const roleNotifs = notifications.filter(n => n.forRoles.includes(currentUser.role));
                          if (roleNotifs.length === 0) {
                            return (
                              <div className="notif-empty">
                                <i className="fa-regular fa-bell-slash"></i>
                                <p>No notifications yet.</p>
                              </div>
                            );
                          }
                          return roleNotifs.map(notif => (
                            <div
                              key={notif.id}
                              className={`notif-item ${!notif.read ? "unread" : ""}`}
                              onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                            >
                              <div className={`notif-icon ${notif.type}`}>
                                <i className={
                                  notif.type === "consultation" ? "fa-solid fa-stethoscope" :
                                    notif.type === "medicine" ? "fa-solid fa-pills" :
                                      notif.type === "reminder" ? "fa-solid fa-clock" :
                                        notif.type === "alert" ? "fa-solid fa-triangle-exclamation" :
                                          "fa-solid fa-circle-info"
                                }></i>
                              </div>
                              <div className="notif-body">
                                <h5>{notif.title}</h5>
                                <p>{notif.message}</p>
                              </div>
                              <span className="notif-time">{notif.time}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                  </div>

                  <div className="dash-row">
                    <div className="panel">
                      <div className="panel-header">
                        <h3 className="panel-title"><i className="fa-regular fa-clock" style={{ color: "var(--primary)" }}></i> Practice Schedule Queue</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => openBookAppointmentModal()}>
                          <i className="fa-solid fa-plus"></i> New Appointment
                        </button>
                      </div>
                      <div className="appointments-grid">
                        {appointments.filter(a => a.doctorId === targetDocId).length === 0 ? (
                          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0" }}>
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

                            // Dynamic left border and background color based on status and visitType (using slightly darker/richer transparent layers)
                            let cardBorderLeft = "3px solid var(--primary)";
                            let cardBackground = "linear-gradient(90deg, rgba(14, 165, 233, 0.12) 0%, var(--glass) 100%)";

                            if (isBlocked) {
                              cardBorderLeft = "3px solid var(--text-secondary)";
                              cardBackground = "linear-gradient(90deg, rgba(100, 116, 139, 0.12) 0%, var(--glass) 100%)";
                            } else if (app.status === "completed") {
                              cardBorderLeft = "3px solid var(--secondary)";
                              cardBackground = "linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, var(--glass) 100%)";
                            } else if (app.visitType === "emergency") {
                              cardBorderLeft = "3px solid var(--danger)";
                              cardBackground = "linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, var(--glass) 100%)";
                            } else if (app.visitType === "follow-up") {
                              cardBorderLeft = "3px solid var(--warning)";
                              cardBackground = "linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, var(--glass) 100%)";
                            }

                            return (
                              <div
                                key={app.id}
                                className="appointment-card glass-card"
                                style={{
                                  cursor: isBlocked ? "default" : "pointer",
                                  borderLeft: cardBorderLeft,
                                  opacity: isBlocked ? 0.75 : 1,
                                  background: cardBackground
                                }}
                                onClick={() => {
                                  if (isBlocked) return;
                                  setSelectedPatDetailId(app.patientId);
                                  setActivePage("patient-folder");
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", minWidth: "75px" }}>
                                    {app.appointmentTime}
                                  </span>
                                  <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {pName}
                                    </h4>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                                      {pMeta ? `(${pMeta})` : ""}
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                                  <span className={`badge ${badgeClass}`} style={{ fontSize: "0.65rem" }}>
                                    {isBlocked ? "block" : app.visitType}
                                  </span>
                                  <span className={`badge ${statusBadgeClass}`} style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>
                                    {app.status}
                                  </span>

                                  <div style={{ display: "flex", gap: "0.25rem" }}>
                                    {isBlocked && (
                                      <button
                                        className="btn btn-outline btn-sm"
                                        style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", color: "var(--danger)", borderColor: "var(--danger)" }}
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
                                        Unblock
                                      </button>
                                    )}
                                    {!isBlocked && app.status === "scheduled" && currentUser.role === "doctor" && (
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem" }}
                                        onClick={() => startConsultationSoap(app.id)}
                                      >
                                        Start SOAP
                                      </button>
                                    )}
                                    {!isBlocked && app.status === "completed" && (
                                      <button
                                        className="btn btn-outline btn-sm"
                                        style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem" }}
                                        onClick={() => loadPrescriptionPrint(generateId('RX'))}
                                      >
                                        RX
                                      </button>
                                    )}
                                    {(() => {
                                      const appReports = labReports.filter(r => r.appointmentId === app.id);
                                      if (appReports.length > 0 && !isBlocked) {
                                        return (
                                          <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem" }}
                                            onClick={() => openViewReportsModal(app.id)}
                                          >
                                            Reports ({appReports.length})
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
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
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                        <p>
                          {!searchQuery 
                            ? "No attending patients in directory yet. Use the search bar at the top to find existing profiles by ID/Phone, or register a new patient."
                            : "No patients match the search query."}
                        </p>
                      </div>
                    ) : (
                      getFilteredPatients().map(pat => {
                        const patApps = getSortedPatientAppointments(pat.id);
                        const isDetailsExpanded = !!expandedDetailsPatientIds[pat.id];
                        const isApptsExpanded = !!expandedAppointmentsPatientIds[pat.id];
                        const initials = (pat.name as string).split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

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
                                    {pat.isFamilyMember && (
                                      <span style={{ fontSize: "0.7rem", color: "var(--primary)", backgroundColor: "var(--primary-light)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                                        {pat.relation} of {pat.primaryPatient.name}
                                      </span>
                                    )}
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
                                    onClick={() => handleLogConsultClick(pat.isFamilyMember ? pat.primaryPatient.id : pat.id, pat.isFamilyMember ? pat.id : null)}
                                    style={{ height: "34px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                  >
                                    <i className="fa-solid fa-stethoscope"></i> Log Consult
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setBookingPatientId(pat.isFamilyMember ? pat.primaryPatient.id : pat.id);
                                      setBookingFamilyMemberId(pat.isFamilyMember ? pat.id : "");
                                      setBookingDoctorId(currentUser.doctorId || "");
                                      setBookingDate(new Date().toISOString().split("T")[0]);
                                      setBookingIsBlock(false);
                                      setBookingTime("");
                                      setBookingComplaint("");
                                      setBookingSearchVal("");
                                      setBookingSearchDone(false);
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
                        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${activeFolderTab === "medical" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setActiveFolderTab("medical")}
                          >
                            <i className="fa-solid fa-clock-rotate-left"></i> Medical Portfolio
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${activeFolderTab === "dental" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => {
                              setActiveFolderTab("dental");
                              setSelectedTooth(null);
                            }}
                          >
                            <i className="fa-solid fa-tooth"></i> Dental Workspace
                          </button>
                        </div>

                        {activeFolderTab === "medical" ? (
                          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: 0 }}>
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
                                    setBookingSearchVal("");
                                    setBookingSearchDone(false);
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
                                                {rep.findings && (
                                                  <pre style={{ fontFamily: "monospace", fontSize: "0.75rem", padding: "0.35rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, whiteSpace: "pre-wrap", margin: "0 0 0.5rem 0" }}>
                                                    {rep.findings}
                                                  </pre>
                                                )}
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                  <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => {
                                                      setViewPdfReport(rep);
                                                      setIsPdfModalOpen(true);
                                                    }}
                                                  >
                                                    <i className="fa-solid fa-file-pdf"></i> View Report PDF
                                                  </button>
                                                  {rep.fileUrl && (
                                                    <a
                                                      href={rep.fileUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      download={rep.fileName || "report.pdf"}
                                                      className="btn btn-secondary btn-sm"
                                                    >
                                                      <i className="fa-solid fa-download"></i> Download Attached PDF
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

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
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {/* DENTAL ARCHES */}
                            <div className="panel" style={{ padding: "1.25rem", border: "1px solid var(--border)", marginTop: 0 }}>
                              <h3 className="panel-title" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fa-solid fa-teeth" style={{ color: "var(--primary)" }}></i> Interactive Odontogram
                              </h3>
                              <div className="odontogram-panel">
                                <div className="odontogram-arch">
                                  <div className="odontogram-arch-title">
                                    <i className="fa-solid fa-chevron-up"></i> Maxillary Arch (Upper - Teeth 1-16)
                                  </div>
                                  <div className="odontogram-teeth-row">
                                    {Array.from({ length: 16 }, (_, i) => i + 1).map(num => {
                                      const statusClass = getToothStatusClass(num, pat.id);
                                      const statusChar = getToothStatusChar(num, pat.id);
                                      const isSelected = selectedTooth === num;
                                      return (
                                        <div
                                          key={num}
                                          className={`tooth-card ${isSelected ? "selected" : ""}`}
                                          onClick={() => handleToothClick(num, pat.id)}
                                        >
                                          <span className="tooth-num">{num}</span>
                                          <div className={`tooth-icon-holder ${statusClass}`}>
                                            {statusChar === "H" ? (
                                              <i className="fa-solid fa-tooth" style={{ fontSize: "0.65rem", opacity: 0.5 }}></i>
                                            ) : statusChar}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="odontogram-arch">
                                  <div className="odontogram-arch-title">
                                    <i className="fa-solid fa-chevron-down"></i> Mandibular Arch (Lower - Teeth 17-32)
                                  </div>
                                  <div className="odontogram-teeth-row">
                                    {Array.from({ length: 16 }, (_, i) => i + 17).map(num => {
                                      const statusClass = getToothStatusClass(num, pat.id);
                                      const statusChar = getToothStatusChar(num, pat.id);
                                      const isSelected = selectedTooth === num;
                                      return (
                                        <div
                                          key={num}
                                          className={`tooth-card ${isSelected ? "selected" : ""}`}
                                          onClick={() => handleToothClick(num, pat.id)}
                                        >
                                          <span className="tooth-num">{num}</span>
                                          <div className={`tooth-icon-holder ${statusClass}`}>
                                            {statusChar === "H" ? (
                                              <i className="fa-solid fa-tooth" style={{ fontSize: "0.65rem", opacity: 0.5 }}></i>
                                            ) : statusChar}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="odontogram-legend">
                                  <div className="legend-item"><span className="legend-dot"></span> Healthy</div>
                                  <div className="legend-item"><span className="legend-dot decayed"></span> Decayed</div>
                                  <div className="legend-item"><span className="legend-dot filled"></span> Filled</div>
                                  <div className="legend-item"><span className="legend-dot crown"></span> Crown</div>
                                  <div className="legend-item"><span className="legend-dot missing"></span> Missing</div>
                                </div>
                              </div>
                            </div>

                            {/* TOOTH NOTES & STATUS EDITOR */}
                            {selectedTooth !== null && (
                              <div className="panel animate-fade-in" style={{ border: "1px solid var(--primary)", background: "var(--primary-light)", padding: "1.25rem", marginTop: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                  <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--primary)", fontWeight: 700 }}>
                                    <i className="fa-solid fa-pen-to-square"></i> Tooth #{selectedTooth} Editor
                                  </h4>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: "2px 6px" }}
                                    onClick={() => setSelectedTooth(null)}
                                  >
                                    Close
                                  </button>
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Clinical Status</label>
                                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                    {[
                                      { name: "Healthy", value: "healthy" },
                                      { name: "Decayed", value: "decayed" },
                                      { name: "Filled", value: "filled" },
                                      { name: "Crown", value: "crown" },
                                      { name: "Missing", value: "missing" }
                                    ].map(opt => {
                                      const patientOdontogram = odontogramData[pat.id] || {};
                                      const isCurrent = (patientOdontogram[selectedTooth] || "healthy") === opt.value;
                                      return (
                                        <button
                                          type="button"
                                          key={opt.value}
                                          className={`btn btn-sm ${isCurrent ? "btn-primary" : "btn-outline"}`}
                                          style={{ fontSize: "0.75rem" }}
                                          onClick={() => handleUpdateToothStatus(opt.value, pat.id)}
                                        >
                                          {opt.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Clinical Notes for Tooth #{selectedTooth}</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Enter notes (e.g. distal caries, RCT planned...)"
                                    value={toothNoteInput}
                                    onChange={(e) => setToothNoteInput(e.target.value)}
                                    style={{ padding: "0.5rem", fontSize: "0.8rem" }}
                                  ></textarea>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleSaveToothNote(pat.id)}
                                >
                                  <i className="fa-solid fa-save"></i> Save Tooth Note
                                </button>
                              </div>
                            )}

                            {/* TREATMENT PLAN BUILDER */}
                            <div className="panel" style={{ padding: "1.25rem", border: "1px solid var(--border)", marginTop: 0 }}>
                              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fa-solid fa-screwdriver-wrench" style={{ color: "var(--secondary)" }}></i> Treatment Plan Builder
                              </h4>

                              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "flex-end" }}>
                                <div style={{ flex: "1 1 200px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Select Procedure</label>
                                  <select
                                    value={treatmentProcedureInput}
                                    onChange={(e) => setTreatmentProcedureInput(e.target.value)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                                  >
                                    {DENTAL_PROCEDURES.map(proc => (
                                      <option key={proc.name} value={proc.name}>
                                        {proc.name} (₹{proc.cost.toLocaleString()})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div style={{ flex: "1 1 120px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Tooth Ref</label>
                                  <select
                                    value={selectedTooth || ""}
                                    onChange={(e) => setSelectedTooth(e.target.value ? Number(e.target.value) : null)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                                  >
                                    <option value="">General</option>
                                    {Array.from({ length: 32 }, (_, i) => i + 1).map(num => (
                                      <option key={num} value={num}>Tooth #{num}</option>
                                    ))}
                                  </select>
                                </div>

                                <div style={{ flex: "2 1 250px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Clinical Notes</label>
                                  <input
                                    type="text"
                                    placeholder="Enter notes..."
                                    value={treatmentNotesInput}
                                    onChange={(e) => setTreatmentNotesInput(e.target.value)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem", height: "36px" }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  style={{ height: "36px", paddingInline: "1rem" }}
                                  onClick={() => handleAddTreatmentPlan(pat.id)}
                                >
                                  <i className="fa-solid fa-plus"></i> Add Plan
                                </button>
                              </div>

                              <div className="table-wrapper" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                <table style={{ fontSize: "0.8rem" }}>
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Tooth</th>
                                      <th>Procedure</th>
                                      <th>Notes</th>
                                      <th>Est. Cost</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const patientPlans = treatmentPlans[pat.id] || [];
                                      const totalCost = patientPlans.reduce((sum, p) => sum + p.cost, 0);
                                      return (
                                        <>
                                          {patientPlans.map(item => (
                                            <tr key={item.id}>
                                              <td>{formatDate(item.date)}</td>
                                              <td style={{ fontWeight: 600 }}>{item.tooth}</td>
                                              <td style={{ fontWeight: 600 }}>{item.procedure}</td>
                                              <td style={{ color: "var(--text-secondary)" }}>{item.notes}</td>
                                              <td style={{ fontWeight: 700 }}>₹{item.cost.toLocaleString()}</td>
                                              <td>
                                                <button
                                                  type="button"
                                                  className="btn btn-danger btn-sm"
                                                  style={{ padding: "2px 6px" }}
                                                  onClick={() => handleDeleteTreatmentPlan(item.id, pat.id)}
                                                >
                                                  &times;
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                          {patientPlans.length === 0 && (
                                            <tr>
                                              <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                                                No treatment plans built yet.
                                              </td>
                                            </tr>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </tbody>
                                </table>
                              </div>

                              {(() => {
                                const patientPlans = treatmentPlans[pat.id] || [];
                                const totalCost = patientPlans.reduce((sum, p) => sum + p.cost, 0);
                                return patientPlans.length > 0 ? (
                                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                      Total Estimated Cost: <span style={{ color: "var(--secondary)", fontSize: "1.1rem" }}>₹{totalCost.toLocaleString()}</span>
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                            </div>

                            {/* RECALL SCHEDULER */}
                            <div className="panel" style={{ padding: "1.25rem", border: "1px solid var(--border)", marginTop: 0 }}>
                              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fa-solid fa-calendar-check" style={{ color: "var(--primary)" }}></i> Dental Recalls & Follow-ups
                              </h4>

                              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "flex-end" }}>
                                <div style={{ flex: "1 1 200px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Recall Type</label>
                                  <select
                                    value={recallTypeInput}
                                    onChange={(e) => setRecallTypeInput(e.target.value)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                                  >
                                    <option value="Routine Scaling & Exam">Routine Scaling & Exam</option>
                                    <option value="6-Month Prophylaxis">6-Month Prophylaxis</option>
                                    <option value="Orthodontic Follow-up">Orthodontic Follow-up</option>
                                    <option value="Implant Restoration Check">Implant Restoration Check</option>
                                    <option value="Deep Scaling Maintenance">Deep Scaling Maintenance</option>
                                  </select>
                                </div>

                                <div style={{ flex: "1 1 150px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Recall Due Date</label>
                                  <input
                                    type="date"
                                    value={recallDateInput}
                                    onChange={(e) => setRecallDateInput(e.target.value)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem", height: "36px" }}
                                  />
                                </div>

                                <div style={{ flex: "2 1 250px" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Notes</label>
                                  <input
                                    type="text"
                                    placeholder="Scheduler Notes..."
                                    value={recallNotesInput}
                                    onChange={(e) => setRecallNotesInput(e.target.value)}
                                    style={{ fontSize: "0.85rem", padding: "0.5rem", height: "36px" }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ height: "36px", paddingInline: "1rem" }}
                                  onClick={() => handleAddRecall(pat.id)}
                                >
                                  <i className="fa-solid fa-clock"></i> Schedule Recall
                                </button>
                              </div>

                              <div className="table-wrapper" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                <table style={{ fontSize: "0.8rem" }}>
                                  <thead>
                                    <tr>
                                      <th>Recall Type</th>
                                      <th>Due Date</th>
                                      <th>Notes</th>
                                      <th>Status</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const patientRecalls = dentalRecalls[pat.id] || [];
                                      return (
                                        <>
                                          {patientRecalls.map(item => (
                                            <tr key={item.id}>
                                              <td style={{ fontWeight: 600 }}>{item.type}</td>
                                              <td style={{ fontWeight: 600, color: "var(--primary)" }}>{formatDate(item.dueDate)}</td>
                                              <td style={{ color: "var(--text-secondary)" }}>{item.notes}</td>
                                              <td>
                                                <span
                                                  onClick={() => handleToggleRecallStatus(item.id, pat.id)}
                                                  className={`badge ${item.status === "completed" ? "badge-success" : "badge-info"}`}
                                                  style={{ cursor: "pointer", fontSize: "0.7rem", padding: "2px 8px" }}
                                                  title="Click to toggle status"
                                                >
                                                  {item.status}
                                                </span>
                                              </td>
                                              <td>
                                                <button
                                                  type="button"
                                                  className="btn btn-danger btn-sm"
                                                  style={{ padding: "2px 6px" }}
                                                  onClick={() => handleDeleteRecall(item.id, pat.id)}
                                                >
                                                  &times;
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                          {patientRecalls.length === 0 && (
                                            <tr>
                                              <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                                                No recalls scheduled yet.
                                              </td>
                                            </tr>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
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

                    <div className="calendar-scroll-container" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch", paddingBottom: "0.5rem" }}>
                      <div className="calendar-grid-monthly" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.75rem", minWidth: "750px" }}>
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
                  <div className="analytics-grid">

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


            {/* ==================== MY CLINICS PAGE ==================== */}
            {currentUser.role === "doctor" && activePage === "my-clinics" && (
              <section className="page-section animate-fade-in">
                <div className="dash-row">
                  {/* Left Column: Add New Clinic */}
                  <div className="panel" style={{ flex: 1, minWidth: "320px" }}>
                    <div className="panel-header">
                      <h3 className="panel-title">
                        <i className="fa-solid fa-circle-plus" style={{ color: "var(--primary)" }}></i> Add Clinic / Hospital
                      </h3>
                      <span className="badge badge-info">{doctorClinics.length}/10</span>
                    </div>
                    {doctorClinics.length >= 10 ? (
                      <div style={{ textAlign: "center", padding: "2rem", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--glass)", marginTop: "1.25rem" }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: "2rem", color: "var(--success)", marginBottom: "0.5rem" }}></i>
                        <p style={{ color: "var(--text-secondary)" }}>Maximum of 10 secondary clinics reached.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleAddClinic} style={{ marginTop: "1.25rem" }}>
                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>Clinic / Hospital Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Apollo Hospital, City Medical Center"
                            value={newClinicName}
                            onChange={(e) => setNewClinicName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>Full Address</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Block-C, Jubilee Hills, Metro City"
                            value={newClinicAddress}
                            onChange={(e) => setNewClinicAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>Phone (Optional)</label>
                          <input
                            type="tel"
                            placeholder="e.g. 0401234567"
                            value={newClinicPhone}
                            onChange={(e) => setNewClinicPhone(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}>
                          <i className="fa-solid fa-plus"></i> Add Clinic
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Right Column: All Clinics List */}
                  <div className="panel" style={{ flex: 2, minWidth: "450px" }}>
                    <div className="panel-header">
                      <h3 className="panel-title">
                        <i className="fa-solid fa-hospital" style={{ color: "var(--secondary)" }}></i> Your Practice Locations
                      </h3>
                      <span className="badge badge-info">{1 + doctorClinics.length} Total</span>
                    </div>

                    <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {/* Primary Clinic Card */}
                      {(() => {
                        const myDoc = doctors.find(d => d.id === currentUser.id);
                        return (
                          <div
                            className="glass-card"
                            style={{
                              padding: "1.25rem",
                              borderLeft: "4px solid var(--success)",
                              background: "var(--glass)",
                              borderRadius: "10px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "1.1rem"
                                }}>
                                  <i className="fa-solid fa-star"></i>
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{myDoc?.clinicName || "Primary Clinic"}</h4>
                                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                    <i className="fa-solid fa-location-dot"></i> {myDoc?.clinicAddress || "—"}
                                  </div>
                                </div>
                              </div>
                              <span className="badge badge-success" style={{ flexShrink: 0 }}>Primary</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Secondary Clinics */}
                      {doctorClinics.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2.5rem", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--glass)" }}>
                          <i className="fa-solid fa-hospital" style={{ fontSize: "2.5rem", color: "var(--text-secondary)", marginBottom: "1rem", opacity: 0.5 }}></i>
                          <p style={{ color: "var(--text-secondary)" }}>No secondary clinics added yet.</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Use the form on the left to add additional practice locations.</p>
                        </div>
                      ) : (
                        doctorClinics.map((clinic: any) => (
                          <div
                            key={clinic.id}
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
                                fontSize: "1.1rem"
                              }}>
                                <i className="fa-solid fa-hospital"></i>
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{clinic.name}</h4>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                  <i className="fa-solid fa-location-dot"></i> {clinic.address}
                                </div>
                                {clinic.phone && (
                                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                    <i className="fa-solid fa-phone"></i> {clinic.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              className="btn btn-outline btn-danger btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}
                              onClick={() => handleDeleteClinic(clinic.id)}
                            >
                              <i className="fa-regular fa-trash-can"></i> Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Digital Signature Settings Panel */}
                <div className="panel" style={{ marginTop: "1.5rem" }}>
                  <div className="panel-header">
                    <h3 className="panel-title">
                      <i className="fa-solid fa-signature" style={{ color: "var(--primary)" }}></i> Digital Signature Settings
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginTop: "1.25rem" }}>
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                        Your digital signature is printed on all issued Prescription Slips. You can paste an image URL, a base64 encoded string, or use the reset button to generate a clean dynamic signature based on your name.
                      </p>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Signature URL / Base64 Content</label>
                        <textarea
                          rows={4}
                          placeholder="data:image/svg+xml;base64,... or https://..."
                          value={doctorSignatureUrl}
                          onChange={(e) => setDoctorSignatureUrl(e.target.value)}
                          style={{ fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                        <button className="btn btn-primary" onClick={handleSaveSignature}>
                          <i className="fa-solid fa-floppy-disk"></i> Save Signature
                        </button>
                        <button className="btn btn-outline" onClick={handleResetSignature}>
                          Reset Default Signature
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px dashed var(--border)", padding: "1.5rem", borderRadius: "var(--radius-md)", background: "var(--background)", minWidth: "240px", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "1rem" }}>Active Signature Preview</span>
                      {doctorSignatureUrl ? (
                        <div style={{ border: "1px solid var(--border)", padding: "0.5rem", borderRadius: "6px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px", minWidth: "200px" }}>
                          <img 
                            src={doctorSignatureUrl} 
                            alt="Signature Preview" 
                            style={{ maxHeight: "80px", maxWidth: "180px", objectFit: "contain" }} 
                          />
                        </div>
                      ) : (
                        <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.85rem", border: "1px solid var(--border)", borderRadius: "6px", width: "200px", backgroundColor: "white" }}>
                          No signature uploaded
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
                        <div><strong>History:</strong> {activeDetails.chronicConditions || "None"}</div>
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
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("lab-history")}>
                          <i className="fa-solid fa-microscope" style={{ color: "var(--secondary)" }}></i> Lab Test History
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("consultation-history")}>
                          <i className="fa-solid fa-notes-medical" style={{ color: "var(--primary)" }}></i> Consultation History
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => setActivePage("pharmacy")}>
                          <i className="fa-solid fa-pills" style={{ color: "var(--warning)" }}></i> Medicine History
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

            {currentUser.role === "patient" && activePage === "lab-history" && (() => {
              // 1. Get patient appointments
              const patApps = appointments.filter(a => {
                if (a.patientId !== currentUser.id) return false;
                return activePatientId === currentUser.id ? !a.familyMemberId : a.familyMemberId === activePatientId;
              });

              // 2. Filter for those with lab history (has lab order or lab report)
              const apptsWithLab = patApps.filter(app => {
                const hasOrder = labOrders.some(o => o.appointmentId === app.id);
                const hasReport = labReports.some(r => r.appointmentId === app.id);
                return hasOrder || hasReport;
              });

              // 3. Sort latest to oldest
              const sortedAppts = [...apptsWithLab].sort((a, b) => {
                return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
              });

              return (
                <section className="page-section">
                  <div className="panel">
                    <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                      <h3 className="panel-title"><i className="fa-solid fa-microscope"></i> Lab History</h3>
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

                    {sortedAppts.length === 0 ? (
                      <div style={{ padding: "3rem 0", textAlign: "center" }}>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                          No lab test prescriptions or uploaded reports found in your history.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {sortedAppts.map(app => {
                          const doc = doctors.find(d => d.id === app.doctorId);
                          const appOrder = labOrders.find(o => o.appointmentId === app.id);
                          const appReports = labReports.filter(r => r.appointmentId === app.id);
                          const isCompleted = appReports.length > 0;

                          // Style variables based on status
                          const themeColor = isCompleted ? "var(--secondary)" : "var(--warning)";
                          const badgeClass = isCompleted ? "badge-success" : "badge-warning";
                          const badgeText = isCompleted ? "Completed" : "Prescribed & Outstanding";
                          const icon = isCompleted ? <i className="fa-solid fa-flask" style={{ color: "var(--secondary)" }}></i> : <i className="fa-solid fa-circle-exclamation" style={{ color: "var(--warning)" }}></i>;

                          return (
                            <div key={app.id} className="glass-card" style={{ borderTop: `4px solid ${themeColor}`, display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                    {formatDate(app.appointmentDate)} at {app.appointmentTime}
                                  </div>
                                  <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: 700 }}>
                                    Consultation with Dr. {doc?.name || "Attending Specialist"}
                                  </h4>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                    {doc?.clinicName || "Practice Clinic"}
                                  </span>
                                  <div style={{ marginTop: "0.35rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                    Appointment: <code style={{ fontSize: "0.72rem" }}>{app.id}</code>
                                  </div>
                                </div>
                                <span className={`badge ${badgeClass}`} style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                                  {badgeText}
                                </span>
                              </div>

                              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                                    {icon}
                                  </div>
                                  <div>
                                    <h5 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 650 }}>
                                      {appOrder ? "Prescribed Diagnostics" : "Uploaded Lab Reports"}
                                    </h5>
                                    {appOrder && (
                                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                        {JSON.parse(appOrder.testsJson).map((t: any) => t.test_name).join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {appReports.length > 0 && (
                                <div style={{ backgroundColor: "var(--background)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Attached Documents</span>
                                  {appReports.map(rep => (
                                    <div key={rep.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{rep.reportTitle}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{rep.fileName || "report.pdf"}</div>
                                      </div>
                                      <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                          type="button"
                                          className="btn btn-outline btn-sm"
                                          onClick={() => {
                                            setViewPdfReport(rep);
                                            setIsPdfModalOpen(true);
                                          }}
                                        >
                                          <i className="fa-solid fa-file-pdf"></i> View PDF
                                        </button>
                                        {rep.fileUrl && (
                                          <a
                                            href={rep.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={rep.fileName || "report.pdf"}
                                            className="btn btn-secondary btn-sm"
                                          >
                                            <i className="fa-solid fa-download"></i> Download PDF
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                {!isCompleted ? (
                                  <button
                                    type="button"
                                    className="btn"
                                    style={{ width: "100%", justifyContent: "center", backgroundColor: "var(--warning)", color: "white", fontWeight: 600 }}
                                    onClick={() => {
                                      setDirectUploadRole("patient");
                                      setDirectUploadAppId(app.id);
                                      setDirectUploadTitle(appOrder ? JSON.parse(appOrder.testsJson).map((t: any) => t.test_name).join(", ") + " Report" : "Lab Report");
                                      setDirectUploadType("blood-test");
                                      setDirectUploadFindings("");
                                      setDirectUploadNotes("");
                                      setDirectUploadFileName("");
                                      setIsDirectUploadOpen(true);
                                    }}
                                  >
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload Test Report Document
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                      setDirectUploadRole("patient");
                                      setDirectUploadAppId(app.id);
                                      setDirectUploadTitle(appOrder ? JSON.parse(appOrder.testsJson).map((t: any) => t.test_name).join(", ") + " Report" : "Lab Report");
                                      setDirectUploadType("blood-test");
                                      setDirectUploadFindings("");
                                      setDirectUploadNotes("");
                                      setDirectUploadFileName("");
                                      setIsDirectUploadOpen(true);
                                    }}
                                  >
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Upload Additional Report
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

            {currentUser.role === "patient" && activePage === "consultation-history" && (() => {
              // 1. Get completed patient appointments
              const patApps = appointments.filter(a => {
                if (a.patientId !== currentUser.id) return false;
                if (a.status !== "completed") return false;
                return activePatientId === currentUser.id ? !a.familyMemberId : a.familyMemberId === activePatientId;
              });

              // 2. Sort latest to oldest
              const sortedApps = [...patApps].sort((a, b) => {
                return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
              });

              return (
                <section className="page-section">
                  <div className="panel">
                    <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                      <h3 className="panel-title"><i className="fa-solid fa-notes-medical"></i> My Consultation History</h3>
                    </div>

                    {sortedApps.length === 0 ? (
                      <div style={{ padding: "3rem 0", textAlign: "center" }}>
                        <p style={{ color: "var(--text-secondary)" }}>
                          No historical consultations found for this profile.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {sortedApps.map(app => {
                          const doc = doctors.find(d => d.id === app.doctorId);
                          const consult = consultations.find(c => c.appointmentId === app.id);
                          const appReports = labReports.filter(r => r.appointmentId === app.id);

                          return (
                            <div key={app.id} className="glass-card" style={{ borderTop: "4px solid var(--primary)", display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                    {formatDate(app.appointmentDate)} at {app.appointmentTime}
                                  </div>
                                  <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
                                    Dr. {doc?.name || "Specialist"}
                                  </h4>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                    {doc?.speciality || "General Practitioner"} — {doc?.clinicName}
                                  </span>
                                </div>
                                <span className="badge badge-success" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>
                                  Completed
                                </span>
                              </div>

                              <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                                <div><strong>Chief Complaint:</strong> {app.chiefComplaint || "Routine consultation checkup."}</div>

                                {consult && (
                                  <>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", backgroundColor: "var(--background)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", margin: "0.25rem 0" }}>
                                      {consult.bp && <div><strong>BP:</strong> {consult.bp} mmHg</div>}
                                      {consult.pulse && <div><strong>Pulse:</strong> {consult.pulse} bpm</div>}
                                      {consult.temp && <div><strong>Temp:</strong> {consult.temp} °F</div>}
                                      {consult.spo2 && <div><strong>SpO2:</strong> {consult.spo2}%</div>}
                                      {consult.weight && <div><strong>Weight:</strong> {consult.weight} kg</div>}
                                      {consult.height && <div><strong>Height:</strong> {consult.height} cm</div>}
                                    </div>

                                    {consult.subjective && (
                                      <div>
                                        <strong>Patient Symptoms / Notes:</strong>
                                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)" }}>{consult.subjective}</p>
                                      </div>
                                    )}

                                    {consult.assessment && (
                                      <div>
                                        <strong>Diagnosis & Assessment:</strong>
                                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)" }}>{consult.assessment}</p>
                                      </div>
                                    )}

                                    {consult.plan && (
                                      <div>
                                        <strong>Treatment Plan & Advice:</strong>
                                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{consult.plan}</p>
                                      </div>
                                    )}
                                  </>
                                )}

                                {!consult && app.notes && (
                                  <div>
                                    <strong>Doctor Notes:</strong>
                                    <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)" }}>{app.notes}</p>
                                  </div>
                                )}
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Appointment: <code style={{ fontSize: "0.72rem" }}>{app.id}</code></span>
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => loadPrescriptionPrint("", app.id)}
                                  >
                                    <i className="fa-solid fa-file-prescription"></i> Prescription Slip
                                  </button>
                                  {appReports.length > 0 && (
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => openViewReportsModal(app.id)}
                                    >
                                      <i className="fa-solid fa-file-waveform"></i> Diagnostic Reports ({appReports.length})
                                    </button>
                                  )}
                                </div>
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

            {currentUser.role === "patient" && activePage === "pharmacy" && (() => {
              // Get all prescriptions for this patient sorted newest first
              const patRx = prescriptions
                .filter(rx => rx.patientId === currentUser.id)
                .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

              return (
                <section className="page-section">
                  <div className="panel">
                    <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                      <h3 className="panel-title"><i className="fa-solid fa-pills"></i> Medicine History</h3>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{patRx.length} prescription{patRx.length !== 1 ? "s" : ""} found</span>
                    </div>

                    {patRx.length === 0 ? (
                      <div style={{ padding: "3rem 0", textAlign: "center" }}>
                        <i className="fa-solid fa-pills" style={{ fontSize: "2.5rem", color: "var(--border)", marginBottom: "1rem", display: "block" }}></i>
                        <p style={{ color: "var(--text-secondary)" }}>No prescriptions have been issued yet.</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Medicines prescribed during consultations will appear here.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {patRx.map(rx => {
                          const app = appointments.find(a => a.id === rx.appointmentId);
                          const doc = doctors.find(d => d.id === rx.doctorId);
                          let meds: any[] = [];
                          try { meds = JSON.parse(rx.medicinesJson); } catch { meds = []; }

                          return (
                            <div key={rx.id} className="glass-card" style={{ borderTop: "4px solid var(--primary)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                              {/* Card Header */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                    {app ? `${formatDate(app.appointmentDate)} at ${app.appointmentTime}` : formatDate(rx.issuedAt)}
                                  </div>
                                  <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)" }}>
                                    Dr. {doc?.name || "Attending Doctor"}
                                  </h4>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                    {doc?.speciality || "General Practitioner"}{doc?.clinicName ? ` — ${doc.clinicName}` : ""}
                                  </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                                  <span className="badge badge-info" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                                    <i className="fa-solid fa-prescription-bottle-medical"></i> {meds.length} Medicine{meds.length !== 1 ? "s" : ""}
                                  </span>
                                  {rx.validUntil && (
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Valid until {formatDate(rx.validUntil)}</span>
                                  )}
                                </div>
                              </div>

                              {/* Medicines Table */}
                              {meds.length > 0 && (
                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                                  <div className="table-wrapper" style={{ margin: 0 }}>
                                    <table style={{ fontSize: "0.85rem" }}>
                                      <thead>
                                        <tr>
                                          <th style={{ width: "30%" }}>Medicine</th>
                                          <th>Dosage</th>
                                          <th>Frequency</th>
                                          <th>Duration</th>
                                          <th>Instructions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {meds.map((med: any, idx: number) => (
                                          <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{idx + 1}. {med.name}</td>
                                            <td>{med.dosage || "—"}</td>
                                            <td>{med.frequency || "—"}</td>
                                            <td>{med.duration || "—"}</td>
                                            <td style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontStyle: "italic" }}>{med.instructions || "Take with water"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {rx.notes && (
                                <div style={{ background: "var(--background)", borderRadius: 8, padding: "0.75rem 1rem", borderLeft: "3px solid var(--primary)" }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Doctor's Note</span>
                                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-primary)" }}>{rx.notes}</p>
                                </div>
                              )}

                              {/* Footer */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Appointment: <code style={{ fontSize: "0.72rem" }}>{rx.appointmentId}</code></span>
                                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Prescription: <code style={{ fontSize: "0.72rem" }}>{rx.id}</code></span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => loadPrescriptionPrint("", rx.appointmentId)}
                                >
                                  <i className="fa-solid fa-print"></i> Prescription Slip
                                </button>
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




            {/* ==================== LAB SCREEN WORKSPACES ==================== */}
            {currentUser.role === "lab" && activePage === "dashboard" && (
              <section className="page-section">
                <div className="panel" style={{ maxWidth: 650, margin: "0 auto" }}>
                  <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <h3 className="panel-title"><i className="fa-solid fa-cloud-arrow-up"></i> Pathology File Upload Center</h3>
                  </div>
                  <form onSubmit={handleLabDashboardUpload}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Appointment ID</label>
                      <input
                        type="text"
                        placeholder="e.g. APT-20260601-123"
                        value={labDashAppId}
                        onChange={(e) => {
                          setLabDashAppId(e.target.value);
                          // Try to pre-fill report title if appointment exists
                          const app = appointments.find(a => a.id === e.target.value);
                          if (app && !labDashTitle) {
                            setLabDashTitle(`${app.chiefComplaint || "Diagnostic"} Report`);
                          }
                        }}
                        required
                      />
                      <small style={{ display: "block", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Enter the patient's unique Appointment ID to link this diagnostic report.
                      </small>
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Report Title / Test Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lipid Profile, Complete Blood Count"
                        value={labDashTitle}
                        onChange={(e) => setLabDashTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Diagnostic Modality / Type</label>
                      <select
                        value={labDashType}
                        onChange={(e) => setLabDashType(e.target.value)}
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

                    <div className="form-group" style={{ marginBottom: "2rem" }}>
                      <label style={{ fontWeight: 600 }}>Upload Supporting PDF Document</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setLabDashFileName(e.target.files[0].name);
                            setLabDashFile(e.target.files[0]);
                          }
                        }}
                        required
                      />
                      {labDashFileName && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
                          <i className="fa-regular fa-file-pdf"></i> Selected: {labDashFileName}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      <i className="fa-solid fa-cloud-arrow-up"></i> Upload Document & Notify Doctor
                    </button>
                  </form>
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
                <div className="form-group" style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px", background: "var(--background)", marginBottom: "1.25rem" }}>
                  <label style={{ fontWeight: 650, fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>
                    Patient Selection
                  </label>

                  {bookingPatientId ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--surface)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {(() => {
                            if (bookingFamilyMemberId) {
                              const p = patients.find(pat => pat.id === bookingPatientId);
                              const fm = p?.familyMembers?.find(f => f.id === bookingFamilyMemberId);
                              return fm ? `${fm.name} (${fm.relation} of ${p?.name})` : "Family Member";
                            } else {
                              const p = patients.find(pat => pat.id === bookingPatientId);
                              return p ? p.name : bookingPatientId;
                            }
                          })()}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          ID: {bookingFamilyMemberId || bookingPatientId}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setBookingPatientId("");
                          setBookingFamilyMemberId("");
                          setBookingSearchVal("");
                          setBookingSearchDone(false);
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          placeholder="Enter Patient ID or Phone number..."
                          value={bookingSearchVal}
                          onChange={(e) => setBookingSearchVal(e.target.value)}
                          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            if (bookingSearchVal.trim()) {
                              setBookingSearchDone(true);
                            } else {
                              alert("Please enter a phone number or Patient ID to search.");
                            }
                          }}
                        >
                          Search
                        </button>
                      </div>

                      {bookingSearchDone && (() => {
                        const q = bookingSearchVal.trim().toLowerCase();
                        const matches: any[] = [];

                        patients.forEach(p => {
                          if (p.id.toLowerCase() === q || p.primaryPhone === q) {
                            matches.push({
                              id: p.id,
                              name: p.name,
                              phone: p.primaryPhone,
                              isFamilyMember: false,
                              rawPatient: p
                            });
                          }
                          p.familyMembers?.forEach(fm => {
                            if (fm.id.toLowerCase() === q || p.primaryPhone === q) {
                              matches.push({
                                id: fm.id,
                                name: fm.name,
                                phone: p.primaryPhone,
                                isFamilyMember: true,
                                relation: fm.relation,
                                parentName: p.name,
                                parentId: p.id,
                                rawPatient: p
                              });
                            }
                          });
                        });

                        return (
                          <div style={{ marginTop: "1rem" }}>
                            {matches.length === 0 ? (
                              <div style={{ padding: "0.75rem", background: "var(--surface)", border: "1px dashed var(--danger)", borderRadius: "6px", textAlign: "center" }}>
                                <div style={{ fontSize: "0.85rem", color: "var(--danger)", fontWeight: 600, marginBottom: "0.5rem" }}>No patient found.</div>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ display: "inline-flex", gap: "0.25rem", marginInline: "auto" }}
                                  onClick={() => {
                                    setIsBookAppOpen(false);
                                    setIsAddPatientOpen(true);
                                  }}
                                >
                                  <i className="fa-solid fa-user-plus"></i> Register as a New Patient
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.5rem", background: "var(--surface)" }}>
                                {matches.map(m => (
                                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0.5rem", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.85rem", textAlign: "left" }}>
                                      <div style={{ fontWeight: 650 }}>{m.name} {m.isFamilyMember && `(${m.relation} of ${m.parentName})`}</div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                        ID: {m.id} | Phone: {m.phone}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                                      onClick={() => {
                                        if (m.isFamilyMember) {
                                          setBookingPatientId(m.parentId);
                                          setBookingFamilyMemberId(m.id);
                                        } else {
                                          setBookingPatientId(m.id);
                                          setBookingFamilyMemberId("");
                                        }
                                      }}
                                    >
                                      Select
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {!bookingSearchDone && (
                        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ width: "100%", justifyContent: "center" }}
                            onClick={() => {
                              setIsBookAppOpen(false);
                              setIsAddPatientOpen(true);
                            }}
                          >
                            <i className="fa-solid fa-user-plus"></i> Register as a New Patient
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
              {(() => {
                const soapApp = appointments.find(a => a.id === soapAppId);
                const soapPatient = soapApp ? patients.find(p => p.id === soapApp.patientId) : null;

                const alerts: { type: "danger" | "warning" | "success"; text: string; title: string; icon: string }[] = [];
                
                // Vitals alerts
                let isBpElevated = false;
                if (soapBp) {
                  const parts = soapBp.split("/");
                  if (parts.length === 2) {
                    const sys = parseInt(parts[0].trim(), 10);
                    const dia = parseInt(parts[1].trim(), 10);
                    if (!isNaN(sys) && sys > 130) isBpElevated = true;
                    if (!isNaN(dia) && dia > 80) isBpElevated = true;
                  }
                }
                if (isBpElevated) {
                  alerts.push({
                    type: "danger",
                    title: "Hypertension Alert",
                    icon: "fa-solid fa-heart-crack",
                    text: `Recorded Blood Pressure (${soapBp} mmHg) exceeds 130/80 mmHg. Exercise caution when administering local anesthetics or vasoactive agents.`
                  });
                }

                if (soapSpo2) {
                  const spo2Num = parseInt(soapSpo2.trim(), 10);
                  if (!isNaN(spo2Num) && spo2Num < 95) {
                    alerts.push({
                      type: "danger",
                      title: "Hypoxia Warning",
                      icon: "fa-solid fa-lungs",
                      text: `Patient's Oxygen Saturation (${soapSpo2}%) is low. Ensure proper oxygenation before starting procedures.`
                    });
                  }
                }

                // Allergy checks
                if (soapPatient && soapPatient.allergies) {
                  const allergiesLower = soapPatient.allergies.toLowerCase();
                  if (allergiesLower.includes("penicillin")) {
                    const conflicts = soapPrescribedMeds.filter(m => {
                      const name = m.name.toLowerCase();
                      return name.includes("amoxicillin") || name.includes("penicillin") || name.includes("ampicillin") || name.includes("augmentin");
                    });
                    if (conflicts.length > 0) {
                      alerts.push({
                        type: "danger",
                        title: "Allergy Conflict",
                        icon: "fa-solid fa-triangle-exclamation",
                        text: `Severe Drug-Allergy Conflict: Patient is allergic to Penicillin. Prescribing ${conflicts.map(c => c.name).join(", ")} poses a high risk of anaphylaxis. Consider alternatives like Clindamycin.`
                      });
                    }
                  }
                }

                // Caries suggestions
                if (soapPatient) {
                  const patientOdontogram = odontogramData[soapPatient.id] || {};
                  const decayedTeeth: number[] = [];
                  Object.entries(patientOdontogram).forEach(([toothNum, status]) => {
                    if (status === "decayed") {
                      decayedTeeth.push(Number(toothNum));
                    }
                  });
                  if (decayedTeeth.length > 0) {
                    alerts.push({
                      type: "warning",
                      title: "Caries Suggestion",
                      icon: "fa-solid fa-tooth",
                      text: `Active decay logged on Tooth #${decayedTeeth.join(", #")}. Suggest Root Canal Treatment or Composite Filling, and updating treatment plan.`
                    });
                  }
                }

                if (alerts.length === 0) {
                  alerts.push({
                    type: "success",
                    title: "Clinical Checks Passed",
                    icon: "fa-solid fa-shield-halved",
                    text: "No vitals anomalies or drug-allergy interactions detected for this consultation."
                  });
                }

                return (
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                    {/* Left Column: Input Form (Takes up remaining space) */}
                    <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      
                      {/* Clinic / Hospital Selector */}
                      <div className="panel" style={{ padding: "1rem", backgroundColor: "var(--background)", borderColor: "var(--border)", marginBottom: 0 }}>
                        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}><i className="fa-solid fa-hospital"></i> Consulting From</h4>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <select
                            value={soapClinicId}
                            onChange={(e) => setSoapClinicId(e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: "0.9rem" }}
                          >
                            <option value="">{(() => { const d = doctors.find(doc => doc.id === currentUser?.id); return d ? `${d.clinicName} (Primary)` : "Primary Clinic"; })()}</option>
                            {doctorClinics.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Patient Vitals */}
                      <div className="panel" style={{ padding: "1rem", backgroundColor: "var(--background)", borderColor: "var(--border)", marginBottom: 0 }}>
                        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}><i className="fa-solid fa-heart-pulse"></i> Patient Vital Signs</h4>
                        <div className="soap-vitals-grid">
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>BP (mmHg)</label><input type="text" value={soapBp} onChange={(e) => setSoapBp(e.target.value)} /></div>
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Pulse (bpm)</label><input type="text" value={soapPulse} onChange={(e) => setSoapPulse(e.target.value)} /></div>
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Temp (°F)</label><input type="text" value={soapTemp} onChange={(e) => setSoapTemp(e.target.value)} /></div>
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>SpO2 (%)</label><input type="text" value={soapSpo2} onChange={(e) => setSoapSpo2(e.target.value)} /></div>
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Weight (kg)</label><input type="text" value={soapWeight} onChange={(e) => setSoapWeight(e.target.value)} /></div>
                          <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: "0.75rem" }}>Height (cm)</label><input type="text" value={soapHeight} onChange={(e) => setSoapHeight(e.target.value)} /></div>
                        </div>
                      </div>

                      {/* SOAP Text areas */}
                      <div className="soap-box" style={{ marginTop: 0 }}>
                        <div className="consultation-form-section">
                          <h4 style={{ fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.5rem" }}><i className="fa-solid fa-user-clock"></i> Subjective (Patient complaints)</h4>
                          <textarea rows={3} value={soapSubjective} onChange={(e) => setSoapSubjective(e.target.value)}></textarea>
                        </div>
                        <div className="consultation-form-section">
                          <h4 style={{ fontSize: "0.85rem", color: "var(--secondary)", marginBottom: "0.5rem" }}><i className="fa-solid fa-magnifying-glass-chart"></i> Objective (Observations)</h4>
                          <textarea rows={3} value={soapObjective} onChange={(e) => setSoapObjective(e.target.value)}></textarea>
                        </div>
                      </div>

                      <div className="soap-box" style={{ marginTop: 0 }}>
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
                      <div className="panel" style={{ padding: "1.25rem", marginTop: 0, border: "1px dashed var(--primary)", marginBottom: 0 }}>
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
                          <div className="soap-referrals-grid">
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

                            <div className="form-group grid-span-2" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Reason for Referral</label>
                              <input
                                type="text"
                                placeholder="e.g., Clinical evaluation for cardiac murmurs"
                                value={soapReferReason}
                                onChange={(e) => setSoapReferReason(e.target.value)}
                                required={soapReferEnabled}
                              />
                            </div>

                            <div className="form-group grid-span-2" style={{ marginBottom: 0 }}>
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
                      <div className="soap-split" style={{ marginTop: 0 }}>

                        {/* Prescription list creator */}
                        <div className="panel" style={{ padding: "1rem", marginBottom: 0 }}>
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
                        <div className="panel" style={{ padding: "1rem", marginBottom: 0 }}>
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

                    {/* Right Column: AI Clinical Copilot */}
                    <div style={{ flex: "0 0 300px", minWidth: "260px", display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "10px" }}>
                      <div className="ai-copilot-container">
                        <h4 className="ai-copilot-title">
                          <i className="fa-brain fa-solid"></i> AI Clinical Copilot
                        </h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                          Scanning patient chart, vitals, allergies, and prescriptions in real-time.
                        </p>
                        <div className="ai-copilot-alert-box">
                          {alerts.map((alert, idx) => (
                            <div key={idx} className={`ai-alert-bubble ${alert.type}`}>
                              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <i className={alert.icon}></i> {alert.title}
                              </div>
                              <div>{alert.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                    <span>{previewRx.clinic?.name || previewRx.doctor?.clinicName || "Clinic Center"}</span>
                  </div>
                  <div className="pres-doc-info">
                    <h2>{previewRx.doctor?.name}</h2>
                    <p><strong>{previewRx.doctor?.qualifications}</strong></p>
                    <p>Reg No: {previewRx.doctor?.registrationNo}</p>
                    <p style={{ fontSize: "0.75rem" }}>{previewRx.clinic?.address || previewRx.doctor?.clinicAddress}</p>
                    {previewRx.clinic?.phone && (
                      <p style={{ fontSize: "0.75rem" }}><i className="fa-solid fa-phone"></i> {previewRx.clinic.phone}</p>
                    )}
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
                    <strong>Appointment ID</strong>
                    <code>{previewRx.rx.appointmentId}</code>
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
                  <div className="table-wrapper">
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
                    <p>HealOne 360 Digital Signature Slip</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ID Hash: SHA-{previewRx.rx.id.slice(-6)}</p>
                  </div>
                  <div className="pres-signature-line">
                    {previewRx.doctor?.signatureUrl ? (
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
                        <img 
                          src={previewRx.doctor.signatureUrl} 
                          alt="Doctor Signature" 
                          style={{ maxHeight: "55px", maxWidth: "160px", objectFit: "contain" }} 
                        />
                      </div>
                    ) : (
                      <div style={{ height: "60px" }}></div>
                    )}
                    <div className="line" style={{ margin: "0 auto 0.25rem auto" }}></div>
                    <p>{previewRx.doctor?.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Attending Doctor</p>
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
                <label>Upload Clinical/Imaging PDF Report</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setDirectUploadFileName(e.target.files[0].name);
                      setDirectUploadFile(e.target.files[0]);
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
                    <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      {rep.fileUrl && (
                        <a
                          href={rep.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={rep.fileName || "report.pdf"}
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="fa-solid fa-download"></i> Download Attached PDF
                        </a>
                      )}
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


      {/* ==================== SIMULATED CLINICAL PDF REPORT VIEWER DIALOG ==================== */}
      <div id="clinical-report-preview-modal" className={`modal-backdrop ${isPdfModalOpen ? "active" : ""}`}>
        <div className="modal-container" style={{ maxWidth: 900, backgroundColor: "var(--surface)" }}>
          <div className="modal-header">
            <h3><i className="fa-regular fa-file-pdf" style={{ color: "var(--danger)" }}></i> {viewPdfReport?.reportTitle || "Clinical Report Viewer"}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {viewPdfReport && reportBlobUrls[viewPdfReport.id] && (
                <a
                  href={reportBlobUrls[viewPdfReport.id]}
                  download={viewPdfReport.fileName || "report.pdf"}
                  className="btn btn-primary btn-sm"
                  style={{ color: "white" }}
                >
                  <i className="fa-solid fa-download"></i> Download PDF
                </a>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Print</button>
              <button className="modal-close" style={{ display: "inline-flex", marginLeft: "0.5rem" }} onClick={() => setIsPdfModalOpen(false)}>&times;</button>
            </div>
          </div>
          <div className="modal-body" style={{ padding: 0 }}>
            {viewPdfReport && (
              <>
                {/* If we have a blob URL from this session, render the real PDF */}
                {reportBlobUrls[viewPdfReport.id] ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <iframe
                      src={reportBlobUrls[viewPdfReport.id]}
                      style={{ width: "100%", height: "70vh", border: "none", borderRadius: "0 0 12px 12px", background: "#f4f4f4" }}
                      title={viewPdfReport.reportTitle || "Lab Report"}
                    />
                    <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", gap: "2rem", fontSize: "0.8rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                      <span><strong>Report ID:</strong> <code>{viewPdfReport.id}</code></span>
                      <span><strong>Appointment:</strong> <code>{viewPdfReport.appointmentId || "Direct Upload"}</code></span>
                      <span><strong>Uploaded:</strong> {formatDate(viewPdfReport.uploadedAt)}</span>
                      <span><strong>File:</strong> {viewPdfReport.fileName || "report.pdf"}</span>
                    </div>
                  </div>
                ) : (
                  /* Fallback: show structured metadata when PDF not in current session */
                  <div className="clinical-report-pdf" id="clinical-report-pdf-print" style={{ padding: "1.5rem" }}>
                    <div style={{ background: "var(--background)", border: "1px dashed var(--warning)", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--warning)", marginTop: 2 }}></i>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--warning)" }}>PDF Not Available in Current Session</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>The original file was uploaded in a previous session. Report metadata is shown below. To view the PDF, please re-upload the file.</div>
                      </div>
                    </div>
                    <div className="clinical-report-header">
                      <div className="report-clinic-logo">
                        <i className="fa-solid fa-house-chimney-medical"></i>
                        <span>
                          {viewPdfReport.uploadedBy === "LAB-00001"
                            ? "Apex Diagnostics Center"
                            : (viewPdfReport.uploadedBy === "LAB-00002"
                              ? "Metro Pathology Labs"
                              : `Uploaded by: ${viewPdfReport.uploadedBy}`)}
                        </span>
                      </div>
                      <div className="report-doc-info">
                        <h2>Diagnostic Lab Report</h2>
                        <p>File Ref: {viewPdfReport.fileName || "report.pdf"}</p>
                      </div>
                    </div>
                    <div className="report-meta-grid">
                      <div className="report-meta-item"><strong>Patient ID</strong><code>{viewPdfReport.patientId}</code></div>
                      <div className="report-meta-item"><strong>Report ID</strong><code>{viewPdfReport.id}</code></div>
                      <div className="report-meta-item"><strong>Appointment</strong><code>{viewPdfReport.appointmentId || "Direct"}</code></div>
                      <div className="report-meta-item"><strong>Uploaded At</strong><span>{formatDate(viewPdfReport.uploadedAt)}</span></div>
                    </div>
                    <div className="report-section">
                      <h3>Report Title</h3>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{viewPdfReport.reportTitle}</div>
                    </div>
                    {viewPdfReport.findings && (
                      <div className="report-section">
                        <h3>Diagnostic Findings</h3>
                        <div className="table-wrapper">
                          <table className="report-table">
                            <thead><tr><th>Parameter</th><th>Value / Status</th></tr></thead>
                            <tbody>
                              {viewPdfReport.findings.split("\n").map((line: string, idx: number) => {
                                const parts = line.split(":");
                                return parts.length >= 2
                                  ? <tr key={idx}><td style={{ fontWeight: 600 }}>{parts[0].trim()}</td><td>{parts.slice(1).join(":").trim()}</td></tr>
                                  : <tr key={idx}><td colSpan={2} style={{ whiteSpace: "pre-wrap" }}>{line}</td></tr>;
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {viewPdfReport.notes && (
                      <div className="report-section">
                        <h3>Notes</h3>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.6" }}>{viewPdfReport.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                      marginBottom: "0.5rem",
                      flexWrap: "wrap"
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
    setBookingFamilyMemberId("");
    setBookingDate(new Date().toISOString().split("T")[0]);
    setBookingIsBlock(false);
    setBookingTime("");
    setBookingComplaint("");
    setBookingSearchVal("");
    setBookingSearchDone(false);
    loadBookingSlots();
    setIsBookAppOpen(true);
  }

  function generateId(prefix: string) {
    const today = new Date();
    const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
    return `${prefix}-${dateStr}-${String(Math.floor(Math.random() * 900) + 100)}`;
  }
}
