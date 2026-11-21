import type { Assessment } from '@/types/database.types';

export interface SanitizedAssessment {
  id: string;
  first_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi: string;
  target_direction: string;
  target_weight_kg: number | null;
  timeline_weeks: number | null;
  routine: {
    wake_time?: string;
    sleep_time?: string;
    work_shift?: string;
    meal_frequency?: string;
    activity_level?: string;
  };
  food_preferences: {
    diet_type?: string;
    regional_preference?: string;
    allergies?: string[];
    dislikes?: string[];
    cooking_access?: string;
  };
  health_screening: {
    conditions?: string[];
    is_pregnant_or_nursing?: boolean;
    eating_disorder_history?: boolean;
    medications?: string;
  };
  status: string;
  submitted_at: string;
}

/**
 * Strips all personal contact identifiers (Email and Phone / Contact Number)
 * and technical security secrets (tokens) to guarantee client privacy and confidentiality
 * on all downloadable files.
 */
export function sanitizeAssessmentForExport(
  raw: Partial<Assessment> | Record<string, unknown>
): SanitizedAssessment {
  const height = Number(raw['height_cm'] || 165);
  const weight = Number(raw['weight_kg'] || 65);
  const heightM = height > 0 ? height / 100 : 1.65;
  const bmiCalc = (weight / (heightM * heightM)).toFixed(1);

  const routine = (raw['routine_data'] as Record<string, unknown>) || {};
  const preferences = (raw['food_preferences'] as Record<string, unknown>) || {};
  const health = (raw['health_screening'] as Record<string, unknown>) || {};

  const sanitized: SanitizedAssessment = {
    id: String(raw['id'] || 'assessment_lead'),
    first_name: String(raw['first_name'] || 'Client'),
    age: Number(raw['age'] || 25),
    gender: String(raw['gender'] || 'Not specified'),
    height_cm: height,
    weight_kg: weight,
    bmi: bmiCalc,
    target_direction: String(raw['target_direction'] || 'maintain_health').replace(/_/g, ' '),
    target_weight_kg: raw['target_weight_kg'] ? Number(raw['target_weight_kg']) : null,
    timeline_weeks: raw['timeline_weeks'] ? Number(raw['timeline_weeks']) : null,
    routine: {
      wake_time: (routine['wake_time'] as string) || '06:30',
      sleep_time: (routine['sleep_time'] as string) || '23:00',
      work_shift: ((routine['work_shift'] as string) || 'Standard Day').replace(/_/g, ' '),
      meal_frequency: ((routine['meal_frequency'] as string) || '3 meals').replace(/_/g, ' '),
      activity_level: ((routine['activity_level'] as string) || 'Lightly active').replace(/_/g, ' '),
    },
    food_preferences: {
      diet_type: (preferences['diet_type'] as string) || 'Vegetarian',
      regional_preference: ((preferences['regional_preference'] as string) || 'North Indian').replace(/_/g, ' '),
      allergies: (preferences['allergies'] as string[]) || [],
      dislikes: (preferences['dislikes'] as string[]) || [],
      cooking_access: ((preferences['cooking_access'] as string) || 'Cooks at home').replace(/_/g, ' '),
    },
    health_screening: {
      conditions: (health['conditions'] as string[]) || [],
      is_pregnant_or_nursing: Boolean(health['is_pregnant_or_nursing']),
      eating_disorder_history: Boolean(health['eating_disorder_history']),
      medications: (health['medications'] as string) || 'None reported',
    },
    status: String(raw['status'] || 'pending_review').replace(/_/g, ' '),
    submitted_at: raw['submitted_at'] ? String(raw['submitted_at']) : new Date().toISOString(),
  };

  // Explicit safety guarantee: delete any accidentally attached contact fields
  const safeObj = sanitized as unknown as Record<string, unknown>;
  delete safeObj['email'];
  delete safeObj['phone'];
  delete safeObj['contact_no'];
  delete safeObj['contact'];
  delete safeObj['mobile'];
  delete safeObj['draft_token_hash'];

  return sanitized;
}

/**
 * Generates a clean Word Document (.doc) compatible HTML document.
 * Strictly guarantees that Email and Phone Number are NOT present.
 */
