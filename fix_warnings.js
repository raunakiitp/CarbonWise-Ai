const fs = require('fs');

function fix(file, replacements) {
  if (!fs.existsSync(file)) { console.log('NOT FOUND:', file); return; }
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    if (!content.includes(from)) {
      console.log(`WARN: pattern not found in ${file}: "${from.slice(0,50)}"`);
    }
    content = content.split(from).join(to);
  }
  fs.writeFileSync(file, content);
  console.log('Fixed:', file);
}

// 1. analyzer/page.tsx — remove unused calcSustainabilityScore
fix('src/app/(dashboard)/analyzer/page.tsx', [
  ['import { formatCo2, calcSustainabilityScore } from "@/lib/carbon/calculator";',
   'import { formatCo2 } from "@/lib/carbon/calculator";']
]);

// 2. coach/page.tsx — PROMPT_TEMPLATES IS actually used (line 100 in education, line 6 in coach)
// In coach/page.tsx it is imported but not used directly — remove it
fix('src/app/(dashboard)/coach/page.tsx', [
  ['import { PROMPT_TEMPLATES } from "@/lib/gemini/client";\n', '']
]);

// 3. community/page.tsx — remove unused updateChallengeProgress
fix('src/app/(dashboard)/community/page.tsx', [
  ['import { joinChallenge, updateChallengeProgress } from "@/lib/firebase/firestore";',
   'import { joinChallenge } from "@/lib/firebase/firestore";']
]);

// 4. education/page.tsx — QuizQuestion is imported as type (keep it), ExternalLink unused → remove
fix('src/app/(dashboard)/education/page.tsx', [
  ['import { Brain, ChevronRight, Check, X, Loader2, ExternalLink } from "lucide-react";',
   'import { Brain, ChevronRight, Check, X, Loader2 } from "lucide-react";']
]);

// 5. map/page.tsx — replace aria-selected with aria-pressed (correct for button role)
fix('src/app/(dashboard)/map/page.tsx', [
  ['aria-selected={selectedPlace?.id === place.id}',
   'aria-pressed={selectedPlace?.id === place.id}']
]);

// 6. predictions/page.tsx — remove unused Info import
fix('src/app/(dashboard)/predictions/page.tsx', [
  ['import { TrendingDown, TrendingUp, Info } from "lucide-react";',
   'import { TrendingDown, TrendingUp } from "lucide-react";']
]);

// 7. lib/carbon/predictor.ts — prefix unused arg with _
fix('src/lib/carbon/predictor.ts', [
  ['  scenario: string\n',
   '  _scenario: string\n']
]);

// 8. lib/firebase/firestore.ts — remove unused QueryConstraint
fix('src/lib/firebase/firestore.ts', [
  ['import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, QueryConstraint } from "firebase/firestore";',
   'import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";']
]);

// 9. components/layout/TopBar.tsx — remove unused Search import
fix('src/components/layout/TopBar.tsx', [
  ['import { Search, Bell, Sun, Moon, Menu } from "lucide-react";',
   'import { Bell, Sun, Moon, Menu } from "lucide-react";']
]);

// 10. hooks/useActions.ts — remove unused format import
fix('src/hooks/useActions.ts', [
  ["import { format } from \"date-fns\";\n", ''],
  ["import { format, ", 'import { ']
]);

console.log('All fixes applied!');
