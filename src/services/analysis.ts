// Example analysis. Replace with the real AI service later.
export interface Observation {
  title: string;
  detail: string;
  note: string;
}

export interface Recommendation {
  id: string;
  title: string;
  summary: string;
  reason: string;
  steps: string[];
  doneLabel: string;
}

export function getObservation(): Observation {
  return {
    title: "حرارة الجو ارتفعت خلال ساعة",
    detail: "من 32.8° إلى 35.2°",
    note: "تحليل تجريبي لتوضيح الفكرة، وليس تشخيصًا لمرض.",
  };
}

export function getRecommendation(): Recommendation {
  return {
    id: "ventilate-bunch-covers",
    title: "تأكد من تهوية أغطية العذوق",
    summary: "إذا كانت العذوق مغطاة، تحقق من عدم انسداد فتحات التهوية.",
    reason: "مع ارتفاع الحرارة وانخفاض الرطوبة، الأغطية المغلقة قد تحبس الحرارة حول الثمار.",
    steps: [
      "تأكد إن العذوق عليها أغطية أصلًا.",
      "افحص فتحات التهوية: هل هي مسدودة؟",
      "سجّل ملاحظاتك وتابع القراءات بعدها.",
    ],
    doneLabel: "تم، فحصت الأغطية",
  };
}
