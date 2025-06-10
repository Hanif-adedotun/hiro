import { render } from '@testing-library/react';
import { Timing } from './prayers';
import { PrayerTable } from './timingDesktop';

jest.mock('./timingDesktop');
jest.mock('./timingMobile');

describe('Prayer Times Component', () => {
  it('should render correctly on desktop', () => {
    const { container } = render(<Timing />);
    expect(container).toMatchSnapshot();
  });

  it('should render mobile version on small screens', () => {
    global.innerWidth = 400;
    const { container } = render(<Timing />);
    expect(container).toMatchSnapshot();
  });

  it('should handle media query failures', () => {
    jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: false, addListener: jest.fn() });
    const { container } = render(<Timing />);
    expect(container).toMatchSnapshot();
  });
});

import { render } from '@testing-library/react';
import { PrayerTable } from './timingDesktop';

jest.mock('@/utils/prayerTypes');

describe('Prayer Table Component', () => {
  it('should render table with prayer times', () => {
    const { container } = render(<PrayerTable />);
    expect(container).toMatchSnapshot();
  });

  it('should handle empty prayer list', () => {
    jest.spyOn(global, 'prayers').mockImplementation(() => []);
    const { container } = render(<PrayerTable />);
    expect(container).toMatchSnapshot();
  });

  it('should handle invalid time rendering', () => {
    jest.spyOn(global, 'renderTime').mockImplementation(() => 'Invalid time');
    const { container } = render(<PrayerTable />);
    expect(container).toMatchSnapshot();
  });
});