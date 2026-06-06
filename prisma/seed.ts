// prisma/seed.ts
// Seeds 60 colleges across 10 Indian cities with courses, placements, and reviews

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helper utilities ────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Static data pools ───────────────────────────────────────────────────────

const CITIES: Record<string, string> = {
  Mumbai: "Maharashtra",
  Delhi: "Delhi",
  Bangalore: "Karnataka",
  Hyderabad: "Telangana",
  Chennai: "Tamil Nadu",
  Pune: "Maharashtra",
  Kolkata: "West Bengal",
  Ahmedabad: "Gujarat",
  Jaipur: "Rajasthan",
  Chandigarh: "Punjab",
};

const COURSE_TEMPLATES = [
  { name: "B.Tech Computer Science", duration: "4 Years", baseFeesMin: 80000, baseFeesMax: 250000 },
  { name: "B.Tech Electronics & Communication", duration: "4 Years", baseFeesMin: 75000, baseFeesMax: 220000 },
  { name: "B.Tech Mechanical Engineering", duration: "4 Years", baseFeesMin: 70000, baseFeesMax: 200000 },
  { name: "B.Tech Civil Engineering", duration: "4 Years", baseFeesMin: 65000, baseFeesMax: 180000 },
  { name: "MBA Business Administration", duration: "2 Years", baseFeesMin: 150000, baseFeesMax: 600000 },
  { name: "BCA Computer Applications", duration: "3 Years", baseFeesMin: 40000, baseFeesMax: 120000 },
  { name: "MCA Computer Applications", duration: "2 Years", baseFeesMin: 60000, baseFeesMax: 150000 },
  { name: "B.Sc Data Science", duration: "3 Years", baseFeesMin: 55000, baseFeesMax: 160000 },
  { name: "M.Tech Artificial Intelligence", duration: "2 Years", baseFeesMin: 100000, baseFeesMax: 280000 },
  { name: "B.Com (Hons)", duration: "3 Years", baseFeesMin: 30000, baseFeesMax: 90000 },
  { name: "BBA Business Administration", duration: "3 Years", baseFeesMin: 50000, baseFeesMax: 130000 },
  { name: "B.Arch Architecture", duration: "5 Years", baseFeesMin: 90000, baseFeesMax: 250000 },
  { name: "MBBS", duration: "5.5 Years", baseFeesMin: 500000, baseFeesMax: 2000000 },
  { name: "B.Pharm Pharmacy", duration: "4 Years", baseFeesMin: 60000, baseFeesMax: 180000 },
  { name: "LLB Law", duration: "3 Years", baseFeesMin: 40000, baseFeesMax: 120000 },
];

const REVIEW_TEMPLATES = [
  "The faculty here is exceptional. Professors bring real industry experience into the classroom and are always available for doubt-clearing sessions.",
  "Campus infrastructure is world-class. Well-equipped labs, a huge library, and excellent sports facilities make student life enjoyable.",
  "Placement cell is very active. Multiple Fortune 500 companies visit campus and the average package has been consistently improving year over year.",
  "The college has a vibrant student community. Cultural fests, hackathons, and technical symposiums keep students engaged throughout the year.",
  "Curriculum is updated regularly to match industry standards. The focus on practical learning rather than just theory sets this college apart.",
  "The research opportunities here are outstanding. Working on live projects with faculty guidance has given me real-world skills.",
  "Hostel facilities are decent and the campus is safe. Mess food quality could be better but overall living experience is satisfactory.",
  "Industry connections are strong. Regular guest lectures from CEOs and tech leads give students valuable networking opportunities.",
  "The alumni network is incredibly supportive. They actively help juniors with internships, referrals, and career guidance.",
  "Location in the heart of the city is a big advantage. Easy access to internship opportunities and startup ecosystem nearby.",
  "Scholarship programs are available for meritorious and economically weaker students. The administration is supportive and responsive.",
  "The entrepreneurship cell here is fantastic. Students with startup ideas get mentorship, funding support, and co-working space.",
  "Library resources are extensive with access to thousands of journals and e-books. Study environment is conducive to learning.",
  "Sports infrastructure is top-notch. National-level athletes from this college have made the institution proud multiple times.",
  "Peer learning culture is exceptional. Students genuinely support each other, and group projects lead to lifelong friendships.",
];

