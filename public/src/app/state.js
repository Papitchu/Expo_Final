export function createInitialState() {
  return {
    screen: 'login',
    onboardingIndex: 0,
    query: '',
    type: '',
    date: '',
    time: '',
    seat: '',
    seatId: null,
    attendees: '',
    space: null,
    spaces: [],
    bookings: [],
    booking: null,
    loginMessage: '',
    userEmail: '',
    error: '',
  };
}
