import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStore } from '../../../store';
import { createSection } from '../../../utils/presets';
import { SectionBuilder } from '../SectionBuilder';

function resetStore() {
  useStore.setState({ sections: [] });
}

describe('SectionBuilder', () => {
  beforeEach(resetStore);

  it('renders empty state when no sections', () => {
    render(<SectionBuilder />);
    expect(screen.getByText('No sections yet. Add one below.')).toBeInTheDocument();
  });

  it('renders section cards after adding sections', () => {
    useStore.setState({
      sections: [
        createSection('hero-banner'),
        createSection('pricing'),
      ],
    });
    render(<SectionBuilder />);
    // Each label appears in both the card and the preset picker
    expect(screen.getAllByText('Hero Banner')).toHaveLength(2);
    expect(screen.getAllByText('Pricing')).toHaveLength(2);
    // Delete buttons prove cards are rendered
    expect(screen.getByLabelText('Remove Hero Banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Pricing')).toBeInTheDocument();
  });

  it('shows section count badge', () => {
    useStore.setState({
      sections: [createSection('hero-banner'), createSection('blank')],
    });
    render(<SectionBuilder />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides count badge when empty', () => {
    render(<SectionBuilder />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('clicking preset adds section to store', async () => {
    const user = userEvent.setup();
    render(<SectionBuilder />);

    await user.click(screen.getByText('Hero Banner'));

    const { sections } = useStore.getState();
    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe('hero-banner');
  });

  it('renders all 11 preset buttons', () => {
    render(<SectionBuilder />);
    expect(screen.getByText('Hero Banner')).toBeInTheDocument();
    expect(screen.getByText('Features Grid')).toBeInTheDocument();
    expect(screen.getByText('Text + Image')).toBeInTheDocument();
    expect(screen.getByText('Our Team')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Contact Form')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('CTA Banner')).toBeInTheDocument();
    expect(screen.getByText('Blank Section')).toBeInTheDocument();
  });

  it('delete button removes section', async () => {
    const user = userEvent.setup();
    const section = createSection('gallery');
    useStore.setState({ sections: [section] });

    render(<SectionBuilder />);
    await user.click(screen.getByLabelText('Remove Gallery'));

    expect(useStore.getState().sections).toHaveLength(0);
  });

  it('height input updates section height', async () => {
    const user = userEvent.setup();
    const section = createSection('hero-banner');
    useStore.setState({ sections: [section] });

    render(<SectionBuilder />);
    const heightInput = screen.getByDisplayValue('100');
    await user.click(heightInput);
    await user.keyboard('{ArrowUp}');

    expect(useStore.getState().sections[0].height).toBe(110);
  });

  it('shows content block count per section', () => {
    const section = createSection('hero-banner');
    useStore.setState({ sections: [section] });

    render(<SectionBuilder />);
    expect(screen.getByText(`${section.contentBlocks.length} blocks`)).toBeInTheDocument();
  });
});
