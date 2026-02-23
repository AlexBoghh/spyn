import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XYZInput } from '../XYZInput';

describe('XYZInput', () => {
  it('renders label', () => {
    render(<XYZInput label="Position" value={{ x: 0, y: 0, z: 0 }} onChange={() => {}} />);
    expect(screen.getByText('Position')).toBeInTheDocument();
  });

  it('renders 3 inputs for X, Y, Z', () => {
    render(<XYZInput label="Position" value={{ x: 1, y: 2, z: 3 }} onChange={() => {}} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(3);
    expect(inputs[0]).toHaveValue(1);
    expect(inputs[1]).toHaveValue(2);
    expect(inputs[2]).toHaveValue(3);
  });

  it('renders X, Y, Z axis labels', () => {
    render(<XYZInput label="Position" value={{ x: 0, y: 0, z: 0 }} onChange={() => {}} />);
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('calls onChange with updated vector when X changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XYZInput label="Pos" value={{ x: 10, y: 20, z: 30 }} onChange={onChange} step={1} />);

    const inputs = screen.getAllByRole('spinbutton');
    await user.click(inputs[0]);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith({ x: 11, y: 20, z: 30 });
  });

  it('calls onChange with updated vector when Z changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XYZInput label="Pos" value={{ x: 10, y: 20, z: 30 }} onChange={onChange} step={5} />);

    const inputs = screen.getAllByRole('spinbutton');
    await user.click(inputs[2]);
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith({ x: 10, y: 20, z: 25 });
  });

  it('renders suffix on all inputs', () => {
    render(<XYZInput label="Rot" value={{ x: 0, y: 0, z: 0 }} onChange={() => {}} suffix="°" />);
    const suffixes = screen.getAllByText('°');
    expect(suffixes).toHaveLength(3);
  });
});
