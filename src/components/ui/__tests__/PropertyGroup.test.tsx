import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyGroup } from '../PropertyGroup';

describe('PropertyGroup', () => {
  it('renders title', () => {
    render(<PropertyGroup label="Model Transform"><div>content</div></PropertyGroup>);
    expect(screen.getByText('Model Transform')).toBeInTheDocument();
  });

  it('shows children when defaultOpen is true', () => {
    render(<PropertyGroup label="Group" defaultOpen={true}><div>inner</div></PropertyGroup>);
    expect(screen.getByText('inner')).toBeInTheDocument();
  });

  it('shows children by default (defaultOpen defaults to true)', () => {
    render(<PropertyGroup label="Group"><div>visible</div></PropertyGroup>);
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('hides children when defaultOpen is false', () => {
    render(<PropertyGroup label="Group" defaultOpen={false}><div>hidden</div></PropertyGroup>);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('toggles children on header click', async () => {
    const user = userEvent.setup();
    render(<PropertyGroup label="Camera"><div>cam-content</div></PropertyGroup>);

    expect(screen.getByText('cam-content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /camera/i }));
    expect(screen.queryByText('cam-content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /camera/i }));
    expect(screen.getByText('cam-content')).toBeInTheDocument();
  });

  it('opens collapsed group on click', async () => {
    const user = userEvent.setup();
    render(<PropertyGroup label="Anim" defaultOpen={false}><div>anim-content</div></PropertyGroup>);

    expect(screen.queryByText('anim-content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /anim/i }));
    expect(screen.getByText('anim-content')).toBeInTheDocument();
  });
});