const DESCRIPTIONS = [
  "A premier institution of higher learning with over four decades of academic excellence. Known for its research-driven approach, industry-aligned curriculum, and strong placement record, this college prepares students to lead in a rapidly evolving world.",
  "Established with a vision to create world-class professionals, this institution blends rigorous academics with cutting-edge facilities. Our graduates are sought after by top MNCs and startups alike across India and globally.",
  "A NAAC A+ accredited institution offering diverse programs across engineering, management, and sciences. The college's commitment to holistic development ensures students graduate as well-rounded individuals ready for global challenges.",
  "Founded by pioneering educators, this college has grown into one of the region's most respected institutions. With state-of-the-art laboratories, an active research ecosystem, and a dedicated placement cell, we shape future leaders.",
  "Recognized for academic innovation and industry collaboration, this institution offers an immersive learning environment. Our industry mentorship programs and live project exposures give students a decisive edge in competitive job markets.",
  "A technology-focused institution committed to nurturing innovation and entrepreneurship. The college's strong ties with the tech industry ensure students stay ahead of emerging trends and are prepared for high-impact careers.",
  "Home to thousands of ambitious students from across India, this institution provides a diverse, inclusive, and intellectually stimulating environment. Our curriculum emphasizes problem-solving, critical thinking, and ethical leadership.",
  "With a legacy of academic excellence spanning three decades, this college has consistently produced top-tier professionals. Our focus on research, innovation, and industry integration makes us a top choice for ambitious students.",
];

// ─── College definitions ──────────────────────────────────────────────────────

interface CollegeDef {
  name: string;
  city: string;
  fees: number;
  rating: number;
  tier: "elite" | "good" | "average";
}

