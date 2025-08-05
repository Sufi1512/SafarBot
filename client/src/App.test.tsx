import { render } from '@testing-library/react';
import App from './App';

test('renders SafarBot app', () => {
  render(<App />);
  // Check if the app renders without crashing
  expect(document.querySelector('.App')).toBeInTheDocument();
});
