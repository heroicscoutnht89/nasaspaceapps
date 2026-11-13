import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { Answers, emptyAnswers } from '../data/checkin';
import { saveCheckin } from '../data/storage';
import { StepShell } from '../components/StepShell';
import { LifestyleStep, MentalStep, ReviewStep, SymptomsStep, VitalsStep } from '../components/CheckinSteps';

const steps = [
  { label: 'Vitals', title: 'Your vitals', subtitle: 'Measure when you are rested. Skip anything you cannot measure.' },
  { label: 'Mental health and crew', title: 'How are you today?', subtitle: 'Your answers are compared to your own baseline, not to other people.' },
  { label: 'Symptoms', title: 'Any symptoms today?', subtitle: 'Choose Yes for anything you noticed in the last 24 hours.' },
  { label: 'Sleep, exercise and food', title: 'Your day so far', subtitle: 'Any exercise type counts.' },
  { label: 'Review and save', title: 'Review', subtitle: 'Saved on this device first. It syncs when the link is back.' },
];

export default function Checkin() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [saved, setSaved] = useState<number | null>(null);
  const [error, setError] = useState('');

  const set = (patch: Partial<Answers>) => setAnswers((prev) => ({ ...prev, ...patch }));

  async function save() {
    try {
      setError('');
      setSaved(await saveCheckin(answers));
    } catch {
      setError('Could not save on this device. Try again.');
    }
  }

  function done() {
    setAnswers(emptyAnswers);
    setStep(0);
    setSaved(null);
    router.navigate('/');
  }

  if (saved !== null) {
    return (
      <StepShell step={steps.length - 1} total={steps.length} label="Done" title="Check-in saved"
        subtitle={`Saved on this device. ${saved} waiting to sync.`} nextLabel="Back to Home" onNext={done} />
    );
  }

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <StepShell
      step={step} total={steps.length} label={current.label} title={current.title} subtitle={current.subtitle}
      nextLabel={last ? 'Save check-in' : 'Next'}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      onNext={last ? save : () => setStep(step + 1)}
    >
      {step === 0 && <VitalsStep a={answers} set={set} />}
      {step === 1 && <MentalStep a={answers} set={set} />}
      {step === 2 && <SymptomsStep a={answers} set={set} />}
      {step === 3 && <LifestyleStep a={answers} set={set} />}
      {step === 4 && <ReviewStep a={answers} />}
      {error ? <Text style={{ color: theme.colors.alert, marginTop: 12 }}>{error}</Text> : null}
    </StepShell>
  );
}