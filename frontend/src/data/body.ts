import type { Status } from '../theme';

export type BodyArea = {
  id: string;
  name: string;
  label: string;
  status: Status;
  x: number;
  y: number;
  labelX: number;
  labelAnchor: 'start' | 'end';
  effect: string;
  readings: string[];
  action: string;
};

export const bodyAreas: BodyArea[] = [
  {
    id: 'brain', name: 'Brain and mood', label: 'Brain', status: 'watch',
    x: 110, y: 38, labelX: 148, labelAnchor: 'start',
    effect: 'Isolation, distance from Earth and other stressors can affect mood, sleep and thinking. NASA also lists changes to the brain and eyes as a spaceflight risk.',
    readings: ['Mood 2.8 of 5 (your baseline 3.6)', 'Sleep 5.1 h (your baseline 7.0 h)'],
    action: 'Keep a fixed sleep window, talk with the crew or call home, and do the breathing exercise. If low mood continues, contact your flight surgeon.',
  },
  {
    id: 'heart', name: 'Heart and vessels', label: 'Heart', status: 'watch',
    x: 122, y: 110, labelX: 146, labelAnchor: 'start',
    effect: 'Weightlessness changes circulation and how the heart and blood vessels work, which may raise the risk of cardiovascular events.',
    readings: ['Resting heart rate 71 bpm (your baseline 64)', 'Blood pressure 118/76 mmHg'],
    action: '10 minutes of light cardio, drink water, and re-check tomorrow. If it stays raised for 3 days or you feel chest pain, contact your flight surgeon.',
  },
  {
    id: 'gut', name: 'Gut and nutrition', label: 'Gut', status: 'nominal',
    x: 110, y: 158, labelX: 130, labelAnchor: 'start',
    effect: 'Gut and skin microbes can change in space, and NASA lists this as a risk for illness. Poor nutrition also affects crew health and performance.',
    readings: ['Meals eaten 2 of 3', 'Fluids 1.8 L'],
    action: 'Keep regular meals and fluids. Report stomach upset or fever in your check-in.',
  },
  {
    id: 'bones', name: 'Bones and muscles', label: 'Bones & muscles', status: 'nominal',
    x: 82, y: 250, labelX: 60, labelAnchor: 'end',
    effect: 'Bones weaken and become more brittle in space, and muscle strength falls. NASA lists reduced fitness and bone changes as risks.',
    readings: ['Exercise 42 min today (goal 60)'],
    action: 'Keep up resistive and cardio exercise. Any exercise type counts.',
  },
];