import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumericInput } from '../NumericInput';

describe('NumericInput', () => {
  it('renders with label', () => {
    render(<NumericInput label="Scale" value={1} onChange={() => {}} />);
    expect(screen.getByText('Scale')).toBeInTheDocument();
  });

  it('displays the value', () => {
    render(<NumericInput label="X" value={42} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(42);
  });

  it('calls onChange when typed into', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={0} onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '25');

    expect(onChange).toHaveBeenCalled();
  });

  it('clamps value to min', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={5} onChange={onChange} min={0} max={100} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '-10');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBeGreaterThanOrEqual(0);
  });

  it('clamps value to max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={5} onChange={onChange} min={0} max={100} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '200');

    const calls = onChange.mock.calls.filter(([v]: [number]) => typeof v === 'number');
    if (calls.length > 0) {
      const lastVal = calls[calls.length - 1][0];
      expect(lastVal).toBeLessThanOrEqual(100);
    }
  });

  it('increments by step on ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={10} onChange={onChange} step={5} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('decrements by step on ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={10} onChange={onChange} step={5} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('increments by step*10 on Shift+ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumericInput label="X" value={10} onChange={onChange} step={1} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('renders suffix', () => {
    render(<NumericInput label="Angle" value={45} onChange={() => {}} suffix="°" />);
    expect(screen.getByText('°')).toBeInTheDocument();
  });
});
