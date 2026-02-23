import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

const SIMPLE_OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

const GROUPED_OPTIONS = [
  { value: 'easeInQuad', label: 'Ease In Quad', group: 'Quad' },
  { value: 'easeOutQuad', label: 'Ease Out Quad', group: 'Quad' },
  { value: 'easeInCubic', label: 'Ease In Cubic', group: 'Cubic' },
  { value: 'linear', label: 'Linear' },
];

describe('Select', () => {
  it('renders label', () => {
    render(<Select label="Easing" value="a" onChange={() => {}} options={SIMPLE_OPTIONS} />);
    expect(screen.getByText('Easing')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="Easing" value="a" onChange={() => {}} options={SIMPLE_OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gamma' })).toBeInTheDocument();
  });

  it('selects the correct value', () => {
    render(<Select label="Pick" value="b" onChange={() => {}} options={SIMPLE_OPTIONS} />);
    expect(screen.getByRole('combobox')).toHaveValue('b');
  });

  it('calls onChange on selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select label="Pick" value="a" onChange={onChange} options={SIMPLE_OPTIONS} />);

    await user.selectOptions(screen.getByRole('combobox'), 'c');
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('renders grouped options with optgroup', () => {
    render(<Select label="Easing" value="linear" onChange={() => {}} options={GROUPED_OPTIONS} />);
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('label', 'Quad');
    expect(groups[1]).toHaveAttribute('label', 'Cubic');
  });

  it('renders ungrouped options outside optgroups', () => {
    render(<Select label="Easing" value="linear" onChange={() => {}} options={GROUPED_OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Linear' })).toBeInTheDocument();
  });
});
