export interface Activity {
  name: string;
  category: string;
  date: string;
  points: number;
}

export interface Leader {
  name: string;
  role: string;
  score: number;
  avatar: string;
  categoryStats: { icon: string; label: string; count: number }[];
  activities: Activity[];
}

const firstNames = [
  "Oleksandr", "Maria", "Thomas", "Anna", "Dmitry", "Elena", "Pavel", "Katarina",
  "Andrei", "Natalia", "Viktor", "Sofia", "Maxim", "Julia", "Sergei", "Oksana",
  "Ivan", "Tatiana", "Roman", "Alina", "Artem", "Darya", "Nikolai", "Ekaterina",
  "Vladislav", "Irina", "Denis", "Olga", "Kirill", "Marina", "Mikhail", "Svetlana",
  "Alexei", "Vera", "Stanislav", "Polina", "Georgi", "Lyudmila", "Oleg", "Anastasia",
  "Valentin", "Larisa", "Bogdan", "Kristina", "Timur", "Galina", "Ruslan", "Margarita",
  "Yaroslav", "Valentina", "Igor", "Nadezhda", "Evgeny", "Tamara", "Vadim", "Zhanna",
  "Grigory", "Ludmila", "Leonid", "Raisa", "Boris", "Alla", "Felix", "Diana",
  "Stepan", "Zoya", "Gleb", "Inna", "Matvei", "Lilia", "Danilo", "Renata",
  "Erik", "Kseniya", "Mark", "Veronika", "Lev", "Yuliya", "Fedor", "Albina",
  "Taras", "Nina", "Semyon", "Rita", "Zakhar", "Eleonora", "Platon", "Vasilisa",
  "Miroslav", "Snezhana", "Daniil", "Alyona", "Filipp", "Milena", "Svyatoslav", "Ulyana",
  "Tomas", "Agata", "Adrian", "Yelena",
];

const lastNames = [
  "Bondarenko", "Fernandez", "Richter", "Kovalenko", "Petrov", "Ivanova", "Novak",
  "Schmidt", "Popov", "Sokolova", "Weber", "Moroz", "Kowalski", "Horvat", "Fischer",
  "Tkachenko", "Kravchenko", "Shevchenko", "Lysenko", "Boyko", "Melnyk", "Polishchuk",
  "Savchenko", "Rudenko", "Marchenko", "Karpenko", "Babenko", "Oliynyk", "Chernysh",
  "Yakovlev", "Fedorov", "Kuznetsov", "Morozov", "Volkov", "Lebedev", "Solovyov",
  "Pavlov", "Smirnov", "Vasiliev", "Kozlov", "Stepanov", "Orlov", "Andreev",
  "Makarov", "Nikitin", "Zaitsev", "Belov", "Gusev", "Frolov", "Vinogradov",
  "Klimov", "Baranov", "Egorov", "Fomin", "Zhukov", "Kalinin", "Shapovalov",
  "Grigoriev", "Romanov", "Tarasov", "Belyaev", "Komissarov", "Gerasimov",
  "Davydov", "Medvedev", "Lobanov", "Kiselev", "Dmitriev", "Antonov", "Tikhonov",
  "Abramov", "Ignatov", "Kudryavtsev", "Blinov", "Sorokin", "Bogdanov", "Semenov",
  "Voronov", "Savin", "Vlasov", "Nikitenko", "Kononov", "Kotov", "Denisov",
  "Gorbunov", "Suvorov", "Kazakov", "Kulikov", "Polyakov", "Naumov", "Potapov",
  "Zakharov", "Chernov", "Sysoev", "Eliseev", "Komarov", "Shulgin", "Rogov",
  "Lavrov", "Zubarev",
];

const roles = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer",
  "Principal Engineer", "QA Engineer", "Senior QA Engineer", "Lead QA Engineer",
  "DevOps Engineer", "Senior DevOps Engineer", "Frontend Developer",
  "Senior Frontend Developer", "Backend Developer", "Senior Backend Developer",
  "Full Stack Developer", "Data Engineer", "ML Engineer", "iOS Developer",
  "Android Developer", "Group Manager", "Engineering Manager",
  "Product Designer", "Senior Product Designer", "UX Researcher",
  "Technical Writer", "Security Engineer", "Platform Engineer",
  "Site Reliability Engineer", "Cloud Architect", "Solutions Architect",
  "Database Administrator",
];

const locations = [
  "UA.D1.G1", "UA.D2.G1", "UA.U1.D1", "BY.U1.G3", "PL.G6", "PL.G2",
  "DE.U1.G1", "ES.U1.D1", "SK.U1.D1.G1", "UZ.U1.D3", "UZ.U1.D3.T1",
  "BY.U1.DQA2.T1", "SK.U1.D1.G1.T1", "CZ.U1.G2", "LT.D1.G1",
];

const activityPrefixes = ["[REG]", "[UNI]", "[COM]", "[INT]"];

