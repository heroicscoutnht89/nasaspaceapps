export type Answers = {
  heartRate: string;
  systolic: string;
  diastolic: string;
  temperature: string;
  glucose: string;
  mood: number | null;
  crewTension: number | null;
  feelings: Record<string, boolean>;
  symptoms: Record<string, boolean>;
  sleepHours: string;
  bedtime: string;
  wakeTime: string;
  light: string | null;
  exerciseMinutes: string;
  exerciseTypes: string[];
  meals: string | null;
  appetite: string | null;
  fluids: string;
};

export const emptyAnswers: Answers = {
  heartRate: '', systolic: '', diastolic: '', temperature: '', glucose: '',
  mood: null, crewTension: null, feelings: {}, symptoms: {},
  sleepHours: '', bedtime: '', wakeTime: '', light: null,
  exerciseMinutes: '', exerciseTypes: [], meals: null, appetite: null, fluids: '',
};

export const feelingList = [
  { id: 'nervous', label: 'Nervous or on edge' },
  { id: 'lowInterest', label: 'Little interest in activities' },
  { id: 'sleepTrouble', label: 'Hard to sleep or stay asleep' },
];

export const symptomList = [
  { id: 'nausea', label: 'Nausea or vomiting' },
  { id: 'headache', label: 'Headache' },
  { id: 'dizzy', label: 'Dizziness or balance trouble' },
  { id: 'motionSickness', label: 'Motion sickness' },
  { id: 'vision', label: 'Blurred or changed vision' },
  { id: 'rashFever', label: 'Skin rash or fever' },
  { id: 'stomach', label: 'Stomach upset' },
  { id: 'tired', label: 'Unusual tiredness' },
];

export const lightOptions = ['Dim', 'Normal', 'Bright'];
export const exerciseOptions = ['Resistive', 'Cardio', 'Other'];
export const mealOptions = ['0', '1', '2', '3'];
export const appetiteOptions = ['Low', 'Normal', 'High'];