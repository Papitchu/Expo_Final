import { renderOnboarding } from '../pages/onboarding.js';
import { renderLogin } from '../pages/login.js';
import { renderHome, renderSpaceList, renderSpaceDetail } from '../pages/spaces.js';
import { renderSchedule, renderAlternatives, renderBookingReview, renderBookingConfirmed } from '../pages/booking.js';
import { renderMyBookings, renderBookingDetail } from '../pages/myBookings.js';
import { renderFrame } from '../ui/layout.js';

export function renderScreen(screen, state) {
  const content = getScreenContent(screen, state);
  return renderFrame(screen, content);
}

function getScreenContent(screen, state) {
  switch (screen) {
    case 'onboarding': return renderOnboarding(state);
    case 'login': return renderLogin(state);
    case 'home': return renderHome(state);
    case 'search':
    case 'space-list': return renderSpaceList(state);
    case 'space-detail': return renderSpaceDetail(state);
    case 'schedule': return renderSchedule(state);
    case 'alternatives': return renderAlternatives();
    case 'booking-review': return renderBookingReview(state);
    case 'booking-confirmed': return renderBookingConfirmed(state);
    case 'my-bookings': return renderMyBookings(state);
    case 'booking-detail': return renderBookingDetail(state);
    default: return `<h1>ไม่พบขั้นตอน</h1><button type="button" data-action="home">กลับหน้าหลัก</button>`;
  }
}
