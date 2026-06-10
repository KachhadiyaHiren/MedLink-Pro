import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.medicineOrder.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.labOrder.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctorClinic.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.medicinesCatalog.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Medicines Catalog...');
  const meds = [
    { id: 'MED-001', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Cardiology', price: 120, unit: 'Strip of 10 Tablets', requiresPrescription: true },
    { id: 'MED-002', name: 'Paracetamol 650mg', genericName: 'Paracetamol', category: 'Analgesic', price: 30, unit: 'Strip of 15 Tablets', requiresPrescription: false },
    { id: 'MED-003', name: 'Metformin 500mg SR', genericName: 'Metformin', category: 'Antidiabetic', price: 55, unit: 'Strip of 10 Tablets', requiresPrescription: true },
    { id: 'MED-004', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', price: 110, unit: 'Strip of 10 Capsules', requiresPrescription: true },
    { id: 'MED-005', name: 'Montelukast 10mg + Levocetirizine 5mg', genericName: 'Montelukast & Levocetirizine', category: 'Antiallergic / Asthma', price: 145, unit: 'Strip of 10 Tablets', requiresPrescription: true },
    { id: 'MED-006', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', price: 40, unit: 'Strip of 15 Tablets', requiresPrescription: true },
    { id: 'MED-007', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', price: 25, unit: 'Strip of 10 Tablets', requiresPrescription: false },
    { id: 'MED-008', name: 'Pantoprazole 40mg EC', genericName: 'Pantoprazole', category: 'Antacid', price: 85, unit: 'Strip of 10 Tablets', requiresPrescription: false }
  ];
  for (const m of meds) {
    await prisma.medicinesCatalog.create({ data: m });
  }

  console.log('Seeding Users and attending Profiles...');
  
  // Seed Doctors
  const docs = [
    {
      id: 'DOC-00001',
      phone: '9876500001',
      fullName: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@healone360.com',
      role: 'doctor',
      profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      doctorDetails: {
        id: 'DOC-00001',
        name: 'Dr. Sarah Jenkins',
        speciality: 'Cardiologist',
        qualifications: 'MBBS, MD, DM (Cardiology)',
        registrationNo: 'MC-88291',
        clinicName: 'Heart & Vascular Wellness Center',
        clinicAddress: 'Suite 402, Medical Enclave, Central Ave, Metro City',
        consultationFee: 800.0,
        bio: 'Dr. Jenkins is an expert in preventive cardiology, heart failure management, and non-invasive cardiac imaging. She has over 15 years of experience in leading hospitals.',
        languages: 'English, Hindi',
        availableDays: 'Monday, Tuesday, Wednesday, Thursday, Friday',
        profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        reviewsCount: 142,
        isApproved: true,
        signatureUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxwYXRoIGQ9Ik0gMTAgNDAgUSA1MCAxMCAxMDAgNTAgVCAxOTAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBlYTVlOSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSIyNSIgeT0iNDUiIGZvbnQtZmFtaWx5PSInQnJ1c2ggU2NyaXB0IE1UJywgY3Vyc2l2ZSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iIzFlM2E4YSI+RHIuIFMuIEplbmtpbnM8L3RleHQ+PC9zdmc+'
      }
    },
    {
      id: 'DOC-00002',
      phone: '9876500002',
      fullName: 'Dr. Amit Sharma',
      email: 'amit.sharma@healone360.com',
      role: 'doctor',
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      doctorDetails: {
        id: 'DOC-00002',
        name: 'Dr. Amit Sharma',
        speciality: 'Pediatrician',
        qualifications: 'MBBS, MD (Pediatrics), DCH',
        registrationNo: 'MC-77382',
        clinicName: 'Little Angels Kids Clinic',
        clinicAddress: 'Shop 12, Ground Floor, Sunrise Plaza, Sector 15, Metro City',
        consultationFee: 500.0,
        bio: 'Dr. Sharma is dedicated to pediatric healthcare, offering vaccination programs, growth development monitoring, and childhood disease management.',
        languages: 'English, Hindi, Marathi',
        availableDays: 'Monday, Wednesday, Friday, Saturday',
        profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        rating: 4.9,
        reviewsCount: 218,
        isApproved: true,
        signatureUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxwYXRoIGQ9Ik0gMTUgMzUgUSA2MCA1MCAxMTAgMjAgVCAxODUgNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSIzMCIgeT0iNDgiIGZvbnQtZmFtaWx5PSInQnJ1c2ggU2NyaXB0IE1UJywgY3Vyc2l2ZSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iIzA2NWY0NiI+RHIuIEEuIFNoYXJtYTwvdGV4dD48L3N2Zz4='
      }
    },
    {
      id: 'DOC-00003',
      phone: '9876500003',
      fullName: 'Dr. Eleanor Vance',
      email: 'eleanor.vance@healone360.com',
      role: 'doctor',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
      doctorDetails: {
        id: 'DOC-00003',
        name: 'Dr. Eleanor Vance',
        speciality: 'Neurologist',
        qualifications: 'MBBS, MD (Medicine), DM (Neurology)',
        registrationNo: 'MC-90210',
        clinicName: 'Vance Brain & Spine Institute',
        clinicAddress: 'A-56, Neuro-Spine Wing, Parkway Hospital, Metro City',
        consultationFee: 1200.0,
        bio: 'Dr. Vance specializes in stroke management, epilepsy treatments, cognitive disorders, and chronic migraines.',
        languages: 'English',
        availableDays: 'Tuesday, Thursday, Saturday',
        profilePhoto: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
        rating: 4.7,
        reviewsCount: 85,
        isApproved: true,
        signatureUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxwYXRoIGQ9Ik0gMjAgNDUgUSA3MCAxNSAxMjAgNDAgVCAxODAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhiNWNmNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSIyNSIgeT0iNTIiIGZvbnQtZmFtaWx5PSInQnJ1c2ggU2NyaXB0IE1UJywgY3Vyc2l2ZSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iIzViMjFiNiI+RHIuIEUuIFZhbmNlPC90ZXh0Pjwvc3ZnPg=='
      }
    },
    {
      id: 'DOC-00004',
      phone: '9876500004',
      fullName: 'Dr. Rajesh Patil',
      email: 'rajesh.patil@healone360.com',
      role: 'doctor',
      profilePhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
      doctorDetails: {
        id: 'DOC-00004',
        name: 'Dr. Rajesh Patil',
        speciality: 'Dermatologist',
        qualifications: 'MBBS, DDVL (Dermatology)',
        registrationNo: 'MC-54321',
        clinicName: 'Skin & Hair Clinic',
        clinicAddress: '2nd Floor, Apex Heights, Station Road, Metro City',
        consultationFee: 600.0,
        bio: 'Dr. Patil specializes in clinical dermatology, acne treatments, and hair loss therapies.',
        languages: 'English, Marathi',
        availableDays: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
        profilePhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        rating: 4.6,
        reviewsCount: 98,
        isApproved: false,
        signatureUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMDAgODAiPjxwYXRoIGQ9Ik0gMTIgMzAgUSA1NSA2MCAxMTUgMzUgVCAxOTAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSIzMiIgeT0iNDIiIGZvbnQtZmFtaWx5PSInQnJ1c2ggU2NyaXB0IE1UJywgY3Vyc2l2ZSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iIzc4MzUwZiI+RHIuIFIuIFBhdGlsPC90ZXh0Pjwvc3ZnPg=='
      }
    }
  ];

  for (const d of docs) {
    await prisma.user.create({
      data: {
        id: d.id,
        phone: d.phone,
        fullName: d.fullName,
        email: d.email,
        role: d.role,
        profilePhoto: d.profilePhoto
      }
    });

    await prisma.doctor.create({
      data: d.doctorDetails
    });
  }

  // Seed Secondary Clinics for Doctors
  console.log('Seeding Doctor Secondary Clinics...');
  const doctorClinics = [
    {
      id: 'DCLNC-00001-001',
      doctorId: 'DOC-00001',
      name: 'Apollo Heart Institute',
      address: 'Block-C, Apollo Hospitals, Jubilee Hills, Metro City',
      phone: '0401234567',
      isPrimary: false,
      sortOrder: 1
    },
    {
      id: 'DCLNC-00001-002',
      doctorId: 'DOC-00001',
      name: 'Metro General Hospital — Cardiology Wing',
      address: '3rd Floor, Metro General Hospital, MG Road, Metro City',
      phone: '0409876543',
      isPrimary: false,
      sortOrder: 2
    },
    {
      id: 'DCLNC-00002-001',
      doctorId: 'DOC-00002',
      name: 'Rainbow Children\'s Hospital',
      address: 'Wing-A, Rainbow Hospital, Banjara Hills, Metro City',
      phone: '0405551234',
      isPrimary: false,
      sortOrder: 1
    }
  ];

  for (const dc of doctorClinics) {
    await prisma.doctorClinic.create({ data: dc });
  }

  // Seed Labs
  const labs = [
    {
      id: 'LAB-00001',
      name: 'Apex Diagnostics Center',
      labCode: 'LAB-APEX-01',
      address: '15-B, Ground Floor, Health Plaza, Metro City',
      phone: '8888888888',
      email: 'reports@apexdiag.com',
      accreditation: 'NABL Accredited & ISO 9001:2015 Certified',
      isApproved: true,
      testsCatalog: JSON.stringify([
        { test_code: 'LIPID', name: 'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)', price: 600, duration: '12 hours' },
        { test_code: 'CBC', name: 'Complete Blood Count (CBC) with ESR', price: 300, duration: '6 hours' },
        { test_code: 'TSH', name: 'Thyroid Stimulating Hormone (TSH)', price: 450, duration: '8 hours' }
      ])
    },
    {
      id: 'LAB-00002',
      name: 'Metro Pathology Labs',
      labCode: 'LAB-METRO-02',
      address: 'Building 89, Metro Circle, Station Road, Metro City',
      phone: '7777777777',
      email: 'contact@metropath.com',
      accreditation: 'CAP Accredited & NABL Certified',
      isApproved: true,
      testsCatalog: JSON.stringify([
        { test_code: 'LIPID', name: 'Lipid Profile Test', price: 550, duration: '10 hours' },
        { test_code: 'CBC', name: 'Complete Blood Count', price: 280, duration: '4 hours' }
      ])
    }
  ];

  for (const l of labs) {
    await prisma.user.create({
      data: {
        id: l.id,
        phone: l.phone,
        fullName: l.name,
        email: l.email,
        role: 'lab',
        profilePhoto: 'https://images.unsplash.com/photo-1579154769741-6296d1a3b188?auto=format&fit=crop&q=80&w=200'
      }
    });
    // For simplicity, lab configurations are stored directly in static arrays in our routes or we can fetch them.
    // However, since we defined schema, wait, we don't have a direct Lab table in schema.prisma, wait, did we define a Lab table in schema.prisma?
    // Let's check: Ah! In schema.prisma we did NOT define a separate Lab table, but we can easily verify user role === 'lab' and store lab details inside user or database. Wait! Did we define a Lab model? Let's check:
    // User, Doctor, Patient, FamilyMember, Appointment, Consultation, Prescription, LabOrder, LabReport, MedicineOrder, MedicinesCatalog.
    // Yes! No Lab model is in schema.prisma (which is correct to keep it simple, since lab users are covered in User). Oh, wait! The LabOrder references labId, which matches User.id of the lab. That is extremely clean!
  }

  // Seed Admin
  await prisma.user.create({
    data: {
      id: 'ADM-001',
      phone: '9900001122',
      fullName: 'System Administrator',
      email: 'admin@healone360.com',
      role: 'admin',
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'
    }
  });

  // Seed Patients
  const patients = [
    {
      id: 'PAT-00001',
      name: 'John Doe',
      primaryPhone: '9876543210',
      email: 'john.doe@gmail.com',
      dateOfBirth: '1980-04-15',
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Flat 101, Oakwood Apartments, Sector 4, Metro City',
      emergencyContact: 'Mary Doe (+91 9876543211)',
      allergies: 'Penicillin, Peanuts',
      chronicConditions: 'Hypertension'
    },
    {
      id: 'PAT-00002',
      name: 'Jane Smith',
      primaryPhone: '9123456789',
      email: 'jane.smith@yahoo.com',
      dateOfBirth: '1994-08-22',
      gender: 'Female',
      bloodGroup: 'A+',
      address: 'House 45, Green Meadows Colony, Ring Road, Metro City',
      emergencyContact: 'Robert Smith (+91 9123456780)',
      allergies: 'None',
      chronicConditions: 'Asthma'
    }
  ];

  for (const p of patients) {
    await prisma.user.create({
      data: {
        id: p.id,
        phone: p.primaryPhone,
        fullName: p.name,
        email: p.email,
        role: 'patient',
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      }
    });

    const createdPat = await prisma.patient.create({
      data: p
    });

    if (p.id === 'PAT-00002') {
      // Add family members
      await prisma.familyMember.create({
        data: {
          id: 'FM-00001',
          name: 'Aarav Smith',
          relation: 'Son',
          dateOfBirth: '2018-05-10',
          gender: 'Male',
          bloodGroup: 'A+',
          allergies: 'Dust mites',
          chronicConditions: 'Asthma',
          patientId: createdPat.id
        }
      });
      await prisma.familyMember.create({
        data: {
          id: 'FM-00002',
          name: 'Robert Smith',
          relation: 'Spouse',
          dateOfBirth: '1990-11-05',
          gender: 'Male',
          bloodGroup: 'B+',
          allergies: 'Shellfish',
          chronicConditions: 'None',
          patientId: createdPat.id
        }
      });
    }
  }

  console.log('Seeding historical Appointments...');
  
  // Historical Appointment 1 (Completed)
  await prisma.appointment.create({
    data: {
      id: 'APT-20260601-001',
      doctorId: 'DOC-00001',
      patientId: 'PAT-00001',
      familyMemberId: null,
      appointmentDate: '2026-06-01',
      appointmentTime: '10:30 AM',
      status: 'completed',
      visitType: 'first-visit',
      chiefComplaint: 'Mild chest tightness and high blood pressure reading at home.',
      notes: 'Patient advised blood tests and diet control. Prescribed daily antihypertensives.'
    }
  });

  await prisma.consultation.create({
    data: {
      id: 'CNS-20260601-001',
      appointmentId: 'APT-20260601-001',
      subjective: 'Patient reports intermittent tightness in left side of chest after meals. No pain radiating to arm. Mild stress at work.',
      objective: 'BP: 152/94 mmHg, Pulse: 78 bpm, SpO2: 98% on room air. Lungs clear, heart sounds normal.',
      assessment: 'Stage 2 Hypertension. Rule out cardiac angina. Need Lipid Profile.',
      plan: '1. Start Amlodipine 5mg OD for BP.\n2. Complete fasting Lipid Profile test.\n3. Return for review in 2 days.',
      diagnosisCodes: 'I10 (Essential Hypertension)',
      bp: '152/94',
      pulse: '78',
      temp: '98.4',
      spo2: '98',
      weight: '82',
      height: '176',
      followUpDate: '2026-06-03'
    }
  });

  await prisma.prescription.create({
    data: {
      id: 'RX-20260601-001',
      consultationId: 'CNS-20260601-001',
      appointmentId: 'APT-20260601-001',
      doctorId: 'DOC-00001',
      patientId: 'PAT-00001',
      validUntil: '2026-07-01',
      notes: 'Avoid spicy food and reduce sodium intake. Walk 30 mins daily.',
      medicinesJson: JSON.stringify([
        {
          name: 'Amlodipine 5mg',
          dosage: '5mg',
          frequency: 'Once daily (morning)',
          duration: '15 days',
          instructions: 'Take before breakfast with water',
          quantity: 15
        }
      ])
    }
  });

  await prisma.labOrder.create({
    data: {
      id: 'LO-20260601-001',
      appointmentId: 'APT-20260601-001',
      doctorId: 'DOC-00001',
      patientId: 'PAT-00001',
      labId: 'LAB-00001', // Assigned to Apex
      testsJson: JSON.stringify([
        { test_code: 'LIPID', test_name: 'Lipid Profile', urgency: 'routine' }
      ]),
      status: 'completed',
      notes: 'Fasting required (12 hours).'
    }
  });

  await prisma.labReport.create({
    data: {
      id: 'RPT-20260601-001',
      labOrderId: 'LO-20260601-001',
      appointmentId: 'APT-20260601-001',
      patientId: 'PAT-00001',
      uploadedBy: 'LAB-00001',
      reportTitle: 'Lipid Profile Report',
      reportType: 'blood-test',
      findings: 'Total Cholesterol: 242 mg/dL (High)\nTriglycerides: 185 mg/dL (High)\nHDL Cholesterol: 41 mg/dL (Low-normal)\nLDL Cholesterol: 164 mg/dL (High)',
      notes: 'Specimen: Serum. Fasting duration: 12.5 hours. Results correlate with hyperlipidemia.'
    }
  });

  await prisma.medicineOrder.create({
    data: {
      id: 'MO-20260601-001',
      patientId: 'PAT-00001',
      prescriptionId: 'RX-20260601-001',
      itemsJson: JSON.stringify([
        { medicine_id: 'MED-006', name: 'Amlodipine 5mg', qty: 1, price: 40.0 }
      ]),
      totalAmount: 40.0,
      status: 'delivered',
      deliveryAddress: 'Flat 101, Oakwood Apartments, Sector 4, Metro City'
    }
  });

  // Historical Appointment 2 (Completed - Aarav Smith)
  await prisma.appointment.create({
    data: {
      id: 'APT-20260602-001',
      doctorId: 'DOC-00002',
      patientId: 'PAT-00002',
      familyMemberId: 'FM-00001', // Aarav Smith
      appointmentDate: '2026-06-02',
      appointmentTime: '11:00 AM',
      status: 'completed',
      visitType: 'follow-up',
      chiefComplaint: 'Routine asthma review for child.',
      notes: 'Inhaler technique reviewed. Advised to continue current dosage.'
    }
  });

  await prisma.consultation.create({
    data: {
      id: 'CNS-20260602-001',
      appointmentId: 'APT-20260602-001',
      subjective: 'Aarav is doing well. Inhaler used only 2 times in the last month. No nocturnal cough.',
      objective: 'Chest clear. SpO2: 99%. Throat clear.',
      assessment: 'Mild Persistent Asthma - Controlled.',
      plan: '1. Continue Montelukast 10mg + Levocetirizine 5mg at bedtime.\n2. Practice proper inhaler spacer use.',
      diagnosisCodes: 'J45.3 (Mild Persistent Asthma)',
      bp: '95/60',
      pulse: '92',
      temp: '98.2',
      spo2: '99',
      weight: '26',
      height: '125',
      followUpDate: '2026-07-02'
    }
  });

  await prisma.prescription.create({
    data: {
      id: 'RX-20260602-001',
      consultationId: 'CNS-20260602-001',
      appointmentId: 'APT-20260602-001',
      doctorId: 'DOC-00002',
      patientId: 'PAT-00002',
      familyMemberId: 'FM-00001',
      validUntil: '2026-09-02',
      notes: 'Avoid cold drinks and keep away from dust allergens.',
      medicinesJson: JSON.stringify([
        {
          name: 'Montelukast 10mg + Levocetirizine 5mg',
          dosage: '1 tablet',
          frequency: 'Once daily (night)',
          duration: '30 days',
          instructions: 'Take after meals, before sleeping',
          quantity: 30
        }
      ])
    }
  });

  // Scheduled appointment for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  await prisma.appointment.create({
    data: {
      id: 'APT-20260603-001',
      doctorId: 'DOC-00001',
      patientId: 'PAT-00001',
      familyMemberId: null,
      appointmentDate: tomorrowStr,
      appointmentTime: '02:00 PM',
      status: 'scheduled',
      visitType: 'follow-up',
      chiefComplaint: 'Follow-up check with cholesterol lab test reports.',
      notes: ''
    }
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
