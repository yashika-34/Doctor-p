const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Symptom = require('../models/Symptom');
const Slot = require('../models/Slot');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('🌱 Connecting to database...');
    await connectDB();

    console.log('🧹 Clearing existing seed data...');
    await User.deleteMany({ email: { $in: [/doctorp\.com$/i, /example\.com$/i] } });
    await DoctorProfile.deleteMany({});
    await Symptom.deleteMany({});
    await Slot.deleteMany({});
    await Review.deleteMany({});
    await Appointment.deleteMany({});

    console.log('👤 Creating default users (Admin, Doctor, Patient)...');

    // 1. Admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@doctorp.com',
      password: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    });

    // 2. Demo Patient user
    const patientUser = await User.create({
      name: 'Rahul Sharma',
      email: 'patient@doctorp.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+91 91234 56789',
      gender: 'Male',
      age: 28,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });

    // 3. Fictional Doctors dataset across Cardiology, Dermatology, Neurology, Pediatrics, Orthopedics, General Medicine
    const doctorsList = [
      {
        email: 'dr.sharma@doctorp.com',
        name: 'Dr. Rajesh Sharma',
        specialization: 'Cardiology',
        qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)', 'FACC'],
        experience: 16,
        consultationFee: 800,
        clinicName: 'Heart Care & Vascular Institute',
        location: {
          address: '42 Medical Enclave, Connaught Place',
          city: 'New Delhi',
          coordinates: { lat: 28.6328, lng: 77.2197 },
        },
        bio: 'Senior Interventional Cardiologist specializing in preventive cardiology, coronary angiography, hypertension management, and heart wellness.',
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        totalReviews: 38,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        email: 'dr.priya@doctorp.com',
        name: 'Dr. Priya Patel',
        specialization: 'Dermatology',
        qualifications: ['MBBS', 'MD (Dermatology)', 'Fellowship in Cosmetic Dermatology'],
        experience: 11,
        consultationFee: 650,
        clinicName: 'Skin & Aesthetics Center',
        location: {
          address: '15 Bandra West, Linking Road',
          city: 'Mumbai',
          coordinates: { lat: 19.0596, lng: 72.8295 },
        },
        bio: 'Board-certified dermatologist with deep expertise in clinical dermatology, acne therapies, allergic skin conditions, and advanced laser treatments.',
        profileImage: 'https://images.unsplash.com/photo-1594824813511-0967e8913697?auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        totalReviews: 42,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      },
      {
        email: 'dr.aravind@doctorp.com',
        name: 'Dr. Aravind Menon',
        specialization: 'Neurology',
        qualifications: ['MBBS', 'MD', 'DM (Neurology)', 'FRCP (London)'],
        experience: 20,
        consultationFee: 1000,
        clinicName: 'Apex Neurosciences Clinic',
        location: {
          address: '88 Indiranagar 100ft Road',
          city: 'Bangalore',
          coordinates: { lat: 12.9784, lng: 77.6408 },
        },
        bio: 'Renowned consultant neurologist with extensive experience managing migraines, epilepsy, neuropathy, Parkinson’s, and neuro-rehabilitation.',
        profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        totalReviews: 54,
        availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['09:30', '10:30', '11:30', '14:30', '15:30'],
      },
      {
        email: 'dr.ananya@doctorp.com',
        name: 'Dr. Ananya Roy',
        specialization: 'Pediatrics',
        qualifications: ['MBBS', 'DCH', 'MD (Pediatrics)'],
        experience: 9,
        consultationFee: 550,
        clinicName: 'Little Smiles Child Care',
        location: {
          address: '24 Park Street',
          city: 'Kolkata',
          coordinates: { lat: 22.5512, lng: 88.3524 },
        },
        bio: 'Dedicated pediatrician focused on holistic child wellness, neonatal care, developmental tracking, and gentle immunization programs.',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        totalReviews: 61,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['09:00', '10:00', '11:00', '16:00', '17:00', '18:00'],
      },
      {
        email: 'dr.vikram@doctorp.com',
        name: 'Dr. Vikram Malhotra',
        specialization: 'Orthopedics',
        qualifications: ['MBBS', 'MS (Orthopedics)', 'MCh (Orth)', 'Joint Replacement Specialist'],
        experience: 15,
        consultationFee: 750,
        clinicName: 'Joint & Spine Mobility Hospital',
        location: {
          address: '102 Sector 29',
          city: 'Gurugram',
          coordinates: { lat: 28.4674, lng: 77.0688 },
        },
        bio: 'Orthopedic surgeon and sports injury specialist specializing in knee arthroscopy, spine care, fracture rehabilitation, and arthritis management.',
        profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
        rating: 4.7,
        totalReviews: 29,
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['10:00', '11:00', '12:00', '15:00', '16:00'],
      },
      {
        email: 'dr.sunita@doctorp.com',
        name: 'Dr. Sunita Verma',
        specialization: 'General Medicine',
        qualifications: ['MBBS', 'MD (General Medicine)'],
        experience: 14,
        consultationFee: 500,
        clinicName: 'City Wellness & Family Clinic',
        location: {
          address: '55 Civil Lines',
          city: 'New Delhi',
          coordinates: { lat: 28.6814, lng: 77.2227 },
        },
        bio: 'Compassionate family physician providing primary healthcare, chronic illness monitoring (diabetes, thyroid), fever management, and lifestyle counseling.',
        profileImage: 'https://images.unsplash.com/photo-1594824813511-0967e8913697?auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        totalReviews: 47,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
      },
      {
        email: 'dr.kavita@doctorp.com',
        name: 'Dr. Kavita Nair',
        specialization: 'Cardiology',
        qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
        experience: 12,
        consultationFee: 750,
        clinicName: 'Metro Cardiac Centre',
        location: {
          address: '77 Anna Salai',
          city: 'Chennai',
          coordinates: { lat: 13.0604, lng: 80.2496 },
        },
        bio: 'Clinical cardiologist focused on non-invasive cardiology, echocardiography, cardiac prevention, and heart failure care.',
        profileImage: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        totalReviews: 33,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        timeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        email: 'dr.manish@doctorp.com',
        name: 'Dr. Manish Kapoor',
        specialization: 'Dermatology',
        qualifications: ['MBBS', 'DVD', 'MD (Dermatology)'],
        experience: 8,
        consultationFee: 600,
        clinicName: 'DermaCare Skin & Hair Clinic',
        location: {
          address: '18 Jubilee Hills Road No. 36',
          city: 'Hyderabad',
          coordinates: { lat: 17.4319, lng: 78.4073 },
        },
        bio: 'Expert in treating psoriasis, eczema, pediatric skin allergies, and advanced hair rejuvenation therapies.',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
        rating: 4.6,
        totalReviews: 22,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        timeSlots: ['11:00', '12:00', '15:00', '16:00', '17:00'],
      },
    ];

    console.log(`👨‍⚕️ Seeding ${doctorsList.length} verified doctors...`);
    for (const doc of doctorsList) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'Doctor@123',
        role: 'doctor',
        phone: '+91 98000 11223',
        status: 'active',
        avatar: doc.profileImage,
      });

      const doctorProfile = await DoctorProfile.create({
        userId: user._id,
        name: doc.name,
        specialization: doc.specialization,
        qualifications: doc.qualifications,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        clinicName: doc.clinicName,
        location: doc.location,
        bio: doc.bio,
        profileImage: doc.profileImage,
        approvalStatus: 'approved',
        isVerified: true,
        isAvailableToday: true,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        availableDays: doc.availableDays,
        timeSlots: doc.timeSlots,
        slotDuration: 30,
      });

      // Seed a few demo slots for today and tomorrow
      const today = new Date().toISOString().slice(0, 10);
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().slice(0, 10);

      for (const d of [today, tomorrow]) {
        for (const t of doc.timeSlots.slice(0, 3)) {
          await Slot.create({
            doctorId: doctorProfile._id,
            date: d,
            time: t,
            status: 'available',
          });
        }
      }
    }

    console.log('🤖 Seeding AI Symptom Checker database...');
    const symptomsData = [
      {
        keywords: ['chest pain', 'heart palpitations', 'shortness of breath', 'high blood pressure', 'left arm pain'],
        specialty: 'Cardiology',
        description: 'Your symptoms might indicate cardiac strain or vascular hypertension. We strongly recommend consulting a Cardiologist promptly.',
        urgency: 'high',
        icon: 'heart-pulse',
        color: '#DC2626',
      },
      {
        keywords: ['skin rash', 'acne', 'itching', 'eczema', 'skin redness', 'moles', 'hair fall', 'dandruff'],
        specialty: 'Dermatology',
        description: 'Your symptoms are consistent with dermatological or allergic conditions. A Dermatologist can perform a detailed skin examination.',
        urgency: 'low',
        icon: 'sparkles',
        color: '#0D9488',
      },
      {
        keywords: ['severe headache', 'migraine', 'dizziness', 'numbness', 'memory loss', 'tremor', 'fainting'],
        specialty: 'Neurology',
        description: 'Neurological symptoms like persistent headaches or dizziness require careful clinical neurological assessment.',
        urgency: 'medium',
        icon: 'brain',
        color: '#7C3AED',
      },
      {
        keywords: ['child fever', 'baby cough', 'infant rash', 'child vomiting', 'pediatric growth', 'vaccination'],
        specialty: 'Pediatrics',
        description: 'Childhood illnesses and developmental concerns are best evaluated by a specialized Pediatrician.',
        urgency: 'medium',
        icon: 'baby',
        color: '#2563EB',
      },
      {
        keywords: ['joint pain', 'knee pain', 'back pain', 'fracture', 'bone ache', 'stiff neck', 'arthritis'],
        specialty: 'Orthopedics',
        description: 'Musculoskeletal pain, joint stiffness, and mobility challenges are managed by an Orthopedic specialist.',
        urgency: 'medium',
        icon: 'bone',
        color: '#D97706',
      },
      {
        keywords: ['fever', 'cold', 'cough', 'fatigue', 'weakness', 'sore throat', 'body ache', 'vomiting', 'nausea'],
        specialty: 'General Medicine',
        description: 'General viral infections, seasonal illnesses, or constitutional fatigue should be examined first by a General Physician.',
        urgency: 'low',
        icon: 'stethoscope',
        color: '#059669',
      },
    ];

    await Symptom.insertMany(symptomsData);

    console.log('⭐ Creating demo completed appointment and review...');
    const firstDoctor = await DoctorProfile.findOne();
    if (firstDoctor) {
      const demoDate = new Date();
      demoDate.setDate(demoDate.getDate() - 3);
      const demoDateStr = demoDate.toISOString().slice(0, 10);

      const pastApt = await Appointment.create({
        doctorId: firstDoctor._id,
        patientId: patientUser._id,
        appointmentDate: demoDateStr,
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Routine cardiac health checkup',
        fee: firstDoctor.consultationFee,
        status: 'completed',
        isReviewed: true,
      });

      await Review.create({
        doctorId: firstDoctor._id,
        patientId: patientUser._id,
        appointmentId: pastApt._id,
        rating: 5,
        review: 'Exceptional care! Dr. Sharma thoroughly explained my test results and outlined a very clear treatment roadmap. Highly recommended!',
        tags: ['Punctual', 'Empathetic', 'Knowledgeable'],
      });

      // Create an upcoming appointment for demo patient
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 2);
      const nextDateStr = nextDate.toISOString().slice(0, 10);

      await Appointment.create({
        doctorId: firstDoctor._id,
        patientId: patientUser._id,
        appointmentDate: nextDateStr,
        startTime: '14:00',
        endTime: '14:30',
        reason: 'Follow-up consultation',
        fee: firstDoctor.consultationFee,
        status: 'confirmed',
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('──────────────────────────────────────────────────');
    console.log('🔑 Demo Credentials:');
    console.log('   👑 Admin:   admin@doctorp.com   / Admin@123');
    console.log('   👨‍⚕️ Doctor:  dr.sharma@doctorp.com / Doctor@123');
    console.log('   👤 Patient: patient@doctorp.com / Patient@123');
    console.log('──────────────────────────────────────────────────');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