const COLLEGES: CollegeDef[] = [
  // Mumbai (6)
  { name: "Indian Institute of Technology Bombay", city: "Mumbai", fees: 220000, rating: 4.9, tier: "elite" },
  { name: "Veermata Jijabai Technological Institute", city: "Mumbai", fees: 85000, rating: 4.3, tier: "good" },
  { name: "K.J. Somaiya College of Engineering", city: "Mumbai", fees: 165000, rating: 4.1, tier: "good" },
  { name: "NMIMS School of Technology", city: "Mumbai", fees: 280000, rating: 4.4, tier: "good" },
  { name: "Fr. Conceicao Rodrigues College of Engineering", city: "Mumbai", fees: 90000, rating: 3.8, tier: "average" },
  { name: "Thadomal Shahani Engineering College", city: "Mumbai", fees: 110000, rating: 3.9, tier: "average" },

  // Delhi (6)
  { name: "Indian Institute of Technology Delhi", city: "Delhi", fees: 225000, rating: 4.9, tier: "elite" },
  { name: "Delhi Technological University", city: "Delhi", fees: 72000, rating: 4.4, tier: "good" },
  { name: "Netaji Subhas University of Technology", city: "Delhi", fees: 68000, rating: 4.2, tier: "good" },
  { name: "Jamia Millia Islamia University", city: "Delhi", fees: 55000, rating: 4.0, tier: "good" },
  { name: "Amity University Delhi", city: "Delhi", fees: 195000, rating: 3.9, tier: "average" },
  { name: "Guru Gobind Singh Indraprastha University", city: "Delhi", fees: 82000, rating: 3.7, tier: "average" },

  // Bangalore (6)
  { name: "Indian Institute of Science", city: "Bangalore", fees: 35000, rating: 5.0, tier: "elite" },
  { name: "RV College of Engineering", city: "Bangalore", fees: 120000, rating: 4.5, tier: "good" },
  { name: "PES University", city: "Bangalore", fees: 185000, rating: 4.3, tier: "good" },
  { name: "BMS College of Engineering", city: "Bangalore", fees: 115000, rating: 4.2, tier: "good" },
  { name: "MS Ramaiah Institute of Technology", city: "Bangalore", fees: 125000, rating: 4.1, tier: "good" },
  { name: "Bangalore Institute of Technology", city: "Bangalore", fees: 95000, rating: 3.8, tier: "average" },

  // Hyderabad (6)
  { name: "Indian Institute of Technology Hyderabad", city: "Hyderabad", fees: 218000, rating: 4.8, tier: "elite" },
  { name: "BITS Pilani Hyderabad Campus", city: "Hyderabad", fees: 420000, rating: 4.7, tier: "elite" },
  { name: "Osmania University College of Engineering", city: "Hyderabad", fees: 65000, rating: 4.1, tier: "good" },
  { name: "Chaitanya Bharathi Institute of Technology", city: "Hyderabad", fees: 98000, rating: 4.0, tier: "good" },
  { name: "VNR Vignana Jyothi Institute of Engineering", city: "Hyderabad", fees: 105000, rating: 3.9, tier: "average" },
  { name: "CVR College of Engineering", city: "Hyderabad", fees: 88000, rating: 3.7, tier: "average" },

  // Chennai (6)
  { name: "Indian Institute of Technology Madras", city: "Chennai", fees: 215000, rating: 4.9, tier: "elite" },
  { name: "Anna University CEG Campus", city: "Chennai", fees: 58000, rating: 4.4, tier: "good" },
  { name: "SRM Institute of Science and Technology", city: "Chennai", fees: 175000, rating: 4.1, tier: "good" },
  { name: "Vellore Institute of Technology Chennai", city: "Chennai", fees: 185000, rating: 4.2, tier: "good" },
  { name: "SSN College of Engineering", city: "Chennai", fees: 130000, rating: 4.0, tier: "good" },
  { name: "Rajalakshmi Engineering College", city: "Chennai", fees: 95000, rating: 3.8, tier: "average" },

  // Pune (6)
  { name: "College of Engineering Pune", city: "Pune", fees: 78000, rating: 4.5, tier: "good" },
  { name: "Pune Institute of Computer Technology", city: "Pune", fees: 112000, rating: 4.3, tier: "good" },
  { name: "Symbiosis Institute of Technology", city: "Pune", fees: 220000, rating: 4.2, tier: "good" },
  { name: "Vishwakarma Institute of Technology", city: "Pune", fees: 105000, rating: 4.0, tier: "good" },
  { name: "MIT College of Engineering Pune", city: "Pune", fees: 142000, rating: 4.1, tier: "good" },
  { name: "Bharati Vidyapeeth College of Engineering", city: "Pune", fees: 88000, rating: 3.8, tier: "average" },

  // Kolkata (6)
  { name: "Indian Institute of Technology Kharagpur", city: "Kolkata", fees: 212000, rating: 4.8, tier: "elite" },
  { name: "Jadavpur University", city: "Kolkata", fees: 42000, rating: 4.5, tier: "good" },
  { name: "Calcutta Institute of Engineering and Management", city: "Kolkata", fees: 85000, rating: 3.9, tier: "average" },
  { name: "Heritage Institute of Technology", city: "Kolkata", fees: 95000, rating: 4.0, tier: "good" },
  { name: "Techno India University", city: "Kolkata", fees: 78000, rating: 3.8, tier: "average" },
  { name: "Institute of Engineering and Management Kolkata", city: "Kolkata", fees: 102000, rating: 3.9, tier: "average" },

  // Ahmedabad (6)
  { name: "Indian Institute of Technology Gandhinagar", city: "Ahmedabad", fees: 208000, rating: 4.7, tier: "elite" },
  { name: "Nirma University Institute of Technology", city: "Ahmedabad", fees: 148000, rating: 4.3, tier: "good" },
  { name: "Dharmsinh Desai University", city: "Ahmedabad", fees: 125000, rating: 4.1, tier: "good" },
  { name: "CHARUSAT University", city: "Ahmedabad", fees: 110000, rating: 4.0, tier: "good" },
  { name: "Silver Oak College of Engineering", city: "Ahmedabad", fees: 82000, rating: 3.7, tier: "average" },
  { name: "Indus University Ahmedabad", city: "Ahmedabad", fees: 98000, rating: 3.6, tier: "average" },

  // Jaipur (6)
  { name: "Malaviya National Institute of Technology", city: "Jaipur", fees: 145000, rating: 4.5, tier: "good" },
  { name: "BITS Pilani Main Campus", city: "Jaipur", fees: 430000, rating: 4.8, tier: "elite" },
  { name: "Poornima University", city: "Jaipur", fees: 98000, rating: 3.9, tier: "average" },
  { name: "Jaipur National University", city: "Jaipur", fees: 88000, rating: 3.8, tier: "average" },
  { name: "JECRC University", city: "Jaipur", fees: 105000, rating: 3.9, tier: "average" },
  { name: "Rajasthan Technical University", city: "Jaipur", fees: 62000, rating: 4.0, tier: "good" },

  // Chandigarh (6)
  { name: "Punjab Engineering College", city: "Chandigarh", fees: 88000, rating: 4.4, tier: "good" },
  { name: "Chandigarh University", city: "Chandigarh", fees: 145000, rating: 4.2, tier: "good" },
  { name: "Chitkara University", city: "Chandigarh", fees: 135000, rating: 4.1, tier: "good" },
  { name: "Panjab University UIET", city: "Chandigarh", fees: 72000, rating: 4.3, tier: "good" },
  { name: "CGC Landran", city: "Chandigarh", fees: 95000, rating: 3.8, tier: "average" },
  { name: "Rayat-Bahra University", city: "Chandigarh", fees: 85000, rating: 3.6, tier: "average" },
];

