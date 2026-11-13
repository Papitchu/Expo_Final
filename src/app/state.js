export function createInitialState() {
  return {
    screen: 'login',
    onboardingIndex: 0,
    query: '',
    type: '',
    date: '',
    time: '',
    seat: '',
    attendees: '',
    space: null,
    bookings: [],
    booking: null,
    loginMessage: '',
    userEmail: '',
  };
}
