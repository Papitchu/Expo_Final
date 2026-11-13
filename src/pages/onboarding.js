import { flow } from '../data/flow.js';
import { button } from '../ui/markup.js';

export function renderOnboarding(state) {
  const currentStep = Math.min(state.onboardingIndex, flow.onboarding.length - 1);
  return `<h1>ยินดีต้อนรับ</h1><p>ขั้นแนะนำ ${currentStep + 1} จาก ${flow.onboarding.length}: ${flow.onboarding[currentStep]}</p>
    ${button(currentStep === flow.onboarding.length - 1 ? 'เริ่มต้นใช้งาน' : 'ถัดไป', 'onboarding-next')}
    ${button('ข้าม', 'login', true)}`;
}