// Realistic Unsplash image URLs for college campuses
const CAMPUS_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800",
  "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800", // ✅ replaced the 404 one
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800", // ✅ new replacement
];

// ─── Placement data generator ────────────────────────────────────────────────

function generatePlacements(collegeId: number, tier: string) {
  const tierMultipliers: Record<string, { avg: [number, number]; high: [number, number]; rate: [number, number] }> = {
    elite: { avg: [1800000, 2800000], high: [5000000, 15000000], rate: [92, 99] },
    good: { avg: [800000, 1600000], high: [2500000, 6000000], rate: [78, 92] },
    average: { avg: [400000, 800000], high: [1200000, 2800000], rate: [62, 80] },
  };

  const m = tierMultipliers[tier];
  const years = [2022, 2023, 2024];

  return years.map((year, idx) => ({
    year,
    collegeId,
    // Packages grow ~8–12% year-over-year
    avgPackage: randomBetween(m.avg[0], m.avg[1]) * (1 + idx * 0.09),
    highestPackage: randomBetween(m.high[0], m.high[1]) * (1 + idx * 0.07),
    placementRate: Math.min(99, randomFloat(m.rate[0], m.rate[1])),
  }));
}

// ─── Course generator ─────────────────────────────────────────────────────────

function generateCourses(collegeId: number, count: number) {
  const shuffled = [...COURSE_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((c) => ({
    name: c.name,
    duration: c.duration,
    fees: randomBetween(c.baseFeesMin, c.baseFeesMax),
    collegeId,
  }));
}

// ─── Review generator ─────────────────────────────────────────────────────────

// ─── Review generator ─────────────────────────────────────────────────────────

function generateReviews(collegeId: number, avgRating: number, userIds: string[]) { // ✅ added userIds param
  const shuffledTemplates = [...REVIEW_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 5);

  return shuffledTemplates.map((content, idx) => ({
    content,
    rating: Math.min(5, Math.max(3, randomFloat(avgRating - 0.8, avgRating + 0.5))),
    userId: userIds[idx % userIds.length], // ✅ use real DB user IDs
    collegeId,
    createdAt: new Date(Date.now() - randomBetween(1, 365) * 24 * 60 * 60 * 1000),
  }));
}

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data in correct order (respects FK constraints)
  console.log("🗑️  Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  // Create seed users FIRST
  console.log("👤 Creating seed users...");
  const seedUsers = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `seeduser${i + 1}@example.com`,
          name: `Seed User ${i + 1}`,
        },
      })
    )
  );
  const userIds = seedUsers.map((u) => u.id);

  console.log(`📚 Seeding ${COLLEGES.length} colleges...`);

  for (let i = 0; i < COLLEGES.length; i++) {
    const def = COLLEGES[i];
    const state = CITIES[def.city];
    const courseCount = randomBetween(3, 5);

    // Create college
    const college = await prisma.college.create({
      data: {
        name: def.name,
        location: `${def.city}, ${state}`,
        city: def.city,
        state: state,
        fees: def.fees,
        rating: def.rating,
        description: pick(DESCRIPTIONS),
        imageUrl: CAMPUS_IMAGES[i % CAMPUS_IMAGES.length],
      },
    });

    // Create courses
    const courses = generateCourses(college.id, courseCount);
    await prisma.course.createMany({ data: courses });

    // Create placements (2022, 2023, 2024)
    const placements = generatePlacements(college.id, def.tier);
    await prisma.placement.createMany({ data: placements });

    // Create reviews (5 per college)
    const reviews = generateReviews(college.id, def.rating, userIds);
    await prisma.review.createMany({ data: reviews });

    if ((i + 1) % 10 === 0) {
      console.log(`  ✅ Seeded ${i + 1}/${COLLEGES.length} colleges`);
    }
  }

  const counts = {
    colleges: await prisma.college.count(),
    courses: await prisma.course.count(),
    placements: await prisma.placement.count(),
    reviews: await prisma.review.count(),
  };

  console.log("\n✨ Seed complete!");
  console.log(`  📊 Colleges:   ${counts.colleges}`);
  console.log(`  📖 Courses:    ${counts.courses}`);
  console.log(`  💼 Placements: ${counts.placements}`);
  console.log(`  ⭐ Reviews:    ${counts.reviews}`);
}
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