export function generateAssessmentDocHtml(item: SanitizedAssessment): string {
  const allergyList = item.food_preferences.allergies?.length
    ? item.food_preferences.allergies.join(', ')
    : 'None reported';
  const dislikeList = item.food_preferences.dislikes?.length
    ? item.food_preferences.dislikes.join(', ')
    : 'None reported';
  const conditionList = item.health_screening.conditions?.length
    ? item.health_screening.conditions.map((c) => c.replace(/_/g, ' ').toUpperCase()).join(', ')
    : 'None reported / Healthy';

  const dateStr = new Date(item.submitted_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Fitvora Client Assessment - ${item.first_name}</title>
  <style>
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      margin: 24px;
      color: #1A2E1C;
      background-color: #FFFFFF;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header-box {
      border-bottom: 2pt solid #075B2B;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: bold;
      color: #075B2B;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-subtitle {
      font-size: 11pt;
      color: #555555;
      margin-top: 4px;
    }
    .privacy-notice {
      background-color: #EAF8E7;
      border: 1pt solid #A7E0A3;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 9.5pt;
      color: #075B2B;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #075B2B;
      background-color: #F4FAF2;
      border-left: 4pt solid #075B2B;
      padding: 4px 8px;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    table.data-table th, table.data-table td {
      border: 1pt solid #D8E5D7;
      padding: 6px 10px;
      text-align: left;
      font-size: 10pt;
    }
    table.data-table th {
      background-color: #F8FBF8;
      color: #333333;
      font-weight: bold;
      width: 32%;
    }
    table.data-table td {
      color: #111111;
    }
    .badge-alert {
      color: #A33A00;
      font-weight: bold;
      background-color: #FFF3E8;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1pt solid #E5E7EB;
      font-size: 8.5pt;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <h1 class="brand-title">FITVORA — CLIENT WELLNESS ASSESSMENT</h1>
    <div class="doc-subtitle">Intake Form Data • Submitted: ${dateStr} • Ref ID: ${item.id}</div>
  </div>

  <div class="privacy-notice">
    🔒 PRIVACY & CONFIDENTIALITY PROTECTED: Personal contact credentials (Email and Mobile Number) are strictly excluded from this report for client privacy.
  </div>

  <!-- 1. Physical Profile & Goal -->
  <div class="section-title">1. CANDIDATE PROFILE & WELLNESS TARGET</div>
  <table class="data-table">
    <tr>
      <th>Client First Name</th>
      <td><strong>${item.first_name}</strong></td>
    </tr>
    <tr>
      <th>Age & Gender</th>
      <td>${item.age} years old • ${item.gender}</td>
    </tr>
    <tr>
      <th>Height & Weight</th>
      <td>${item.height_cm} cm / ${item.weight_kg} kg</td>
    </tr>
    <tr>
      <th>Calculated BMI</th>
      <td><strong>${item.bmi}</strong></td>
    </tr>
    <tr>
      <th>Wellness Goal / Direction</th>
      <td><strong style="text-transform: capitalize; color: #075B2B;">${item.target_direction}</strong></td>
    </tr>
    <tr>
      <th>Target Weight & Timeline</th>
      <td>${item.target_weight_kg ? `${item.target_weight_kg} kg` : 'Gradual progress'} (Timeline: ${item.timeline_weeks ? `${item.timeline_weeks} weeks` : 'Flexible'})</td>
    </tr>
    <tr>
      <th>Assessment Status</th>
      <td><span style="text-transform: capitalize;">${item.status}</span></td>
    </tr>
  </table>

  <!-- 2. Daily Routine & Schedule -->
  <div class="section-title">2. DAILY ROUTINE & CIRCADIAN SCHEDULE</div>
  <table class="data-table">
    <tr>
      <th>Sleep & Wake Window</th>
      <td>Sleep: ${item.routine.sleep_time} &bull; Wake: ${item.routine.wake_time}</td>
    </tr>
    <tr>
      <th>Work Shift</th>
      <td><span style="text-transform: capitalize;">${item.routine.work_shift}</span></td>
    </tr>
    <tr>
      <th>Daily Meal Frequency</th>
      <td><span style="text-transform: capitalize;">${item.routine.meal_frequency}</span></td>
    </tr>
    <tr>
      <th>Daily Activity Level</th>
      <td><span style="text-transform: capitalize;">${item.routine.activity_level}</span></td>
    </tr>
  </table>

  <!-- 3. Food & Regional Preferences -->
  <div class="section-title">3. FOOD & REGIONAL DIETARY PREFERENCES</div>
  <table class="data-table">
    <tr>
      <th>Dietary Style</th>
      <td><strong style="text-transform: capitalize;">${item.food_preferences.diet_type}</strong></td>
    </tr>
    <tr>
      <th>Regional Cuisine Preference</th>
      <td><span style="text-transform: capitalize;">${item.food_preferences.regional_preference}</span></td>
    </tr>
    <tr>
      <th>Cooking Setup & Access</th>
      <td><span style="text-transform: capitalize;">${item.food_preferences.cooking_access}</span></td>
    </tr>
    <tr>
      <th>Reported Food Allergies</th>
      <td><span style="color: ${item.food_preferences.allergies?.length ? '#C53030' : '#1A2E1C'}; font-weight: ${item.food_preferences.allergies?.length ? 'bold' : 'normal'};">${allergyList}</span></td>
    </tr>
    <tr>
      <th>Food Dislikes / Ingredients to Avoid</th>
      <td>${dislikeList}</td>
    </tr>
  </table>

  <!-- 4. Health Screening & Medical History -->
  <div class="section-title">4. HEALTH & SAFETY SCREENING</div>
  <table class="data-table">
    <tr>
      <th>Reported Medical Conditions</th>
      <td><strong>${conditionList}</strong></td>
    </tr>
    <tr>
      <th>Pregnant or Nursing</th>
      <td>${item.health_screening.is_pregnant_or_nursing ? '<span class="badge-alert">YES &bull; Safety Protocol Required</span>' : 'No'}</td>
    </tr>
    <tr>
      <th>Eating Disorder History</th>
      <td>${item.health_screening.eating_disorder_history ? '<span class="badge-alert">YES &bull; Clinical Review Required</span>' : 'No'}</td>
    </tr>
    <tr>
      <th>Current Medications</th>
      <td>${item.health_screening.medications}</td>
    </tr>
  </table>

  <div class="footer">
    Fitvora Holistic Health &bull; Confidential Client Intake Document &bull; Personal contact data (Email & Contact No) omitted &bull; Generated: ${new Date().toUTCString()}
  </div>
</body>
</html>`;
}

/**
 * Generates a clean CSV file string for one or multiple sanitized assessments.
 * Columns: Strictly NO Email, NO Contact Number / Phone.
 */
export function generateAssessmentCsv(items: SanitizedAssessment[]): string {
  const headers = [
    'Assessment ID',
    'Client Name',
    'Age',
    'Gender',
    'Height (cm)',
    'Weight (kg)',
    'BMI',
    'Target Direction',
    'Target Weight (kg)',
    'Timeline (weeks)',
    'Diet Type',
    'Regional Style',
    'Cooking Access',
    'Allergies',
    'Dislikes',
    'Wake Time',
    'Sleep Time',
    'Work Shift',
    'Meal Frequency',
    'Activity Level',
    'Reported Conditions',
    'Pregnant or Nursing',
    'Eating Disorder History',
    'Medications',
    'Status',
    'Submitted Date',
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [headers.map(escapeCsv).join(',')];

  for (const a of items) {
    const row = [
      a.id,
      a.first_name,
      a.age,
      a.gender,
      a.height_cm,
      a.weight_kg,
      a.bmi,
      a.target_direction,
      a.target_weight_kg ?? '',
      a.timeline_weeks ?? '',
      a.food_preferences.diet_type ?? '',
      a.food_preferences.regional_preference ?? '',
      a.food_preferences.cooking_access ?? '',
      (a.food_preferences.allergies || []).join('; '),
      (a.food_preferences.dislikes || []).join('; '),
      a.routine.wake_time ?? '',
      a.routine.sleep_time ?? '',
      a.routine.work_shift ?? '',
      a.routine.meal_frequency ?? '',
      a.routine.activity_level ?? '',
      (a.health_screening.conditions || []).join('; '),
      a.health_screening.is_pregnant_or_nursing ? 'YES' : 'NO',
      a.health_screening.eating_disorder_history ? 'YES' : 'NO',
      a.health_screening.medications ?? 'None',
      a.status,
      a.submitted_at,
    ];
    rows.push(row.map(escapeCsv).join(','));
  }

  return rows.join('\r\n');
}

/**
 * Generates formatted text/markdown for clean terminal or notepad reading.
 * Strictly NO Email, NO Contact Number.
 */
export function generateAssessmentText(item: SanitizedAssessment): string {
  const allergies = item.food_preferences.allergies?.length
    ? item.food_preferences.allergies.join(', ')
    : 'None';
  const dislikes = item.food_preferences.dislikes?.length
    ? item.food_preferences.dislikes.join(', ')
    : 'None';
  const conditions = item.health_screening.conditions?.length
    ? item.health_screening.conditions.join(', ')
    : 'None reported';

  return `============================================================
FITVORA — CLIENT ASSESSMENT FORM DATA
(Confidential Intake Record — Contact Details Redacted)
============================================================
Assessment ID:   ${item.id}
Client Name:     ${item.first_name}
Age / Gender:    ${item.age} years old / ${item.gender}
Height / Weight: ${item.height_cm} cm / ${item.weight_kg} kg (BMI: ${item.bmi})
Wellness Goal:   ${item.target_direction}
Target Weight:   ${item.target_weight_kg ? `${item.target_weight_kg} kg` : 'Gradual progress'}
Timeline:        ${item.timeline_weeks ? `${item.timeline_weeks} weeks` : 'Flexible'}

------------------------------------------------------------
DAILY ROUTINE & SCHEDULE
------------------------------------------------------------
Sleep Window:    ${item.routine.sleep_time} to ${item.routine.wake_time}
Work Shift:      ${item.routine.work_shift}
Meal Frequency:  ${item.routine.meal_frequency}
Activity Level:  ${item.routine.activity_level}

------------------------------------------------------------
FOOD & DIETARY PREFERENCES
------------------------------------------------------------
Diet Type:       ${item.food_preferences.diet_type}
Regional Style:  ${item.food_preferences.regional_preference}
Cooking Access:  ${item.food_preferences.cooking_access}
Allergies:       ${allergies}
Dislikes:        ${dislikes}

------------------------------------------------------------
HEALTH & SAFETY SCREENING
------------------------------------------------------------
Conditions:      ${conditions}
Pregnant/Nurse:  ${item.health_screening.is_pregnant_or_nursing ? 'YES (High Priority)' : 'No'}
ED History:      ${item.health_screening.eating_disorder_history ? 'YES (Review Required)' : 'No'}
Medications:     ${item.health_screening.medications}

------------------------------------------------------------
NOTE: Email address and contact phone number are strictly 
omitted from this export for member confidentiality.
============================================================
`;
}