const activityTypes = [
  "Mentoring of", "Workshop on", "Lecture about", "Code review for",
  "Training session on", "Presentation about", "Knowledge sharing:",
  "Hackathon project:", "Tech talk:", "Blog post about",
  "Open source contribution to", "Interview preparation for",
  "Onboarding support for", "Documentation of", "Research on",
];

const activityTopics = [
  "React Performance", "System Design Patterns", "Cloud Architecture",
  "Testing Strategies", "CI/CD Pipelines", "Kubernetes Deployment",
  "GraphQL Best Practices", "TypeScript Advanced Types", "Microservices",
  "Database Optimization", "Security Practices", "Agile Methodologies",
  "Machine Learning Basics", "Docker Containers", "API Design",
  "Code Quality Standards", "Monitoring & Observability", "Team Leadership",
  "Cross-team Collaboration", "Technical Debt Reduction",
];

const activityPersons = [
  "Artem Volkov", "Daria Sokolova", "Pavel Novak", "Elena Morozova",
  "Viktor Schmidt", "Katarina Weber", "Maxim Popov", "Sofia Horvat",
  "Andrei Fischer", "Natalia Kowalski", "Ivan Petrov", "Julia Kravchenko",
  "Dmitry Lysenko", "Anna Boyko", "Sergei Melnyk", "Oksana Savchenko",
  "Roman Rudenko", "Alina Marchenko", "Nikolai Karpenko", "Ekaterina Babenko",
];

const categories = [
  { name: "Education", bg: "#dbeafe", color: "#1e40af" },
  { name: "University Partnership", bg: "#e2e8f0", color: "#475569" },
  { name: "Community", bg: "#dcfce7", color: "#166534" },
  { name: "Contribution", bg: "#f3e8ff", color: "#6b21a8" },
  { name: "Training", bg: "#dbeafe", color: "#1e40af" },
  { name: "Public Speaking", bg: "#fef3c7", color: "#92400e" },
];

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateActivities(rand: () => number, count: number): Activity[] {
  const acts: Activity[] = [];
  for (let i = 0; i < count; i++) {
    const prefix = activityPrefixes[Math.floor(rand() * activityPrefixes.length)];
    const type = activityTypes[Math.floor(rand() * activityTypes.length)];
    const usesPerson = type.endsWith("of") || type.endsWith("for");
    const subject = usesPerson
      ? activityPersons[Math.floor(rand() * activityPersons.length)]
      : activityTopics[Math.floor(rand() * activityTopics.length)];
    const cat = categories[Math.floor(rand() * categories.length)];
    const day = Math.floor(rand() * 28) + 1;
    const month = Math.floor(rand() * 12);
    const year = 2023 + Math.floor(rand() * 3); // 2023, 2024, or 2025
    const points = (Math.floor(rand() * 12) + 1) * 8;

    acts.push({
      name: `${prefix} ${type} ${subject}`,
      category: cat.name,
      date: `${day.toString().padStart(2, "0")}-${months[month]}-${year}`,
      points,
    });
  }
  return acts.sort((a, b) => {
    const mA = months.indexOf(a.date.split("-")[1]);
    const mB = months.indexOf(b.date.split("-")[1]);
    return mB - mA || parseInt(b.date) - parseInt(a.date);
  });
}

function generateLeaders(): Leader[] {
  const rand = seededRandom(42);
  const result: Leader[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 100; i++) {
    let name = "";
    do {
      const first = firstNames[Math.floor(rand() * firstNames.length)];
      const last = lastNames[Math.floor(rand() * lastNames.length)];
      name = `${first} ${last}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const role = roles[Math.floor(rand() * roles.length)];
    const location = locations[Math.floor(rand() * locations.length)];
    const baseScore = Math.max(50, 500 - i * 4 - Math.floor(rand() * 20));
    const avatarId = (i % 70) + 1;

    const statCount = Math.floor(rand() * 3) + 1;
    const categoryStats: { icon: string; label: string; count: number }[] = [];
    const usedIcons = new Set<string>();
    const iconOptions = [
      { icon: "presentation", label: "Public Speaking" },
      { icon: "education", label: "Education" },
      { icon: "community", label: "Community" },
    ];
    for (let s = 0; s < statCount; s++) {
      const opt = iconOptions[s % iconOptions.length];
      if (!usedIcons.has(opt.icon)) {
        usedIcons.add(opt.icon);
        categoryStats.push({
          icon: opt.icon,
          label: opt.label,
          count: Math.floor(rand() * 15) + 1,
        });
      }
    }

    const actCount = Math.floor(rand() * 5) + 1;
    const activities = generateActivities(rand, actCount);

    result.push({
      name,
      role: `${role} (${location})`,
      score: baseScore,
      avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
      categoryStats,
      activities,
    });
  }

  return result.sort((a, b) => b.score - a.score);
}

export const allLeaders = generateLeaders();
