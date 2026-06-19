const fs = require('fs');

const fix = (file, replaces) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replaces) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(file, content);
};

fix('src/app/(dashboard)/analyzer/page.tsx', [['calcSustainabilityScore, ', '']]);
fix('src/app/(dashboard)/coach/page.tsx', [['buildCoachPrompt, ', ''], ['PROMPT_TEMPLATES, ', '']]);
fix('src/app/(dashboard)/community/page.tsx', [['updateChallengeProgress, ', ''], ['Trophy, ', ''], ['format, ', '']]);
fix('src/app/(dashboard)/education/page.tsx', [['QuizQuestion, ', ''], ['BookOpen, ', ''], ['ExternalLink, ', '']]);
fix('src/app/(dashboard)/dashboard/page.tsx', [['import { GLOBAL_AVERAGES } from "@/constants/emissions";', ''], [', Award ', ' '], [', Award}', '}']]);
fix('src/app/(dashboard)/goals/page.tsx', [['useState({', 'useState(() => ({'], ['  });', '  }));'], [', Edit3 ', ' '], ['AlertCircle, Target, CheckCircle, ', '']]);
fix('src/app/(dashboard)/map/page.tsx', [['const [mapLoaded, setMapLoaded] = useState(false);', ''], ['aria-selected=\"true\"', '/* aria-selected */']]);
fix('src/app/(dashboard)/predictions/page.tsx', [['const yearEndConservative = latest ? predictFutureEmissions(history, latest, 12, \"conservative\") : null;', ''], ['const yearEndOptimistic = prediction?.scenarioOptimistic[11]?.predicted ?? 0;', ''], ['MapPin, Navigation, Calendar, Search, Info', 'TrendingDown, TrendingUp']]);
fix('src/app/(dashboard)/reports/page.tsx', [['\"', '&quot;']]);
fix('src/hooks/useActions.ts', [['format, ', '']]);
fix('src/lib/carbon/predictor.ts', [['scenario: \"bau\"', '_scenario: \"bau\"']]);
fix('src/lib/firebase/firestore.ts', [['QueryConstraint, ', '']]);
fix('src/components/layout/TopBar.tsx', [['Search, ', '']]);
